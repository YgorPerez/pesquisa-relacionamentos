import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { commandForUse } from './dev.ts'
import { checkoutPort } from './ports.ts'

const FOLDER = mkdtempSync(join(tmpdir(), 'dev-'))
afterAll(() => rmSync(FOLDER, { recursive: true, force: true }))

const main = join(FOLDER, 'main')
mkdirSync(join(main, '.git'), { recursive: true })
const worktree = join(FOLDER, 'worktree')
mkdirSync(worktree)
writeFileSync(join(worktree, '.git'), 'gitdir: /x\n')

describe('commandForUse', () => {
  it("the main checkout's dev is `vp dev` on 4310, which refuses a busy port", () => {
    expect(commandForUse('dev', {}, main)).toEqual({
      port: 4310,
      command: 'pnpm exec vp dev --port 4310 --strictPort',
      env: {},
    })
  })

  it("in a worktree, each use on its block's port", () => {
    const start = checkoutPort('start', worktree)
    expect(commandForUse('start', {}, worktree)).toEqual({
      port: start,
      command: 'node .output/server/index.mjs',
      env: { PORT: String(start) },
    })
    const storybook = checkoutPort('storybook', worktree)
    expect(commandForUse('storybook', {}, worktree).command).toBe(
      `pnpm exec storybook dev --port ${storybook} --no-open --exact-port`,
    )
  })

  it("the environment's port beats the block's", () => {
    expect(commandForUse('dev', { DEV_PORT: '5000' }, worktree).port).toBe(5000)
    expect(
      commandForUse('storybook', { STORYBOOK_PORT: '5001' }, worktree).port,
    ).toBe(5001)
    expect(
      commandForUse('start', { START_PORT: '5002' }, worktree).env,
    ).toEqual({ PORT: '5002' })
  })

  it("the shell's generic PORT changes nothing: another tool may have set it", () => {
    expect(commandForUse('start', { PORT: '3000' }, main).port).toBe(4311)
  })

  it('a port that is not a number stops everything, naming the variable', () => {
    expect(() => commandForUse('dev', { DEV_PORT: 'abc' }, main)).toThrow(
      'DEV_PORT="abc": expected a port, from 1 to 65535',
    )
  })
})
