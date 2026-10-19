// O que liga os arquivos: Guias e Dicas herdam país, período e `cobre` das
// Fichas citadas, e as regras de publicação do #7 e do #10 barram o build.
import type { Cobre } from './esquema.ts'
import type { Ficha } from './ficha.ts'
import { SECOES_DO_GUIA, type AchadoDoGuia, type Dica, type DicaLida, type Guia, type GuiaLido, type Tema } from './itens.ts'
import type { Forca } from './listas.ts'
import { problema, type Problema } from './problemas.ts'

/** Referência a uma Ficha no meio do texto: `[@slug-da-ficha]`. */
const REFERENCIA = /\[@([a-z0-9]+(?:-[a-z0-9]+)*)\]/g

/** Os slugs citados como `[@slug]` num markdown, na ordem. */
export function referenciasNoTexto(markdown: string): string[] {
  return [...markdown.matchAll(REFERENCIA)].map((m) => m[1] ?? '')
}

const unicos = <T>(lista: ReadonlyArray<T>): T[] => [...new Set(lista)]

function herdado(
  fichas: ReadonlyArray<Ficha>,
  proprio: { pais?: string; periodo?: string; vale_para?: Cobre },
) {
  return {
    paises: proprio.pais ? [proprio.pais] : unicos(fichas.flatMap((f) => f.paises)),
    periodo: proprio.periodo ?? unicos(fichas.map((f) => f.periodo)).join('; '),
    cobre: proprio.vale_para ? [proprio.vale_para] : fichas.map((f) => f.cobre),
    recorte: proprio.vale_para !== undefined,
  }
}

export interface Lidos {
  readonly fichas: ReadonlyArray<Ficha>
  readonly temas: ReadonlyArray<Tema>
  readonly guias: ReadonlyArray<GuiaLido>
  readonly dicas: ReadonlyArray<DicaLida>
  /** Os caminhos dos arquivos que existem mas não leram. Contam como
   * existentes, para um erro num arquivo não virar "não existe" nos outros. */
  readonly quebrados: ReadonlySet<string>
}

export interface Ligados {
  readonly temas: ReadonlyArray<Tema>
  readonly guias: ReadonlyArray<Guia>
  readonly dicas: ReadonlyArray<Dica>
  readonly erros: ReadonlyArray<Problema>
}

/** As Fichas de um Guia na ordem da página: resposta curta, Dicas, achados,
 * divergência, Perfil, Mitos e Limitações. */
function fichasNaOrdemDaPagina(guia: GuiaLido, dicas: ReadonlyMap<string, DicaLida>): string[] {
  return unicos([
    ...referenciasNoTexto(guia.respostaCurta),
    ...guia.dicas.flatMap((slug) => dicas.get(slug)?.fichas ?? []),
    ...guia.achados.flatMap((a) => [...referenciasNoTexto(a.texto), ...a.fichas]),
    ...(guia.divergencia?.lados.flatMap((l) => [...referenciasNoTexto(l.texto), ...l.fichas]) ?? []),
    ...referenciasNoTexto(guia.variaConformePerfil),
    ...guia.mitos.flatMap((m) => [...referenciasNoTexto(m.por_que_nao), ...m.fichas]),
    ...referenciasNoTexto(guia.limitacoes),
  ])
}

/** Onde o Guia cita Fichas diretamente (sem contar as Dicas), campo a campo. */
interface Citacao {
  readonly campo: string
  readonly fichas: ReadonlyArray<string>
}

function citacoesDoGuia(guia: GuiaLido): Citacao[] {
  return [
    { campo: 'resposta curta', fichas: referenciasNoTexto(guia.respostaCurta) },
    ...guia.achados.flatMap((a, i) => [
      { campo: `achados.${i}.texto`, fichas: referenciasNoTexto(a.texto) },
      { campo: `achados.${i}.fichas`, fichas: a.fichas },
    ]),
    ...(guia.divergencia?.lados.flatMap((l, i) => [
      { campo: `divergencia.lados.${i}.texto`, fichas: referenciasNoTexto(l.texto) },
      { campo: `divergencia.lados.${i}.fichas`, fichas: l.fichas },
    ]) ?? []),
    { campo: SECOES_DO_GUIA.perfil, fichas: referenciasNoTexto(guia.variaConformePerfil) },
    ...guia.mitos.flatMap((m, i) => [
      { campo: `mitos.${i}.por_que_nao`, fichas: referenciasNoTexto(m.por_que_nao) },
      { campo: `mitos.${i}.fichas`, fichas: m.fichas },
    ]),
    { campo: SECOES_DO_GUIA.limitacoes, fichas: referenciasNoTexto(guia.limitacoes) },
  ]
}

