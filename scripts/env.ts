// The repository's environment variables, read and validated with T3 Env
// (ADR 0032, modeled on Festival dos Macacos' `env.server.ts`). Readers:
// `./ports.ts` (the port of each use), `frontend/vite/environment.ts` (the build
// ones: the library, the sitemap and counting on localhost),
// `frontend/scripts/vps.ts` (the VPS, the GoatCounter login and the comment
// token it hands the app) and `frontend/src/platform/server-env.ts` (that
// token, in the app server).
//
// Each type is a hand-written Standard Schema, which `createEnv` accepts per
// key: the app does not use Effect (spec #23), and a zod just for this would
// weigh more than the few lines here. A blank key (as `.env.example` leaves it)
// counts as missing, and surrounding whitespace is trimmed.
//
// Runs on plain `node`, which reads TypeScript by itself: only erasable syntax.

import { createEnv, type StandardSchemaV1 } from '@t3-oss/env-core'
import { statSync } from 'node:fs'
import { resolve } from 'node:path'

type Schema<Output> = StandardSchemaV1<unknown, Output>

/** A variable type: `fallback` when it is missing, else what `convert` gets
 * from the trimmed text, or the error with `expected`. */
function variable<Output>(
  expected: string,
  fallback: Output,
  convert: (value: string) => Output | undefined,
): Schema<Output> {
  return {
    '~standard': {
      version: 1,
      vendor: 'tem-estudo',
      validate(raw) {
        if (raw === undefined) return { value: fallback }
        const value = typeof raw === 'string' ? raw.trim() : undefined
        const converted = value ? convert(value) : undefined
        return converted === undefined
          ? { issues: [{ message: `expected ${expected}` }] }
          : { value: converted }
      },
    },
  }
}

/** A TCP port. */
export const port = (fallback: number) =>
  variable('a port, from 1 to 65535', fallback, (value) => {
    const number = Number(value)
    return /^\d+$/.test(value) && number >= 1 && number <= 65_535
      ? number
      : undefined
  })

const isFolder = (path: string) =>
  statSync(path, { throwIfNoEntry: false })?.isDirectory() ?? false
const isFile = (path: string) =>
  statSync(path, { throwIfNoEntry: false })?.isFile() ?? false

/** A folder that exists, relative to `base`. Missing, `base`/`fallback`. */
export const folder = (base: string, fallback: string) =>
  variable('an existing folder', resolve(base, fallback), (value) => {
    const path = resolve(base, value)
    return isFolder(path) ? path : undefined
  })

/** A file that exists, relative to `base`, or nothing. */
export const optionalFile = (base: string) =>
  variable<string | undefined>('an existing file', undefined, (value) => {
    const path = resolve(base, value)
    return isFile(path) ? path : undefined
  })

/** A system user, like the SSH one on the VPS. */
export const user = (fallback: string) =>
  variable('a user (lowercase, digits, _ and -)', fallback, (value) =>
    /^[a-z_][a-z0-9_-]*$/.test(value) ? value : undefined,
  )

/** An e-mail, like the GoatCounter login, or nothing. */
export const optionalEmail = variable<string | undefined>(
  'an e-mail',
  undefined,
  (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined),
)

/** A secret, like the token that opens a Comentário's issue, or nothing
 * (blank too). It never fails: the error message would print its value. */
export const optionalSecret: Schema<string | undefined> = {
  '~standard': {
    version: 1,
    vendor: 'tem-estudo',
    validate: (raw) => ({
      value: (typeof raw === 'string' && raw.trim()) || undefined,
    }),
  },
}

/** An on/off switch, `1` or `0`, like `VITE_COUNT_ON_LOCALHOST`. */
export const flag = (fallback: boolean) =>
  variable('1 or 0', fallback, (value) =>
    value === '1' ? true : value === '0' ? false : undefined,
  )

type Schemas = Record<string, Schema<unknown>>
type Read<S extends Schemas> = {
  [Name in keyof S]: StandardSchemaV1.InferOutput<S[Name]>
}

/** Reads the variables of `schemas` from `source`, or throws a single message
 * with each wrong variable, the value it had and what was expected. */
export function readEnv<S extends Schemas>(
  schemas: S,
  source: Record<string, string | undefined>,
): Read<S> {
  // A copy: `emptyStringAsUndefined` deletes the blank keys from the object.
  const runtimeEnv = { ...source }
  const read = createEnv({
    server: schemas,
    runtimeEnv,
    isServer: true,
    emptyStringAsUndefined: true,
    onValidationError(issues) {
      const lines = issues.map((issue) => {
        const [key] = issue.path ?? []
        const name = String(
          typeof key === 'object' && key !== null ? key.key : key,
        )
        return `  ${name}=${JSON.stringify(source[name])}: ${issue.message}`
      })
      throw new Error(`Invalid environment variables:\n${lines.join('\n')}`)
    },
  })
  // A plain object, not T3 Env's Proxy: callers compare and spread it.
  return { ...read } as Read<S>
}
