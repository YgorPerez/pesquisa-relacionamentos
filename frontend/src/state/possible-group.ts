// The Possible group in the browser: the saved Requirements and the count.
//
// The Requirements live in `localStorage['tem-estudo:requirements']`, in the
// `Requirements` shape of `@tem-estudo/rules/requirements` (plain JSON, read
// by `readRequirements`). `null` means the visitor never touched them: the B5
// card (#32) shows Brazil's number, and the link (#34) carries only the
// Profile. The count runs here, over the per-place packs the build writes
// (`vite/possible-group.ts`, downloaded by `group-packs.ts`): nothing the
// visitor asks for leaves the device.
import type {
  PlaceData,
  PackPlace,
} from '@tem-estudo/rules/possible-group-data'
import { estimateGroup, type Estimate } from '@tem-estudo/rules/possible-group'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  readRequirements,
  DEFAULT_REQUIREMENTS,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import { useEffect, useMemo, useState } from 'react'
import possibleGroup from 'virtual:possible-group'
import { requestPack, usePack } from './group-packs'
import { renameKeys, stored, useStored } from './stored'

/** The Requirements as saved before the code moved to English (ADR 0039):
 * the same values under Portuguese keys. */
export const LEGACY_REQUIREMENTS = {
  key: 'grupo-possivel',
  migrate: (raw: unknown) => {
    const requirements = renameKeys(raw, {
      idade: 'age',
      lugar: 'place',
      companheiro: 'noLiveInPartner',
      escolaridade: 'education',
      renda: 'income',
      cores: 'colors',
      religioes: 'religions',
      semFilhos: 'noChildren',
      altura: 'height',
      naoFuma: 'nonSmoker',
    }) as Record<string, unknown>
    return {
      ...requirements,
      place: renameKeys(requirements.place, {
        uf: 'state',
        municipio: 'municipality',
      }),
    }
  },
}

const savedRequirements = stored<Requirements>(
  'requirements',
  readRequirements,
  LEGACY_REQUIREMENTS,
)

/** The saved Requirements; `null` if the visitor never touched them (and on
 * the server). */
export const useSavedRequirements = (): Requirements | null =>
  useStored(savedRequirements)

/** Saves the Requirements (validated like the reader does); `null`
 * deletes. */
export const saveRequirements = (requirements: Requirements | null) =>
  savedRequirements.write(requirements && readRequirements(requirements))

/** The places with data: Brazil and the states the build packed. */
export const PLACES_WITH_DATA = possibleGroup.places

/** The count for someone who said nothing (Brazil, no Profile), done at
 * build time. */
const EXAMPLE_ESTIMATE: Estimate = possibleGroup.example

export interface BrowserCount {
  /** The estimate for the requested Requirements or, while the data
   * arrives, the last one that could be made. */
  readonly estimate: Estimate
  /** The estimate is not yet the one for the requested Requirements. */
  readonly loading: boolean
  /** The pack did not arrive (no network?). `retry` requests again. */
  readonly failed: boolean
  readonly retry: () => void
  /** The chosen state's data, for the list of municipalities. */
  readonly stateData: PlaceData | undefined
}

/**
 * The count of what the shared link carries, when it differs from the one on
 * the screen (`needed`): the sensitive Requirements left out for lack of
 * consent. The share image says this number, not the screen's. `null` when
 * not needed or while the data has not arrived; the packs are the ones the
 * screen's count already asked for.
 */
export function useSharedEstimate(
  profile: Profile | null,
  shared: Requirements | null,
  needed: boolean,
): Estimate | null {
  const requirements = shared ?? DEFAULT_REQUIREMENTS
  const state = requirements.place?.state
  const brazil = usePack('BR').data
  const stateData = usePack(state).data
  return useMemo(() => {
    if (!needed || !brazil || (state && !stateData)) return null
    try {
      return estimateGroup(
        { profile, requirements },
        { brazil, ...(stateData && { state: stateData }) },
      )
    } catch {
      return null
    }
  }, [needed, profile, requirements, brazil, state, stateData])
}

/** The count for the Profile and the Requirements, redone on each change. */
export function usePossibleGroup(
  profile: Profile | null,
  saved: Requirements | null,
): BrowserCount {
  const requirements = saved ?? DEFAULT_REQUIREMENTS
  const state = requirements.place?.state
  const needed: PackPlace[] = state ? ['BR', state] : ['BR']
  const brazilPack = usePack('BR')
  const statePack = usePack(state)

  // Whoever never said anything sees the count done at build time, without
  // downloading anything.
  const isExample = profile === null && saved === null

  useEffect(() => {
    if (!isExample) for (const place of needed) requestPack(place)
  })

  const brazil = brazilPack.data
  const stateData = statePack.data
  const ready = brazil && (!state || stateData)
  const computed = useMemo(() => {
    if (!ready || isExample) return null
    const data = { brazil, ...(stateData && { state: stateData }) }
    try {
      return estimateGroup({ profile, requirements }, data)
    } catch {
      // A saved municipality the current data does not have: the whole
      // state counts.
      const wholeState = {
        ...requirements,
        place: requirements.place && { state: requirements.place.state },
      }
      return estimateGroup({ profile, requirements: wholeState }, data)
    }
  }, [ready, isExample, profile, requirements, brazil, stateData])
  // While the data arrives, the last one that could be made counts. Kept in
  // state and swapped during render, as React says to keep what came from a
  // previous render.
  const [last, setLast] = useState<Estimate>(EXAMPLE_ESTIMATE)
  const estimate = isExample ? EXAMPLE_ESTIMATE : (computed ?? last)
  if (estimate !== last) setLast(estimate)

  return {
    estimate,
    loading: !isExample && !computed,
    failed: brazilPack.failed || statePack.failed,
    retry: () => needed.forEach((place) => requestPack(place, true)),
    stateData,
  }
}
