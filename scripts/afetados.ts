// O que um diff afeta, como o `afetados.ts` do Festival dos Macacos: a suíte
// do PR (`suite-do-pr.ts`), a menor prova (`prova-minima.ts`) e o hook de push
// (`verificar-push.ts`) rodam só isso. A suíte inteira roda no CI do PR e toda
// noite.
//
// Os testes do Vitest escolhem a si mesmos: o `--changed <base>` segue o grafo
// de imports a partir do que mudou. O que sobra decidir aqui é quando rodar
// tudo, porque o grafo não vê o que muda por fora dele (o lockfile, uma
// config, o plugin que lê o acervo), em quais pacotes rodar o Vitest, e quais
// specs do e2e o diff alcança, porque uma spec abre um endereço e não importa
// a tela. Uma spec alcança os termos que diz a tabela abaixo, pelo nome do
// arquivo do app que mudou e pelas pastas dele.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { spawnSync } from 'node:child_process'

/** Os termos que cada spec do e2e percorre. Uma spec nova entra aqui, e o
 * teste deste arquivo falha até ela entrar. */
export const TERMOS_DAS_SPECS: Readonly<Record<string, readonly string[]>> = {
  'accessibility.e2e.ts': [],
  'analytics.e2e.ts': ['analytics', 'contagem', 'privacidade'],
  'search.e2e.ts': ['busca', 'guia', 'estudos'],
  'possible-group-card.e2e.ts': ['grupo-possivel', 'compartilhar'],
  'fact-sheets.e2e.ts': ['estudos', 'selos'],
  'possible-group.e2e.ts': ['grupo-possivel'],
  'guide.e2e.ts': ['guia', 'dicas', 'inicio'],
  'home.e2e.ts': ['inicio'],
  'reads.e2e.ts': ['leituras'],
  'link.e2e.ts': ['link', 'compartilhar', 'grupo-possivel', 'prioridades'],
  'navigation.e2e.ts': ['navegacao', 'topo', 'guia'],
  'profile.e2e.ts': ['perfil', 'guia'],
  'priorities.e2e.ts': ['prioridades', 'guia'],
  'privacy.e2e.ts': ['privacidade'],
}

/** Rodam em toda rodada que mexe no app: abrem cada página a frio, e pegam o
 * que quebra em qualquer uma. */
const SEMPRE = ['accessibility.e2e.ts', 'home.e2e.ts']

/** O nome de arquivo ou de pasta que não é o termo dele. */
const APELIDOS: Readonly<Record<string, string>> = {
  $tema: 'guia',
  guias: 'guia',
  guides: 'guia',
  'guide-view': 'guia',
  'profile-in-guide': 'perfil',
  'group-packs': 'grupo-possivel',
  'priorities-view': 'prioridades',
  'fact-sheets': 'estudos',
  'cited-in': 'estudos',
  goatcounter: 'analytics',
  counting: 'analytics',
  events: 'analytics',
  index: 'inicio',
  home: 'inicio',
  header: 'topo',
  navigation: 'navegacao',
  badges: 'selos',
  share: 'compartilhar',
  profile: 'perfil',
  priorities: 'prioridades',
  'possible-group': 'grupo-possivel',
  reads: 'leituras',
  search: 'busca',
}

