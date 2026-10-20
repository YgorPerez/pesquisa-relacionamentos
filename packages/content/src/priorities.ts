// The priorities file (#9, #10, #19; story 99): per trait × outcome, the level
// from 0 to 3, the measure, the plain text and the fact sheet, plus the bias
// by gender. The `/prioridades` calculator and the B1 guide card read this
// same file. Every number follows the claims rule: the cited fact sheet must
// exist and be ✅ or 🟡. The YAML keys are the content contract, in English
// since #70. The trait ids are the link's values and stay in Portuguese.
import { Schema } from 'effect'
import { parse as parseYaml } from 'yaml'
import { Slug } from './schema.ts'
import type { FactSheet } from './fact-sheet.ts'
import { decode, problem, type Problem } from './problems.ts'

export const PRIORITIES_FILE = 'data/priorities/priorities.yaml'
export const PRIORITIES_META = 'data/priorities/priorities.meta.yaml'

const Text = Schema.String.check(
  Schema.isMinLength(1, { message: 'cannot be empty' }),
)
const Percent = Schema.Int.check(
  Schema.isBetween(
    { minimum: 0, maximum: 100 },
    { message: 'whole percentage from 0 to 100' },
  ),
)

/** A trait × outcome cell. Without a fact sheet, only level 0. */
const Cell = Schema.Struct({
  level: Schema.Literals([0, 1, 2, 3]),
  measure: Schema.optional(Text),
  plain_text: Text,
  fact_sheet: Schema.optional(Slug),
})
export type PriorityCell = typeof Cell.Type

/** The gap between what people state and what they choose. */
const Bias = Schema.Struct({
  all: Schema.optional(Text),
  man: Schema.optional(Text),
  woman: Schema.optional(Text),
})

const Trait = Schema.Struct({
  id: Slug,
  name: Text,
  attraction: Cell,
  satisfaction: Cell,
  duration: Cell,
  bias: Schema.optional(Bias),
})
export type Trait = typeof Trait.Type

/** The Joel 2020 bar: where satisfaction comes from, in percent. */
const ExplainedSatisfaction = Schema.Struct({
  fact_sheet: Slug,
  relationship: Percent,
  partner: Percent,
  unexplained: Percent,
})
export type ExplainedSatisfaction = typeof ExplainedSatisfaction.Type

const PrioritiesFileSchema = Schema.Struct({
  explained_satisfaction: ExplainedSatisfaction,
  traits: Schema.Array(Trait),
})

export interface Priorities extends Schema.Schema.Type<
  typeof PrioritiesFileSchema
> {
  /** Path of the file from the repository root. */
  readonly file: string
}

export type ParsedPriorities =
  | { readonly ok: true; readonly priorities: Priorities }
  | { readonly ok: false; readonly errors: ReadonlyArray<Problem> }

/** The claims rule for a fact sheet cited by the data. */
export function dataFactSheetProblem(
  file: string,
  field: string,
  slug: string,
  factSheets: ReadonlyArray<FactSheet>,
): Problem | null {
  const factSheet = factSheets.find((f) => f.slug === slug)
  if (!factSheet)
    return problem(
      file,
      `the fact sheet studies/${slug}.md does not exist`,
      field,
    )
  if (factSheet.status === 'unverified')
    return problem(
      file,
      `${slug} is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets`,
      field,
    )
  return null
}

const OUTCOMES = ['attraction', 'satisfaction', 'duration'] as const

export function readPriorities(
  file: string,
  text: string,
  factSheets: ReadonlyArray<FactSheet>,
  hasMeta: boolean,
): ParsedPriorities {
  if (!hasMeta)
    return {
      ok: false,
      errors: [
        problem(
          file,
          'missing the priorities.meta.yaml next to it, with the fact sheet, the variables, the date, the script and the version',
        ),
      ],
    }
  let value: unknown
  try {
    value = parseYaml(text) ?? {}
  } catch (e) {
    return {
      ok: false,
      errors: [problem(file, `is not valid YAML: ${(e as Error).message}`)],
    }
  }
  const parsed = decode(PrioritiesFileSchema, value, file)
  if (!parsed.ok) return { ok: false, errors: parsed.problems }
  const { explained_satisfaction: bar, traits } = parsed.value

  const errors: Problem[] = []
  const sum = bar.relationship + bar.partner + bar.unexplained
  if (sum !== 100)
    errors.push(
      problem(
        file,
        `relationship, partner and unexplained add up to ${sum}%, not 100%`,
        'explained_satisfaction',
      ),
    )
  const fromBar = dataFactSheetProblem(
    file,
    'explained_satisfaction.fact_sheet',
    bar.fact_sheet,
    factSheets,
  )
  if (fromBar) errors.push(fromBar)

  traits.forEach((trait, i) => {
    if (traits.findIndex((other) => other.id === trait.id) !== i)
      errors.push(
        problem(
          file,
          `the trait "${trait.id}" appears more than once`,
          `traits.${i}.id`,
        ),
      )
    for (const outcome of OUTCOMES) {
      const cell = trait[outcome]
      const field = `traits.${i}.${outcome}.fact_sheet`
      if (cell.fact_sheet === undefined) {
        if (cell.level > 0)
          errors.push(
            problem(
              file,
              `level ${cell.level} needs the fact sheet that backs it; without a fact sheet, only 0 ("não sabemos")`,
              field,
            ),
          )
        continue
      }
      const fromCell = dataFactSheetProblem(
        file,
        field,
        cell.fact_sheet,
        factSheets,
      )
      if (fromCell) errors.push(fromCell)
    }
  })

  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, priorities: { file, ...parsed.value } }
}
