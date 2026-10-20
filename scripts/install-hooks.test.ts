import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { installHooks } from './install-hooks.ts'
import { envWithoutHookGit } from './suite-log.ts'

const temporaries: string[] = []
afterEach(() => {
  for (const folder of temporaries.splice(0))
    rmSync(folder, { recursive: true, force: true })
})

const git = (cwd: string, ...args: string[]) =>
  spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: envWithoutHookGit(),
  }).stdout.trim()

function repository({ withHook = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'install-hooks-'))
  temporaries.push(root)
  git(root, 'init', '-q')
  if (withHook) {
    mkdirSync(join(root, '.githooks'))
    writeFileSync(join(root, '.githooks/pre-push'), '#!/bin/sh\n')
  }
  return root
}

describe('installHooks', () => {
  it('sets core.hooksPath, and the second time says it already is', () => {
    const root = repository()
    expect(installHooks(root).ok).toBe(true)
    expect(git(root, 'config', '--get', 'core.hooksPath')).toBe('.githooks')
    expect(installHooks(root)).toMatchObject({
      ok: true,
      text: expect.stringMatching(/^already installed/),
    })
  })

  it("this checkout's absolute .githooks path counts as installed", () => {
    const root = repository()
    git(root, 'config', '--local', 'core.hooksPath', join(root, '.githooks'))
    expect(installHooks(root).text).toMatch(/^already installed/)
  })

  it('does not replace a core.hooksPath pointing elsewhere, nor turn off an existing hook', () => {
    const other = repository()
    git(other, 'config', '--local', 'core.hooksPath', '/some/other/place')
    expect(installHooks(other)).toMatchObject({ ok: false })
    expect(git(other, 'config', '--get', 'core.hooksPath')).toBe(
      '/some/other/place',
    )

    const withHook = repository()
    writeFileSync(join(withHook, '.git/hooks/pre-commit'), '#!/bin/sh\n')
    expect(installHooks(withHook).text).toMatch(/pre-commit/)
    expect(git(withHook, 'config', '--get', 'core.hooksPath')).toBe('')
  })

  it('without .githooks/pre-push, there is nothing to install', () => {
    expect(installHooks(repository({ withHook: false })).ok).toBe(false)
  })
})
