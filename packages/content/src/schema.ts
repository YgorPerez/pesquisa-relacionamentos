// The fact sheet frontmatter (#10, #5, #16), in Effect Schema. The build
// validator and the app read the same schema; the closed lists come from
// `lists.ts`. Keys and values are the content contract, in English since #70.
import { Schema } from 'effect'
import {
  CALCULATORS,
  COUPLES,
  DESIGNS,
  STRENGTHS,
  GENDERS,
  SEEKS,
  VERIFICATION_STATUSES,
} from './lists.ts'
import { Visual } from './visuals.ts'

const Text = Schema.String.check(
  Schema.isMinLength(1, { message: 'cannot be empty' }),
)

const DateText = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'write the date as YYYY-MM-DD',
  }),
)

export const Url = Schema.String.check(
  Schema.isPattern(/^https?:\/\/\S+$/, {
    message: 'must be a URL starting with http',
  }),
)

/** File slug: lowercase, no accents, hyphenated (#15). */
export const Slug = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'use lowercase without accents, with hyphens between words',
  }),
)

const Age = Schema.Int.check(
  Schema.isBetween(
    { minimum: 0, maximum: 120 },
    { message: 'age between 0 and 120' },
  ),
)

/** Who the sample covers. A missing key means the study did not split by it. */
export const Coverage = Schema.Struct({
  genders: Schema.optional(Schema.Array(Schema.Literals(GENDERS))),
  seeks: Schema.optional(Schema.Array(Schema.Literals(SEEKS))),
  ages: Schema.optional(Schema.Struct({ min: Age, max: Age })),
  couple: Schema.optional(Schema.Literals(COUPLES)),
})
export type Coverage = typeof Coverage.Type

/** Search title and description in place of the derived ones (#15). */
export const Seo = Schema.Struct({
  title: Schema.optional(Text),
  description: Schema.optional(Text),
})
export type Seo = typeof Seo.Type

/** Where a calculator data file comes from (`data/**\/x.meta.yaml`, #10). */
export const DataMeta = Schema.Struct({
  fact_sheet: Slug,
  table: Schema.optional(Schema.Array(Text)),
  variables: Schema.optional(Schema.Array(Text)),
  downloaded_on: DateText,
  script: Text,
  version: Text,
  /** What the pipeline checked against published numbers. */
  cross_check: Schema.optional(Text),
})
export type DataMeta = typeof DataMeta.Type

export const FactSheetFrontmatter = Schema.Struct({
  reference: Text,
  link: Url,
  status: Schema.Literals(VERIFICATION_STATUSES),
  verified_on: Schema.optional(DateText),
  strength: Schema.Literals(STRENGTHS),
  strength_reason: Text,
  countries: Schema.Array(Text),
  period: Text,
  sample: Schema.Struct({
    n: Schema.optional(Schema.Int.check(Schema.isGreaterThan(0))),
    description: Text,
    representative: Schema.Boolean,
  }),
  design: Schema.Literals(DESIGNS),
  conflict: Schema.optional(Text),
  license: Schema.optional(Text),
  covers: Coverage,
  previous: Schema.optional(Schema.Array(Slug)),
  seo: Schema.optional(Seo),
})
export type FactSheetFrontmatter = typeof FactSheetFrontmatter.Type

const Slugs = Schema.Array(Slug)

/** `tips/<slug>.md`: the body is the tip text. */
export const TipFrontmatter = Schema.Struct({
  fact_sheets: Slugs,
  strength: Schema.Literals(STRENGTHS),
  inference: Schema.optional(Schema.Boolean),
  applies_to: Schema.optional(Coverage),
  previous: Schema.optional(Slugs),
  seo: Schema.optional(Seo),
})
export type TipFrontmatter = typeof TipFrontmatter.Type

/** A Myth, placed in the Guide's body by a line `{{myth:<id>}}`. */
export const Myth = Schema.Struct({
  id: Slug,
  claim: Text,
  why_not: Text,
  fact_sheets: Slugs,
})
export type Myth = typeof Myth.Type

/** A finding of the Guide: what a Question's answer rests on, which the
 * build checks (the Confidence ceiling, the Fact sheets that exist and were
 * verified). The page does not list the findings (#194); a sentence of the
 * body marks with `{{you:<id>}}` that a finding's sample may be the
 * reader's. */
export const GuideFinding = Schema.Struct({
  id: Slug,
  text: Text,
  fact_sheets: Slugs,
  country: Schema.optional(Text),
  period: Schema.optional(Text),
  applies_to: Schema.optional(Coverage),
})

/** A Question's `previous`: the old slug in the same topic, or `topic/slug`
 * when the Question came from another topic. */
const QuestionPath = Schema.String.check(
  Schema.isPattern(
    /^(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)?[a-z0-9]+(?:-[a-z0-9]+)*$/,
    {
      message:
        'use the old slug or topic/slug, lowercase without accents, hyphenated',
    },
  ),
)

/** A Question of the Guide, answered where it fits in the narrative: the
 * body places it with a line `{{question:<slug>}}` (ADR 0042). */
export const QuestionFrontmatter = Schema.Struct({
  slug: Slug,
  question: Text,
  /** The short answer, in markdown, with `[@fact-sheet]` references and the
   * key number as `==…==`. */
  answer: Text,
  confidence: Schema.Literals(STRENGTHS),
  /** The ids of the findings the answer rests on: the Confidence ceiling is
   * checked against their Fact sheets. */
  findings: Slugs,
  calculator: Schema.optional(Schema.Literals(CALCULATORS)),
  previous: Schema.optional(Schema.Array(QuestionPath)),
})
export type QuestionFrontmatter = typeof QuestionFrontmatter.Type

/** `guides/<topic>.md`: a Topic and its Guide (ADR 0042). The body holds the
 * opening (before the first `##`), one `##` per Chapter and, last, "## O que
 * não se sabe". */
export const GuideFrontmatter = Schema.Struct({
  title: Text,
  /** Where the topic goes on the home page, smallest first (#143). The
   * topics are spaced by ten (10, 20, … 60): a new topic picks a free number
   * between two others and touches only its own file. */
  position: Schema.Int.check(
    Schema.isGreaterThan(0, { message: 'a whole number from 1 up' }),
  ),
  /** The Questions, in the order "Em resumo" lists them. */
  questions: Schema.Array(QuestionFrontmatter),
  findings: Schema.Array(GuideFinding),
  myths: Schema.optional(Schema.Array(Myth)),
  /** The Visuals (#182), each placed in the body by a line
   * `{{visual:<id>}}`; `visuals.ts` has the format and the checks. */
  visuals: Schema.optional(Schema.Array(Visual)),
  /** The "O que levar" block: the strongest Tips of the Guide. */
  takeaways: Schema.optional(Slugs),
  /** Questions of other Topics, for the end of the page. */
  related: Schema.optional(Slugs),
  previous: Schema.optional(Slugs),
  seo: Schema.optional(Seo),
})
export type GuideFrontmatter = typeof GuideFrontmatter.Type
