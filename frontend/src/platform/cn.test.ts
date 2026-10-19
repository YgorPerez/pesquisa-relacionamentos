// O `cn` só junta o que reconhece. Um nome do tema que ele não conhece cai no
// grupo errado (`text-label` lido como cor apagaria o `text-tinta` ao lado) ou
// em grupo nenhum (dois tamanhos ficariam, e a ordem do CSS decidiria). No
// molde do `cn.test.ts` do Festival dos Macacos.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'cn/build'
import { describe, expect, it, onTestFinished } from 'vite-plus/test'
import { cn } from './cn'
import tabelas from './cn-tabelas'

/** Os nomes que o `@theme` de `ui/tokens.css` declara numa escala:
 * `--text-label` → `label`. As subchaves (`--text-label--line-height`) e o
 * `initial` não contam. */
function daEscala(escala: string): string[] {
  const css = readFileSync(new URL('../ui/tokens.css', import.meta.url), 'utf8')
  const nomes = css.matchAll(
    new RegExp(`^\\s*--${escala}-([a-z0-9-]+?):`, 'gm'),
  )
  return [...new Set([...nomes].map((m) => m[1]!))].filter(
    (nome) => !nome.includes('--'),
  )
}

describe('o cn conhece as escalas do tema', () => {
  it.each(daEscala('text'))('text-%s é tamanho, e não cor', (nome) => {
    expect(cn('text-nota', `text-${nome}`)).toBe(`text-${nome}`)
    expect(cn('text-tinta', `text-${nome}`)).toBe(`text-tinta text-${nome}`)
  })

  it.each(daEscala('color'))('text-%s é cor, e não tamanho', (nome) => {
    expect(cn('text-tinta-2', `text-${nome}`)).toBe(`text-${nome}`)
    expect(cn('text-label', `text-${nome}`)).toBe(`text-label text-${nome}`)
    expect(cn('bg-papel', `bg-${nome}`)).toBe(`bg-${nome}`)
  })

  it.each(daEscala('leading'))('leading-%s é entrelinha', (nome) => {
    expect(cn('leading-none', `leading-${nome}`)).toBe(`leading-${nome}`)
  })

  it.each(daEscala('tracking'))('tracking-%s é espaçamento', (nome) => {
    expect(cn('tracking-title', `tracking-${nome}`)).toBe(`tracking-${nome}`)
  })

  it.each(daEscala('radius'))('rounded-%s é raio', (nome) => {
    expect(cn('rounded-none', `rounded-${nome}`)).toBe(`rounded-${nome}`)
  })

  it.each(daEscala('spacing'))('p-%s é espaço', (nome) => {
    expect(cn('p-2', `p-${nome}`)).toBe(`p-${nome}`)
  })

  it.each(daEscala('font'))('font-%s é família, e não peso', (nome) => {
    expect(cn('font-body', `font-${nome}`)).toBe(`font-${nome}`)
    expect(cn('font-bold', `font-${nome}`)).toBe(`font-bold font-${nome}`)
  })
})

// As tabelas ficam no repositório, prontas, para o navegador não ter de
// compilá-las. Quem muda uma escala do `@theme` roda `pnpm cn:tabelas`.
it('as tabelas são as que o styles.css de hoje gera', async () => {
  const pasta = mkdtempSync(join(tmpdir(), 'cn-tabelas-'))
  onTestFinished(() => rmSync(pasta, { recursive: true, force: true }))
  const saida = join(pasta, 'cn-tabelas.js')
  await build({
    cwd: fileURLToPath(new URL('../..', import.meta.url)),
    css: 'src/styles.css',
    full: true,
    out: saida,
  })

  const geradas = await import(/* @vite-ignore */ pathToFileURL(saida).href)
  expect(geradas.default).toEqual(tabelas)
})
