// The private local sources (ADR 0040): the full text that has no open
// license lives in the private repo `pesquisa-relacionamentos-fontes`, and
// each machine keeps a clone of it at `sources/private/` in the main
// checkout, which `.gitignore` leaves out. `prepare-worktree.ts` calls
// `ensurePrivateSources` before linking the folder into a worktree.

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  readdirSync,
  readlinkSync,
  rmSync,
  unlinkSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'

export const PRIVATE_SOURCES = 'sources/private'
/** Where the folder was before #70. Only a notice is left for it. */
const LEGACY = 'fontes/privado'

/** The private repo's URL, in the same form as the public repo's `origin`
 * (https or ssh), so the clone goes through the credentials that already
 * reach it. */
export function privateRemoteFor(origin: string) {
  return origin.trim().replace(/(\.git)?\/?$/, '-fontes.git')
}

/** A worktree prepared before #78 has `sources/private` as a link to the
 * main checkout's legacy folder. Removes that link, so `link` can point it at
 * the clone, and says so; anything else stays. */
export function dropLegacyLink(main: string, worktree: string) {
  const target = join(worktree, PRIVATE_SOURCES)
  const current = lstatSync(target, { throwIfNoEntry: false })
  if (!current?.isSymbolicLink()) return null
  const legacy = join(main, LEGACY)
  const pointsAt = resolve(dirname(target), readlinkSync(target))
  if (pointsAt !== legacy) return null
  unlinkSync(target)
  return `${PRIVATE_SOURCES}: removed the link to the old ${LEGACY}.`
}

/** Git with the same credentials as `folder`, never asking on a terminal. */
function git(folder: string, env: NodeJS.ProcessEnv, ...args: string[]) {
  return execFileSync('git', args, {
    cwd: folder,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 120_000,
    env: {
      ...env,
      GIT_TERMINAL_PROMPT: '0',
      GIT_SSH_COMMAND: env.GIT_SSH_COMMAND ?? 'ssh -o BatchMode=yes',
    },
  })
}

/** The `credential.helper` values the main checkout sets for itself. The
 * public repo may pin an account there (AGENTS.md), and the clone takes the
 * same list, in the same order, empty resets included. */
function localHelpers(main: string, env: NodeJS.ProcessEnv) {
  try {
    // Not trimmed: an empty first value is the reset of the global helpers.
    const out = git(
      main,
      env,
      'config',
      '--local',
      '--get-all',
      'credential.helper',
    )
    return out.replace(/\n$/, '').split('\n')
  } catch {
    return []
  }
}

export interface Options {
  /** The private repo's URL. By default, derived from the main checkout's
   * `origin`. */
  readonly remote?: string
  readonly env?: NodeJS.ProcessEnv
}

/** Makes sure the main checkout has `sources/private/`, cloning the private
 * repo there when it is missing, and returns what to say. Without access, it
 * says so in one line and leaves nothing behind. */
export function ensurePrivateSources(main: string, options: Options = {}) {
  const env = options.env ?? process.env
  const target = join(main, PRIVATE_SOURCES)
  const lines: string[] = []
  const legacy = join(main, LEGACY)
  if (existsSync(legacy)) {
    const files = readdirSync(legacy).filter((name) => !name.startsWith('.'))
    lines.push(
      files.length > 0
        ? `${LEGACY} still has ${files.length} ${files.length === 1 ? 'file' : 'files'}, which nothing reads now: move them into ${PRIVATE_SOURCES}/, then commit and push there.`
        : `${LEGACY} is empty and nothing reads it now: delete it.`,
    )
  }
  if (existsSync(target)) {
    if (!existsSync(join(target, '.git')))
      lines.push(
        `${PRIVATE_SOURCES}: a folder, not a clone of the private repo. Kept; its files reach CI only once they are pushed there.`,
      )
    return lines
  }
  let remote = options.remote
  if (!remote) {
    try {
      remote = privateRemoteFor(
        git(main, env, 'remote', 'get-url', 'origin').trim(),
      )
    } catch {
      lines.push(
        `${PRIVATE_SOURCES}: the main checkout has no origin, so there is no private repo to clone. Skipped.`,
      )
      return lines
    }
  }
  const helpers = localHelpers(main, env).flatMap((helper) => [
    '-c',
    `credential.helper=${helper}`,
  ])
  try {
    git(main, env, 'clone', '--quiet', ...helpers, remote, target)
    lines.push(`${PRIVATE_SOURCES}: cloned from ${remote}.`)
  } catch (error) {
    rmSync(target, { recursive: true, force: true })
    const { stderr } = error as { stderr?: string }
    const reason = stderr?.trim().split('\n').at(-1) || (error as Error).message
    lines.push(
      `${PRIVATE_SOURCES}: could not clone ${remote} (${reason}). Without access to the private repo, \`pnpm verify\` sees only the public sources; ask YgorPerez for access, then run this again.`,
    )
  }
  return lines
}
