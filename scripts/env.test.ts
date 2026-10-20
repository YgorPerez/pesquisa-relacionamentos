import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import {
  flag,
  folder,
  optionalEmail,
  optionalFile,
  port,
  readEnv,
  user,
} from './env.ts'

const FOLDER = mkdtempSync(join(tmpdir(), 'env-'))
afterAll(() => rmSync(FOLDER, { recursive: true, force: true }))
mkdirSync(join(FOLDER, 'acervo'))
writeFileSync(join(FOLDER, 'sitemap.xml'), '<urlset/>')

describe('readEnv', () => {
  const schemas = {
    DEV_PORT: port(4310),
    CONTENT_ROOT: folder(FOLDER, '.'),
    SITEMAP_ANTERIOR: optionalFile(FOLDER),
    VITE_COUNT_ON_LOCALHOST: flag(false),
  }

  it('with no variable at all, gives the defaults', () => {
    expect(readEnv(schemas, {})).toEqual({
      DEV_PORT: 4310,
      CONTENT_ROOT: FOLDER,
      SITEMAP_ANTERIOR: undefined,
      VITE_COUNT_ON_LOCALHOST: false,
    })
  })

  it('a blank key counts as missing, and surrounding whitespace is trimmed', () => {
    const source = { DEV_PORT: '', CONTENT_ROOT: ' acervo ' }
    expect(readEnv(schemas, source)).toMatchObject({
      DEV_PORT: 4310,
      CONTENT_ROOT: join(FOLDER, 'acervo'),
    })
    // `createEnv` deletes the blank keys from the object it gets: the caller's
    // source stays as it was.
    expect(source).toEqual({ DEV_PORT: '', CONTENT_ROOT: ' acervo ' })
  })

  it('reads what the environment gives, with paths relative to the base', () => {
    expect(
      readEnv(schemas, {
        DEV_PORT: '5000',
        CONTENT_ROOT: 'acervo',
        SITEMAP_ANTERIOR: 'sitemap.xml',
        VITE_COUNT_ON_LOCALHOST: '1',
      }),
    ).toEqual({
      DEV_PORT: 5000,
      CONTENT_ROOT: join(FOLDER, 'acervo'),
      SITEMAP_ANTERIOR: join(FOLDER, 'sitemap.xml'),
      VITE_COUNT_ON_LOCALHOST: true,
    })
  })

  it.each([
    ['DEV_PORT', 'abc', 'a port, from 1 to 65535'],
    ['DEV_PORT', '70000', 'a port, from 1 to 65535'],
    ['DEV_PORT', '50.5', 'a port, from 1 to 65535'],
    ['CONTENT_ROOT', 'does-not-exist', 'an existing folder'],
    ['CONTENT_ROOT', 'sitemap.xml', 'an existing folder'],
    ['SITEMAP_ANTERIOR', 'does-not-exist.xml', 'an existing file'],
    ['SITEMAP_ANTERIOR', 'acervo', 'an existing file'],
    ['VITE_COUNT_ON_LOCALHOST', 'maybe', '1 or 0'],
  ])(
    '%s=%s stops everything, naming the variable and what was expected',
    (name, value, expected) => {
      expect(() => readEnv(schemas, { [name]: value })).toThrow(
        `${name}=${JSON.stringify(value)}: expected ${expected}`,
      )
    },
  )

  it('an e-mail has an at sign and a domain', () => {
    const schema = { GOATCOUNTER_EMAIL: optionalEmail }
    expect(readEnv(schema, {})).toEqual({ GOATCOUNTER_EMAIL: undefined })
    expect(readEnv(schema, { GOATCOUNTER_EMAIL: 'me@site.com' })).toEqual({
      GOATCOUNTER_EMAIL: 'me@site.com',
    })
    expect(() => readEnv(schema, { GOATCOUNTER_EMAIL: 'me@site' })).toThrow(
      'GOATCOUNTER_EMAIL="me@site": expected an e-mail',
    )
  })

  it('the VPS user is a system name', () => {
    const schema = { VPS_USER: user('root') }
    expect(readEnv(schema, {})).toEqual({ VPS_USER: 'root' })
    expect(readEnv(schema, { VPS_USER: 'deploy' })).toEqual({
      VPS_USER: 'deploy',
    })
    expect(() => readEnv(schema, { VPS_USER: 'root;ls' })).toThrow(
      'VPS_USER="root;ls": expected a user (lowercase, digits, _ and -)',
    )
  })

  it('gathers every wrong one into a single message', () => {
    expect(() =>
      readEnv(schemas, { DEV_PORT: 'x', VITE_COUNT_ON_LOCALHOST: 'y' }),
    ).toThrow(
      'Invalid environment variables:\n' +
        '  DEV_PORT="x": expected a port, from 1 to 65535\n' +
        '  VITE_COUNT_ON_LOCALHOST="y": expected 1 or 0',
    )
  })
})
