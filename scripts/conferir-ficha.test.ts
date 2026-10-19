// `node --test "scripts/*.test.ts"`, na raiz. As Fichas e as Fontes locais de
// fixture ficam em `scripts/fixtures/conferencia/`, que faz o papel da raiz
// do repositório.

import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { conferirFicha, main } from './conferir-ficha.ts'

const raiz = fileURLToPath(new URL('./fixtures/conferencia/', import.meta.url))
const conferir = (slug: string, fonte?: string) =>
  conferirFicha(`estudos/${slug}.md`, { raiz, ...(fonte ? { fonte } : {}) })

describe('conferirFicha', () => {
  it('passa quando cada trecho está na fonte e cada número está no trecho', () => {
    const r = conferir('lima-2021-conferida')
    assert.deepEqual(r.falhas, [])
    assert.equal(r.fonte, 'fontes/privado/lima-2021-conferida.txt')
    assert.equal(r.conferidas, 3)
  })

  it('o Trecho casa com a palavra que a fonte hifenizou no fim da linha', () => {
    // A fonte quebra "relation-\nship"; o Trecho escreve "relationship".
    const r = conferir('lima-2021-conferida')
    assert.equal(r.falhas.some((f) => f.medida === 'Satisfação, app × amigos'), false)
  })

  it('lê um snapshot HTML como texto, sem as tags e com as entidades', () => {
    const r = conferir('lima-2021-conferida', 'fontes/lima-2021-pagina.html')
    assert.deepEqual(r.falhas, [])
    assert.equal(r.conferidas, 3)
  })

  it('aponta o Trecho que não está na fonte, o número fora do Trecho e a linha sem Trecho', () => {
    const r = conferir('lima-2021-erros', 'fontes/privado/lima-2021-conferida.txt')
    assert.deepEqual(
      r.falhas.map((f) => [f.linha, f.medida]),
      [
        [1, 'Trecho inventado'],
        [2, 'Número errado'],
        [3, 'Sem trecho'],
      ],
    )
    assert.match(r.falhas[0]!.motivo, /não está na fonte/)
    assert.match(r.falhas[1]!.motivo, /19 não aparece no Trecho/)
    assert.match(r.falhas[2]!.motivo, /sem Trecho/)
    assert.equal(r.conferidas, 1)
  })

  it('roda o Cálculo e barra o Valor que ele não reproduz', () => {
    const r = conferir('lima-2021-calculo', 'fontes/privado/lima-2021-conferida.txt')
    assert.deepEqual(
      r.falhas.map((f) => [f.linha, f.motivo]),
      [[2, 'o Cálculo deu "35.7", que não reproduz 40']],
    )
    assert.equal(r.conferidas, 1)
  })
})

describe('main', () => {
  const rodar = (...argv: string[]) => {
    const linhas: string[] = []
    const codigo = main(argv, { raiz, escrever: (l) => linhas.push(l) })
    return { codigo, saida: linhas.join('\n') }
  }

  it('sai com 0 quando tudo confere', () => {
    const { codigo, saida } = rodar('estudos/lima-2021-conferida.md')
    assert.equal(codigo, 0)
    assert.match(saida, /3 de 3 linhas conferidas/)
  })

  it('sai com 1 e lista as falhas por linha', () => {
    const { codigo, saida } = rodar('estudos/lima-2021-erros.md', '--fonte', 'fontes/privado/lima-2021-conferida.txt')
    assert.equal(codigo, 1)
    assert.match(saida, /linha 2 \(Número errado\): o número 19 não aparece no Trecho/)
  })

  it('sai com 1 quando não acha a Fonte local', () => {
    const { codigo, saida } = rodar('estudos/lima-2021-erros.md')
    assert.equal(codigo, 1)
    assert.match(saida, /sem Fonte local/)
  })

  it('sai com 1 sem Ficha para conferir', () => {
    assert.equal(rodar().codigo, 1)
  })
})
