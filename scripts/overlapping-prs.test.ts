import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { type OpenPr, overlaps, overlapWarning } from './overlapping-prs.ts'

function pr(number: number, headRefName: string, ...paths: string[]): OpenPr {
  return {
    number,
    title: `PR ${number}`,
    headRefName,
    files: paths.map((path) => ({ path })),
  }
}

describe('overlaps', () => {
  it('lists the PR that touches a file of this branch, with the shared files', () => {
    const prs = [
      pr(1058, 'fix/sharp', 'backend/package.json', 'pnpm-lock.yaml'),
      pr(1007, 'chore/worktree', 'scripts/prepare-worktree.ts'),
    ]
    assert.deepEqual(
      overlaps(['pnpm-lock.yaml', 'pnpm-workspace.yaml'], prs, []),
      [{ number: 1058, title: 'PR 1058', shared: ['pnpm-lock.yaml'] }],
    )
  })

  it("leaves out this branch's PR and the one under a stacked PR", () => {
    const prs = [
      pr(1060, 'chore/integra', 'AGENTS.md'),
      pr(1004, 'chore/auditoria', 'AGENTS.md'),
      pr(1016, 'chore/outra', 'AGENTS.md'),
    ]
    assert.deepEqual(
      overlaps(['AGENTS.md'], prs, ['chore/integra', 'chore/auditoria']).map(
        (p) => p.number,
      ),
      [1016],
    )
  })

  it('with no file in common, nothing', () => {
    assert.deepEqual(overlaps(['a.ts'], [pr(1, 'x', 'b.ts')], []), [])
  })
})

describe('overlapWarning', () => {
  it('cuts at five files and says how many are left', () => {
    const shared = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    assert.deepEqual(overlapWarning([{ number: 9, title: 'T', shared }]), [
      '#9 T: a, b, c, d, e and 2 more',
    ])
  })
})
