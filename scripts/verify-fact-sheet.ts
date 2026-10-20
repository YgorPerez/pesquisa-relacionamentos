// Fact sheet verification (#37): for each Achados row, the excerpt is in the
// local source, the number in the Valor is in the excerpt and the `Cálculo`
// reproduces the Valor. The private folder is a clone of the private sources
// repo (ADR 0040): on a machine, `prepare-worktree.ts` sets it up; in CI,
// `.github/scripts/fact-sheets.ts` runs this on the verified fact sheets.
//
//   pnpm verify studies/<slug>.md [more fact sheets] [--source <path>]
//
// Without `--source`, looks for `sources/<slug>.<ext>` and then
// `sources/private/<slug>.<ext>`, with ext pdf, html, txt or md. A pdf goes
// through `pdftotext` (poppler-utils); html loses its tags. Any failure exits
// with code 1.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { readFactSheet } from '../packages/content/src/fact-sheet.ts'

export interface Failure {
  /** The Achados table row, from 1; `null` when the failure is about the whole fact sheet. */
  readonly row: number | null
  readonly measure: string | null
  readonly reason: string
}

export interface Verification {
  readonly factSheet: string
  /** The local source used, relative to the root, or `null` if none was found. */
  readonly source: string | null
  readonly failures: ReadonlyArray<Failure>
  /** How many Achados rows passed everything. */
  readonly verified: number
}

export interface Options {
  /** The repository root; paths are relative to it. */
  readonly root: string
  /** The local source, when it does not follow the fact sheet's name. */
  readonly source?: string
}

const EXTENSIONS = ['pdf', 'html', 'txt', 'md'] as const

/** The fact sheet's local source, relative to `root`, or `null`. */
export function findSource(root: string, slug: string): string | null {
  for (const folder of ['sources', 'sources/private']) {
    for (const ext of EXTENSIONS) {
      const path = `${folder}/${slug}.${ext}`
      if (existsSync(join(root, path))) return path
    }
  }
  return null
}

/** The source's text, from a text file or from a PDF via `pdftotext`. */
function readSource(root: string, path: string): string {
  if (/\.html?$/.test(path))
    return htmlText(readFileSync(join(root, path), 'utf8'))
  if (!path.endsWith('.pdf')) return readFileSync(join(root, path), 'utf8')
  const r = spawnSync('pdftotext', ['-enc', 'UTF-8', join(root, path), '-'], {
    encoding: 'utf8',
  })
  if (r.status !== 0)
    throw new Error(
      `pdftotext failed on ${path} (install poppler-utils): ${(r.stderr || r.error?.message || '').trim()}`,
    )
  return r.stdout
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  shy: '­',
}

/** The text of a page snapshot: without script, style and tags, with entities decoded. */
function htmlText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
      if (name.startsWith('#x') || name.startsWith('#X'))
        return String.fromCodePoint(parseInt(name.slice(2), 16))
      if (name.startsWith('#'))
        return String.fromCodePoint(Number(name.slice(1)))
      return ENTITIES[name.toLowerCase()] ?? whole
    })
}

/**
 * The text the way verification compares it: without end-of-line
 * hyphenation, with quotes, ligatures and spaces unified. Source and excerpt
 * go through the same function, so "long-term" broken into "long-\nterm" and
 * "relation-\nship" match an excerpt written on a single line.
 */
export function normalize(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/­/g, '')
    .replace(/[‐‑]/g, '-')
    .replace(/(\p{L})-[ \t]*\r?\n\s*(\p{L})/gu, '$1$2')
    .replace(/(\p{L})-(?=\p{L})/gu, '$1')
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export function verifyFactSheet(file: string, options: Options): Verification {
  const { root } = options
  const slug = file.replace(/^.*\//, '').replace(/\.md$/, '')
  const failures: Failure[] = []
  const whole = (reason: string): Verification => ({
    factSheet: file,
    source: null,
    failures: [{ row: null, measure: null, reason }],
    verified: 0,
  })

  const read = readFactSheet(file, readFileSync(join(root, file), 'utf8'))
  if (!read.ok)
    return whole(
      `the fact sheet does not pass the build: ${read.errors.map((e) => e.message).join('; ')}`,
    )

  const source = options.source ?? findSource(root, slug)
  const extensions = EXTENSIONS.join(',')
  if (!source)
    return whole(
      `no local source: no sources/${slug}.{${extensions}} nor sources/private/${slug}.{${extensions}}`,
    )
  if (!existsSync(join(root, source)))
    return whole(`the local source ${source} does not exist`)
  const text = normalize(readSource(root, source))
  if (read.factSheet.findings.length === 0)
    return { ...whole('the Achados table is empty'), source }

  let verified = 0
  read.factSheet.findings.forEach((finding, i) => {
    const before = failures.length
    const fail = (reason: string) =>
      failures.push({ row: i + 1, measure: finding.measure, reason })
    const excerpt = finding.excerpt ? cleanExcerpt(finding.excerpt) : ''
    if (!excerpt) fail('no excerpt')
    else if (!text.includes(normalize(excerpt)))
      fail(`the excerpt is not in the source: "${excerpt}"`)
    if (finding.calculation) {
      // A calculated number is not in the excerpt; the excerpt holds the
      // inputs and the Cálculo must return the Valor.
      const output = runCalculation(root, finding.calculation)
      if (!output.ok) fail(output.reason)
      else {
        const fromCalculation = numbers(output.text)
        const missing = numbers(finding.value).filter(
          (n) => !fromCalculation.some((c) => sameNumber(n, c)),
        )
        if (missing.length > 0)
          fail(
            `the Cálculo gave "${output.text}", which does not reproduce ${missing.map((n) => n.raw).join(', ')}`,
          )
      }
    } else if (excerpt) {
      const inExcerpt = numbers(excerpt)
      for (const n of numbers(finding.value)) {
        if (!inExcerpt.some((t) => sameNumber(n, t)))
          fail(`the number ${n.raw} does not appear in the excerpt`)
      }
    }
    if (failures.length === before) verified++
  })

  return { factSheet: file, source, failures, verified }
}

const INTERPRETERS: Record<string, string> = {
  ts: process.execPath,
  js: process.execPath,
  mjs: process.execPath,
  py: 'python3',
  sh: 'bash',
}

type Output =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly reason: string }

