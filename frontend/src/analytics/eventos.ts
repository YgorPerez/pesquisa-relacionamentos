// Os eventos da contagem de uso (#21, #35), todos aqui. O nome é o que o
// painel do GoatCounter mostra, e mudar um quebra a série que já está lá.
// Nenhum leva o Perfil: os pedaços são o Guia, a Ficha, o motivo e a
// calculadora, nunca algo sobre quem visita.

/** Os quatro motivos do "não" do "Ajudou?", fechados (#21). */
export const MOTIVOS_DO_NAO = ['nao-respondeu', 'nao-confio', 'dificil', 'nao-vale'] as const
export type MotivoDoNao = (typeof MOTIVOS_DO_NAO)[number]

export type CalculadoraContada = 'grupo-possivel' | 'prioridades'

export type Evento =
  | `ajudou/sim/${string}`
  | `ajudou/nao/${MotivoDoNao}/${string}`
  | `ficha/${string}/${string}`
  | `calculadora/${CalculadoraContada}`

export const EVENTOS = {
  /** "Ajudou?" no fim do Guia: sim. */
  ajudouSim: (guia: string): Evento => `ajudou/sim/${guia}`,
  /** "Ajudou?": não, com o motivo. */
  ajudouNao: (motivo: MotivoDoNao, guia: string): Evento => `ajudou/nao/${motivo}/${guia}`,
  /** Uma Ficha aberta do Guia, pelo título ou por um link no texto. */
  fichaAberta: (guia: string, ficha: string): Evento => `ficha/${guia}/${ficha}`,
  /** A calculadora mexida; conta uma vez por visita. */
  calculadora: (calculadora: CalculadoraContada): Evento => `calculadora/${calculadora}`,
} as const
