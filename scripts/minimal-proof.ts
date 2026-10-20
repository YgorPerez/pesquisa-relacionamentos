// The minimal proof of a change (ADR 0016, from Festival dos Macacos's
// ADR-0035), in one command:
//
//   node scripts/minimal-proof.ts                 against the merge-base with origin/main
//   node scripts/minimal-proof.ts --base <ref>    against another branch's (origin/spec/23-mvp)
//
// From the diff against the merge-base (`diffAgainst`), the commits and the
// working tree, it runs, in this order:
//
// 1. the types (`typecheck`, with the Effect diagnostics) of each package the
//    diff touches and of the app, which imports the packages;
// 2. Vitest with `--changed <base>` in each affected folder (`affected.ts`);
// 3. the app's folders (`frontend/lint/pastas.ts`) and each component's story
//    (`frontend/lint/stories.ts`), if the app changed;
// 4. `vp check` on the changed files: format, lint and types.
//
// A failing step does not stop the others. At the end, one line per step, and
// it exits with an error if any failed. No e2e, no stories and no full suite:
// those run in the PR's CI and in `pr-suite.ts`. Every Vitest run here is
// filtered and does not wait for the machine queue (`machine-queue.ts`).
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { diffAgainst, planForDiff } from './affected.ts'
import { ROOT } from './ports.ts'

export type Step = {
  readonly name: string
  /** Where it runs from, relative to the repo root. */
  readonly folder: string
  /** The program and its arguments, one per item: no shell reads them, and a
   * route path like `src/routes/$tema/$slug.tsx` arrives intact. */
  readonly command: readonly [string, ...string[]]
  /** Why the step does not run. */
  readonly skip?: string
}

/** The name of each workspace folder with `typecheck`. The root has none:
 * `vp check` checks the scripts' types. */
const PACKAGES: Readonly<Record<string, string>> = {
  frontend: 'frontend',
  'packages/content': '@tem-estudo/content',
  'packages/rules': '@tem-estudo/rules',
}

/** The steps of a diff's proof. `exists` says whether a repo file exists (a
 * deleted one does not go to the check). */
export function proofPlan({
  files,
  base,
  exists,
}: {
  files: readonly string[]
  base: string
  exists: (file: string) => boolean
}): Step[] {
  const plan = planForDiff(files)
  const folders = new Set(plan.packages)
  // The app imports the pure packages: a type that changes there breaks here.
  if ([...folders].some((p) => p.startsWith('packages/')))
    folders.add('frontend')
  const order = ['packages/content', 'packages/rules', 'frontend', '.']
  const affected = order.filter((p) => folders.has(p))
  const steps: Step[] = []

  for (const folder of affected) {
    const name = PACKAGES[folder]
    if (name)
      steps.push({
        name: `types:${name}`,
        folder: '.',
        command: ['pnpm', '--filter', name, 'run', 'typecheck'],
      })
  }
  for (const folder of affected)
    steps.push({
      name: `vitest:${folder}`,
      folder,
      command: [
        'pnpm',
        'exec',
        'vp',
        'test',
        'run',
        '--changed',
        base,
        '--passWithNoTests',
      ],
    })
  if (files.some((a) => a.startsWith('frontend/src/')))
    steps.push(
      {
        name: 'folders',
        folder: '.',
        command: ['node', 'frontend/lint/pastas.ts'],
      },
      // Each component in `src/ui/` has a story (ADR 0036).
      {
        name: 'components',
        folder: '.',
        command: ['node', 'frontend/lint/stories.ts'],
      },
    )
  const existing = files.filter(exists)
  if (existing.length > 0)
    steps.push({
      name: 'check',
      folder: '.',
      command: [
        'pnpm',
        'exec',
        'vp',
        'check',
        '--no-error-on-unmatched-pattern',
        ...existing,
      ],
    })
  if (plan.stories)
    steps.push({
      name: 'stories',
      folder: 'frontend',
      command: ['pnpm', 'test:stories'],
      skip: 'the stories run whole; they run in the PR CI and in pr-suite.ts',
    })
  return steps
}

/** Runs a step from `root`, with output on screen, and returns the status. */
function runStep(step: Step, root: string) {
  const [program, ...args] = step.command
  return spawnSync(program, args, {
    cwd: join(root, step.folder),
    // Windows only finds `pnpm.cmd` through the shell; cmd.exe does not
    // expand `$`.
    shell: process.platform === 'win32',
    stdio: 'inherit',
  }).status
}

function main() {
  const i = process.argv.indexOf('--base')
  const against = i === -1 ? 'origin/main' : process.argv[i + 1]
  if (against === undefined || against.startsWith('--')) {
    console.error('[proof] --base needs a ref: --base <branch>.')
    return 1
  }
  const { base, files } = diffAgainst(ROOT, against)
  const steps = proofPlan({
    files,
    base,
    exists: (file) => existsSync(join(ROOT, file)),
  })
  console.log(
    `[proof] ${files.length} files changed since ${base.slice(0, 7)} (merge-base with ${against})`,
  )
  const summary: string[] = []
  let failures = 0
  for (const step of steps) {
    if (step.skip !== undefined) {
      summary.push(`[proof] skip   ${step.name}: ${step.skip}`)
      continue
    }
    console.log(
      `\n[proof] ${step.name}: ${step.command.join(' ')} (in ${step.folder})`,
    )
    const start = Date.now()
    const status = runStep(step, ROOT)
    if (status !== 0) failures++
    summary.push(
      `[proof] ${status === 0 ? 'ok    ' : 'FAILED'} ${step.name} (${Math.round((Date.now() - start) / 1000)} s)`,
    )
  }
  console.log(`\n${summary.join('\n')}`)
  console.log(
    failures === 0
      ? '[proof] All passed.'
      : `[proof] ${failures} step(s) failed; the output of each is above.`,
  )
  return failures === 0 ? 0 : 1
}

if (import.meta.main) process.exit(main())