const NIVEL: Record<Forca, number> = { fraca: 1, moderada: 2, forte: 3 }

/** A Confiança nunca passa da Ficha mais forte que sustenta a resposta, e
 * fica em moderada no máximo quando todas são 🟡 (#7). As Dicas não contam:
 * cada uma traz a própria Força. */
function tetoDaConfianca(guia: GuiaLido, citadas: ReadonlyArray<Ficha>): Problema[] {
  const fichas = citadas.filter((f) => f.status !== 'nao-verificado')
  if (fichas.length === 0) return []
  const confianca = NIVEL[guia.confianca]
  const maisForte = fichas.reduce((a, b) => (NIVEL[b.forca] > NIVEL[a.forca] ? b : a))
  if (confianca > NIVEL[maisForte.forca])
    return [
      problema(
        guia.arquivo,
        `a Confiança (${guia.confianca}) passa da Ficha mais forte que o Guia cita (${maisForte.forca})`,
        'confianca',
      ),
    ]
  if (confianca > NIVEL.moderada && fichas.every((f) => f.status === 'parcial'))
    return [
      problema(
        guia.arquivo,
        `a Confiança (${guia.confianca}) passa de moderada, e o Guia só cita Fichas parciais (🟡)`,
        'confianca',
      ),
    ]
  return []
}

/** Cada pasta de Guias tem um `_tema.md` cuja `ordem` lista os Guias da
 * pasta, cada um uma vez; o slug do Guia é único no site. */
function temasEGuias(lidos: Lidos): Problema[] {
  const erros: Problema[] = []
  const temas = new Map(lidos.temas.map((t) => [t.slug, t]))
  for (const tema of unicos(lidos.guias.map((g) => g.tema)))
    if (!temas.has(tema) && !lidos.quebrados.has(`guias/${tema}/_tema.md`))
      erros.push(problema(`guias/${tema}`, 'falta o _tema.md com o título e a ordem dos Guias'))

  for (const tema of lidos.temas) {
    const lidosDaPasta = lidos.guias.filter((g) => g.tema === tema.slug).map((g) => g.slug)
    const daPasta = [
      ...lidosDaPasta,
      ...[...lidos.quebrados].flatMap((c) => {
        const achado = new RegExp(`^guias/${tema.slug}/([^_/][^/]*)\\.md$`).exec(c)
        return achado?.[1] ? [achado[1]] : []
      }),
    ]
    for (const slug of lidosDaPasta)
      if (!tema.ordem.includes(slug))
        erros.push(problema(tema.arquivo, `o Guia "${slug}" está na pasta e falta na ordem`, 'ordem'))
    tema.ordem.forEach((slug, i) => {
      if (tema.ordem.indexOf(slug) !== i)
        erros.push(problema(tema.arquivo, `o Guia "${slug}" aparece mais de uma vez`, 'ordem'))
      else if (!daPasta.includes(slug))
        erros.push(problema(tema.arquivo, `o Guia "${slug}" não existe em guias/${tema.slug}/`, 'ordem'))
    })
  }

  const primeiro = new Map<string, GuiaLido>()
  for (const guia of lidos.guias) {
    const outro = primeiro.get(guia.slug)
    if (outro)
      erros.push(
        problema(guia.arquivo, `o slug "${guia.slug}" já é do Guia ${outro.arquivo}; o Guia é citado só pelo slug`),
      )
    else primeiro.set(guia.slug, guia)
  }
  return erros
}

