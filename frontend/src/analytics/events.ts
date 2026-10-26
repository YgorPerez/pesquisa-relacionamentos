// The usage-count events (#21, #35), all here. The name is what the
// GoatCounter dashboard shows, and changing one breaks the series already
// there (the move to English, ADR 0039, broke it once). None carries the
// Profile: the pieces are the Guide, the Fact sheet, the reason, the
// calculator and the Neighbor site, never anything about who visits. The slugs are the URLs', in
// Portuguese.

/** The four closed reasons for the "no" of "Ajudou?" (#21). */
export const NO_REASONS = [
  'did-not-answer',
  'do-not-trust',
  'hard-to-understand',
  'does-not-apply',
] as const
export type NoReason = (typeof NO_REASONS)[number]

/** The calculator, by its route (`/grupo-possivel`, `/prioridades`). */
export type CountedCalculator = 'grupo-possivel' | 'prioridades'

const CALCULATOR_EVENT: Readonly<Record<CountedCalculator, string>> = {
  'grupo-possivel': 'possible-group',
  prioridades: 'priorities',
}

export type AnalyticsEvent =
  | `helped/yes/${string}`
  | `helped/no/${NoReason}/${string}`
  | `fact-sheet/${string}/${string}`
  | `calculator/${string}`
  | `continue-reading/${string}`
  | `neighbor-site/${string}`

// Since #194 (2026-10-26) the Guide has one "Ajudou?" and its key is the
// Topic's slug (`helped/yes/onde-conhecer-pessoas`); the per-Question series
// (`helped/…/onde-os-casais-se-conhecem`) stopped that day. A Fact sheet
// opened from the Guide also counts by the Topic since then.
export const EVENTS = {
  /** "Ajudou?" at the end of the Guide: yes. */
  helpedYes: (guide: string): AnalyticsEvent => `helped/yes/${guide}`,
  /** "Ajudou?": no, with the reason. */
  helpedNo: (reason: NoReason, guide: string): AnalyticsEvent =>
    `helped/no/${reason}/${guide}`,
  /** A Fact sheet opened from the Guide, by its title or by a link in the
   * text. */
  factSheetOpened: (guide: string, factSheet: string): AnalyticsEvent =>
    `fact-sheet/${guide}/${factSheet}`,
  /** The calculator was used; counts once per visit. */
  calculator: (calculator: CountedCalculator): AnalyticsEvent =>
    `calculator/${CALCULATOR_EVENT[calculator]}`,
  /** "Continuar lendo" on the home page: the Guide only, never where the
   * reader stopped (#195). */
  continueReading: (guide: string): AnalyticsEvent =>
    `continue-reading/${guide}`,
  /** A Reading opened, on `/sites-vizinhos` or at the end of a Guide: the
   * Neighbor site's id only (#179). */
  neighborSite: (site: string): AnalyticsEvent => `neighbor-site/${site}`,
} as const
