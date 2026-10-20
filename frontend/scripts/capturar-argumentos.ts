// O que `scripts/capturar.ts` entende da linha de comando, e os ids de story
// parecidos com um que não existe, sem navegador: separado para ser testado
// (`capturar-argumentos.test.ts`). Veio do Festival dos Macacos.

export const TELAS = {
  celular: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const

export type Tela = keyof typeof TELAS

export type Opcoes = {
  /** O caminho no app, com a busca: `/prioridades?topo=renda`. */
  rota: string
  /** Onde o app roda, sem barra no fim. */
  base: string
  saida: string
  /** O começo do nome de cada arquivo; `-celular.png` e `-desktop.png` vêm
   * depois. */
  nome: string
  /** Seletores do Playwright tocados em ordem antes da captura. */
  toques: string[]
  /** A página inteira, e não só a primeira tela. */
  inteira: boolean
  /** Grava também um vídeo de cada tela, do carregamento ao último toque, com
   * o movimento ligado. */
  video: boolean
  telas: Tela[]
}

/** Com `--story`: uma story do Storybook fotografada em instantes da
 * animação, numa tela só. */
export type OpcoesDaStory = {
  /** O id da story no `index.json`: `ui-perfil--vazio`. */
  story: string
  /** Os instantes em ms, contados do carregamento da story, em ordem e sem
   * repetir. */
  instantes: number[]
  /** Onde o Storybook roda, sem barra no fim. */
  base: string
  saida: string
  /** O começo do nome de cada arquivo; `-celular-0500ms.png` vem depois. */
  nome: string
  tela: Tela
}

/** Onde cada um roda por padrão: o `pnpm start` e o `pnpm storybook` do
 * checkout (`scripts/ports.ts`). */
export type Padroes = { saida: string; app: string; storybook: string }

export const USO = `Uso: node scripts/capturar.ts <rota> [opções]

  --tocar <seletor>    toca num seletor do Playwright antes; repete em ordem
  --inteira            captura a página inteira, não só a primeira tela
  --video              grava também um vídeo de cada tela (.mp4 com ffmpeg, .webm sem)
  --so celular|desktop só uma das telas (390×844 e 1280×800)
  --nome <nome>        começo do nome dos arquivos (padrão: a rota)
  --saida <pasta>      onde gravar (padrão: <tmp>/capturas)
  --base <url>         onde o app roda (padrão: o \`pnpm start\` deste checkout)
  --porta <n>          o mesmo que --base http://localhost:<n>

Ou uma story do Storybook, em instantes da animação:

  node scripts/capturar.ts --story <id> --em 0,500,1000 [opções]

  --story <id>         o id da story no index.json do Storybook que está rodando
  --em <ms,ms,...>     os instantes, contados do carregamento da story (padrão: 0)
  --so celular|desktop a tela (padrão: celular)
  --nome, --saida, --base e --porta como acima; o Storybook padrão é o do
  \`pnpm storybook\` deste checkout`

const COM_VALOR = new Set([
  '--tocar',
  '--so',
  '--nome',
  '--saida',
  '--base',
  '--porta',
  '--story',
  '--em',
])
const SEM_VALOR = new Set(['--inteira', '--video'])

/** `/estudos/costa-2018?de=busca` → `estudos-costa-2018`. */
export function nomeDaRota(rota: string): string {
  const caminho = rota.split('?')[0] ?? ''
  const nome = caminho
    .split('/')
    .filter(Boolean)
    .join('-')
    .replace(/[^\w.-]/g, '_')
  return nome || 'inicio'
}

export function lerArgumentos(
  argv: readonly string[],
  padroes: Padroes,
): Opcoes | OpcoesDaStory | { erro: string } {
  const separados = separar(argv)
  if ('erro' in separados) return separados
  const { valores, ligadas } = separados
  const ultimo = (opcao: string) => valores.get(opcao)?.at(-1)
  const base = baseDe(ultimo)
  if (typeof base === 'object') return base
  if (valores.has('--story'))
    return daStory(separados, ultimo, {
      saida: padroes.saida,
      base: base ?? padroes.storybook,
    })
  if (valores.has('--em')) return { erro: '--em é só com --story' }

  const rota = rotaDe(separados.rotas)
  if (typeof rota !== 'string') return rota

  const telas = telasDe(ultimo('--so'))
  if ('erro' in telas) return telas

  return {
    rota,
    base: base ?? padroes.app,
    saida: ultimo('--saida') ?? padroes.saida,
    nome: ultimo('--nome') ?? nomeDaRota(rota),
    toques: valores.get('--tocar') ?? [],
    inteira: ligadas.has('--inteira'),
    video: ligadas.has('--video'),
    telas,
  }
}

/** Onde o app ou o Storybook roda, de `--base` ou `--porta`, ou `undefined`
 * para o padrão de cada um. */
function baseDe(
  ultimo: (opcao: string) => string | undefined,
): string | undefined | { erro: string } {
  const base = ultimo('--base')
  const porta = ultimo('--porta')
  if (base !== undefined && porta !== undefined)
    return { erro: '--base ou --porta, não os dois' }
  if (porta === undefined) return base?.replace(/\/+$/, '')
  if (!/^\d+$/.test(porta)) return { erro: '--porta pede um número' }
  return `http://localhost:${porta}`
}

/** As opções que só a captura de uma rota entende. */
const SO_DA_ROTA = ['--tocar', '--inteira', '--video']

function daStory(
  { rotas, valores, ligadas }: Separados,
  ultimo: (opcao: string) => string | undefined,
  padroes: { saida: string; base: string },
): OpcoesDaStory | { erro: string } {
  if (rotas.length > 0) return { erro: '--story não leva rota' }
  const daRota = SO_DA_ROTA.find(
    (opcao) => ligadas.has(opcao) || valores.has(opcao),
  )
  if (daRota) return { erro: `${daRota} não funciona com --story` }
  const instantes = instantesDe(ultimo('--em') ?? '0')
  if ('erro' in instantes) return instantes
  const tela = ultimo('--so') ?? 'celular'
  if (!(tela in TELAS)) return { erro: '--so aceita celular ou desktop' }
  const story = ultimo('--story') as string
  return {
    story,
    instantes,
    base: padroes.base,
    saida: ultimo('--saida') ?? padroes.saida,
    nome: ultimo('--nome') ?? story,
    tela: tela as Tela,
  }
}

/** `500,0,1000` → `[0, 500, 1000]`: o relógio da captura só anda para a
 * frente. */
function instantesDe(em: string): number[] | { erro: string } {
  const partes = em.split(',').map((parte) => parte.trim())
  if (partes.some((parte) => !/^\d+$/.test(parte)))
    return { erro: `--em pede milissegundos separados por vírgula: ${em}` }
  return [...new Set(partes.map(Number))].sort((a, b) => a - b)
}

/** As telas de `--so`, ou as duas sem ele. */
function telasDe(so: string | undefined): Tela[] | { erro: string } {
  if (so === undefined) return ['celular', 'desktop']
  if (!(so in TELAS)) return { erro: '--so aceita celular ou desktop' }
  return [so as Tela]
}

/** A linha de comando em três montes: as rotas, cada opção com valor com
 * todos os valores que vieram, na ordem, e as opções ligadas. */
type Separados = {
  rotas: string[]
  valores: Map<string, string[]>
  ligadas: Set<string>
}

function separar(argv: readonly string[]): Separados | { erro: string } {
  const rotas: string[] = []
  const valores = new Map<string, string[]>()
  const ligadas = new Set<string>()
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string
    if (!arg.startsWith('--')) {
      rotas.push(arg)
      continue
    }
    if (SEM_VALOR.has(arg)) {
      ligadas.add(arg)
      continue
    }
    if (!COM_VALOR.has(arg)) return { erro: `Opção desconhecida: ${arg}` }
    const valor = argv[i + 1]
    if (valor === undefined || valor.startsWith('--'))
      return { erro: `${arg} pede um valor` }
    valores.set(arg, [...(valores.get(arg) ?? []), valor])
    i++
  }
  return { rotas, valores, ligadas }
}

