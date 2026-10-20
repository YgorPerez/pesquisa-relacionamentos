// `node --test "scripts/*.test.ts"`, from the root. The fixture fact sheets
// and local sources live in `scripts/fixtures/verification/`, which plays the
// role of the repository root.

import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'vite-plus/test'
import { main, verifyFactSheet } from './verify-fact-sheet.ts'

const root = fileURLToPath(new URL('./fixtures/verification/', import.meta.url))
const verify = (slug: string, source?: string) =>
  verifyFactSheet(`estudos/${slug}.md`, { root, ...(source ? { source } : {}) })

describe('verifyFactSheet', () => {
  it('passes when each excerpt is in the source and each number is in the excerpt', () => {
    const r = verify('lima-2021-conferida')
    assert.deepEqual(r.failures, [])
    assert.equal(r.source, 'fontes/privado/lima-2021-conferida.txt')
    assert.equal(r.verified, 3)
  })

  it('the excerpt matches a word the source hyphenated at the end of a line', () => {
    // The source breaks "relation-\nship"; the excerpt writes "relationship".
    const r = verify('lima-2021-conferida')
    assert.equal(
      r.failures.some((f) => f.measure === 'Satisfação, app × amigos'),
      false,
    )
  })

  it('reads an HTML snapshot as text, without tags and with entities', () => {
    const r = verify('lima-2021-conferida', 'fontes/lima-2021-pagina.html')
    assert.deepEqual(r.failures, [])
    assert.equal(r.verified, 3)
  })

  it('flags the excerpt not in the source, the number outside the excerpt and the row with no excerpt', () => {
    const r = verify(
      'lima-2021-erros',
      'fontes/privado/lima-2021-conferida.txt',
    )
    assert.deepEqual(
      r.failures.map((f) => [f.row, f.measure]),
      [
        [1, 'Trecho inventado'],
        [2, 'Número errado'],
        [3, 'Sem trecho'],
      ],
    )
    assert.match(r.failures[0]!.reason, /is not in the source/)
    assert.match(r.failures[1]!.reason, /19 does not appear in the excerpt/)
    assert.match(r.failures[2]!.reason, /no excerpt/)
    assert.equal(r.verified, 1)
  })

  it('runs the Cálculo and blocks the Valor it does not reproduce', () => {
    const r = verify(
      'lima-2021-calculo',
      'fontes/privado/lima-2021-conferida.txt',
    )
    assert.deepEqual(
      r.failures.map((f) => [f.row, f.reason]),
      [[2, 'the Cálculo gave "35.7", which does not reproduce 40']],
    )
    assert.equal(r.verified, 1)
  })
})

describe('main', () => {
  const run = (...argv: string[]) => {
    const lines: string[] = []
    const code = main(argv, { root, write: (l) => lines.push(l) })
    return { code, output: lines.join('\n') }
  }

  it('exits 0 when everything checks out', () => {
    const { code, output } = run('estudos/lima-2021-conferida.md')
    assert.equal(code, 0)
    assert.match(output, /3 of 3 rows verified/)
  })

  it('exits 1 and lists the failures by row', () => {
    const { code, output } = run(
      'estudos/lima-2021-erros.md',
      '--source',
      'fontes/privado/lima-2021-conferida.txt',
    )
    assert.equal(code, 1)
    assert.match(
      output,
      /row 2 \(Número errado\): the number 19 does not appear in the excerpt/,
    )
  })

  it('exits 1 when it finds no local source', () => {
    const { code, output } = run('estudos/lima-2021-erros.md')
    assert.equal(code, 1)
    assert.match(output, /no local source/)
  })

  it('exits 1 with no fact sheet to verify', () => {
    assert.equal(run().code, 1)
  })
})
