// The words of the home page's "Continuar lendo" (`continue-reading.tsx`),
// shared with its test.

/** The block's title. */
export const CONTINUE_READING = 'Continuar lendo'

/** How much of the Guide was read. */
export const readShare = (progress: number): string =>
  `${Math.round(progress * 100)}% lido`

/** The × of an item. */
export const forget = (guide: string): string => `Esquecer ${guide}`