/** O que muda por fora do grafo de imports, ou o que todo o resto usa. */
const DE_TODOS: ReadonlyArray<[RegExp, string]> = [
  [/^packages\//, 'packages/ é lido pelo app inteiro'],
  [/(^|\/)platform\//, 'platform/ é de todas as páginas'],
  [/(^|\/)pnpm-(lock|workspace)\.yaml$/, 'mudou o pnpm-lock ou o workspace'],
  [/(^|\/)package\.json$/, 'mudou um package.json'],
  [/(^|\/)tsconfig[^/]*\.json$/, 'mudou um tsconfig'],
  [/(^|\/)[^/]+\.config\.(ts|js|mjs)$/, 'mudou uma config'],
  [/^frontend\/\.storybook\//, 'mudou a config do Storybook'],
  [/^frontend\/lint\//, 'mudou uma regra do lint'],
  [/^frontend\/vite\//, 'mudou um plugin do build'],
  [
    /^frontend\/src\/[^/]+$/,
    'mudou a entrada do app (router, servidor, estilos)',
  ],
  [/^frontend\/src\/routes\/__root\.tsx$/, 'mudou a raiz das rotas'],
  [
    /^frontend\/src\/ui\/(tokens|drawings|fonts|desenhos|fontes)\.css$/,
    'mudou o estilo de todas as páginas',
  ],
  [
    /^frontend\/src\/(content\/view|state\/stored|conteudo\/vista|estado\/armazenado)\.ts$/,
    'mudou o que toda página lê',
  ],
  [/^frontend\/e2e\/(?![^/]+\.e2e\.ts$)/, 'mudou o e2e por baixo das specs'],
  [
    /^scripts\/(portas|fila-da-maquina|dev|matar-arvore)\.ts$/,
    'mudou um script que a suíte usa',
  ],
  [/^\.github\/workflows\//, 'mudou o CI'],
]

/** Não tem teste: texto para gente e para agente. */
const SO_TEXTO = /(\.md$|^docs\/|^\.claude\/|^\.agents\/|^GLOSSARY|^README)/
/** O acervo, que o Conteúdo valida e o build lê. */
const ACERVO = /^(estudos|dicas|relatorios|fontes|dados)\//
const DA_RAIZ = /^(\.github\/)?scripts\//

export type Plano = {
  /** Por que roda tudo, ou `null` quando roda só o afetado. */
  readonly completo: string | null
  /** As pastas onde o Vitest roda, com o `--changed`: `frontend`, um pacote
   * de `packages/`, ou `.` para os scripts da raiz. */
  readonly pacotes: readonly string[]
  /** Se o build roda. */
  readonly build: boolean
  /** Se os testes das stories rodam. */
  readonly stories: boolean
  /** As specs do e2e, em ordem. Vazio, o e2e não roda. */
  readonly specs: readonly string[]
  /** O que o log diz sobre cada escolha. */
  readonly motivos: readonly string[]
}

const TODAS_AS_SPECS = Object.keys(TERMOS_DAS_SPECS).sort()
const TERMOS = new Set(Object.values(TERMOS_DAS_SPECS).flat())
const PASTAS = ['frontend', 'packages/content', 'packages/rules', '.']

/** Os termos de um arquivo do app: cada pasta e o nome, sem as extensões. */
function termosDoArquivo(caminho: string) {
  return caminho
    .replace(/^frontend\/src\/[^/]+\//, '')
    .split('/')
    .map((parte) => parte.replace(/(\.[a-z]+)+$/, ''))
    .map((parte) => APELIDOS[parte] ?? parte)
    .filter((parte) => TERMOS.has(parte))
}

/** O plano de uma rodada, a partir dos arquivos que o diff mudou, com os
 * caminhos a partir da raiz do repo. */
export function planoDoDiff(arquivos: readonly string[]): Plano {
  const pacotes = new Set<string>()
  const specs = new Set<string>()
  const motivos: string[] = []
  let app = false
  let build = false
  let e2eInteiro = false

  for (const arquivo of arquivos) {
    const deTodos = DE_TODOS.find(([padrao]) => padrao.test(arquivo))
    if (deTodos)
      return {
        completo: `${deTodos[1]} (${arquivo})`,
        pacotes: PASTAS,
        build: true,
        stories: true,
        specs: TODAS_AS_SPECS,
        motivos: [],
      }
    // Antes do texto: uma Ficha é `.md`, e o build a lê.
    if (ACERVO.test(arquivo)) {
      pacotes.add('packages/content')
      build = true
      continue
    }
    if (SO_TEXTO.test(arquivo)) continue
    if (DA_RAIZ.test(arquivo)) {
      pacotes.add('.')
      continue
    }
    const spec = /^frontend\/e2e\/([^/]+\.e2e\.ts)$/.exec(arquivo)?.[1]
    if (spec) {
      specs.add(spec)
      build = true
      continue
    }
    if (!arquivo.startsWith('frontend/')) {
      motivos.push(`${arquivo} não tem teste`)
      continue
    }
    pacotes.add('frontend')
    if (!arquivo.startsWith('frontend/src/')) continue
    app = true
    build = true
    if (arquivo.endsWith('.test.ts')) continue
    const termos = termosDoArquivo(arquivo)
    if (termos.length === 0) {
      e2eInteiro = true
      motivos.push(`e2e inteiro: ${arquivo} não tem termo na tabela`)
    }
    for (const termo of termos)
      for (const [nome, dela] of Object.entries(TERMOS_DAS_SPECS))
        if (dela.includes(termo)) specs.add(nome)
  }

  if (app)
    for (const spec of e2eInteiro ? TODAS_AS_SPECS : SEMPRE) specs.add(spec)
  return {
    completo: null,
    pacotes: PASTAS.filter((p) => pacotes.has(p)),
    build,
    stories: app,
    specs: [...specs].sort(),
    motivos,
  }
}

/** O commit de onde o `HEAD` saiu de `contra`, e o que mudou desde ele, o que
 * não foi commitado e os arquivos novos inclusive. Busca o `origin` antes,
 * a menos que `buscar` seja `false`. */
export function diffContra(
  raiz: string,
  contra: string,
  { buscar = true } = {},
) {
  const git = (...args: string[]) => {
    const saida = spawnSync('git', args, { cwd: raiz, encoding: 'utf8' })
    if (saida.status !== 0)
      throw new Error(`git ${args.join(' ')}: ${saida.stderr.trim()}`)
    return saida.stdout.trim()
  }
  if (buscar) spawnSync('git', ['fetch', '-q', 'origin'], { cwd: raiz })
  const base = git('merge-base', contra, 'HEAD')
  const arquivos = [
    ...git('diff', '--name-only', '--no-renames', base).split(/\r?\n/),
    ...git('ls-files', '--others', '--exclude-standard').split(/\r?\n/),
  ].filter(Boolean)
  return { base, arquivos: [...new Set(arquivos)].sort() }
}
