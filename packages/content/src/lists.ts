// The content's closed lists (#10, #5, #16), with no dependency at all: the
// browser imports from here without pulling Effect along. The values are the
// content contract, in English since #70.

/** Verification status: ✅ read in the original, 🟡 partial, ⬜ unverified. */
export const VERIFICATION_STATUSES = [
  'verified',
  'partial',
  'unverified',
] as const
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

/** Strength of the evidence of a fact sheet and a tip, and a guide's
 * confidence. */
export const STRENGTHS = ['strong', 'moderate', 'weak'] as const
export type Strength = (typeof STRENGTHS)[number]

export const DESIGNS = [
  'longitudinal',
  'cross-sectional',
  'experiment',
  'platform',
  'administrative',
  'meta-analysis',
] as const
export type Design = (typeof DESIGNS)[number]

/** What a study covers. The profile's `outro` and `ambos` have no match
 * here (#5). */
export const GENDERS = ['man', 'woman'] as const
export const SEEKS = ['men', 'women'] as const
export const COUPLES = ['different-sex', 'same-sex'] as const

/** The calculators a guide can host. */
export const CALCULATORS = ['possible-group', 'priorities'] as const
export type Calculator = (typeof CALCULATORS)[number]

/** The language a Neighbor site writes in: Portuguese goes first in each
 * Topic's Readings (#179). */
export const READING_LANGUAGES = ['pt', 'en'] as const
export type ReadingLanguage = (typeof READING_LANGUAGES)[number]

/** The notices a Neighbor site or a Reading carries, in the order shown:
 * what it sells, the cause it declares, then the Caveat, which only a
 * Reading carries (GLOSSARY: Ressalva). */
export const NOTICE_KINDS = ['commercial', 'cause', 'caveat'] as const
export type NoticeKind = (typeof NOTICE_KINDS)[number]

/** The app's fixed paths, which no topic can use as its slug (#15). They are
 * public URLs, so they stay in Portuguese. */
export const RESERVED_ROUTES = [
  'busca',
  'estudos',
  'dicas',
  'glossario',
  'grifos',
  'grupo-possivel',
  'prioridades',
  'privacidade',
  'sites-vizinhos',
  'trechos',
  'sitemap.xml',
  'robots.txt',
] as const
