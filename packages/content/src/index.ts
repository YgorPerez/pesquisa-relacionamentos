// The content package's interface: load the library and derive paths and
// indexing from it. Pure, no DOM and no network; only `readFiles` touches the
// disk.
export {
  loadLibrary,
  factSheetBySlug,
  readFiles,
  buildLibrary,
  type Library,
  type ContentFile,
  type LoadOptions,
  type DataOrigin,
  type LoadResult,
} from './library.ts'
export {
  tipSearch,
  factSheetSearch,
  topicSearch,
  sitemapPaths,
  LIMITS,
  ORIGIN,
  redirects,
  robotsTxt,
  sitemapXml,
  plainText,
  type SearchMeta,
} from './search.ts'
export {
  tipPath,
  factSheetPath,
  questionPath,
  topicPath,
  calculatorPath,
  isFactSheetIndexable,
} from './paths.ts'
export {
  tipBySlug,
  isTipPublished,
  guideBySlug,
  guidesWithTip,
  guideTips,
  guideMyths,
  topicGuides,
  topicBySlug,
} from './queries.ts'
export type { Coverage, Divergence, Myth, Seo } from './schema.ts'
export type {
  Visual,
  BarsVisual,
  TimelineVisual,
  StudyTableVisual,
  DiagramVisual,
  Calculation,
  Evidence,
} from './visuals.ts'
export type { GuideFinding, Tip, Guide, Topic } from './items.ts'
export {
  CALCULATORS,
  COUPLES,
  DESIGNS,
  STRENGTHS,
  GENDERS,
  SEEKS,
  RESERVED_ROUTES,
  VERIFICATION_STATUSES,
  type Calculator,
  type Design,
  type Strength,
  type VerificationStatus,
} from './lists.ts'
export type { Finding, FactSheet } from './fact-sheet.ts'
export type {
  Trait,
  PriorityCell,
  Priorities,
  ExplainedSatisfaction,
  PercentRange,
} from './priorities.ts'
export type { Section } from './markdown.ts'
export { referencesInText } from './publication.ts'
export { formatProblems, type Problem } from './problems.ts'
