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
  questionBySlug,
  questionsWithTip,
  topicQuestions,
  topicBySlug,
  topicReadings,
} from './queries.ts'
export type { NeighborSite, Notices, Reading } from './neighbor-sites.ts'
export {
  NOTICE_KINDS,
  READING_LANGUAGES,
  type NoticeKind,
  type ReadingLanguage,
} from './lists.ts'
export type { Coverage, Myth, Seo } from './schema.ts'
export type {
  Visual,
  BarsVisual,
  TimelineVisual,
  StudyTableVisual,
  DiagramVisual,
  Calculation,
  Evidence,
} from './visuals.ts'
export type {
  Chapter,
  ChapterPart,
  GuideFinding,
  Question,
  Tip,
  Topic,
} from './items.ts'
export { UNKNOWNS_TITLE } from './items.ts'
export { BRAZIL_MARK, YOU_MARK } from './marks.ts'
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
