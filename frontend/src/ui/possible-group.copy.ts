// The Possible group copy the page and the pieces share. Outside
// `possible-group.tsx`, which only exports components: that way Fast Refresh
// keeps the screen's state when it changes.
import {
  REQUIREMENT_SOURCE,
  type Cost,
  type RequirementId,
} from '@tem-estudo/rules/possible-group'
import { formatGain, formatTimes } from '@tem-estudo/rules/numbers'
import { REQUIREMENT_TITLE } from '@tem-estudo/rules/requirements'

const list = new Intl.ListFormat('pt-BR', { type: 'conjunction' })

/** A Requirement as a noun in a sentence ("escolaridade", "morar com
 * companheiro(a)"). */
const noun = (k: RequirementId) =>
  k === 'partner'
    ? 'morar com companheiro(a)'
    : REQUIREMENT_TITLE[k as keyof typeof REQUIREMENT_TITLE].toLowerCase()

/** The opening of the independence range's sentence (#301): which
 * Requirements come from the PNS and which from the Census, the ones that
 * cut inside sex and age (age and place cut both sides alike). */
export function independenceSources(
  active: ReadonlyArray<RequirementId>,
): string {
  const pns = active.filter((k) => REQUIREMENT_SOURCE[k] === 'PNS')
  const census = active.filter(
    (k) => REQUIREMENT_SOURCE[k] === 'Censo' && k !== 'age' && k !== 'place',
  )
  const side = (ks: RequirementId[]) =>
    `${list.format(ks.map(noun))} ${ks.length > 1 ? 'vêm' : 'vem'}`
  const text = `${side(pns)} da PNS; ${side(census)} do Censo.`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "soltar só este: ×3,4 (+670)". Below 5%, it says it barely changes. */
export function costText(cost: Cost): string {
  if (cost.times < 1.05) return 'soltar este quase não muda o grupo'
  return `soltar só este: ${formatTimes(cost.times)} (${formatGain(cost.gain)})`
}
