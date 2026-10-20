// What `pnpm check` blocks at the end and can be checked in seconds, like the
// Festival dos Macacos `antes-de-integrar.ts`: run it before merging, and
// `merge-branches.ts` runs it before the suite.
//
//   node scripts/before-merge.ts [--base <ref>]   (default: origin/main)
//
// Only when the diff since the base touches `frontend/`:
//
// 1. `fallow dead-code`: unused exports;
// 2. `pnpm run doctor`: React Doctor, which blocks what the React Compiler does
//    not accept and a prop copied into a `useState`;
// 3. fallow's health against the base's. `pnpm check` requires `fallow health`
//    ≥ 90 with the front's coverage, and the front sits close to that: 0.1
//    less already turns it red. Without coverage the absolute score differs,
//    but the penalties are the same, and none may go up. The two that go up
//    with an ordinary diff are the ones fallow's score counts like this
//    (https://fallow.tools/docs/explanations/health/):
//    - coupling: the share of files with fan-in above max(p95 of fan-in, 10),
//      times 0.5. A file with no function at all (only types and constants)
//      does not count; giving a function to one that many import makes it
//      count;
//    - size: functions over 60 lines per thousand functions, times 0.5.
//
// Exits 1 with what got worse and how to fix it; 0 with nothing. Runs on plain
// `node`.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ROOT } from './ports.ts'

/** What fallow's health says about a tree, in what a diff touches. */
export type Health = {
  penalties: Record<string, number>
  functionsOver60PerThousand: number
  /** The files with fan-in above the coupling limit. */
  coupled: string[]
}

type HealthJson = {
  health_score: { penalties: Record<string, number> }
  vital_signs: { functions_over_60_loc_per_k: number; p95_fan_in: number }
  file_scores: { path: string; fan_in: number }[]
}

/** The health, from the JSON of `fallow health --format json`. Paths are made
 * relative to `frontend/`, so the base, read in another folder, compares. */
export function readHealth(json: HealthJson): Health {
  const limit = Math.max(json.vital_signs.p95_fan_in, 10)
  return {
    penalties: json.health_score.penalties,
    functionsOver60PerThousand: json.vital_signs.functions_over_60_loc_per_k,
    coupled: json.file_scores
      .filter(({ fan_in }) => fan_in > limit)
      .map(({ path }) => path.split(/[\\/]frontend[\\/]/).at(-1) ?? path)
      .sort(),
  }
}

/** The penalties the sentences above already cover, plus hotspots, which come
 * from git history: the base, taken out of it, has no history, and the suite
 * does not even count it (N/A). */
const ALREADY_COVERED = ['coupling', 'unit_size', 'hotspots']

/** What got worse from `before` to `after`, one sentence per thing, with the
 * fix. Empty when nothing got worse. */
export function regressions(before: Health, after: Health): string[] {
  const sentences: string[] = []
  const added = after.coupled.filter((a) => !before.coupled.includes(a))
  if (added.length > 0 && after.coupled.length > before.coupled.length)
    sentences.push(
      `coupling: ${added.join(', ')} now has fan-in above the limit (max(p95, 10)). ` +
        'Put what is new in a small module that only its users import, not in one that many import.',
    )
  if (after.functionsOver60PerThousand > before.functionsOver60PerThousand)
    sentences.push(
      `size: functions over 60 lines went from ${before.functionsOver60PerThousand} to ${after.functionsOver60PerThousand} per thousand. ` +
        'Split the function that went over 60 lines into smaller components or functions.',
    )
  for (const [name, value] of Object.entries(after.penalties)) {
    const previous = before.penalties[name] ?? 0
    if (value > previous && !ALREADY_COVERED.includes(name))
      sentences.push(
        `fallow's ${name} penalty went from ${previous} to ${value}.`,
      )
  }
  return sentences
}

function run(cwd: string, command: string, args: string[]) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
}

function healthIn(folder: string, fallow: string): Health {
  const { stdout, status, stderr } = run(folder, fallow, [
    'health',
    '--format',
    'json',
  ])
  if (!stdout.trim())
    throw new Error(`fallow health did not answer (${status}): ${stderr}`)
  return readHealth(JSON.parse(stdout) as HealthJson)
}

/** The base's health: its `frontend/`, taken out of git into a separate
 * folder. */
function baseHealth(base: string, fallow: string): Health {
  const folder = mkdtempSync(join(tmpdir(), 'before-merge-'))
  try {
    const archive = spawnSync(
      'git',
      ['archive', '--format=tar', base, 'frontend'],
      { cwd: ROOT, maxBuffer: 1024 * 1024 * 1024 },
    )
    const extract = spawnSync('tar', ['-x', '-C', folder], {
      input: archive.stdout,
    })
    if (archive.status !== 0 || extract.status !== 0)
      throw new Error(`could not take frontend out of git at ${base}.`)
    return healthIn(join(folder, 'frontend'), fallow)
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

function main() {
  const i = process.argv.indexOf('--base')
  const base = i === -1 ? 'origin/main' : process.argv[i + 1]
  if (!base) {
    console.error('usage: node scripts/before-merge.ts [--base <ref>]')
    return 1
  }
  const diff = run(ROOT, 'git', ['diff', '--name-only', `${base}...HEAD`])
  if (diff.status !== 0) {
    console.error(
      `[before-merge] git diff ${base}...HEAD: ${diff.stderr.trim()}`,
    )
    return 1
  }
  if (!diff.stdout.split('\n').some((a) => a.startsWith('frontend/'))) {
    console.error(
      '[before-merge] the diff does not touch frontend: nothing to check.',
    )
    return 0
  }
  const front = join(ROOT, 'frontend')
  const fallow = join(front, 'node_modules/.bin/fallow')
  if (!existsSync(fallow)) {
    console.error(
      '[before-merge] no frontend/node_modules: run `node scripts/prepare-worktree.ts`. The suite checks the rest.',
    )
    return 0
  }
  // The comparison's base is the merge-base: a branch behind main does not
  // take the blame for what main brought in later.
  const mergeBase = run(ROOT, 'git', ['merge-base', base, 'HEAD']).stdout.trim()
  const failures: string[] = []

  const dead = run(front, fallow, ['dead-code'])
  if (dead.status !== 0)
    failures.push(`fallow dead-code:\n${dead.stdout}${dead.stderr}`)
  const doctor = run(front, 'pnpm', ['run', 'doctor'])
  if (doctor.status !== 0)
    failures.push(`pnpm run doctor:\n${doctor.stdout}${doctor.stderr}`)
  const worse = regressions(
    baseHealth(mergeBase, fallow),
    healthIn(front, fallow),
  )
  if (worse.length > 0)
    failures.push(
      `fallow health got worse since ${base}, and \`pnpm check\` requires ≥ 90 with the front's coverage:\n- ${worse.join('\n- ')}`,
    )

  for (const failure of failures) console.error(`[before-merge] ${failure}`)
  if (failures.length > 0) return 1
  console.error(
    '[before-merge] fallow dead-code, doctor and fallow health are as in the base.',
  )
  return 0
}

if (import.meta.main) process.exit(main())
