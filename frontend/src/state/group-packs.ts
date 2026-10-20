// The Possible group packs by place, which the build writes
// (`vite/possible-group.ts`) and the browser downloads. One request per place,
// kept: going back to a state already downloaded does not request it again,
// and two cards that ask for the same place share the request. The count
// (`possible-group.ts`) only reads from here.
import {
  openPack,
  type PlaceData,
  type PackPlace,
} from '@tem-estudo/rules/possible-group-data'
import { useSyncExternalStore } from 'react'
import possibleGroup from 'virtual:possible-group'

const opened = new Map<PackPlace, PlaceData>()
const requests = new Map<PackPlace, Promise<void>>()
const failures = new Set<PackPlace>()
const subscribers = new Set<() => void>()
const notify = () => {
  subscribers.forEach((subscriber) => subscriber())
}

/** Requests the place's pack, if it has not arrived nor is on its way. One
 * that failed is only requested `again` (the page's "Tentar de novo"): the
 * page requests on every render, and without network each failure requested
 * once more, nonstop, and the failure notice flickered. */
export function requestPack(place: PackPlace, again = false) {
  if (opened.has(place) || requests.has(place)) return
  if (failures.has(place) && !again) return
  failures.delete(place)
  const request = fetch(`${possibleGroup.base}/${place}.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`pack ${place}: ${response.status}`)
      return response.json()
    })
    .then((pack) => {
      opened.set(place, openPack(pack))
    })
    .catch(() => {
      failures.add(place)
    })
    .finally(() => {
      requests.delete(place)
      notify()
    })
  requests.set(place, request)
  notify()
}

const subscribe = (subscriber: () => void) => {
  subscribers.add(subscriber)
  return () => subscribers.delete(subscriber)
}

/** The place's data, once the pack arrives, and whether the request failed
 * (no network?). Read as a store snapshot, and not straight from the `Map` in
 * the render: the React Compiler keeps what the render computes, and only a
 * value that comes from a hook says it changed. `undefined` requests
 * nothing. */
export function usePack(place: PackPlace | undefined): {
  data: PlaceData | undefined
  failed: boolean
} {
  const data = useSyncExternalStore(
    subscribe,
    () => (place ? opened.get(place) : undefined),
    () => undefined,
  )
  const failed = useSyncExternalStore(
    subscribe,
    () => (place ? failures.has(place) : false),
    () => false,
  )
  return { data, failed }
}
