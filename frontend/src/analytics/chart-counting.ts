// A chart's count, apart from `counting.ts` and `events.ts`, which many files
// already import (`scripts/before-merge.ts`).
import { countEvent } from './counting'
import { EVENTS } from './events'

/** A card pinned on chart `chart`: each pin counts, under its chart (#502). */
export const countPinnedCard = (chart: string) =>
  countEvent(EVENTS.chartCard(chart))
