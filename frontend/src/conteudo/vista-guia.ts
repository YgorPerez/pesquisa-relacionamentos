// Guias, Temas e Dicas no formato que as páginas desenham. O markdown vira
// HTML no servidor, com as referências `[@slug]` numeradas pela ordem das
// Fichas citadas e o número-chave `==…==` em rosa.
import type { Acervo, Cobre, Dica, Ficha, Forca, Guia, Tema } from '@tem-estudo/conteudo'
import { html, htmlEmLinha, resumo, type FichaResumo } from './vista'

const ESCAPAR: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapar = (texto: string) => texto.replace(/[&<>"]/g, (c) => ESCAPAR[c] ?? c)

/** As Fichas numeradas de uma página: a referência N leva à Ficha N da lista. */
type Numeracao = ReadonlyMap<string, { readonly n: number; readonly titulo: string }>

function numerar(slugs: ReadonlyArray<string>, acervo: Acervo): Numeracao {
  return new Map(
    slugs.map((slug, i) => [
      slug,
      { n: i + 1, titulo: acervo.fichas.find((f) => f.slug === slug)?.titulo ?? slug },
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
  const marcado = markdown.replace(/==([^=\n]+)==/g, '<mark class="numero-chave">$1</mark>')
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

/** Texto em linha com as referências das Fichas da lista antes da pontuação
 * final: "por app ①." */
function textoComFichas(texto: string, fichas: ReadonlyArray<string>, numeros: Numeracao): string {
  const refs = fichas.map((s) => `[@${s}]`).join('')
  const [, corpo = '', ponto = ''] = /^([\s\S]*?)([.!?]*)$/.exec(texto.trimEnd()) ?? []
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

export const primeiraFrase = (markdown: string): string => {
  const texto = semMarcas(markdown)
  return /^.+?[.!?](?=\s|$)/.exec(texto)?.[0] ?? texto
}

const cortar = (texto: string, limite = 155) =>
  texto.length <= limite ? texto : `${texto.slice(0, limite - 1).replace(/\s+\S*$/, '')}…`

/** A Pergunta com a única palavra em amarelo (`==palavra==`). */
export const perguntaHtml = (pergunta: string) =>
  escapar(pergunta).replace(/==([^=]+)==/, '<span class="marca-texto">$1</span>')

const IDADE_MAXIMA = 120

function umCobre(cobre: Cobre): string {
  const partes: string[] = []
  if (cobre.casal === 'hetero') partes.push('casais homem-mulher')
  else if (cobre.casal === 'mesmo-sexo') partes.push('casais do mesmo sexo')
  const generos = cobre.generos ?? []
  if (generos.length === 1) partes.push(generos[0] === 'homem' ? 'só homens' : 'só mulheres')
  else if (generos.length === 2 && !cobre.casal) partes.push('homens e mulheres')
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
export function valePara(cobres: ReadonlyArray<Cobre>): string {
  const frases = [...new Set(cobres.map(umCobre))]
  if (frases.length === 0 || frases.every((f) => f === ''))
    return 'o estudo não separou por gênero, orientação nem idade.'
  return `${frases.map((f) => f || 'sem recorte por gênero ou idade').join('; ')}.`
}

/** País e ano da amostra, curtos para a caixinha ao lado do achado. */
export function ondeEQuando(paises: ReadonlyArray<string>, periodo: string) {
  return {
    pais: paises.length === 0 ? 'país não informado' : paises.length > 2 ? `${paises.length} países` : paises.join(', '),
    periodo,
  }
}

export interface DicaNoGuia {
  readonly slug: string
  readonly html: string
  readonly forca: Forca
  readonly inferencia: boolean
  readonly valePara: string
}

export interface AchadoVista {
  readonly html: string
  readonly pais: string
  readonly periodo: string
  readonly valePara: string
}

export interface FichaCitada extends FichaResumo {
  readonly n: number
  readonly ancora: string
}

export interface GuiaResumo {
  readonly tema: string
  readonly slug: string
  readonly perguntaHtml: string
  readonly pergunta: string
  readonly confianca: Forca
  readonly primeiraFrase: string
}

export interface GuiaVista extends GuiaResumo {
  readonly tema: string
  readonly temaTitulo: string
  readonly respostaHtml: string
  readonly dicas: ReadonlyArray<DicaNoGuia>
  readonly achados: ReadonlyArray<AchadoVista>
  readonly divergencia: {
    readonly melhorDesenhoHtml: string
    readonly lados: ReadonlyArray<{ readonly titulo: string; readonly html: string }>
  } | null
  readonly perfilHtml: string
  readonly mitos: ReadonlyArray<{ readonly afirmacao: string; readonly porQueNaoHtml: string }>
  readonly limitacoesHtml: string
  readonly fichas: ReadonlyArray<FichaCitada>
  readonly relacionadas: ReadonlyArray<GuiaResumo>
  readonly descricao: string
}

export function resumoDoGuia(guia: Guia): GuiaResumo {
  return {
    tema: guia.tema,
    slug: guia.slug,
    pergunta: semMarcas(guia.pergunta),
    perguntaHtml: perguntaHtml(guia.pergunta),
    confianca: guia.confianca,
    primeiraFrase: primeiraFrase(guia.respostaCurta),
  }
}

const fichaDoAcervo = (acervo: Acervo, slug: string): Ficha | undefined =>
  acervo.fichas.find((f) => f.slug === slug)

function fichasCitadas(slugs: ReadonlyArray<string>, acervo: Acervo): FichaCitada[] {
  return slugs.flatMap((slug, i) => {
    const ficha = fichaDoAcervo(acervo, slug)
    return ficha ? [{ ...resumo(ficha), n: i + 1, ancora: ancora(slug) }] : []
  })
}

export function vistaDoGuia(guia: Guia, acervo: Acervo): GuiaVista {
  const numeros = numerar(guia.fichasCitadas, acervo)
  const tema = acervo.temas.find((t) => t.slug === guia.tema)
  return {
    ...resumoDoGuia(guia),
    temaTitulo: tema?.titulo ?? guia.tema,
    respostaHtml: html(comReferencias(guia.respostaCurta, numeros)),
    dicas: guia.dicas.flatMap((slug) => {
      const dica = acervo.dicas.find((d) => d.slug === slug)
      return dica
        ? [
            {
              slug,
              html: textoComFichas(dica.texto, dica.fichas, numeros),
              forca: dica.forca,
              inferencia: dica.inferencia,
              valePara: valePara(dica.cobre),
            },
          ]
        : []
    }),
    achados: guia.achados.map((a) => ({
      html: textoComFichas(a.texto, a.fichas, numeros),
      ...ondeEQuando(a.paises, a.periodo),
      valePara: valePara(a.cobre),
    })),
    divergencia: guia.divergencia
      ? {
          melhorDesenhoHtml: htmlEmLinha(comReferencias(guia.divergencia.melhor_desenho, numeros)),
          lados: guia.divergencia.lados.map((l) => ({
            titulo: l.titulo,
            html: textoComFichas(l.texto, l.fichas, numeros),
          })),
        }
      : null,
    perfilHtml: html(comReferencias(guia.variaConformePerfil, numeros)),
    mitos: guia.mitos.map((m) => ({
      afirmacao: m.afirmacao,
      porQueNaoHtml: textoComFichas(m.por_que_nao, m.fichas, numeros),
    })),
    limitacoesHtml: html(comReferencias(guia.limitacoes, numeros)),
    fichas: fichasCitadas(guia.fichasCitadas, acervo),
    relacionadas: guia.relacionadas.flatMap((slug) => {
      const outro = acervo.guias.find((g) => g.slug === slug)
      return outro ? [resumoDoGuia(outro)] : []
    }),
    descricao: guia.seo?.descricao ?? cortar(semMarcas(guia.respostaCurta)),
  }
}

export interface TemaVista {
  readonly slug: string
  readonly titulo: string
  readonly contextoHtml: string
  readonly descricao: string
  readonly guias: ReadonlyArray<GuiaResumo & { readonly respostaHtml: string }>
}

export function vistaDoTema(tema: Tema, acervo: Acervo): TemaVista {
  return {
    slug: tema.slug,
    titulo: tema.titulo,
    contextoHtml: html(tema.contexto),
    descricao: tema.seo?.descricao ?? cortar(semMarcas(tema.contexto)),
    // Na página do Tema a resposta curta vai sem os números: as Fichas estão
    // no Guia, e o Tema não faz afirmação nova (#7).
    guias: acervo.guias
      .filter((g) => g.tema === tema.slug)
      .map((g) => ({ ...resumoDoGuia(g), respostaHtml: html(semReferencias(g.respostaCurta)) })),
  }
}

const semReferencias = (markdown: string) =>
  markdown.replace(REFS, '').replace(/==([^=\n]+)==/g, '$1')

export interface DicaResumo {
  readonly slug: string
  readonly texto: string
  readonly forca: Forca
  readonly inferencia: boolean
}

export interface DicaVista extends DicaResumo {
  readonly valePara: string
  readonly fichas: ReadonlyArray<FichaCitada>
  readonly guias: ReadonlyArray<GuiaResumo>
}

export const resumoDaDica = (dica: Dica): DicaResumo => ({
  slug: dica.slug,
  texto: semMarcas(dica.texto),
  forca: dica.forca,
  inferencia: dica.inferencia,
})

export function vistaDaDica(dica: Dica, acervo: Acervo): DicaVista {
  return {
    ...resumoDaDica(dica),
    valePara: valePara(dica.cobre),
    fichas: fichasCitadas(dica.fichas, acervo),
    guias: acervo.guias.filter((g) => g.dicas.includes(dica.slug)).map(resumoDoGuia),
  }
}