/**
 * Runs the Cálculo cell: the path of a repository script, relative to the
 * root, with optional arguments (`scripts/calculations/kowal-2025-brasil.py BR`).
 * Standard output, trimmed, is what gets compared with the Valor.
 */
function runCalculation(root: string, cell: string): Output {
  const [script = '', ...args] = cell.replace(/`/g, '').trim().split(/\s+/)
  const ext = script.replace(/^.*\./, '')
  const interpreter = INTERPRETERS[ext]
  if (script.startsWith('/') || script.split('/').includes('..'))
    return {
      ok: false,
      reason: `the Cálculo must be a path inside the repository: ${script}`,
    }
  if (!existsSync(join(root, script)))
    return { ok: false, reason: `the Cálculo script does not exist: ${script}` }
  if (!interpreter)
    return {
      ok: false,
      reason: `cannot run .${ext}; use ${Object.keys(INTERPRETERS).join(', ')}`,
    }
  const r = spawnSync(interpreter, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 60_000,
  })
  if (r.status !== 0)
    return {
      ok: false,
      reason: `the Cálculo ${script} failed: ${(r.stderr || r.error?.message || '').trim()}`,
    }
  return { ok: true, text: r.stdout.trim() }
}

interface ParsedNumber {
  /** How the number was written: "18,5", "1,204", ".04". */
  readonly raw: string
  /** The possible readings: "1,204" is 1204 in English and 1.204 in Portuguese. */
  readonly readings: ReadonlyArray<number>
}

/**
 * The numbers in a text, without sign. The Valor comes in Portuguese ("0,04",
 * "11.196") and the excerpt in the source's language ("0.04", ".04",
 * "11,196"), so each number keeps every reading its writing allows.
 */
export function numbers(text: string): ParsedNumber[] {
  return [...text.matchAll(/(?<![\d.,])(?:\d+(?:[.,]\d+)*|[.,]\d+)/g)].map(
    ([raw]) => ({
      raw,
      readings: readings(raw),
    }),
  )
}

function readings(raw: string): number[] {
  if (/^[.,]/.test(raw)) return [Number(`0.${raw.slice(1)}`)]
  const parts = raw.split(/[.,]/)
  const separators = raw.replace(/\d/g, '')
  if (parts.length === 1) return [Number(raw)]
  const [integer, ...rest] = parts
  const thousands = rest.every((p) => p.length === 3)
  if (parts.length === 2) {
    const decimal = Number(`${integer}.${rest[0]}`)
    return thousands ? [decimal, Number(parts.join(''))] : [decimal]
  }
  // Three or more groups: equal separators are thousands ("1.234.567"); with a
  // different separator at the end, the last one is the decimal ("1,204.5",
  // "1.204,5").
  if (new Set(separators).size === 1)
    return thousands ? [Number(parts.join(''))] : []
  const last = parts.pop() ?? ''
  return parts.slice(1).every((p) => p.length === 3)
    ? [Number(`${parts.join('')}.${last}`)]
    : []
}

function sameNumber(a: ParsedNumber, b: ParsedNumber): boolean {
  return a.readings.some((x) => b.readings.some((y) => Math.abs(x - y) < 1e-9))
}

export interface Environment {
  readonly root: string
  readonly write: (line: string) => void
}

const USAGE =
  'usage: node scripts/verify-fact-sheet.ts studies/<slug>.md [more fact sheets] [--source <path>]'

/** The command line: returns the exit code, 1 on any failure. */
export function main(
  argv: ReadonlyArray<string>,
  { root, write }: Environment,
): number {
  const factSheets: string[] = []
  let source: string | undefined
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? ''
    if (arg === '--source') source = argv[++i] ?? ''
    else factSheets.push(arg)
  }
  if (factSheets.length === 0 || source === '') {
    write(USAGE)
    return 1
  }
  if (source !== undefined && factSheets.length > 1) {
    write('--source applies to a single fact sheet.')
    return 1
  }

  let failed = false
  for (const factSheet of factSheets) {
    const r = verifyFactSheet(factSheet, {
      root,
      ...(source ? { source } : {}),
    })
    const withFailure = new Set(
      r.failures.flatMap((f) => (f.row === null ? [] : [f.row])),
    ).size
    const summary = `${r.verified} of ${r.verified + withFailure} rows verified`
    const where = r.source ? ` (${r.source})` : ''
    if (r.failures.length === 0) {
      write(`ok    ${factSheet}${where}: ${summary}`)
      continue
    }
    failed = true
    write(`FAIL  ${factSheet}${where}: ${summary}`)
    for (const f of r.failures)
      write(
        f.row === null
          ? `  ${f.reason}`
          : `  row ${f.row} (${f.measure}): ${f.reason}`,
      )
  }
  return failed ? 1 : 0
}

if (import.meta.main) {
  process.exitCode = main(process.argv.slice(2), {
    root: process.cwd(),
    write: (l) => console.log(l),
  })
}

/** Strips outer quotes and the markdown emphasis the table cell may have. */
function cleanExcerpt(cell: string): string {
  return cell
    .trim()
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/\*/g, '')
    .trim()
}
