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

const Url = Schema.String.check(
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

/** `guides/<topic>/_topic.md`: the body is the context paragraph. */
export const TopicFrontmatter = Schema.Struct({
  title: Text,
  /** Where the topic goes on the home page, smallest first (#143). The
   * topics are spaced by ten (10, 20, … 60): a new topic picks a free number
   * between two others and touches only its own file. */
  position: Schema.Int.check(
    Schema.isGreaterThan(0, { message: 'a whole number from 1 up' }),
  ),
  order: Slugs,
  previous: Schema.optional(Slugs),
  seo: Schema.optional(Seo),
})
export type TopicFrontmatter = typeof TopicFrontmatter.Type

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

export const GuideFinding = Schema.Struct({
  text: Text,
  fact_sheets: Slugs,
  country: Schema.optional(Text),
  period: Schema.optional(Text),
  applies_to: Schema.optional(Coverage),
})

const Side = Schema.Struct({ title: Text, text: Text, fact_sheets: Slugs })

/** The evidence diverges: both sides in a table and which one has the better
 * design (#7). */
export const Divergence = Schema.Struct({
  better_design: Text,
  sides: Schema.Tuple([Side, Side]),
})
export type Divergence = typeof Divergence.Type

export const Myth = Schema.Struct({
  claim: Text,
  why_not: Text,
  fact_sheets: Slugs,
})
export type Myth = typeof Myth.Type

/** A guide's `previous`: the old slug in the same topic, or `topic/slug` when the
 * guide came from another topic. */
const GuidePath = Schema.String.check(
  Schema.isPattern(
    /^(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)?[a-z0-9]+(?:-[a-z0-9]+)*$/,
    {
      message:
        'use the old slug or topic/slug, lowercase without accents, hyphenated',
    },
  ),
)

/** `guides/<topic>/<slug>.md`: the body holds the short answer (before the
 * first `##`), the Guide's own sections if any, "Varia conforme o Perfil?"
 * and "Limitações". */
export const GuideFrontmatter = Schema.Struct({
  question: Text,
  confidence: Schema.Literals(STRENGTHS),
  findings: Schema.Array(GuideFinding),
  divergence: Schema.optional(Divergence),
  tips: Schema.optional(Slugs),
  myths: Schema.optional(Schema.Array(Myth)),
  related: Schema.optional(Slugs),
  calculator: Schema.optional(Schema.Literals(CALCULATORS)),
  previous: Schema.optional(Schema.Array(GuidePath)),
  seo: Schema.optional(Seo),
  /** The Question's Visuals (#182), each placed in the body by a line
   * `{{visual:<id>}}`; `visuals.ts` has the format and the checks. */
  visuals: Schema.optional(Schema.Array(Visual)),
})
export type GuideFrontmatter = typeof GuideFrontmatter.Type
