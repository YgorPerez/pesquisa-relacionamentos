// The study's Design and the Strength of evidence written out, for the pages.
// Outside `badges.tsx`, which only exports components: that way Fast Refresh
// keeps the screen's state when it changes.
import type { Design, Strength } from '@tem-estudo/content'

/** The Strength (and a Guide's Confidence) as the page writes it. */
export const STRENGTH_WORD: Record<Strength, string> = {
  strong: 'forte',
  moderate: 'moderada',
  weak: 'fraca',
}

export const DESIGN_NAME: Record<Design, string> = {
  longitudinal: 'longitudinal (acompanha as mesmas pessoas no tempo)',
  'cross-sectional': 'transversal (um retrato num momento)',
  experiment: 'experimento',
  platform: 'dados de plataforma',
  administrative: 'registro administrativo',
  'meta-analysis': 'meta-análise (junta vários estudos)',
}
