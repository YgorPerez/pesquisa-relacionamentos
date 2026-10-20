// Temas, Guias e Dicas para as páginas, lidos no servidor como as Fichas
// (`fichas.ts`): o navegador recebe só a vista pronta de cada página.
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  dicaPorSlug,
  dicaPublicada,
  guiaPorSlug,
  temaPorSlug,
} from '@tem-estudo/conteudo/consultas'
import {
  resumoDaDica,
  resumoDoGuia,
  semMarcas,
  vistaDaDica,
  vistaDoGuia,
  vistaDoTema,
  type DicaResumo,
  type DicaVista,
  type GuiaResumo,
  type GuiaVista,
  type TemaVista,
} from './vista-guia'
import { vistaDasPrioridades, type PrioridadesVista } from './vista-prioridades'

const texto = (valor: unknown, nome: string): string => {
  if (typeof valor !== 'string') throw new Error(`${nome} inválido`)
  return valor
}

interface TemaNoInicio {
  readonly slug: string
  readonly titulo: string
  readonly guias: ReadonlyArray<GuiaResumo>
}

/** Os Temas com as Perguntas na ordem, para a página inicial. */
export const listarTemas = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<TemaNoInicio>> => {
    const { default: acervo } = await import('virtual:acervo')
    return acervo.temas.map((tema) => ({
      slug: tema.slug,
      titulo: tema.titulo,
      guias: acervo.guias.filter((g) => g.tema === tema.slug).map(resumoDoGuia),
    }))
  },
)

export const buscarTema = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => texto(slug, 'tema'))
  .handler(async ({ data: slug }): Promise<TemaVista> => {
    const { default: acervo } = await import('virtual:acervo')
    const tema = temaPorSlug(acervo, slug)
    if (!tema) throw notFound()
    return vistaDoTema(tema, acervo)
  })

export const buscarGuia = createServerFn({ method: 'GET' })
  .validator((dados: unknown) => {
    const { tema, slug } = (dados ?? {}) as Record<string, unknown>
    return { tema: texto(tema, 'tema'), slug: texto(slug, 'slug') }
  })
  .handler(
    async ({
      data,
    }): Promise<
      GuiaVista & {
        prioridades: PrioridadesVista | null
        grupoPossivel: boolean
      }
    > => {
      const { default: acervo } = await import('virtual:acervo')
      const guia = guiaPorSlug(acervo, data.slug)
      if (!guia || guia.tema !== data.tema) throw notFound()
      return {
        ...vistaDoGuia(guia, acervo),
        // O cartão do B1 lê o mesmo arquivo da página `/prioridades`.
        prioridades:
          guia.calculadora === 'prioridades'
            ? vistaDasPrioridades(acervo)
            : null,
        // O cartão do B5 faz a conta no navegador, com os dados do build.
        grupoPossivel: guia.calculadora === 'grupo-possivel',
      }
    },
  )

export interface GuiaDaCalculadora {
  readonly tema: string
  readonly slug: string
  readonly pergunta: string
  readonly confianca: GuiaVista['confianca']
  /** A resposta curta em texto puro: as referências levam a Fichas da página do Guia. */
  readonly resposta: string
}

/** O Guia que hospeda a calculadora (`calculadora:` no frontmatter), para o
 * bloco "Do Guia" da página dela; `null` enquanto nenhum Guia publicado a hospeda. */
export const buscarGuiaDaCalculadora = createServerFn({ method: 'GET' })
  .validator((nome: unknown) => texto(nome, 'calculadora'))
  .handler(async ({ data: nome }): Promise<GuiaDaCalculadora | null> => {
    const { default: acervo } = await import('virtual:acervo')
    const guia = acervo.guias.find((g) => g.calculadora === nome)
    if (!guia) return null
    const resumo = resumoDoGuia(guia)
    return {
      tema: guia.tema,
      slug: guia.slug,
      pergunta: resumo.pergunta,
      confianca: guia.confianca,
      resposta: semMarcas(guia.respostaCurta),
    }
  })

/** A calculadora de Prioridades; `null` enquanto o arquivo não está no build. */
export const buscarPrioridades = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PrioridadesVista | null> => {
    const { default: acervo } = await import('virtual:acervo')
    return vistaDasPrioridades(acervo)
  },
)

/** As Dicas publicadas: as que se apoiam só em Fichas ✅ ou 🟡. */
export const listarDicas = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<DicaResumo>> => {
    const { default: acervo } = await import('virtual:acervo')
    return acervo.dicas.filter(dicaPublicada).map(resumoDaDica)
  },
)

export const buscarDica = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => texto(slug, 'slug'))
  .handler(async ({ data: slug }): Promise<DicaVista> => {
    const { default: acervo } = await import('virtual:acervo')
    const dica = dicaPorSlug(acervo, slug)
    if (!dica || !dicaPublicada(dica)) throw notFound()
    return vistaDaDica(dica, acervo)
  })
