// Who a sample covers, in the shape a Fact sheet's `covers`, a finding's or
// tip's `applies_to` and a stacked bar's `applies_to` share. Its own module
// because `schema.ts` imports the Visuals, and a Visual's bar uses it too.
import { Schema } from 'effect'
import { COUPLES, GENDERS, SEEKS } from './lists.ts'

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
