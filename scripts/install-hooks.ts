// Turns on the `.githooks/` hooks in the repository of the checkout it runs
// in, like Festival dos Macacos's `instalar-hooks.ts`: `git config
// core.hooksPath .githooks`. `prepare-worktree.ts` calls this; by hand,
// `node scripts/install-hooks.ts` at a checkout's root.
//
// `core.hooksPath` lives in `.git/config`, shared by every worktree. The path
// is relative, and git reads it from each worktree's root: each one runs its
// own branch's `.githooks/`.
//
// Claude Code, when it creates an agent's worktree, replaces the relative path
// with the absolute path of the main checkout's `.githooks/`. That path, or
// the one of any other worktree of this repository, counts as installed:
// `.githooks/pre-push` hands off to the one of the worktree doing the push.
//
// Safe to run again as often as you like. It replaces nothing that already
// exists: if `core.hooksPath` points elsewhere, or `.git/hooks/` holds
// someone's hook, it warns and stops without touching anything, because
// `core.hooksPath` would silently turn that hook off.
//
// Runs on plain `node`, without `node_modules`.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, realpathSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import { envWithoutHookGit } from './suite-log.ts'

const HOOKS_PATH = '.githooks'

/** Installs, or says why not. `ok` also when it was already installed. */
export function installHooks(folder: string): { ok: boolean; text: string } {
  const git = (...args: string[]) =>
    spawnSync('git', args, {
      cwd: folder,
      encoding: 'utf8',
      env: envWithoutHookGit(),
    })
  const line = (...args: string[]) => git(...args).stdout.trim()
  const root = line('rev-parse', '--show-toplevel')
  if (!root || !existsSync(join(root, HOOKS_PATH, 'pre-push')))
    return {
      ok: false,
      text: `${folder} has no ${HOOKS_PATH}/pre-push: nothing to install.`,
    }

  const real = (path: string) => {
    const absolute = resolve(path)
    return existsSync(absolute) ? realpathSync(absolute) : absolute
  }
  /** `value` is the absolute `.githooks/` of one of this repo's worktrees. */
  const fromOneOfOurWorktrees = (value: string) =>
    isAbsolute(value) &&
    line('worktree', 'list', '--porcelain')
      .split('\n')
      .filter((l) => l.startsWith('worktree '))
      .some(
        (l) =>
          real(join(l.slice('worktree '.length), HOOKS_PATH)) === real(value),
      )

  const current = git('config', '--show-scope', '--get', 'core.hooksPath')
  if (current.status === 0) {
    const [scope, value = ''] = current.stdout.trim().split(/\t/)
    if (
      scope === 'local' &&
      (value === HOOKS_PATH || fromOneOfOurWorktrees(value))
    )
      return { ok: true, text: `already installed: core.hooksPath = ${value}.` }
    return {
      ok: false,
      text:
        `core.hooksPath is already "${value}" (${scope}), and changing it would turn off the hooks there. ` +
        `Nothing changed. To use this repository's, run \`git config --local core.hooksPath ${HOOKS_PATH}\` yourself.`,
    }
  }

  const hooks = join(
    line('rev-parse', '--path-format=absolute', '--git-common-dir'),
    'hooks',
  )
  const existing = existsSync(hooks)
    ? readdirSync(hooks).filter((name) => !name.endsWith('.sample'))
    : []
  if (existing.length > 0)
    return {
      ok: false,
      text:
        `${hooks} has ${existing.join(', ')}, which core.hooksPath would turn off. ` +
        `Nothing changed. Move them to ${HOOKS_PATH}/ or merge them into this repo's pre-push, and run this again.`,
    }

  git('config', '--local', 'core.hooksPath', HOOKS_PATH)
  return {
    ok: true,
    text:
      `installed: core.hooksPath = ${HOOKS_PATH}, for every worktree. ` +
      'pre-push runs the audit and the affected tests; `git push --no-verify` skips it.',
  }
}

if (import.meta.main) {
  const { ok, text } = installHooks(process.cwd())
  ;(ok ? console.log : console.error)(`[hooks] ${text}`)
  process.exit(ok ? 0 : 1)
}
