// The Possible group copy the page and the pieces share. Outside
// `possible-group.tsx`, which only exports components: that way Fast Refresh
// keeps the screen's state when it changes.
import {
  REQUIREMENT_SOURCE,
  type Cost,
  type RequirementId,
} from '@tem-estudo/rules/possible-group'
import { andList } from '@tem-estudo/rules/lists'
import { formatGain, formatTimes } from '@tem-estudo/rules/numbers'
import {
  REQUIREMENT_TITLE,
  type SensitiveRequirement,
} from '@tem-estudo/rules/requirements'

/** The Requirements whose title alone ("Pais", "Casa") does not say what
 * they ask, written as in a sentence. */
const NOUN: Partial<Record<RequirementId, string>> = {
  partner: 'morar com companheiro(a)',
  parents: 'morar com os pais',
  work: 'situação de trabalho',
  home: 'casa própria',
  drinking: 'frequência com que bebe',
}

/** A Requirement as a noun in a sentence ("escolaridade", "morar com
 * companheiro(a)"). */
const noun = (k: RequirementId) =>
  NOUN[k] ??
  REQUIREMENT_TITLE[k as keyof typeof REQUIREMENT_TITLE].toLowerCase()

/** The opening of the independence range's paragraph (#301): which
 * Requirements come from which survey, and how many surveys that is. On the
 * Census side, only the ones that cut inside sex and age (age and place cut
 * every side alike). */
export function independenceSources(active: ReadonlyArray<RequirementId>): {
  readonly text: string
  readonly surveys: number
} {
  const from = (source: string) =>
    active.filter(
      (k) => REQUIREMENT_SOURCE[k] === source && k !== 'age' && k !== 'place',
    )
  const sides = (
    [
      ['PNS', 'da PNS'],
      ['PNAD', 'da PNAD'],
      ['Censo', 'do Censo'],
    ] as const
  )
    .map(([source, of]) => [from(source), of] as const)
    .filter(([ks]) => ks.length > 0)
    .map(
      ([ks, of]) =>
        `${andList(ks.map(noun))} ${ks.length > 1 ? 'vêm' : 'vem'} ${of}`,
    )
  const text = `${sides.join('; ')}.`
  return {
    text: text.charAt(0).toUpperCase() + text.slice(1),
    surveys: sides.length,
  }
}

/** What the top range combines: the Census sampling error with the interval
 * of each other survey the count reads (#287, #294). */
export function samplingText(
  active: ReadonlyArray<RequirementId>,
  records: number,
): string {
  const census = `o erro de amostra do Censo (${Math.round(records).toLocaleString('pt-BR')} registros)`
  const others = (['PNS', 'PNAD'] as const).filter((source) =>
    active.some((k) => REQUIREMENT_SOURCE[k] === source),
  )
  if (others.length === 0) return `A faixa é ${census}.`
  const intervals = andList(others.map((source) => `da ${source}`))
  return `A faixa junta ${census} com ${others.length > 1 ? 'os intervalos' : 'o intervalo'} ${intervals}.`
}

/** What each sensitive Requirement measures, under its control. The count's
 * caveats say the rest. */
export const SENSITIVE_NOTE: Readonly<
  Partial<Record<RequirementId, string>> & Record<SensitiveRequirement, string>
> = {
  obesity:
    'IMC é o peso dividido pela altura ao quadrado; 30 ou mais é o corte de obesidade da OMS. A PNS 2019 usa o peso e a altura que a pessoa declarou.',
  depression:
    'Pelo PHQ-9 da PNS 2019, um questionário sobre as 2 últimas semanas: mede um período da vida, não quem a pessoa é.',
  bisexual:
    'Quem se declara bissexual na PNS 2019, de 18 anos ou mais. É uma estatística experimental do IBGE, com poucos registros por idade.',
  worship:
    'Quem vai a cultos ou atividades da religião uma vez por semana ou mais, pela PNS 2019, que não pergunta qual religião.',
}

/** Where a sensitive Requirement stays, after what it measures. */
export const SENSITIVE_STAYS =
  'Dado sensível: fica só neste aparelho e vai no link só se você deixar.'

/** "soltar só este: ×3,4 (+670)". Below 5%, it says it barely changes. */
export function costText(cost: Cost): string {
  if (cost.times < 1.05) return 'soltar este quase não muda o grupo'
  return `soltar só este: ${formatTimes(cost.times)} (${formatGain(cost.gain)})`
}
