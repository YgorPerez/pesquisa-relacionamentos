// Gets a checkout ready for dev, the tests and the e2e, with no manual step
// (ADR 0010, from Festival dos Macacos's ADR-0038). T3 Code runs this in every
// worktree it creates (`t3.json`, with `T3CODE_PROJECT_ROOT` pointing at the
// main checkout); outside it, `node scripts/prepare-worktree.ts` at the
// worktree's root does the same, and finds the main checkout through git.
//
// 1. `pnpm install --frozen-lockfile` at the root, which sets up the whole
//    workspace (`frontend/`, `packages/*`) and, through `prepare`, applies the
//    `@effect/tsgo` patch (ADR 0004).
// 2. Clones the private sources repo into the main checkout's
//    `sources/private/` when it is missing there (ADR 0040,
//    `private-sources.ts`). Without access, it says so and goes on.
//    In a worktree, links in here what git does not carry and the main
//    checkout has: the frontend's `.env` files, that `sources/private/`
//    (which `pnpm verify` reads) and the impeccable skill. The root `.env`
//    and `.env.deploy` stay out: they carry the Hostinger token and VPS
//    access, and an agent's worktree does not get those for free.
// 3. Syncs the Effect code in `.repos/` (ADR 0012) from the main checkout's
//    copy, without downloading it again.
// 4. Turns on the push hook (`install-hooks.ts`).
// 5. Fetches `origin/main` and says how many commits HEAD is behind it. A
//    worktree is born from a local branch, which may be days behind.
//
// Safe to run again as often as you like. Runs on plain `node`, which reads
// TypeScript by itself: only syntax it strips.

