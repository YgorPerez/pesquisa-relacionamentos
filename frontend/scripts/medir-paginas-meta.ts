// O que o `./medir-paginas.ts` mede e contra o quê: as cinco páginas, a meta
// (ADR 0033) e a tabela que ele imprime. Fica à parte do que abre navegador
// para os testes lerem sem rede. No molde do `medir-paginas-meta.ts` do
// Festival dos Macacos.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

/** O gzip que o Nginx da VPS aplica (`nginx/temestudo.conf`): o `text/html`
 * sempre, os `gzip_types` e o `gzip_comp_level`, que sem linha é 1. */
export type Gzip = { nivel: number; tipos: string[] }

export function gzipDoNginx(conf: string): Gzip {
  const tipos = /^\s*gzip_types\s+([^;]+);/m.exec(conf)?.[1].trim().split(/\s+/)
  const nivel = /^\s*gzip_comp_level\s+(\d+);/m.exec(conf)?.[1]
  return {
    nivel: nivel ? Number(nivel) : 1,
    tipos: ['text/html', ...(tipos ?? [])],
  }
}

/** Se o Nginx comprimiria a resposta com este `Content-Type`. */
export function comprimeComoONginx(
  tipo: string | undefined,
  gzip: Gzip,
): boolean {
  const semParametros = tipo?.split(';')[0].trim().toLowerCase()
  return !!semParametros && gzip.tipos.includes(semParametros)
}

export type NomeDaPagina =
  | 'início'
  | 'Guia'
  | 'Ficha'
  | 'Grupo possível'
  | 'Prioridades'

/** Uma página da medida. `toque` é o seletor do Playwright do que a pessoa
 * toca logo que a página abre, a interação de que sai o INP. */
export type Pagina = { nome: NomeDaPagina; caminho: string; toque: string }

/** O Guia e a Ficha de fixture (`e2e/acervo`): o acervo ainda não tem Guia. */
export const CAMINHOS_DA_FIXTURE = {
  guia: '/onde-conhecer-pessoas/onde-os-casais-se-conhecem',
  ficha: '/estudos/lima-2015-encontros',
} as const

export function paginas(caminhos: { guia: string; ficha: string }): Pagina[] {
  return [
    { nome: 'início', caminho: '/', toque: 'h1' },
    {
      nome: 'Guia',
      caminho: caminhos.guia,
      toque: 'role=form[name="Seu Perfil"] >> role=radio >> nth=0',
    },
    { nome: 'Ficha', caminho: caminhos.ficha, toque: 'h1' },
    {
      nome: 'Grupo possível',
      caminho: '/grupo-possivel',
      toque: 'role=radio[name="superior completo"]',
    },
    {
      nome: 'Prioridades',
      caminho: '/prioridades',
      toque: 'role=region[name="Seu topo 3"] >> role=button >> nth=0',
    },
  ]
}

/** A meta de uma página (ADR 0033): o JS e o CSS transferidos, em KB com o
 * gzip, e o LCP e o INP, em ms, medianas no 4G lento do Lighthouse. */
type Meta = { jsKb: number; cssKb: number; lcpMs: number; inpMs: number }

/** O LCP e o INP "bons" do Core Web Vitals, e um teto de CSS. */
const BOM = { cssKb: 15, lcpMs: 2500, inpMs: 200 }

/** O JS é o medido no #59 com uns 15% de folga: um chunk que engorda a
 * página passa dele, e quem sobe o teto diz por quê. */
const META: Record<NomeDaPagina, Meta> = {
  início: { ...BOM, jsKb: 200 },
  Guia: { ...BOM, jsKb: 260 },
  Ficha: { ...BOM, jsKb: 210 },
  'Grupo possível': { ...BOM, jsKb: 250 },
  Prioridades: { ...BOM, jsKb: 240 },
}

export function mediana(valores: readonly number[]): number {
  if (valores.length === 0) return Number.NaN
  const ordem = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(ordem.length / 2)
  return ordem.length % 2 ? ordem[meio] : (ordem[meio - 1] + ordem[meio]) / 2
}

/** Uma abertura da página: os bytes de JS e de CSS como chegaram, e o LCP e
 * o INP em ms. */
export type Execucao = { js: number; css: number; lcp: number; inp: number }

export type Linha = {
  pagina: NomeDaPagina
  jsKb: number
  cssKb: number
  lcpMs: number
  inpMs: number
  falhas: string[]
}

/** As medianas das execuções contra a META da página. */
export function linhaDe(
  pagina: NomeDaPagina,
  execucoes: readonly Execucao[],
): Linha {
  const m = (campo: keyof Execucao) => mediana(execucoes.map((e) => e[campo]))
  const linha = {
    pagina,
    jsKb: m('js') / 1024,
    cssKb: m('css') / 1024,
    lcpMs: m('lcp'),
    inpMs: m('inp'),
  }
  const meta = META[pagina]
  const falhas: string[] = []
  if (linha.jsKb > meta.jsKb) falhas.push('JS')
  if (linha.cssKb > meta.cssKb) falhas.push('CSS')
  if (linha.lcpMs > meta.lcpMs) falhas.push('LCP')
  if (linha.inpMs > meta.inpMs) falhas.push('INP')
  // Uma medida que não rodou não passa calada.
  if (execucoes.length === 0) falhas.push('sem medida')
  return { ...linha, falhas }
}

const numero = (n: number, casas: number) =>
  Number.isNaN(n) ? '—' : n.toFixed(casas).replace('.', ',')

/** A tabela em Markdown, que cola direto num PR ou numa issue. */
export function tabela(linhas: readonly Linha[]): string {
  const cabecalho = [
    '| Página | JS | CSS | LCP | INP | Passa? |',
    '|---|---|---|---|---|---|',
  ]
  const corpo = linhas.map((l) => {
    const meta = META[l.pagina]
    return [
      l.pagina,
      `${numero(l.jsKb, 1)} KB (≤ ${meta.jsKb})`,
      `${numero(l.cssKb, 1)} KB (≤ ${meta.cssKb})`,
      `${numero(l.lcpMs / 1000, 2)} s (≤ ${numero(meta.lcpMs / 1000, 1)})`,
      `${numero(l.inpMs, 0)} ms (≤ ${meta.inpMs})`,
      l.falhas.length ? `não (${l.falhas.join(', ')})` : 'sim',
    ].join(' | ')
  })
  return [...cabecalho, ...corpo.map((l) => `| ${l} |`)].join('\n')
}
