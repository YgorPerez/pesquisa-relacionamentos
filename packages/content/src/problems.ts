// The build's errors and warnings, with the file and the field.
import { Result, Schema, SchemaIssue } from 'effect'

export interface Problem {
  /** Path relative to the repository root, like `studies/joel-2020.md`. */
  readonly file: string
  /** The frontmatter field (`covers.genders.0`) or the body section. */
  readonly field?: string
  /** The whole sentence, already with file and field, ready for the terminal. */
  readonly message: string
}

export function problem(file: string, text: string, field?: string): Problem {
  const where = field ? `${file}: ${field}` : file
  return { file, ...(field ? { field } : {}), message: `${where}: ${text}` }
}

/** One line per problem, for the build to show them all at once. */
export function formatProblems(problems: ReadonlyArray<Problem>): string {
  return problems.map((p) => `- ${p.message}`).join('\n')
}

const format = SchemaIssue.makeFormatterStandardSchemaV1()

const valueAt = (value: unknown, path: ReadonlyArray<PropertyKey>): unknown =>
  path.reduce<unknown>(
    (current, key) =>
      current !== null && typeof current === 'object'
        ? (current as Record<PropertyKey, unknown>)[key]
        : undefined,
    value,
  )

/** Effect's messages become sentences for whoever writes the content. */
function translate(original: string, value: unknown): string {
  const shown = value === undefined ? '' : ` (got ${JSON.stringify(value)})`
  // On an optional field Effect says "Expected X | undefined".
  const message = original.replace(/ \| undefined$/, '')
  if (message === 'Expected number') return `must be a number${shown}`
  if (message === 'Missing key') return 'required field missing'
  if (message === 'Expected no excess property') return 'unknown field'
  const list = /^Expected ((?:(?:"[^"]*"|-?\d+)(?: \| )?)+)$/.exec(message)
  if (list?.[1]) {
    const options = list[1].split(' | ').map((o) => o.replace(/"/g, ''))
    return `value outside the closed list (${options.join(' | ')})${shown}`
  }
  if (message === 'Expected an integer') return `must be an integer${shown}`
  if (message === 'Expected string') return `must be text${shown}`
  if (message === 'Expected boolean') return `must be true or false${shown}`
  if (message === 'Expected array') return `must be a list${shown}`
  if (message === 'Expected object') return `must be an object${shown}`
  return `${message}${shown}`
}

export type Decoded<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly problems: ReadonlyArray<Problem> }

/** Decodes with the schema, rejecting unknown fields, and returns every
 * problem at once. */
export function decode<S extends Schema.Decoder<unknown>>(
  schema: S,
  value: unknown,
  file: string,
): Decoded<S['Type']> {
  const result = Schema.decodeUnknownResult(schema)(value, {
    errors: 'all',
    onExcessProperty: 'error',
  })
  if (Result.isSuccess(result)) return { ok: true, value: result.success }
  const failure = format(result.failure.issue)
  return {
    ok: false,
    problems: failure.issues.map((issue) => {
      const path = (issue.path ?? []).map((p) =>
        typeof p === 'object' && p !== null && 'key' in p ? p.key : p,
      )
      return problem(
        file,
        translate(issue.message, valueAt(value, path)),
        path.length > 0 ? path.map(String).join('.') : undefined,
      )
    }),
  }
}
