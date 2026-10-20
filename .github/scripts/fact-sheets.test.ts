import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { checkFactSheet, report, statusOf } from './fact-sheets.ts'

// A copy of the verification fixtures, which play the repository root: the
// verified `lima-2021-conferida` with its source in `sources/private/`, and
// the partial `lima-2021-erros`.
const FIXTURES = fileURLToPath(
  new URL('../../scripts/fixtures/verification/', import.meta.url),
)
const ROOT = mkdtempSync(join(tmpdir(), 'fact-sheets-'))
cpSync(FIXTURES, ROOT, { recursive: true })
afterAll(() => rmSync(ROOT, { recursive: true, force: true }))

const VERIFIED = 'studies/lima-2021-conferida.md'
const text = readFileSync(join(ROOT, VERIFIED), 'utf8')

/** A copy of the verified fact sheet under another name, changed by `edit`. */
function sheet(name: string, edit = (t: string) => t) {
  const file = `studies/${name}.md`
  writeFileSync(join(ROOT, file), edit(text))
  return file
}

describe('statusOf', () => {
  it("reads the frontmatter's status, and null without one", () => {
    expect(statusOf(text)).toBe('verified')
    expect(statusOf('---\nstatus: "partial"\n---\n')).toBe('partial')
    expect(statusOf('# no frontmatter\nstatus: verified')).toBeNull()
    expect(statusOf(null)).toBeNull()
  })
})

describe('checkFactSheet', () => {
  it('passes a verified fact sheet whose excerpts are in its source', () => {
    expect(checkFactSheet(VERIFIED, { root: ROOT })).toEqual({
      file: VERIFIED,
      kind: 'verified',
      source: 'sources/private/lima-2021-conferida.txt',
      rows: 3,
    })
  })

  it('leaves out a fact sheet that is not marked verified', () => {
    expect(
      checkFactSheet('studies/lima-2021-erros.md', { root: ROOT }),
    ).toBeNull()
  })

  it('fails an excerpt that is not in the source', () => {
    const file = sheet('quebrada', (t) =>
      t.replace('through a dating app', 'through a newspaper ad'),
    )
    cpSync(
      join(ROOT, 'sources/private/lima-2021-conferida.txt'),
      join(ROOT, 'sources/private/quebrada.txt'),
    )
    const r = checkFactSheet(file, { root: ROOT })
    expect(r?.kind).toBe('failed')
    expect(r).toMatchObject({
      reasons: [
        expect.stringMatching(
          /^row 1 \(.+\): the excerpt is not in the source/,
        ),
      ],
    })
  })

  describe('a verified fact sheet with no local source', () => {
    const file = sheet('sem-fonte')

    it('was marked verified by this PR when the base had it otherwise, or not at all', () => {
      const partial = text.replace('status: verified', 'status: partial')
      expect(checkFactSheet(file, { root: ROOT, baseText: partial })).toEqual({
        file,
        kind: 'no-source',
        newlyVerified: true,
      })
      expect(
        checkFactSheet(file, { root: ROOT, baseText: null }),
      ).toMatchObject({ newlyVerified: true })
    })

    it('was already verified on the base, or there is no base (main)', () => {
      expect(
        checkFactSheet(file, { root: ROOT, baseText: text }),
      ).toMatchObject({ newlyVerified: false })
      expect(checkFactSheet(file, { root: ROOT })).toMatchObject({
        newlyVerified: false,
      })
    })
  })
})

describe('report', () => {
  it('fails on a broken fact sheet, with one annotation per problem', () => {
    const { lines, failed, summary } = report(
      [
        {
          file: 'studies/a.md',
          kind: 'verified',
          source: 'sources/a.pdf',
          rows: 2,
        },
        {
          file: 'studies/b.md',
          kind: 'failed',
          source: 'sources/private/b.pdf',
          reasons: ['row 1 (X): the excerpt is not in the source: "50%"'],
        },
      ],
      'this PR',
    )
    expect(failed).toBe(true)
    expect(lines).toContain(
      '::error file=studies/b.md,title=Fact sheet does not match its source::row 1 (X): the excerpt is not in the source: "50%25"',
    )
    expect(summary).toContain('| `studies/a.md` | verified, 2 rows')
  })

  it('warns, without failing, on a fact sheet that was already verified and has no source', () => {
    const { lines, failed } = report(
      [{ file: 'studies/c.md', kind: 'no-source', newlyVerified: false }],
      'the whole library',
    )
    expect(failed).toBe(false)
    expect(lines[0]).toMatch(/^SKIP {2}studies\/c\.md: NOT verified/)
    expect(lines[1]).toMatch(/^::warning file=studies\/c\.md,/)
  })

  it('fails when the PR marks a fact sheet verified without its source', () => {
    const { lines, failed } = report(
      [{ file: 'studies/d.md', kind: 'no-source', newlyVerified: true }],
      'this PR',
    )
    expect(failed).toBe(true)
    expect(lines[1]).toMatch(
      /^::error file=studies\/d\.md,title=Verified without a local source::/,
    )
  })

  it('says when there was nothing to check', () => {
    const { lines, failed, summary } = report([], 'this PR')
    expect(failed).toBe(false)
    expect(lines).toEqual(['No verified fact sheet in this PR.'])
    expect(summary).toContain('No verified fact sheet in this PR.')
  })
})
