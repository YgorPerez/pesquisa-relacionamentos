// The priorities file (#9, #10, #19; story 99): per trait × outcome, the level
// from 0 to 3, the measure, the plain text and the fact sheet, plus the bias
// by gender. The `/prioridades` calculator and the B1 guide card read this
// same file. Every number follows the claims rule: the cited fact sheet must
// exist and be ✅ or 🟡. The YAML keys are the content contract and stay in
// Portuguese.
import { Schema } from 'effect'
import { parse as parseYaml } from 'yaml'
import { Slug } from './schema.ts'
import type { FactSheet } from './fact-sheet.ts'
import { decode, problem, type Problem } from './problems.ts'

export const PRIORITIES_FILE = 'dados/prioridades/prioridades.yaml'
export const PRIORITIES_META = 'dados/prioridades/prioridades.meta.yaml'

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
  degrau: Schema.Literals([0, 1, 2, 3]),
  medida: Schema.optional(Text),
  texto_simples: Text,
  ficha: Schema.optional(Slug),
})
export type PriorityCell = typeof Cell.Type

/** The gap between what people state and what they choose. */
const Bias = Schema.Struct({
  todos: Schema.optional(Text),
  homem: Schema.optional(Text),
  mulher: Schema.optional(Text),
})

const Trait = Schema.Struct({
  id: Slug,
  nome: Text,
  atracao: Cell,
  satisfacao: Cell,
  duracao: Cell,
  vies: Schema.optional(Bias),
})
export type Trait = typeof Trait.Type

/** The Joel 2020 bar: where satisfaction comes from, in percent. */
const ExplainedSatisfaction = Schema.Struct({
  ficha: Slug,
  relacao: Percent,
  parceiro: Percent,
  sem_explicacao: Percent,
})
export type ExplainedSatisfaction = typeof ExplainedSatisfaction.Type

const PrioritiesFileSchema = Schema.Struct({
  satisfacao_explicada: ExplainedSatisfaction,
  caracteristicas: Schema.Array(Trait),
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
      `the fact sheet estudos/${slug}.md does not exist`,
      field,
    )
  if (factSheet.status === 'nao-verificado')
    return problem(
      file,
      `${slug} is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets`,
      field,
    )
  return null
}

const OUTCOMES = ['atracao', 'satisfacao', 'duracao'] as const

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
          'missing the prioridades.meta.yaml next to it, with the fact sheet, the variables, the date, the script and the version',
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
  const { satisfacao_explicada: bar, caracteristicas: traits } = parsed.value

  const errors: Problem[] = []
  const sum = bar.relacao + bar.parceiro + bar.sem_explicacao
  if (sum !== 100)
    errors.push(
      problem(
        file,
        `relacao, parceiro and sem_explicacao add up to ${sum}%, not 100%`,
        'satisfacao_explicada',
      ),
    )
  const fromBar = dataFactSheetProblem(
    file,
    'satisfacao_explicada.ficha',
    bar.ficha,
    factSheets,
  )
  if (fromBar) errors.push(fromBar)

  traits.forEach((trait, i) => {
    if (traits.findIndex((other) => other.id === trait.id) !== i)
      errors.push(
        problem(
          file,
          `the trait "${trait.id}" appears more than once`,
          `caracteristicas.${i}.id`,
        ),
      )
    for (const outcome of OUTCOMES) {
      const cell = trait[outcome]
      const field = `caracteristicas.${i}.${outcome}.ficha`
      if (cell.ficha === undefined) {
        if (cell.degrau > 0)
          errors.push(
            problem(
              file,
              `level ${cell.degrau} needs the fact sheet that backs it; without a fact sheet, only 0 ("não sabemos")`,
              field,
            ),
          )
        continue
      }
      const fromCell = dataFactSheetProblem(file, field, cell.ficha, factSheets)
      if (fromCell) errors.push(fromCell)
    }
  })

  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, priorities: { file, ...parsed.value } }
}
