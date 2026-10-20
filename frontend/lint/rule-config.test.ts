import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import config from '../../vite.config.ts'
import { checkRules, type LintConfig, type LocalPlugin } from './rule-config.ts'

/** The `frontend/lint/` plugins: every `.ts` that exports a plugin. */
async function localPlugins(): Promise<LocalPlugin[]> {
  const folder = import.meta.dirname
  // Only the ones that define a plugin: `folders.ts` is a script, and runs on
  // import.
  const files = readdirSync(folder).filter(
    (a) =>
      a.endsWith('.ts') &&
      !a.endsWith('.test.ts') &&
      readFileSync(resolve(folder, a), 'utf8').includes('definePlugin('),
  )
  const plugins: LocalPlugin[] = []
  for (const file of files) {
    const imported = (await import(
      /* @vite-ignore */ pathToFileURL(resolve(folder, file)).href
    )) as { default?: { meta?: { name?: string }; rules?: object } }
    const plugin = imported.default
    if (!plugin?.meta?.name || !plugin.rules) continue
    plugins.push({
      path: `./frontend/lint/${file}`,
      name: plugin.meta.name,
      rules: Object.keys(plugin.rules),
    })
  }
  return plugins
}

const lint = (config as { lint: LintConfig }).lint

describe('the lint rules', () => {
  it('are the ones we think they are', async () => {
    const locals = await localPlugins()
    expect(locals.map((p) => p.name).sort()).toEqual([
      'cohesion',
      'html',
      'modules',
      'screens',
      'state',
      'theme',
    ])
    expect(checkRules(lint, locals)).toEqual([])
  })

  it('point out the plugin missing from jsPlugins and the rule turned off', () => {
    const locals: LocalPlugin[] = [
      { path: './frontend/lint/x.ts', name: 'x', rules: ['a', 'b'] },
    ]
    expect(
      checkRules(
        { jsPlugins: [], rules: { 'x/a': 'error', 'x/c': 'error' } },
        locals,
      ),
    ).toEqual(
      expect.arrayContaining([
        './frontend/lint/x.ts is not in lint.jsPlugins',
        'x/b is not turned on anywhere',
        'x/c is turned on, but plugin x does not have it',
        'shadcn/no-restyle is not turned on in frontend/src',
      ]),
    )
  })

  it('points out the shadcn rule that applies in ui/shadcn/', () => {
    expect(
      checkRules(
        {
          overrides: [
            {
              files: ['frontend/src/**'],
              rules: { 'shadcn/no-restyle': 'error' },
            },
          ],
        },
        [],
      ),
    ).toContain('shadcn/no-restyle also applies in frontend/src/ui/shadcn/**')
  })
})
