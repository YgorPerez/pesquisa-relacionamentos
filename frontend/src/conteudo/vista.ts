// A Ficha do pacote de conteúdo no formato que as páginas desenham: o
// markdown já virou HTML no servidor, e o navegador recebe só o que mostra.
import type { Achado, Ficha } from '@tem-estudo/content'
import { buscaDaFicha, type Busca } from '@tem-estudo/content/search'
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
  readonly status: Ficha['status']
  readonly forca: Ficha['forca']
  readonly contexto: string
}

export interface FichaVista extends FichaResumo {
  readonly referenciaHtml: HtmlSeguro
  readonly link: string
  readonly verificadoEm: string | null
  readonly forcaPorque: string
  readonly desenho: Ficha['desenho']
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
  readonly busca: Busca
}

const numero = new Intl.NumberFormat('pt-BR')

/** "EUA · 2017 · 5.421 participantes", a linha curta de contexto da lista. */
function contexto(
  ficha: Pick<Ficha, 'paises' | 'periodo' | 'amostra'>,
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

const vistaDoAchado = (a: Achado): AchadoVista => ({
  medida: htmlEmLinha(a.medida),
  valor: htmlEmLinha(a.valor),
  onde: htmlEmLinha(a.onde),
  trecho: a.trecho ? htmlEmLinha(a.trecho) : null,
})

export function resumo(ficha: Ficha): FichaResumo {
  return {
    slug: ficha.slug,
    titulo: ficha.titulo,
    status: ficha.status,
    forca: ficha.forca,
    contexto: contexto(ficha),
  }
}

export function vista(ficha: Ficha, indexar: boolean): FichaVista {
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
    oQueMediuHtml: html(ficha.oQueMediu),
    achados: ficha.achados.map(vistaDoAchado),
    notasDosAchadosHtml: ficha.notasDosAchados
      ? html(ficha.notasDosAchados)
      : null,
    outrasSecoes: ficha.outrasSecoes.map((s) => ({
      titulo: s.titulo,
      html: html(s.markdown),
    })),
    limitacoesHtml: html(ficha.limitacoes),
    indexar,
    busca: buscaDaFicha(ficha),
  }
}
