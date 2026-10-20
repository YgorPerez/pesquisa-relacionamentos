import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { readBuildEnvironment } from './environment.ts'

const FRONTEND = resolve(import.meta.dirname, '..')

const FOLDER = mkdtempSync(join(tmpdir(), 'environment-'))
afterAll(() => rmSync(FOLDER, { recursive: true, force: true }))
writeFileSync(join(FOLDER, 'sitemap.xml'), '<urlset/>')
mkdirSync(join(FOLDER, 'library'))

describe('readBuildEnvironment', () => {
  it('with nothing, the repository root library, no sitemap and no counting on localhost', () => {
    expect(readBuildEnvironment({})).toEqual({
      contentRoot: resolve(FRONTEND, '..'),
      previousSitemap: undefined,
      countOnLocalhost: false,
    })
  })

  it('the e2e fixture, as `playwright.config.ts` asks', () => {
    expect(
      readBuildEnvironment({
        CONTENT_ROOT: 'e2e/library',
        VITE_COUNT_ON_LOCALHOST: '1',
      }),
    ).toEqual({
      contentRoot: join(FRONTEND, 'e2e/library'),
      previousSitemap: undefined,
      countOnLocalhost: true,
    })
  })

  it('absolute paths count as they came', () => {
    expect(
      readBuildEnvironment({
        CONTENT_ROOT: join(FOLDER, 'library'),
        SITEMAP_ANTERIOR: join(FOLDER, 'sitemap.xml'),
      }),
    ).toMatchObject({
      contentRoot: join(FOLDER, 'library'),
      previousSitemap: join(FOLDER, 'sitemap.xml'),
    })
  })

  it('a relative SITEMAP_ANTERIOR starts from where the command ran', () => {
    const { previousSitemap } = readBuildEnvironment(
      { SITEMAP_ANTERIOR: 'sitemap.xml' },
      FOLDER,
    )
    expect(previousSitemap).toBe(join(FOLDER, 'sitemap.xml'))
  })

  it('a root that does not exist stops the build before reading the library', () => {
    expect(() => readBuildEnvironment({ CONTENT_ROOT: 'e2e/libary' })).toThrow(
      'CONTENT_ROOT="e2e/libary": expected an existing folder',
    )
  })

  it('a missing sitemap stops the build', () => {
    expect(() =>
      readBuildEnvironment({ SITEMAP_ANTERIOR: '/tmp/does-not-exist.xml' }),
    ).toThrow(
      'SITEMAP_ANTERIOR="/tmp/does-not-exist.xml": expected an existing file',
    )
  })

  it('counting on localhost only accepts 1 or 0', () => {
    expect(() =>
      readBuildEnvironment({ VITE_COUNT_ON_LOCALHOST: 'true' }),
    ).toThrow('VITE_COUNT_ON_LOCALHOST="true": expected 1 or 0')
  })
})
