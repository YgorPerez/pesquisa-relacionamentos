// Guias, Temas e Dicas no formato que as páginas desenham. O markdown vira
// HTML no servidor, com as referências `[@slug]` numeradas pela ordem das
// Fichas citadas e o número-chave `==…==` em rosa.
import type {
  Library,
  Coverage,
  Tip,
  FactSheet,
  Strength,
  Guide,
  Topic,
} from '@tem-estudo/content'
import {
  tipSearch,
  guideSearch,
  topicSearch,
  type SearchMeta,
} from '@tem-estudo/content/search'
import { isTipPublished } from '@tem-estudo/content/queries'
import { htmlSeguro, type HtmlSeguro } from './html-seguro'
import { html, htmlEmLinha, resumo, type FichaResumo } from './vista'

const ESCAPAR: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}
const escapar = (texto: string) =>
  texto.replace(/[&<>"]/g, (c) => ESCAPAR[c] ?? c)

/** As Fichas numeradas de uma página: a referência N leva à Ficha N da lista. */
type Numeracao = ReadonlyMap<
  string,
  { readonly n: number; readonly titulo: string }
>

function numerar(slugs: ReadonlyArray<string>, acervo: Library): Numeracao {
  return new Map(
    slugs.map((slug, i) => [
      slug,
      {
        n: i + 1,
        titulo: acervo.factSheets.find((f) => f.slug === slug)?.title ?? slug,
      },
    ]),
  )
}

const ancora = (slug: string) => `ficha-${slug}`

function referencia(slug: string, numeros: Numeracao): string {
  const ficha = numeros.get(slug)
  if (!ficha) return ''
  return `<a class="ref" href="#${ancora(slug)}" aria-label="Ficha ${ficha.n}: ${escapar(ficha.titulo)}">${ficha.n}</a>`
}

const REFS = /\s*((?:\[@[a-z0-9-]+\]\s*)+)/g

/** Troca `[@slug]` pelo número no anel e gruda o número na palavra anterior
 * e na pontuação seguinte (The Glued Ref Rule). */
function comReferencias(markdown: string, numeros: Numeracao): string {
  const marcado = markdown.replace(
    /==([^=\n]+)==/g,
    '<mark class="numero-chave">$1</mark>',
  )
  return marcado.replace(
    /([^\s<>[\]]*)\s*((?:\[@[a-z0-9-]+\]\s*)*\[@[a-z0-9-]+\])([.,;:!?]*)/g,
    (_, palavra: string, refs: string, pontuacao: string) => {
      const numerosHtml = [...refs.matchAll(/\[@([a-z0-9-]+)\]/g)]
        .map((m) => referencia(m[1] ?? '', numeros))
        .join('')
      return `<span class="nw">${palavra}${numerosHtml}${pontuacao}</span>`
    },
  )
}

/** Um trecho em linha com `[@slug]` e `==…==`, numerando as Fichas na ordem
 * dada: o mesmo HTML do Guia, para a story do anel de referência. */
export function trechoComReferencias(
  markdown: string,
  fichas: ReadonlyArray<{ readonly slug: string; readonly titulo: string }>,
): HtmlSeguro {
  const numeros: Numeracao = new Map(
    fichas.map((f, i) => [f.slug, { n: i + 1, titulo: f.titulo }]),
  )
  return htmlEmLinha(comReferencias(markdown, numeros))
}

/** Texto em linha com as referências das Fichas da lista antes da pontuação
 * final: "por app ①." */
function textoComFichas(
  texto: string,
  fichas: ReadonlyArray<string>,
  numeros: Numeracao,
): HtmlSeguro {
  const refs = fichas.map((s) => `[@${s}]`).join('')
  const [, corpo = '', ponto = ''] =
    /^([\s\S]*?)([.!?]*)$/.exec(texto.trimEnd()) ?? []
  return htmlEmLinha(comReferencias(`${corpo}${refs}${ponto}`, numeros))
}

/** Texto puro, para busca, Open Graph e o resumo das relacionadas. */
export function semMarcas(markdown: string): string {
  return markdown
    .replace(REFS, '')
    .replace(/==([^=\n]+)==/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** As Fichas citadas na frase do número-chave (`==…==`) da resposta curta:
 * é o `cobre` delas que diz se o número vale para o Perfil. `null` se não há
 * número marcado ou se a frase dele não cita Ficha. */
export function fichasDoNumeroChave(
  markdown: string,
): ReadonlyArray<string> | null {
  const frase = markdown
    .split(/(?<=[.!?])\s+/)
    .find((f) => /==[^=\n]+==/.test(f))
  const slugs = [...(frase ?? '').matchAll(/\[@([a-z0-9-]+)\]/g)].map(
    (m) => m[1] ?? '',
  )
  return slugs.length > 0 ? slugs : null
}

const primeiraFrase = (markdown: string): string => {
  const texto = semMarcas(markdown)
  return /^.+?[.!?](?=\s|$)/.exec(texto)?.[0] ?? texto
}

/** A Pergunta com a única palavra em amarelo (`==palavra==`). */
const perguntaHtml = (pergunta: string) =>
  htmlSeguro(
    escapar(pergunta).replace(
      /==([^=]+)==/,
      '<span class="marca-texto">$1</span>',
    ),
  )

const IDADE_MAXIMA = 120

function umCobre(cobre: Coverage): string {
  const partes: string[] = []
  if (cobre.casal === 'hetero') partes.push('casais homem-mulher')
  else if (cobre.casal === 'mesmo-sexo') partes.push('casais do mesmo sexo')
  const generos = cobre.generos ?? []
  if (generos.length === 1)
    partes.push(generos[0] === 'homem' ? 'só homens' : 'só mulheres')
  else if (generos.length === 2 && !cobre.casal)
    partes.push('homens e mulheres')
  const procura = cobre.procura ?? []
  if (procura.length === 1) partes.push(`que procuram ${procura[0]}`)
  if (cobre.idades)
    partes.push(
      cobre.idades.max >= IDADE_MAXIMA
        ? `a partir de ${cobre.idades.min} anos`
        : `de ${cobre.idades.min} a ${cobre.idades.max} anos`,
    )
  return partes.join(', ')
}

/** A nota "Vale para:" de um achado ou Dica, tirada do `cobre`. */
function valePara(cobres: ReadonlyArray<Coverage>): string {
  const frases = [...new Set(cobres.map(umCobre))]
  // Sem frase nenhuma, o `every` também dá `true`.
  if (frases.every((f) => f === ''))
    return 'o estudo não separou por gênero, orientação nem idade.'
  return `${frases.map((f) => f || 'sem recorte por gênero ou idade').join('; ')}.`
}

/** País e ano da amostra, curtos para a caixinha ao lado do achado. */
function ondeEQuando(paises: ReadonlyArray<string>, periodo: string) {
  return {
    pais:
      paises.length === 0
        ? 'país não informado'
        : paises.length > 2
          ? `${paises.length} países`
          : paises.join(', '),
    periodo,
  }
}

export interface DicaNoGuia {
  readonly slug: string
  readonly html: HtmlSeguro
  readonly forca: Strength
  readonly inferencia: boolean
  readonly valePara: string
  /** O `cobre` cru, para o navegador decidir o "vale para você" com o Perfil. */
  readonly cobre: ReadonlyArray<Coverage>
}

interface AchadoVista {
  readonly html: HtmlSeguro
  readonly pais: string
  readonly periodo: string
  readonly valePara: string
  readonly cobre: ReadonlyArray<Coverage>
}

export interface FichaCitada extends FichaResumo {
  readonly n: number
  readonly ancora: string
}

export interface GuiaResumo {
  readonly tema: string
  readonly slug: string
  readonly perguntaHtml: HtmlSeguro
  readonly pergunta: string
  readonly confianca: Strength
  readonly primeiraFrase: string
}

export interface GuiaVista extends GuiaResumo {
  readonly tema: string
  readonly temaTitulo: string
  readonly respostaHtml: HtmlSeguro
  /** O `cobre` das Fichas da frase do número-chave; `null` sem número marcado. */
  readonly chave: ReadonlyArray<Coverage> | null
  readonly dicas: ReadonlyArray<DicaNoGuia>
  readonly achados: ReadonlyArray<AchadoVista>
  readonly divergencia: {
    readonly melhorDesenhoHtml: HtmlSeguro
    readonly lados: ReadonlyArray<{
      readonly titulo: string
      readonly html: HtmlSeguro
    }>
  } | null
  readonly perfilHtml: HtmlSeguro
  readonly mitos: ReadonlyArray<{
    readonly afirmacao: string
    readonly porQueNaoHtml: HtmlSeguro
  }>
  readonly limitacoesHtml: HtmlSeguro
  readonly fichas: ReadonlyArray<FichaCitada>
  readonly relacionadas: ReadonlyArray<GuiaResumo>
  /** Título e descrição de busca e do Open Graph (#15). */
  readonly busca: SearchMeta
}

export function resumoDoGuia(guia: Guide): GuiaResumo {
  return {
    tema: guia.topic,
    slug: guia.slug,
    pergunta: semMarcas(guia.pergunta),
    perguntaHtml: perguntaHtml(guia.pergunta),
    confianca: guia.confianca,
    primeiraFrase: primeiraFrase(guia.shortAnswer),
  }
}

const fichaDoAcervo = (acervo: Library, slug: string): FactSheet | undefined =>
  acervo.factSheets.find((f) => f.slug === slug)

function fichasCitadas(
  slugs: ReadonlyArray<string>,
  acervo: Library,
): FichaCitada[] {
  return slugs.flatMap((slug, i) => {
    const ficha = fichaDoAcervo(acervo, slug)
    return ficha ? [{ ...resumo(ficha), n: i + 1, ancora: ancora(slug) }] : []
  })
}

function cobreDaChave(
  respostaCurta: string,
  acervo: Library,
): ReadonlyArray<Coverage> | null {
  const slugs = fichasDoNumeroChave(respostaCurta)
  return (
    slugs && slugs.flatMap((slug) => fichaDoAcervo(acervo, slug)?.cobre ?? [])
  )
}

export function vistaDoGuia(guia: Guide, acervo: Library): GuiaVista {
  const numeros = numerar(guia.citedFactSheets, acervo)
  const tema = acervo.topics.find((t) => t.slug === guia.topic)
  return {
    ...resumoDoGuia(guia),
    temaTitulo: tema?.titulo ?? guia.topic,
    respostaHtml: html(comReferencias(guia.shortAnswer, numeros)),
    chave: cobreDaChave(guia.shortAnswer, acervo),
    dicas: guia.dicas.flatMap((slug) => {
      const dica = acervo.tips.find((d) => d.slug === slug)
      return dica
        ? [
            {
              slug,
              html: textoComFichas(dica.text, dica.fichas, numeros),
              forca: dica.forca,
              inferencia: dica.inferencia,
              valePara: valePara(dica.cobre),
              cobre: dica.cobre,
            },
          ]
        : []
    }),
    achados: guia.achados.map((a) => ({
      html: textoComFichas(a.texto, a.fichas, numeros),
      ...ondeEQuando(a.paises, a.periodo),
      valePara: valePara(a.cobre),
      cobre: a.cobre,
    })),
    divergencia: guia.divergencia
      ? {
          melhorDesenhoHtml: htmlEmLinha(
            comReferencias(guia.divergencia.melhor_desenho, numeros),
          ),
          lados: guia.divergencia.lados.map((l) => ({
            titulo: l.titulo,
            html: textoComFichas(l.texto, l.fichas, numeros),
          })),
        }
      : null,
    perfilHtml: html(comReferencias(guia.variesByProfile, numeros)),
    mitos: guia.mitos.map((m) => ({
      afirmacao: m.afirmacao,
      porQueNaoHtml: textoComFichas(m.por_que_nao, m.fichas, numeros),
    })),
    limitacoesHtml: html(comReferencias(guia.limitations, numeros)),
    fichas: fichasCitadas(guia.citedFactSheets, acervo),
    relacionadas: guia.relacionadas.flatMap((slug) => {
      const outro = acervo.guides.find((g) => g.slug === slug)
      return outro ? [resumoDoGuia(outro)] : []
    }),
    busca: guideSearch(guia),
  }
}

export interface TemaVista {
  readonly slug: string
  readonly titulo: string
  readonly contextoHtml: HtmlSeguro
  /** Título e descrição de busca e do Open Graph (#15). */
  readonly busca: SearchMeta
  readonly guias: ReadonlyArray<
    GuiaResumo & { readonly respostaHtml: HtmlSeguro }
  >
}

export function vistaDoTema(tema: Topic, acervo: Library): TemaVista {
  return {
    slug: tema.slug,
    titulo: tema.titulo,
    contextoHtml: html(tema.context),
    busca: topicSearch(tema),
    // Na página do Tema a resposta curta vai sem os números: as Fichas estão
    // no Guia, e o Tema não faz afirmação nova (#7).
    guias: acervo.guides
      .filter((g) => g.topic === tema.slug)
      .map((g) => ({
        ...resumoDoGuia(g),
        respostaHtml: html(semReferencias(g.shortAnswer)),
      })),
  }
}

const semReferencias = (markdown: string) =>
  markdown.replace(REFS, '').replace(/==([^=\n]+)==/g, '$1')

export interface DicaResumo {
  readonly slug: string
  readonly texto: string
  readonly forca: Strength
  readonly inferencia: boolean
}

export interface DicaVista extends DicaResumo {
  readonly valePara: string
  readonly fichas: ReadonlyArray<FichaCitada>
  readonly guias: ReadonlyArray<GuiaResumo>
  readonly busca: SearchMeta
}

export const resumoDaDica = (dica: Tip): DicaResumo => ({
  slug: dica.slug,
  texto: semMarcas(dica.text),
  forca: dica.forca,
  inferencia: dica.inferencia,
})

export function vistaDaDica(dica: Tip, acervo: Library): DicaVista {
  return {
    ...resumoDaDica(dica),
    valePara: valePara(dica.cobre),
    fichas: fichasCitadas(dica.fichas, acervo),
    guias: acervo.guides
      .filter((g) => g.dicas.includes(dica.slug))
      .map(resumoDoGuia),
    busca: tipSearch(dica),
  }
}

export interface CitadaEm {
  readonly guias: ReadonlyArray<GuiaResumo>
  readonly dicas: ReadonlyArray<DicaResumo>
}

/** Os Guias e as Dicas publicadas que citam a Ficha, para a página dela. O
 * Guia conta também quando a Ficha entra só por uma Dica dele. */
export const citadaEm = (slug: string, acervo: Library): CitadaEm => ({
  guias: acervo.guides
    .filter((g) => g.citedFactSheets.includes(slug))
    .map(resumoDoGuia),
  dicas: acervo.tips
    .filter((d) => isTipPublished(d) && d.fichas.includes(slug))
    .map(resumoDaDica),
})
