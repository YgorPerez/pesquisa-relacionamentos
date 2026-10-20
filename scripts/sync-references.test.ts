import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test'
import { effectVersion, syncReferences } from './sync-references.ts'

describe('effectVersion', () => {
  it('reads effect from the catalog, even after a comment', () => {
    const workspace = [
      'packages:',
      '  - frontend',
      '',
      'catalog:',
      "  '@effect/tsgo': 0.53.4",
      '  # Schema only decodes the same way with the same `effect`.',
      '  effect: 4.0.2',
      '  typescript: 7.0.2',
    ].join('\n')
    expect(effectVersion(workspace)).toBe('4.0.2')
  })

  it('an effect outside the catalog does not count', () => {
    expect(effectVersion('overrides:\n  effect: 3.0.0\n')).toBeUndefined()
  })
})

describe('syncReferences', () => {
  const FOLDER = mkdtempSync(join(tmpdir(), 'references-'))
  const source = join(FOLDER, 'effect')
  const target = join(FOLDER, 'repo/.repos/effect-smol')
  const env = {
    ...process.env,
    GIT_CONFIG_GLOBAL: join(FOLDER, 'gitconfig'),
    GIT_CONFIG_NOSYSTEM: '1',
  }
  const git = (...args: string[]) =>
    execFileSync(
      'git',
      ['-c', 'user.name=test', '-c', 'user.email=test@x', ...args],
      { cwd: source, env, stdio: 'ignore' },
    )

  beforeAll(() => {
    writeFileSync(env.GIT_CONFIG_GLOBAL, '')
    mkdirSync(source)
    git('init', '--quiet', '-b', 'main')
    writeFileSync(join(source, 'LLMS.md'), 'v1')
    git('add', '.')
    git('commit', '--quiet', '-m', 'v1')
    git('tag', 'effect@4.0.1')
    writeFileSync(join(source, 'LLMS.md'), 'v2')
    git('commit', '--quiet', '-am', 'v2')
    // A commit carries the tag of each package released with it.
    git('tag', 'effect@4.0.2')
    git('tag', '@effect/vitest@4.0.2')
  })
  afterAll(() => rmSync(FOLDER, { recursive: true, force: true }))

  it("clones the version's tag, and does nothing when already on it", () => {
    expect(syncReferences({ version: '4.0.1', target, source, env })).toBe(
      `.repos/effect-smol goes to effect@4.0.1, cloned from ${source}.`,
    )
    expect(existsSync(join(target, 'LLMS.md'))).toBe(true)
    expect(syncReferences({ version: '4.0.1', target, source, env })).toBe(
      '.repos/effect-smol is already at effect@4.0.1.',
    )
  })

  it('a new catalog version clones again', () => {
    expect(syncReferences({ version: '4.0.2', target, source, env })).toBe(
      `.repos/effect-smol leaves effect@4.0.1 and goes to effect@4.0.2, cloned from ${source}.`,
    )
    expect(syncReferences({ version: '4.0.2', target, source, env })).toBe(
      '.repos/effect-smol is already at effect@4.0.2.',
    )
  })

  it('a tag that does not exist fails with what git said', () => {
    expect(() =>
      syncReferences({
        version: '9.9.9',
        target: join(FOLDER, 'other'),
        source,
        env,
      }),
    ).toThrow(/effect@9\.9\.9/)
  })
})
