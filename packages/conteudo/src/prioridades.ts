// O arquivo de Prioridades (#9, #10, #19; story 99): por característica ×
// desfecho, o degrau de 0 a 3, a medida, o texto simples e a Ficha, além do
// viés por gênero. A calculadora `/prioridades` e o cartão do Guia B1 leem
// este mesmo arquivo. Cada número segue a regra das afirmações: a Ficha
// citada tem de existir e ser ✅ ou 🟡.
import { Schema } from 'effect'
import { parse as lerYaml } from 'yaml'
import { Slug } from './esquema.ts'
import type { Ficha } from './ficha.ts'
import { decodificar, problema, type Problema } from './problemas.ts'

export const ARQUIVO_DE_PRIORIDADES = 'dados/prioridades/prioridades.yaml'
export const META_DE_PRIORIDADES = 'dados/prioridades/prioridades.meta.yaml'

const Texto = Schema.String.check(Schema.isMinLength(1, { message: 'não pode ficar vazio' }))
const Porcento = Schema.Int.check(
  Schema.isBetween({ minimum: 0, maximum: 100 }, { message: 'porcentagem inteira de 0 a 100' }),
)

/** Uma célula característica × desfecho. Sem Ficha, só o degrau 0. */
const Celula = Schema.Struct({
  degrau: Schema.Literals([0, 1, 2, 3]),
  medida: Schema.optional(Texto),
  texto_simples: Texto,
  ficha: Schema.optional(Slug),
})
export type CelulaDePrioridade = typeof Celula.Type

/** A distância entre o que se declara e o que se escolhe. */
const Vies = Schema.Struct({
  todos: Schema.optional(Texto),
  homem: Schema.optional(Texto),
  mulher: Schema.optional(Texto),
})

const Caracteristica = Schema.Struct({
  id: Slug,
  nome: Texto,
  atracao: Celula,
  satisfacao: Celula,
  duracao: Celula,
  vies: Schema.optional(Vies),
})
export type Caracteristica = typeof Caracteristica.Type

/** A barra da Joel 2020: de onde vem a satisfação, em porcentagem. */
const SatisfacaoExplicada = Schema.Struct({
  ficha: Slug,
  relacao: Porcento,
  parceiro: Porcento,
  sem_explicacao: Porcento,
})
export type SatisfacaoExplicada = typeof SatisfacaoExplicada.Type

const ArquivoDePrioridades = Schema.Struct({
  satisfacao_explicada: SatisfacaoExplicada,
  caracteristicas: Schema.Array(Caracteristica),
})

export interface Prioridades extends Schema.Schema.Type<typeof ArquivoDePrioridades> {
  /** Caminho do arquivo a partir da raiz do repositório. */
  readonly arquivo: string
}

export type PrioridadesLidas =
  | { readonly ok: true; readonly prioridades: Prioridades }
  | { readonly ok: false; readonly erros: ReadonlyArray<Problema> }

/** A regra das afirmações para uma Ficha citada pelos dados. */
export function fichaDosDados(
  arquivo: string,
  campo: string,
  slug: string,
  fichas: ReadonlyArray<Ficha>,
): Problema | null {
  const ficha = fichas.find((f) => f.slug === slug)
  if (!ficha) return problema(arquivo, `não existe a Ficha estudos/${slug}.md`, campo)
  if (ficha.status === 'nao-verificado')
    return problema(arquivo, `${slug} é ⬜ (não verificada); dados só citam Ficha ✅ ou 🟡`, campo)
  return null
}

const DESFECHOS = ['atracao', 'satisfacao', 'duracao'] as const

export function lerPrioridades(
  arquivo: string,
  texto: string,
  fichas: ReadonlyArray<Ficha>,
  temMeta: boolean,
): PrioridadesLidas {
  if (!temMeta)
    return {
      ok: false,
      erros: [
        problema(
          arquivo,
          'falta o prioridades.meta.yaml ao lado, com a Ficha, as variáveis, a data, o script e a versão',
        ),
      ],
    }
  let valor: unknown
  try {
    valor = lerYaml(texto) ?? {}
  } catch (e) {
    return { ok: false, erros: [problema(arquivo, `não é YAML válido: ${(e as Error).message}`)] }
  }
  const lido = decodificar(ArquivoDePrioridades, valor, arquivo)
  if (!lido.ok) return { ok: false, erros: lido.problemas }
  const { satisfacao_explicada: barra, caracteristicas } = lido.valor

  const erros: Problema[] = []
  const soma = barra.relacao + barra.parceiro + barra.sem_explicacao
  if (soma !== 100)
    erros.push(
      problema(arquivo, `relação, parceiro e sem explicação somam ${soma}%, e não 100%`, 'satisfacao_explicada'),
    )
  const daBarra = fichaDosDados(arquivo, 'satisfacao_explicada.ficha', barra.ficha, fichas)
  if (daBarra) erros.push(daBarra)

  caracteristicas.forEach((car, i) => {
    if (caracteristicas.findIndex((outra) => outra.id === car.id) !== i)
      erros.push(problema(arquivo, `a característica "${car.id}" aparece mais de uma vez`, `caracteristicas.${i}.id`))
    for (const desfecho of DESFECHOS) {
      const celula = car[desfecho]
      const campo = `caracteristicas.${i}.${desfecho}.ficha`
      if (celula.ficha === undefined) {
        if (celula.degrau > 0)
          erros.push(
            problema(
              arquivo,
              `o degrau ${celula.degrau} precisa da Ficha que o sustenta; sem Ficha, só o 0 ("não sabemos")`,
              campo,
            ),
          )
        continue
      }
      const daCelula = fichaDosDados(arquivo, campo, celula.ficha, fichas)
      if (daCelula) erros.push(daCelula)
    }
  })

  return erros.length > 0 ? { ok: false, erros } : { ok: true, prioridades: { arquivo, ...lido.valor } }
}
