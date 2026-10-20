// The content's closed lists (#10, #5, #16), with no dependency at all: the
// browser imports from here without pulling Effect along. The values are the
// content contract and stay in Portuguese until #70.

/** Verification status: ✅ read in the original, 🟡 partial, ⬜ unverified. */
export const VERIFICATION_STATUSES = [
  'ok',
  'parcial',
  'nao-verificado',
] as const
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

/** Strength of the evidence of a fact sheet and a tip, and a guide's
 * confidence. */
export const STRENGTHS = ['forte', 'moderada', 'fraca'] as const
export type Strength = (typeof STRENGTHS)[number]

export const DESIGNS = [
  'longitudinal',
  'transversal',
  'experimento',
  'plataforma',
  'administrativo',
  'meta-analise',
] as const
export type Design = (typeof DESIGNS)[number]

/** What a study covers. `outro` and `ambos` exist only in the profile (#5). */
export const GENDERS = ['homem', 'mulher'] as const
export const SEEKS = ['homens', 'mulheres'] as const
export const COUPLES = ['hetero', 'mesmo-sexo'] as const

/** The calculators a guide can host. */
export const CALCULATORS = ['grupo-possivel', 'prioridades'] as const
export type Calculator = (typeof CALCULATORS)[number]

/** The app's fixed paths, which no topic can use as its slug (#15). They are
 * public URLs, so they stay in Portuguese. */
export const RESERVED_ROUTES = [
  'estudos',
  'dicas',
  'grupo-possivel',
  'prioridades',
  'privacidade',
  'sitemap.xml',
  'robots.txt',
] as const
