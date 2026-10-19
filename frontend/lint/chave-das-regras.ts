// O `lint/chave-das-regras.ts` do Festival dos Macacos é a chave de cache do
// ESLint: muda quando muda o que as regras leem fora do arquivo lintado. O
// Oxlint do Vite+ não tem esse cache, e o `vp run --cache` já anota sozinho
// cada arquivo que o lint lê (ADR 0002). O que sobra daquele papel é o outro
// lado da mesma pergunta, "as regras que valem são as que a gente acha que
// valem?", e é o que este arquivo confere no `lint` do `vite.config.ts` da
// raiz (ADR 0029):
//
// - todo plugin local de `frontend/lint/` está em `lint.jsPlugins`;
// - toda regra de um plugin local está ligada em algum lugar, e toda regra
//   ligada com o nome de um plugin local existe nele;
// - as regras do `@shadcn/lint` que o ticket #54 pede estão ligadas no app, e
//   desligadas em `src/ui/shadcn/`, onde a classe é a definição da variante.
//
// O `chave-das-regras.test.ts` roda a conferência sobre a config de verdade.

type Nivel = string | [string, ...unknown[]]

export type ConfigDoLint = {
  jsPlugins?: ReadonlyArray<string | { name: string; specifier: string }>
  rules?: Record<string, Nivel>
  overrides?: ReadonlyArray<{
    files: ReadonlyArray<string>
    excludeFiles?: ReadonlyArray<string>
    rules?: Record<string, Nivel>
  }>
}

/** Um plugin local: o nome dele e as regras que ele traz. */
export type PluginLocal = {
  readonly caminho: string
  readonly nome: string
  readonly regras: ReadonlyArray<string>
}

/** As regras do `@shadcn/lint` que o app liga (ticket #54). */
const REGRAS_DO_SHADCN = [
  'shadcn/no-unknown-classes',
  'shadcn/no-raw-colors',
  'shadcn/require-static-classes',
  'shadcn/no-arbitrary-values',
  'shadcn/no-restyle',
] as const

const PASTA_DO_SHADCN = 'frontend/src/ui/shadcn/**'

const ligada = (nivel: Nivel | undefined) =>
  nivel !== undefined && (Array.isArray(nivel) ? nivel[0] : nivel) !== 'off'

type Bloco = {
  files: ReadonlyArray<string>
  excludeFiles: ReadonlyArray<string>
  rules: Record<string, Nivel>
}

/** As `rules` de cima e as de cada `override`, num formato só. */
const blocosDe = (lint: ConfigDoLint): Bloco[] => [
  { files: ['**'], excludeFiles: [], rules: lint.rules ?? {} },
  ...(lint.overrides ?? []).map((o) => ({
    files: o.files,
    excludeFiles: o.excludeFiles ?? [],
    rules: o.rules ?? {},
  })),
]

/** Cada plugin local está em `jsPlugins`, com toda regra ligada. */
function pluginsSemChave(
  lint: ConfigDoLint,
  locais: ReadonlyArray<PluginLocal>,
  ligadas: ReadonlySet<string>,
): string[] {
  const caminhos = new Set(
    (lint.jsPlugins ?? []).map((p) =>
      typeof p === 'string' ? p : p.specifier,
    ),
  )
  return locais.flatMap((plugin) => [
    ...(caminhos.has(plugin.caminho)
      ? []
      : [`${plugin.caminho} não está em lint.jsPlugins`]),
    ...plugin.regras
      .filter((regra) => !ligadas.has(`${plugin.nome}/${regra}`))
      .map(
        (regra) => `${plugin.nome}/${regra} não está ligada em lugar nenhum`,
      ),
  ])
}

/** Cada regra ligada com o nome de um plugin local existe nele. */
function regrasQueNaoExistem(
  locais: ReadonlyArray<PluginLocal>,
  ligadas: ReadonlySet<string>,
): string[] {
  const porNome = new Map(locais.map((p) => [p.nome, new Set(p.regras)]))
  return [...ligadas].flatMap((nome) => {
    const [plugin = '', regra = ''] = nome.split('/')
    const regras = porNome.get(plugin)
    return regras && !regras.has(regra)
      ? [`${nome} está ligada, mas o plugin ${plugin} não a tem`]
      : []
  })
}

/** As do `@shadcn/lint` valem no app e não em `ui/shadcn/`. */
function shadcnForaDoLugar(blocos: ReadonlyArray<Bloco>): string[] {
  return REGRAS_DO_SHADCN.flatMap((regra) => {
    const noApp = blocos.filter(
      (b) =>
        ligada(b.rules[regra]) &&
        b.files.some((f) => f.startsWith('frontend/src')),
    )
    if (noApp.length === 0) return [`${regra} não está ligada em frontend/src`]
    return noApp
      .filter((b) => !b.excludeFiles.includes(PASTA_DO_SHADCN))
      .map(() => `${regra} vale também em ${PASTA_DO_SHADCN}`)
  })
}

/** Os problemas da config; vazio quando está tudo certo. */
export function conferirRegras(
  lint: ConfigDoLint,
  locais: ReadonlyArray<PluginLocal>,
): string[] {
  const blocos = blocosDe(lint)
  const ligadas = new Set(
    blocos.flatMap((b) =>
      Object.entries(b.rules)
        .filter(([, nivel]) => ligada(nivel))
        .map(([nome]) => nome),
    ),
  )
  return [
    ...pluginsSemChave(lint, locais, ligadas),
    ...regrasQueNaoExistem(locais, ligadas),
    ...shadcnForaDoLugar(blocos),
  ]
}
