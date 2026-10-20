import { describe, expect, it } from 'vite-plus/test'
import { countInGrep, findDirective, judge, readDiff } from './suppressions.ts'

// The directives are assembled in pieces: written whole, this file would be
// read as a suppression by the auditor itself (and by Oxlint).
const OX = 'oxlint' + '-disable'
const TS = '@ts-' + 'expect-error'
const MEMO = "'use no " + "memo'"

describe('findDirective', () => {
  it('finds the directive that opens a comment and says whether it has a reason', () => {
    expect(
      findDirective(`  // ${OX}-next-line no-console -- the CLI log`),
    ).toEqual({
      name: 'oxlint-disable',
      hasReason: true,
    })
    expect(findDirective(`/* ${OX} no-console */`)).toEqual({
      name: 'oxlint-disable',
      hasReason: false,
    })
    expect(findDirective(`  // ${TS} the package type is wrong`)).toEqual({
      name: '@ts-expect-error',
      hasReason: true,
    })
    expect(findDirective(`  // ${TS}`)).toEqual({
      name: '@ts-expect-error',
      hasReason: false,
    })
  })

  it('`use no memo` wants the reason in a comment on the same line', () => {
    expect(
      findDirective(`  ${MEMO} // the compiler breaks the effect`),
    ).toEqual({
      name: 'use no memo',
      hasReason: true,
    })
    expect(findDirective(`  ${MEMO}`)).toEqual({
      name: 'use no memo',
      hasReason: false,
    })
  })

  it('a directive quoted mid-sentence turns nothing off', () => {
    expect(findDirective(`const text = 'use ${OX} with a reason'`)).toBeNull()
    expect(findDirective('// nothing here')).toBeNull()
  })
})

const diff = (file: string, ...lines: string[]) =>
  [
    `diff --git a/${file} b/${file}`,
    `--- a/${file}`,
    `+++ b/${file}`,
    '@@ -1,0 +10,3 @@',
    ...lines,
  ].join('\n')

describe('readDiff', () => {
  it('splits the new ones with and without a reason, with the line of each', () => {
    const read = readDiff(
      diff(
        'frontend/src/ui/profile.tsx',
        '+const a = 1',
        `+// ${OX}-next-line no-alert -- the alert is the screen`,
        `+// ${TS}`,
      ),
    )
    expect(read.withReason).toEqual([
      expect.objectContaining({
        file: 'frontend/src/ui/profile.tsx',
        line: 11,
        name: 'oxlint-disable',
      }),
    ])
    expect(read.withoutReason).toEqual([
      expect.objectContaining({ line: 12, name: '@ts-expect-error' }),
    ])
  })

  it('does not read documentation, vendored code or the auditor itself', () => {
    const read = readDiff(
      [
        diff('docs/agents/integration.md', `+// ${OX}`),
        diff('.agents/skills/x/a.ts', `+// ${OX}`),
        diff('.github/scripts/suppressions.test.ts', `+// ${OX}`),
      ].join('\n'),
    )
    expect(read.withoutReason).toEqual([])
  })

  it('a changed auditor configuration goes to a person', () => {
    const read = readDiff(
      [
        diff('frontend/doctor.config.ts', '+      files: ["x"],'),
        diff('frontend/package.json', '+    "react": "^19.4.0",'),
        diff(
          'packages/rules/package.json',
          '+    "fallow": "fallow health --min-score 50",',
        ),
        diff('.github/suppression-ceiling.json', '+    "fallow-ignore": 1,'),
      ].join('\n'),
    )
    expect([...read.configuration.keys()]).toEqual([
      'frontend/doctor.config.ts',
      'packages/rules/package.json',
      '.github/suppression-ceiling.json',
    ])
  })
})

describe('countInGrep', () => {
  it('counts each directive in the tree, from the `git grep` output', () => {
    const output = [
      `abc:frontend/src/ui/a.tsx:3:// ${OX}-next-line x -- reason`,
      `abc:frontend/src/ui/b.tsx:9:  // ${OX} y -- reason`,
      `abc:frontend/src/ui/b.tsx:20:const t = "text that quotes ${OX}"`,
      `abc:packages/content/src/c.ts:1:// ${TS} reason`,
      `abc:frontend/src/routeTree.gen.ts:3:// @ts-${'nocheck'}`,
      `abc:docs/x.md:1:// ${OX}`,
    ].join('\n')
    expect(countInGrep(output)).toEqual({
      'oxlint-disable': 2,
      '@ts-expect-error': 1,
    })
  })
})

describe('judge', () => {
  const nothing = {
    withoutReason: [],
    withReason: [],
    configuration: new Map<string, string[]>(),
  }
  const finding = {
    file: 'frontend/src/ui/a.tsx',
    line: 3,
    name: 'oxlint-disable',
    text: '// …',
  }

  it('with nothing new and at the ceiling, passes', () => {
    const { passes } = judge({
      ...nothing,
      count: {},
      ceiling: {},
      labels: [],
      inCi: true,
    })
    expect(passes).toBe(true)
  })

  it('above the ceiling fails, even with the label', () => {
    const { passes, lines } = judge({
      ...nothing,
      withReason: [finding],
      count: { 'oxlint-disable': 1 },
      ceiling: { 'oxlint-disable': 0 },
      labels: ['supressao-revisada'],
      inCi: true,
    })
    expect(passes).toBe(false)
    expect(lines.join('\n')).toContain(
      'oxlint-disable: 1, and the ceiling is 0',
    )
  })

  it('without a reason always fails', () => {
    const { passes } = judge({
      ...nothing,
      withoutReason: [finding],
      count: { 'oxlint-disable': 1 },
      ceiling: { 'oxlint-disable': 1 },
      labels: ['supressao-revisada'],
      inCi: true,
    })
    expect(passes).toBe(false)
  })

  it('with a reason and at the ceiling, CI waits for the label; the machine only warns', () => {
    const input = {
      ...nothing,
      withReason: [finding],
      count: { 'oxlint-disable': 1 },
      ceiling: { 'oxlint-disable': 1 },
    }
    expect(judge({ ...input, labels: [], inCi: true }).passes).toBe(false)
    expect(
      judge({ ...input, labels: ['supressao-revisada'], inCi: true }).passes,
    ).toBe(true)
    const local = judge({ ...input, labels: [], inCi: false })
    expect(local.passes).toBe(true)
    expect(local.lines.join('\n')).toContain('supressao-revisada')
  })

  it('below the ceiling passes and asks to lower it', () => {
    const { passes, lines } = judge({
      ...nothing,
      count: {},
      ceiling: { '@ts-expect-error': 2 },
      labels: [],
      inCi: true,
    })
    expect(passes).toBe(true)
    expect(lines.join('\n')).toContain('lower in')
  })
})
