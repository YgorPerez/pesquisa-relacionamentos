// The words of the Visuals (`visual-*.tsx`), which the server view and the
// tests share. Outside the pieces, which only export components.
import type { Evidence } from '@tem-estudo/content'

export const VISUAL_COPY = {
  sources: 'Fontes:',
  ownLine: (label: string, expression: string, result: string) =>
    `Conta nossa, ${label}: ${expression} = ${result}.`,
  mean: (inputs: ReadonlyArray<string>) =>
    `média de ${inputs.slice(0, -1).join(', ')} e ${inputs[inputs.length - 1] ?? ''}`,
  countries: (n: number) => `${n} países`,
  people: (n: string) => `${n} pessoas`,
  study: 'Estudo',
  result: 'Resultado',
  /** The heading of the arrows' list, under the diagram. */
  arrows: 'O que cada seta diz',
  evidence: {
    cause: 'um estudo testou a causa',
    association: 'achou só associação',
    inference: 'inferência nossa',
  } satisfies Record<Evidence, string>,
} as const
