// The Possible group link preview's count, without the server: the caller
// says where the packs come from. The site calls it on the server
// (`fetchGroupPreview`, `preview.ts`), over the build's files; Storybook, in
// Node, over the packs it builds from the fixture
// (`platform/storybook/link-previews.ts`).
import type {
  PlaceData,
  PackPlace,
} from '@tem-estudo/rules/possible-group-data'
import {
  estimateGroup,
  needsDetail,
  type Estimate,
} from '@tem-estudo/rules/possible-group'
import { readLink, groupPreview, type Preview } from '@tem-estudo/rules/link'
import { DEFAULT_REQUIREMENTS } from '@tem-estudo/rules/requirements'

/** What the count reads from `virtual:possible-group`. */
export interface PreviewData {
  readonly places: ReadonlyArray<PackPlace>
  readonly example: Estimate
}

/** The Possible group link preview; `null` if the query is not a link's or
 * the data is missing. */
export async function buildGroupPreview(
  query: string,
  data: PreviewData,
  /** The place's pack; the detail one with `detail` (`needsDetail`). */
  pack: (place: PackPlace, detail: boolean) => Promise<PlaceData | null>,
): Promise<Preview | null> {
  const state = readLink('grupo-possivel', query)
  if (state?.calculator !== 'grupo-possivel') return null
  if (!state.profile && !state.requirements)
    return groupPreview(state, data.example)

  const requirements = state.requirements ?? DEFAULT_REQUIREMENTS
  const stateCode = requirements.place?.state
  const detail = needsDetail({ profile: state.profile, requirements })
  const brazil = await pack('BR', detail)
  const statePack =
    stateCode && data.places.includes(stateCode)
      ? await pack(stateCode, detail)
      : null
  if (!brazil || (stateCode && !statePack)) return null
  const count = (r: typeof requirements): Estimate =>
    estimateGroup(
      { profile: state.profile, requirements: r },
      { brazil, ...(statePack && { state: statePack }) },
    )
  const code = requirements.place?.municipality
  const municipality = code
    ? statePack?.municipalities.get(code)?.name
    : undefined
  if (code && !municipality) {
    // A municipality the current data does not have: the whole state counts,
    // as on the page.
    const wholeState = {
      ...requirements,
      place: stateCode ? { state: stateCode } : null,
    }
    return groupPreview(
      { ...state, requirements: wholeState },
      count(wholeState),
    )
  }
  return groupPreview(state, count(requirements), { municipality })
}
