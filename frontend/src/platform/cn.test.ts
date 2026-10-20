// `cn` only joins what it recognizes. A theme name it does not know falls in
// the wrong group (`text-label` read as a color would erase the `text-tinta`
// next to it) or in no group (two sizes would stay, and the CSS order would
// decide). Modeled on the Festival dos Macacos `cn.test.ts`.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'cn/build'
import { describe, expect, it, onTestFinished } from 'vite-plus/test'
import { cn } from './cn'
import tables from './cn-tables'

/** The names the `@theme` of `ui/tokens.css` declares in a scale:
 * `--text-label` → `label`. The subkeys (`--text-label--line-height`) and
 * `initial` do not count. */
function fromScale(scale: string): string[] {
  const css = readFileSync(new URL('../ui/tokens.css', import.meta.url), 'utf8')
  const names = css.matchAll(new RegExp(`^\\s*--${scale}-([a-z0-9-]+?):`, 'gm'))
  return [...new Set([...names].map((m) => m[1]!))].filter(
    (name) => !name.includes('--'),
  )
}

describe('cn knows the theme scales', () => {
  it.each(fromScale('text'))('text-%s is a size, not a color', (name) => {
    expect(cn('text-nota', `text-${name}`)).toBe(`text-${name}`)
    expect(cn('text-tinta', `text-${name}`)).toBe(`text-tinta text-${name}`)
  })

  it.each(fromScale('color'))('text-%s is a color, not a size', (name) => {
    expect(cn('text-tinta-2', `text-${name}`)).toBe(`text-${name}`)
    expect(cn('text-label', `text-${name}`)).toBe(`text-label text-${name}`)
    expect(cn('bg-papel', `bg-${name}`)).toBe(`bg-${name}`)
  })

  it.each(fromScale('leading'))('leading-%s is line height', (name) => {
    expect(cn('leading-none', `leading-${name}`)).toBe(`leading-${name}`)
  })

  it.each(fromScale('tracking'))('tracking-%s is letter spacing', (name) => {
    expect(cn('tracking-title', `tracking-${name}`)).toBe(`tracking-${name}`)
  })

  it.each(fromScale('radius'))('rounded-%s is a radius', (name) => {
    expect(cn('rounded-none', `rounded-${name}`)).toBe(`rounded-${name}`)
  })

  it.each(fromScale('spacing'))('p-%s is spacing', (name) => {
    expect(cn('p-2', `p-${name}`)).toBe(`p-${name}`)
  })

  it.each(fromScale('font'))('font-%s is a family, not a weight', (name) => {
    expect(cn('font-body', `font-${name}`)).toBe(`font-${name}`)
    expect(cn('font-bold', `font-${name}`)).toBe(`font-bold font-${name}`)
  })
})

// The tables live in the repository, ready, so the browser does not have to
// compile them. Whoever changes a `@theme` scale runs `pnpm cn:tables`.
it("the tables are the ones today's styles.css generates", async () => {
  const folder = mkdtempSync(join(tmpdir(), 'cn-tables-'))
  onTestFinished(() => rmSync(folder, { recursive: true, force: true }))
  const output = join(folder, 'cn-tables.js')
  await build({
    cwd: fileURLToPath(new URL('../..', import.meta.url)),
    css: 'src/styles.css',
    full: true,
    out: output,
  })

  const generated = await import(/* @vite-ignore */ pathToFileURL(output).href)
  expect(generated.default).toEqual(tables)
})
