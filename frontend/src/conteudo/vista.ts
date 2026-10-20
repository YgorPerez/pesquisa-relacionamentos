// A Ficha do pacote de conteúdo no formato que as páginas desenham: o
// markdown já virou HTML no servidor, e o navegador recebe só o que mostra.
import type { Finding, FactSheet } from '@tem-estudo/content'
import { factSheetSearch, type SearchMeta } from '@tem-estudo/content/search'
import { Marked } from 'marked'
import { htmlSeguro, type HtmlSeguro } from './html-seguro'

const REPO = 'https://github.com/YgorPerez/pesquisa-relacionamentos/blob/main'

/** Link relativo de uma Ficha: outra Ficha vira a página dela; relatório,
 * pesquisa e fonte local, que o site não publica, vão para o GitHub. */
function reescreverLink(href: string): string {
  if (/^[a-z]+:|^#|^\//i.test(href)) return href
  const caminho = href.replace(/^(\.\.\/)+|^\.\//, '')
  const ficha = /^(?:estudos\/)?([a-z0-9-]+)\.md(#.*)?$/.exec(caminho)
  if (ficha && (href.startsWith('../estudos/') || !href.includes('/'))) {
    return `/estudos/${ficha[1]}${ficha[2] ?? ''}`
  }
  return `${REPO}/${caminho}`
}

const marked = new Marked({
  gfm: true,
  walkTokens(token) {
    if (token.type === 'link') token.href = reescreverLink(token.href)
  },
})

// O HTML sai filtrado daqui: é ele que o `Html` de `ui/guia.tsx` injeta.
export const html = (markdown: string) =>
  htmlSeguro(marked.parse(markdown, { async: false }))
export const htmlEmLinha = (markdown: string) =>
  htmlSeguro(marked.parseInline(markdown, { async: false }))

export interface AchadoVista {
  readonly medida: HtmlSeguro
  readonly valor: HtmlSeguro
  readonly onde: HtmlSeguro
  readonly trecho: HtmlSeguro | null
}

/** O que a lista de `/estudos` mostra de cada Ficha. */
export interface FichaResumo {
  readonly slug: string
  readonly titulo: string
  readonly status: FactSheet['status']
  readonly forca: FactSheet['forca']
  readonly contexto: string
}

export interface FichaVista extends FichaResumo {
  readonly referenciaHtml: HtmlSeguro
  readonly link: string
  readonly verificadoEm: string | null
  readonly forcaPorque: string
  readonly desenho: FactSheet['desenho']
  readonly paises: ReadonlyArray<string>
  readonly periodo: string
  readonly amostraHtml: HtmlSeguro
  readonly representativa: boolean
  readonly n: number | null
  readonly conflitoHtml: HtmlSeguro | null
  readonly licenca: string | null
  readonly oQueMediuHtml: HtmlSeguro
  readonly achados: ReadonlyArray<AchadoVista>
  readonly notasDosAchadosHtml: HtmlSeguro | null
  readonly outrasSecoes: ReadonlyArray<{
    readonly titulo: string
    readonly html: HtmlSeguro
  }>
  readonly limitacoesHtml: HtmlSeguro
  readonly indexar: boolean
  /** Título e descrição de busca (#15). */
  readonly busca: SearchMeta
}

const numero = new Intl.NumberFormat('pt-BR')

/** "EUA · 2017 · 5.421 participantes", a linha curta de contexto da lista. */
function contexto(
  ficha: Pick<FactSheet, 'paises' | 'periodo' | 'amostra'>,
): string {
  const { paises } = ficha
  const partes = [
    paises.length === 0
      ? 'país não informado'
      : paises.length > 3
        ? `${paises.length} países`
        : paises.join(', '),
    ficha.periodo,
    ficha.amostra.n ? `n = ${numero.format(ficha.amostra.n)}` : null,
  ]
  return partes.filter(Boolean).join(' · ')
}

const vistaDoAchado = (a: Finding): AchadoVista => ({
  medida: htmlEmLinha(a.measure),
  valor: htmlEmLinha(a.value),
  onde: htmlEmLinha(a.locator),
  trecho: a.excerpt ? htmlEmLinha(a.excerpt) : null,
})

export function resumo(ficha: FactSheet): FichaResumo {
  return {
    slug: ficha.slug,
    titulo: ficha.title,
    status: ficha.status,
    forca: ficha.forca,
    contexto: contexto(ficha),
  }
}

export function vista(ficha: FactSheet, indexar: boolean): FichaVista {
  return {
    ...resumo(ficha),
    referenciaHtml: htmlEmLinha(ficha.referencia),
    link: ficha.link,
    verificadoEm: ficha.verificado_em ?? null,
    forcaPorque: ficha.forca_porque,
    desenho: ficha.desenho,
    paises: ficha.paises,
    periodo: ficha.periodo,
    amostraHtml: htmlEmLinha(ficha.amostra.descricao),
    representativa: ficha.amostra.representativa,
    n: ficha.amostra.n ?? null,
    conflitoHtml: ficha.conflito ? htmlEmLinha(ficha.conflito) : null,
    licenca: ficha.licenca ?? null,
    oQueMediuHtml: html(ficha.whatItMeasured),
    achados: ficha.findings.map(vistaDoAchado),
    notasDosAchadosHtml: ficha.findingsNotes ? html(ficha.findingsNotes) : null,
    outrasSecoes: ficha.otherSections.map((s) => ({
      titulo: s.title,
      html: html(s.markdown),
    })),
    limitacoesHtml: html(ficha.limitations),
    indexar,
    busca: factSheetSearch(ficha),
  }
}
