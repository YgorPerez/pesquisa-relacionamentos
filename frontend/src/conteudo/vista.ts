// A Ficha do pacote de conteúdo no formato que as páginas desenham: o
// markdown já virou HTML no servidor, e o navegador recebe só o que mostra.
import type { Achado, Ficha } from '@tem-estudo/conteudo'
import { Marked } from 'marked'

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

export const html = (markdown: string) => marked.parse(markdown, { async: false })
export const htmlEmLinha = (markdown: string) => marked.parseInline(markdown, { async: false })

export interface AchadoVista {
  readonly medida: string
  readonly valor: string
  readonly onde: string
  readonly trecho: string | null
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
  readonly referenciaHtml: string
  readonly link: string
  readonly verificadoEm: string | null
  readonly forcaPorque: string
  readonly desenho: Ficha['desenho']
  readonly paises: ReadonlyArray<string>
  readonly periodo: string
  readonly amostraHtml: string
  readonly representativa: boolean
  readonly n: number | null
  readonly conflitoHtml: string | null
  readonly licenca: string | null
  readonly oQueMediuHtml: string
  readonly achados: ReadonlyArray<AchadoVista>
  readonly notasDosAchadosHtml: string | null
  readonly outrasSecoes: ReadonlyArray<{ readonly titulo: string; readonly html: string }>
  readonly limitacoesHtml: string
  readonly indexar: boolean
  readonly descricao: string
}

const numero = new Intl.NumberFormat('pt-BR')

/** "EUA · 2017 · 5.421 participantes", a linha curta de contexto da lista. */
export function contexto(ficha: Pick<Ficha, 'paises' | 'periodo' | 'amostra'>): string {
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

const semMarkdown = (texto: string) => texto.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()

export function vista(ficha: Ficha, indexar: boolean): FichaVista {
  const primeiro = ficha.achados[0]
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
    notasDosAchadosHtml: ficha.notasDosAchados ? html(ficha.notasDosAchados) : null,
    outrasSecoes: ficha.outrasSecoes.map((s) => ({ titulo: s.titulo, html: html(s.markdown) })),
    limitacoesHtml: html(ficha.limitacoes),
    indexar,
    descricao:
      ficha.seo?.descricao ??
      (primeiro ? semMarkdown(`${primeiro.medida}: ${primeiro.valor}.`) : semMarkdown(ficha.referencia)),
  }
}