/** A rota, uma só, com a barra do começo. */
function rotaDe(rotas: readonly string[]): string | { erro: string } {
  const [rota] = rotas
  if (rota === undefined) return { erro: 'Falta a rota' }
  if (rotas.length > 1) return { erro: `Uma rota só, e vieram ${rotas.length}` }
  return rota.startsWith('/') ? rota : `/${rota}`
}

/** Os ids das stories de um `index.json` do Storybook. As páginas de docs
 * ficam fora: não são uma story que se fotografa. */
export function idsDoIndice(indice: unknown): string[] {
  const entradas = (indice as { entries?: Record<string, { type?: string }> })
    ?.entries
  if (!entradas) return []
  return Object.keys(entradas).filter((id) => entradas[id]?.type === 'story')
}

/** Até `quantos` ids parecidos com o pedido, os melhores primeiro: os que têm
 * mais pedaços do pedido e, entre eles, os mais perto por distância de
 * edição. Um id sem pedaço em comum só entra a poucas letras do pedido, como
 * num erro de digitação. */
export function idsParecidos(
  pedido: string,
  ids: readonly string[],
  quantos = 5,
): string[] {
  const alvo = pedido.toLowerCase().replaceAll('/', '-')
  const pedacosDoAlvo = new Set(pedacos(alvo))
  const perto = Math.max(2, Math.floor(alvo.length / 4))
  const candidatos: { id: string; comuns: number; distancia: number }[] = []
  for (const id of ids) {
    const dele = new Set(pedacos(id))
    const comuns = [...pedacosDoAlvo].filter((p) => dele.has(p)).length
    const ate = distancia(alvo, id)
    if (comuns > 0 || ate <= perto)
      candidatos.push({ id, comuns, distancia: ate })
  }
  return candidatos
    .sort(
      (a, b) =>
        b.comuns - a.comuns ||
        a.distancia - b.distancia ||
        a.id.localeCompare(b.id),
    )
    .slice(0, quantos)
    .map(({ id }) => id)
}

function pedacos(id: string): string[] {
  return id.split('-').filter(Boolean)
}

/** A distância de Levenshtein: quantas letras inserir, apagar ou trocar. */
function distancia(a: string, b: string): number {
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const atual = [i]
    for (let j = 1; j <= b.length; j++)
      atual[j] = Math.min(
        (anterior[j] ?? 0) + 1,
        (atual[j - 1] ?? 0) + 1,
        (anterior[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    anterior = atual
  }
  return anterior[b.length] ?? 0
}
