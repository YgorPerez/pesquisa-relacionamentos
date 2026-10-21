// The Priorities copy the pieces and their tests share. Outside
// `priorities.tsx`, which only exports components: that way Fast Refresh
// keeps the screen's state when it changes. The partner's word comes from
// its measured range (`shareWord`), so the sentence follows the data.
import type { PercentRange } from '@tem-estudo/content'
import { decimal } from '@tem-estudo/rules/numbers'
import { shareWord } from '@tem-estudo/rules/priorities'

/** "0% a 1,9%". */
const percentRange = ({ min, max }: PercentRange) =>
  `${decimal(min)}% a ${decimal(max)}%`

/** The whole Joel 2020 bar in one sentence, for the screen reader. */
export const barLabel = (bar: {
  readonly relationship: number
  readonly unexplained: number
  readonly partnerAdded: { readonly baseline: PercentRange }
}) =>
  `Satisfação: ${bar.relationship}% explicado pela relação, ${shareWord(bar.partnerAdded.baseline)} a mais pelo parceiro (${percentRange(bar.partnerAdded.baseline)}), ${bar.unexplained}% sem explicação`

/** The partner's line in the bar's legend. */
export const partnerLegend = (baseline: PercentRange, followUp: PercentRange) =>
  `tudo o que se sabe do parceiro soma de ${percentRange(baseline)} (de ${percentRange(followUp)} no fim dos estudos)`

/** The B1 card's line over the chosen top 3. */
export const cardTop3Lead = (partnerAtBaseline: PercentRange) =>
  `Seu topo 3 cabe na fatia do parceiro, que soma ${shareWord(partnerAtBaseline)} (${percentRange(partnerAtBaseline)}):`