import { execFileSync, spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { installHooks } from './install-hooks.ts'
import { checkoutPort, ROOT } from './ports.ts'
import {
  dropLegacyLink,
  ensurePrivateSources,
  PRIVATE_SOURCES,
} from './private-sources.ts'

/** What the main checkout has, git does not carry, and the worktree needs. */
const FROM_MAIN = [
  'frontend/.env',
  'frontend/.env.local',
  PRIVATE_SOURCES,
  '.claude/skills/impeccable',
  '.agents/skills/impeccable',
]

function say(line: string) {
  console.log(`[prepare] ${line}`)
}

function giveUp(reason: string): never {
  console.error(`[prepare] ${reason}`)
  process.exit(1)
}

/** Compares after following links. */
function samePath(a: string, b: string) {
  const [x, y] = [realpathSync.native(a), realpathSync.native(b)]
  return process.platform === 'win32'
    ? x.toLowerCase() === y.toLowerCase()
    : x === y
}

/** Links `relative` (file or folder) from `main` into `worktree` and returns
 * what to say. What is already a link there stays, and a broken link is
 * redone. A file equal to the main checkout's, from an earlier run, becomes a
 * link. What differs, or a link to somewhere else, belongs to the worktree,
 * and is left alone. If the system refuses the link (Windows without
 * developer mode), it copies and says so. */
export function link(
  main: string,
  worktree: string,
  relative: string,
  createLink: typeof symlinkSync = symlinkSync,
) {
  const source = join(main, relative)
  const target = join(worktree, relative)
  if (!existsSync(source))
    return `${relative}: the main checkout does not have it. Skipped.`
  const isFolder = statSync(source).isDirectory()
  const current = lstatSync(target, { throwIfNoEntry: false })
  if (current && existsSync(target)) {
    if (samePath(target, source))
      return `${relative}: already a link to the main checkout.`
    const equal =
      !isFolder &&
      !current.isSymbolicLink() &&
      current.isFile() &&
      readFileSync(target).equals(readFileSync(source))
    if (!equal) return `${relative}: the worktree has its own. Kept.`
  }
  if (current) rmSync(target, { recursive: true, force: true })
  mkdirSync(dirname(target), { recursive: true })
  try {
    createLink(source, target, isFolder ? 'junction' : 'file')
    return `${relative}: link to ${source}.`
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EPERM') throw error
    cpSync(source, target, { recursive: true })
    return (
      `${relative}: the system refused the link (EPERM), so it is a COPY of ` +
      `${source}. If the main checkout changes, delete the copy and run this again.`
    )
  }
}

/** What to say about `folder`'s HEAD relative to `origin/main`, after
 * fetching it. Up to date, nothing. Offline, it warns and compares with the
 * `origin/main` that was already here. */
export function behindMain(folder: string, env = process.env) {
  const git = (...args: string[]) =>
    execFileSync('git', args, {
      cwd: folder,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      // Offline, fetch neither hangs nor asks for a password.
      timeout: 60_000,
      env: { ...env, GIT_TERMINAL_PROMPT: '0' },
    }).trim()
  const lines: string[] = []
  try {
    git('fetch', '--quiet', 'origin', 'main')
  } catch (error) {
    const { stderr } = error as { stderr?: string }
    const reason = stderr?.trim().split('\n')[0] || String(error)
    lines.push(
      `git fetch failed (${reason}): comparing with the origin/main that was already here.`,
    )
  }
  let behind: number
  try {
    behind = Number(git('rev-list', '--count', 'HEAD..origin/main'))
  } catch {
    return [...lines, 'No origin/main: cannot tell whether HEAD is up to date.']
  }
  if (behind > 0)
    lines.push(
      `${behind} ${behind === 1 ? 'commit' : 'commits'} behind origin/main. ` +
        'To update: git merge origin/main',
    )
  return lines
}

/** The main checkout: what T3 Code says, or the folder the `.git` shared by
 * every worktree comes from. */
function mainCheckout() {
  const fromT3 = process.env.T3CODE_PROJECT_ROOT
  if (fromT3) return resolve(fromT3)
  try {
    const common = execFileSync(
      'git',
      ['rev-parse', '--path-format=absolute', '--git-common-dir'],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim()
    // A repository without a checkout (`--bare`) has nothing to link from.
    return basename(common) === '.git' ? dirname(common) : null
  } catch (error) {
    const { stderr } = error as { stderr?: string }
    giveUp(
      `git did not say where the main checkout is: ${stderr?.trim() || String(error)}\n` +
        'Run again with T3CODE_PROJECT_ROOT pointing at it.',
    )
  }
}

function run(command: string) {
  say(command)
  // `shell: true` so Windows finds `pnpm.cmd`.
  const { status } = spawnSync(command, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  })
  if (status !== 0) giveUp(`\`${command}\` exited with ${status}.`)
}

function syncReferences(main: string | null) {
  const args = [join(ROOT, 'scripts/sync-references.ts')]
  if (main) args.push('--from', join(main, '.repos/effect-smol'))
  const { status } = spawnSync(process.execPath, args, {
    cwd: ROOT,
    stdio: 'inherit',
  })
  // Offline and without a copy in the main checkout, the rest of the
  // preparation still helps.
  if (status !== 0)
    say(
      'The Effect references did NOT sync (the reason is above). ' +
        'Run `node scripts/sync-references.ts` later.',
    )
}

if (import.meta.main) {
  const main = mainCheckout()
  const inMain = main !== null && samePath(ROOT, main)
  say(inMain ? `main checkout ${ROOT}` : `worktree ${ROOT}`)

  // Without a terminal, as in T3 Code, pnpm's question before rebuilding
  // `node_modules` aborted the install.
  run('pnpm install --frozen-lockfile --config.confirm-modules-purge=false')

  // The private sources are cloned into the main checkout, and a worktree
  // links them from there like the rest (ADR 0040).
  if (main) for (const line of ensurePrivateSources(main)) say(line)

  if (!inMain) {
    if (main) {
      const dropped = dropLegacyLink(main, ROOT)
      if (dropped) say(dropped)
      for (const relative of FROM_MAIN) say(link(main, ROOT, relative))
    } else say('No main checkout: the .env files are up to you.')
  }

  syncReferences(inMain ? null : main)
  // The push hook: audit and affected tests (ADR 0020). A `core.hooksPath`
  // pointing elsewhere stays, with the warning.
  say(installHooks(ROOT).text)
  for (const line of behindMain(ROOT)) say(line)
  say(
    `Ready. \`pnpm dev\` starts on http://localhost:${checkoutPort('dev')}; ` +
      'the other ports: `node scripts/ports.ts`.',
  )
}