export function ligar(lidos: Lidos): Ligados {
  const erros: Problema[] = []
  const fichaPorSlug = new Map(lidos.fichas.map((f) => [f.slug, f]))
  const dicaPorSlug = new Map(lidos.dicas.map((d) => [d.slug, d]))
  const guiaPorSlug = new Map(lidos.guias.map((g) => [g.slug, g]))
  const fichasDe = (slugs: ReadonlyArray<string>) =>
    unicos(slugs).flatMap((s) => {
      const ficha = fichaPorSlug.get(s)
      return ficha ? [ficha] : []
    })

  const fichaQueFalta = (arquivo: string, campo: string, slugs: ReadonlyArray<string>) => {
    for (const slug of slugs)
      if (!fichaPorSlug.has(slug) && !lidos.quebrados.has(`estudos/${slug}.md`))
        erros.push(problema(arquivo, `a Ficha "${slug}" não existe em estudos/`, campo))
  }

  const naoVerificada = (slug: string) => fichaPorSlug.get(slug)?.status === 'nao-verificado'
  const SO_VERIFICADA = 'que não foi verificada (⬜); um Guia só cita Ficha ✅ ou 🟡'

  erros.push(...temasEGuias(lidos))
  for (const dica of lidos.dicas) fichaQueFalta(dica.arquivo, 'fichas', dica.fichas)
  for (const guia of lidos.guias) {
    for (const { campo, fichas } of citacoesDoGuia(guia)) {
      fichaQueFalta(guia.arquivo, campo, fichas)
      for (const slug of unicos(fichas).filter(naoVerificada))
        erros.push(problema(guia.arquivo, `cita a Ficha "${slug}", ${SO_VERIFICADA}`, campo))
    }
    for (const slug of guia.dicas) {
      const dica = dicaPorSlug.get(slug)
      if (!dica && !lidos.quebrados.has(`dicas/${slug}.md`)) erros.push(problema(guia.arquivo, `a Dica "${slug}" não existe em dicas/`, 'dicas'))
      for (const ficha of dica?.fichas.filter(naoVerificada) ?? [])
        erros.push(problema(guia.arquivo, `a Dica "${slug}" cita a Ficha "${ficha}", ${SO_VERIFICADA}`, 'dicas'))
    }
    const citadas = citacoesDoGuia(guia).flatMap((c) => c.fichas)
    if (citadas.length === 0) erros.push(problema(guia.arquivo, 'o Guia não cita nenhuma Ficha'))
    erros.push(...tetoDaConfianca(guia, fichasDe(citadas)))
    for (const slug of guia.relacionadas)
      if (!guiaPorSlug.has(slug) && ![...lidos.quebrados].some((c) => c.startsWith('guias/') && c.endsWith(`/${slug}.md`)))
        erros.push(problema(guia.arquivo, `o Guia "${slug}" não existe em guias/`, 'relacionadas'))
  }

  const dicas: Dica[] = lidos.dicas.map((lida) => {
    const fichas = fichasDe(lida.fichas)
    return {
      slug: lida.slug,
      arquivo: lida.arquivo,
      texto: lida.texto,
      fichas: lida.fichas,
      forca: lida.forca,
      inferencia: lida.inferencia ?? false,
      ...herdado(fichas, lida),
      publicada: fichas.length === lida.fichas.length && fichas.every((f) => f.status !== 'nao-verificado'),
      ...(lida.antes ? { antes: lida.antes } : {}),
      ...(lida.seo ? { seo: lida.seo } : {}),
    }
  })

  const ordemDosGuias = new Map(
    lidos.temas.flatMap((t, i) => t.ordem.map((slug, j) => [`${t.slug}/${slug}`, i * 1000 + j] as const)),
  )
  const guias: Guia[] = [...lidos.guias]
    .sort(
      (a, b) =>
        (ordemDosGuias.get(`${a.tema}/${a.slug}`) ?? Infinity) -
          (ordemDosGuias.get(`${b.tema}/${b.slug}`) ?? Infinity) || a.arquivo.localeCompare(b.arquivo),
    )
    .map((lido) => ({
      ...lido,
      achados: lido.achados.map(
        (a): AchadoDoGuia => ({
          texto: a.texto,
          fichas: a.fichas,
          ...herdado(fichasDe(a.fichas), a),
        }),
      ),
      fichasCitadas: fichasNaOrdemDaPagina(lido, dicaPorSlug),
    }))

  return { temas: lidos.temas, guias, dicas, erros }
}
