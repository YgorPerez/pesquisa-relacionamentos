// Brings the Effect v4 source code into `.repos/`, at the exact version in
// `pnpm-workspace.yaml`'s `catalog:` (ADR 0012, from Festival dos Macacos's
// ADR-0039). The v4 API differs from the v3 the agent was trained on, and
// whoever writes Effect code (the Schema in `packages/content`) reads
// `.repos/effect-smol/LLMS.md` and the source there before inventing a
// function.
//
// It is a shallow clone of a tag, ignored by git, which this script redoes
// when the catalog version changes.
//
//   node scripts/sync-references.ts
//   node scripts/sync-references.ts --from <another checkout>/.repos/effect-smol
//
// `--from` clones from a local copy instead of GitHub. That is what
// `prepare-worktree.ts` uses, so a new worktree does not download everything
// again.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const GITHUB = 'https://github.com/Effect-TS/effect.git'

/** The `effect` version in the workspace's `catalog:`. Plain `node` has no
 * YAML reader, and the line is `  effect: <version>` inside the block. */
export function effectVersion(workspace: string) {
  return /^catalog:\n(?:[ \t#].*\n|\n)*?[ \t]+effect: *['"]?([^\s'"]+)/m.exec(
    workspace,
  )?.[1]
}

type SyncRequest = {
  version: string
  target: string
  /** A local copy (another `.repos/effect-smol`) or the repository URL. */
  source?: string
  env?: NodeJS.ProcessEnv
}

/** Leaves `target` at tag `effect@<version>` and says what it did. Throws
 * with git's output if the clone fails. */
export function syncReferences({
  version,
  target,
  source = GITHUB,
  env = process.env,
}: SyncRequest) {
  const git = (args: string[], cwd?: string) =>
    spawnSync('git', args, { cwd, encoding: 'utf8', env })
  const tag = `effect@${version}`
  // An Effect commit carries the tag of each package released with it
  // (`effect@`, `@effect/vitest@`...), so the question is whether ours is
  // among them.
  const tags = existsSync(join(target, '.git'))
    ? git(['tag', '--points-at', 'HEAD'], target).stdout.split(/\r?\n/)
    : []
  if (tags.includes(tag)) return `.repos/effect-smol is already at ${tag}.`
  const current = tags.find((t) => t.startsWith('effect@'))

  const local = !/^[a-z]+:\/\//.test(source)
  rmSync(target, { recursive: true, force: true })
  mkdirSync(dirname(target), { recursive: true })
  const clone = git([
    'clone',
    '--quiet',
    '--depth',
    '1',
    '--branch',
    tag,
    '--single-branch',
    // A local path becomes `file://`, otherwise git ignores `--depth`.
    local ? `file://${resolve(source).replaceAll('\\', '/')}` : source,
    target,
  ])
  if (clone.status !== 0)
    throw new Error(`cloning ${tag} failed: ${clone.stderr.trim()}`)
  return `.repos/effect-smol ${current ? `leaves ${current} and ` : ''}goes to ${tag}, cloned from ${source}.`
}

if (import.meta.main) {
  const root = dirname(import.meta.dirname)
  const version = effectVersion(
    readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8'),
  )
  if (!version) {
    console.error('[references] Could not find `effect` in `catalog:`.')
    process.exit(1)
  }
  const index = process.argv.indexOf('--from')
  const copy = index === -1 ? undefined : process.argv[index + 1]
  try {
    console.log(
      `[references] ${syncReferences({
        version,
        target: join(root, '.repos/effect-smol'),
        // Without the copy (the main checkout has not synced yet), GitHub.
        ...(copy && existsSync(join(copy, '.git')) ? { source: copy } : {}),
      })}`,
    )
  } catch (error) {
    console.error(`[references] ${(error as Error).message}`)
    process.exit(1)
  }
}
