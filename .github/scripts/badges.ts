// Draws the README badges (`docs/badges/*.svg`) from what fallow, React
// Doctor and coverage just measured, like the Festival dos Macacos
// `badges.ts`. They are committed SVGs: no number is written by hand in the
// README, and the badge does not depend on an outside service being up.
//
// Runs in `badges.yml`, from the repo root, after each package's
// `test:coverage`, `fallow health --format json` and `react-doctor --json`.
// By hand, with the same files in place:
//   node .github/scripts/badges.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

/** The part of `fallow health --format json` the badge reads. */
type Health = { health_score: { score: number; grade: string } }
/** The part of `react-doctor --json` the badge reads. */
type Doctor = { summary?: { score: number | null; scoreLabel: string } }
/** A `coverage-final.json` file (istanbul format): each statement, the line
 * it starts on and how many times it ran. */
type Coverage = Record<
  string,
  {
    statementMap: Record<string, { start: { line: number } }>
    s: Record<string, number>
  }
>

/** The color follows fallow's letter: it is what sums up the grade. */
const GRADE_COLOR = {
  A: '#4c1',
  B: '#97ca00',
  C: '#dfb317',
  D: '#fe7d37',
  F: '#e05d44',
}

/** For a number from 0 to 100 with no letter. The ranges are React Doctor's:
 * 90 is "Excellent", 75 "Good", 60 "Needs work". */
function rangeColor(score: number) {
  if (score >= 90) return GRADE_COLOR.A
  if (score >= 75) return GRADE_COLOR.B
  if (score >= 60) return GRADE_COLOR.C
  if (score >= 40) return GRADE_COLOR.D
  return GRADE_COLOR.F
}

/** The average width of a character at 11px in Verdana; wide letters and
 * `%` weigh more. The SVG `textLength` adjusts the rest. */
function width(text: string) {
  return Math.round(
    text
      .split('')
      .reduce(
        (total, c) =>
          total + (/[mwMW%]/.test(c) ? 10 : /[ .·()ilj]/.test(c) ? 3.5 : 7),
        10,
      ),
  )
}

/** The shields "flat" style: two boxes, text with a shadow. */
function badge(label: string, message: string, color: string) {
  const lr = width(label)
  const lm = width(message)
  const total = lr + lm
  const text = (t: string, x: number, l: number) =>
    `<text aria-hidden="true" x="${x * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${l * 10}">${t}</text>` +
    `<text x="${x * 10}" y="140" transform="scale(.1)" fill="#fff" textLength="${l * 10}">${t}</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${label}: ${message}">
<title>${label}: ${message}</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)"><rect width="${lr}" height="20" fill="#555"/><rect x="${lr}" width="${lm}" height="20" fill="${color}"/><rect width="${total}" height="20" fill="url(#s)"/></g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
${text(label, lr / 2, lr - 10)}
${text(message, lr + lm / 2, lm - 10)}
</g>
</svg>
`
}

/** What is not code, by path from the package folder: tests, stories,
 * types, the Storybook scaffolding and what is generated. */
const NOT_COUNTED = [
  /\.test\.tsx?$/,
  /\.stories\.tsx$/,
  /\.d\.ts$/,
  /^src\/platform\/storybook\//,
  /^src\/routeTree\.gen\.ts$/,
]

/** Line coverage of several packages together, as istanbul counts it: a
 * line is the start line of some statement, and it is covered if any of them
 * ran. Rounded down: 89.6% is not 90%. */
export function lineCoverage(
  packages: readonly { folder: string; files: Coverage }[],
) {
  let lines = 0
  let covered = 0
  for (const { folder, files } of packages)
    for (const [path, file] of Object.entries(files)) {
      const inPackage = relative(folder, path).replaceAll('\\', '/')
      if (NOT_COUNTED.some((pattern) => pattern.test(inPackage))) continue
      const byLine = new Map<number, boolean>()
      for (const [id, { start }] of Object.entries(file.statementMap)) {
        const ran = (file.s[id] ?? 0) > 0
        byLine.set(start.line, (byLine.get(start.line) ?? false) || ran)
      }
      lines += byLine.size
      for (const ran of byLine.values()) if (ran) covered += 1
    }
  return lines === 0 ? 0 : Math.floor((covered / lines) * 100)
}

export function badges({
  health,
  doctor,
  coverage,
}: {
  health: Health
  doctor: Doctor
  coverage: number
}) {
  const { score, grade } = health.health_score
  const fallowGrade = `${grade} (${Math.round(score)})`
  // Without the React Doctor API (`--no-score`) the score comes as `null`.
  const doctorScore = doctor.summary?.score
  return {
    fallow: badge(
      'fallow health',
      fallowGrade,
      GRADE_COLOR[grade as keyof typeof GRADE_COLOR] ?? '#9f9f9f',
    ),
    reactDoctor:
      typeof doctorScore === 'number'
        ? badge(
            'react doctor',
            `${doctorScore} · ${doctor.summary?.scoreLabel}`,
            rangeColor(doctorScore),
          )
        : badge('react doctor', 'no score', '#9f9f9f'),
    coverage: badge('coverage', `${coverage}%`, rangeColor(coverage)),
    summary: `fallow: ${fallowGrade} · react doctor: ${doctorScore ?? 'no score'} · coverage: ${coverage}%`,
  }
}

/** The packages whose coverage goes into the badge: the app, the pure
 * packages and the root scripts. */
const PACKAGES = ['frontend', 'packages/content', 'packages/rules', '.']

if (import.meta.main) {
  const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
  const { fallow, reactDoctor, coverage, summary } = badges({
    health: read('frontend/coverage/health.json'),
    doctor: read('frontend/coverage/doctor.json'),
    coverage: lineCoverage(
      PACKAGES.filter((p) =>
        existsSync(join(p, 'coverage/coverage-final.json')),
      ).map((p) => ({
        folder: resolve(p),
        files: read(join(p, 'coverage/coverage-final.json')),
      })),
    ),
  })
  mkdirSync('docs/badges', { recursive: true })
  writeFileSync('docs/badges/fallow.svg', fallow)
  writeFileSync('docs/badges/react-doctor.svg', reactDoctor)
  // The README points at this file name.
  writeFileSync('docs/badges/coverage.svg', coverage)
  console.log(summary)
}
