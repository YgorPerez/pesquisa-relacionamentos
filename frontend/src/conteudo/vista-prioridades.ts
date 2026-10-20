// O arquivo de Prioridades no formato que a página `/prioridades` e o cartão
// do Guia B1 desenham: cada célula com a Ficha já resumida (nome curto,
// Status, Força e amostra), para o navegador não receber o acervo.
import type {
  Library,
  PriorityCell,
  FactSheet,
  Strength,
  VerificationStatus,
} from '@tem-estudo/content'
import type { Level } from '@tem-estudo/rules/priorities'
import { semMarcas } from './vista-guia'

export interface FichaDaPrioridade {
  readonly slug: string
  /** "Joel et al. (2020)": o título da Ficha até os dois-pontos. */
  readonly nome: string
  readonly status: VerificationStatus
  readonly forca: Strength
  readonly amostra: string
}

export interface CelulaVista {
  readonly degrau: Level
  readonly medida: string | null
  readonly texto: string
  readonly ficha: FichaDaPrioridade | null
}

export interface CaracteristicaVista {
  readonly id: string
  readonly nome: string
  readonly atracao: CelulaVista
  readonly satisfacao: CelulaVista
  readonly duracao: CelulaVista
  readonly vies?: {
    readonly todos?: string
    readonly homem?: string
    readonly mulher?: string
  }
}

export interface BarraDaSatisfacao {
  readonly relacao: number
  readonly parceiro: number
  readonly semExplicacao: number
  readonly ficha: FichaDaPrioridade
}

/** O bloco "Do Guia" no fim da página. */
interface GuiaDaCalculadora {
  readonly tema: string
  readonly slug: string
  readonly pergunta: string
  readonly confianca: Strength
  readonly resposta: string
}

export interface PrioridadesVista {
  readonly barra: BarraDaSatisfacao
  readonly caracteristicas: ReadonlyArray<CaracteristicaVista>
  readonly doGuia: GuiaDaCalculadora | null
}

const semFormatacao = (texto: string) =>
  texto.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()

function fichaDaPrioridade(ficha: FactSheet): FichaDaPrioridade {
  return {
    slug: ficha.slug,
    nome: ficha.title.split(':')[0]?.trim() ?? ficha.title,
    status: ficha.status,
    forca: ficha.forca,
    amostra: semFormatacao(ficha.amostra.descricao),
  }
}

export function vistaDasPrioridades(acervo: Library): PrioridadesVista | null {
  const { priorities: prioridades } = acervo
  if (!prioridades) return null
  // O build garante que cada Ficha citada existe e é ✅ ou 🟡.
  const ficha = (slug: string): FichaDaPrioridade => {
    const achada = acervo.factSheets.find((f) => f.slug === slug)
    if (!achada) throw new Error(`Ficha ${slug} sumiu do acervo`)
    return fichaDaPrioridade(achada)
  }
  const celula = (c: PriorityCell): CelulaVista => ({
    degrau: c.degrau,
    medida: c.medida ?? null,
    texto: c.texto_simples,
    ficha: c.ficha ? ficha(c.ficha) : null,
  })
  const { satisfacao_explicada: barra } = prioridades
  const guia = acervo.guides.find((g) => g.calculadora === 'prioridades')
  return {
    barra: {
      relacao: barra.relacao,
      parceiro: barra.parceiro,
      semExplicacao: barra.sem_explicacao,
      ficha: ficha(barra.ficha),
    },
    caracteristicas: prioridades.caracteristicas.map((c) => ({
      id: c.id,
      nome: c.nome,
      atracao: celula(c.atracao),
      satisfacao: celula(c.satisfacao),
      duracao: celula(c.duracao),
      ...(c.vies ? { vies: c.vies } : {}),
    })),
    doGuia: guia
      ? {
          tema: guia.topic,
          slug: guia.slug,
          pergunta: semMarcas(guia.pergunta),
          confianca: guia.confianca,
          resposta: semMarcas(guia.shortAnswer),
        }
      : null,
  }
}
