import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import config from '../../vite.config.ts'
import {
  conferirRegras,
  type ConfigDoLint,
  type PluginLocal,
} from './chave-das-regras.ts'

/** Os plugins de `frontend/lint/`: todo `.ts` que exporta um plugin. */
async function pluginsLocais(): Promise<PluginLocal[]> {
  const pasta = import.meta.dirname
  // Só os que definem plugin: o `pastas.ts` é um script, e roda ao importar.
  const arquivos = readdirSync(pasta).filter(
    (a) =>
      a.endsWith('.ts') &&
      !a.endsWith('.test.ts') &&
      readFileSync(resolve(pasta, a), 'utf8').includes('definePlugin('),
  )
  const plugins: PluginLocal[] = []
  for (const arquivo of arquivos) {
    const modulo = (await import(
      /* @vite-ignore */ pathToFileURL(resolve(pasta, arquivo)).href
    )) as { default?: { meta?: { name?: string }; rules?: object } }
    const plugin = modulo.default
    if (!plugin?.meta?.name || !plugin.rules) continue
    plugins.push({
      caminho: `./frontend/lint/${arquivo}`,
      nome: plugin.meta.name,
      regras: Object.keys(plugin.rules),
    })
  }
  return plugins
}

const lint = (config as { lint: ConfigDoLint }).lint

describe('as regras do lint', () => {
  it('são as que a gente acha que são', async () => {
    const locais = await pluginsLocais()
    expect(locais.map((p) => p.nome).sort()).toEqual([
      'coesao',
      'estado',
      'html',
      'modulos',
      'tema',
    ])
    expect(conferirRegras(lint, locais)).toEqual([])
  })

  it('apontam o plugin fora do jsPlugins e a regra desligada', () => {
    const locais: PluginLocal[] = [
      { caminho: './frontend/lint/x.ts', nome: 'x', regras: ['a', 'b'] },
    ]
    expect(
      conferirRegras(
        { jsPlugins: [], rules: { 'x/a': 'error', 'x/c': 'error' } },
        locais,
      ),
    ).toEqual(
      expect.arrayContaining([
        './frontend/lint/x.ts não está em lint.jsPlugins',
        'x/b não está ligada em lugar nenhum',
        'x/c está ligada, mas o plugin x não a tem',
        'shadcn/no-restyle não está ligada em frontend/src',
      ]),
    )
  })

  it('aponta a regra do shadcn que vale em ui/shadcn/', () => {
    expect(
      conferirRegras(
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
    ).toContain('shadcn/no-restyle vale também em frontend/src/ui/shadcn/**')
  })
})
