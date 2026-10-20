// The study's Design written out, for the Fact sheet page. Outside
// `badges.tsx`, which only exports components: that way Fast Refresh keeps
// the screen's state when it changes.
import type { Design } from '@tem-estudo/content'

export const DESIGN_NAME: Record<Design, string> = {
  longitudinal: 'longitudinal (acompanha as mesmas pessoas no tempo)',
  transversal: 'transversal (um retrato num momento)',
  experimento: 'experimento',
  plataforma: 'dados de plataforma',
  administrativo: 'registro administrativo',
  'meta-analise': 'meta-análise (junta vários estudos)',
}
