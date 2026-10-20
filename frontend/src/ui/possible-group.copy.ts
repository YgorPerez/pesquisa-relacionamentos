// The Possible group copy the page and the pieces share. Outside
// `possible-group.tsx`, which only exports components: that way Fast Refresh
// keeps the screen's state when it changes.
import type { Cost } from '@tem-estudo/rules/possible-group'
import { formatGain, formatTimes } from '@tem-estudo/rules/numbers'

/** "soltar só este: ×3,4 (+670)". Below 5%, it says it barely changes. */
export function costText(cost: Cost): string {
  if (cost.times < 1.05) return 'soltar este quase não muda o grupo'
  return `soltar só este: ${formatTimes(cost.times)} (${formatGain(cost.gain)})`
}
