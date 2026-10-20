import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import {
  checkoutPort,
  PORT_USES,
  requestedPort,
  worktreeBlock,
} from './ports.ts'

const FOLDER = mkdtempSync(join(tmpdir(), 'ports-'))
afterAll(() => rmSync(FOLDER, { recursive: true, force: true }))

/** A fake checkout: in the main one `.git` is a folder, in a worktree a file. */
function checkout(name: string, kind: 'main' | 'worktree' | 'loose') {
  const root = join(FOLDER, name)
  mkdirSync(root, { recursive: true })
  if (kind === 'main') mkdirSync(join(root, '.git'))
  if (kind === 'worktree')
    writeFileSync(join(root, '.git'), 'gitdir: /some/where\n')
  return root
}

describe('checkoutPort', () => {
  it('the main checkout keeps the usual ports', () => {
    const root = checkout('main', 'main')
    expect(PORT_USES.map((use) => checkoutPort(use, root))).toEqual([
      4310, 4311, 4312, 6310, 6311,
    ])
  })

  it('a copy without .git counts as main', () => {
    expect(checkoutPort('dev', checkout('loose', 'loose'))).toBe(4310)
  })

  it("a worktree gets a block of its own, outside the main checkout's and the Festival's ports", () => {
    const root = checkout('wt-a', 'worktree')
    const ports = PORT_USES.map((use) => checkoutPort(use, root))
    expect(new Set(ports).size).toBe(PORT_USES.length)
    for (const port of ports) {
      expect(port).toBeGreaterThanOrEqual(40_100)
      expect(port).toBeLessThan(48_100)
    }
    // The five ports are neighbors, from the first of the block.
    expect(ports[0]! % 10).toBe(0)
    expect(ports).toEqual(ports.map((_, i) => ports[0]! + i))
  })

  it('the same path always gives the same ports', () => {
    const root = checkout('wt-b', 'worktree')
    expect(checkoutPort('e2e', root)).toBe(checkoutPort('e2e', root))
    expect(checkoutPort('e2e', `${root}/`)).toBe(checkoutPort('e2e', root))
  })

  it('two worktrees land in different blocks', () => {
    // Fixed paths: with `mkdtemp` ones, the test would fail 1 time in 800.
    expect(worktreeBlock('/repo/.claude/worktrees/agent-a')).not.toBe(
      worktreeBlock('/repo/.claude/worktrees/agent-b'),
    )
  })

  it('the Windows slash and the drive letter case do not change the block', () => {
    expect(worktreeBlock('C:\\repo\\wt\\')).toBe(worktreeBlock('c:/repo/wt'))
  })
})

describe('requestedPort', () => {
  it("without the use's variable, the checkout's", () => {
    const root = checkout('wt-requested', 'worktree')
    expect(requestedPort('e2e', {}, root)).toBe(checkoutPort('e2e', root))
  })

  it('with it, its own', () => {
    expect(requestedPort('stories', { STORIES_PORT: '5004' })).toBe(5004)
  })

  it('a port that is not a port stops everything, naming the variable', () => {
    expect(() => requestedPort('e2e', { E2E_PORT: 'abc' })).toThrow(
      'E2E_PORT="abc": expected a port, from 1 to 65535',
    )
  })
})
