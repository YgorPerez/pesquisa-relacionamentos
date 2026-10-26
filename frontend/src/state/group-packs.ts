// The Possible group packs by place, which the build writes
// (`vite/possible-group.ts`) and the browser downloads. Each place has a
// default pack and a detail one (with parents, work, home, BMI, depression
// symptoms and religious attendance), which only the counts that read those
// download (`needsDetail`). One request per pack, kept: going
// back to a state already downloaded does not request it again, and two
// cards that ask for the same pack share the request. The count
// (`possible-group.ts`) only reads from here.
import {
  openPack,
  packFile,
  type PlaceData,
  type PackPlace,
} from '@tem-estudo/rules/possible-group-data'
import { useSyncExternalStore } from 'react'
import possibleGroup from 'virtual:possible-group'

/** The packs by file name (`packFile`). */
const opened = new Map<string, PlaceData>()
const requests = new Map<string, Promise<void>>()
const failures = new Set<string>()
const subscribers = new Set<() => void>()
const notify = () => {
  subscribers.forEach((subscriber) => subscriber())
}

/** Requests the place's pack (the detail one with `detail`), if it has not
 * arrived nor is on its way. One that failed is only requested `again` (the
 * page's "Tentar de novo"): the page requests on every render, and without
 * network each failure requested once more, nonstop, and the failure notice
 * flickered. */
export function requestPack(place: PackPlace, detail: boolean, again = false) {
  const file = packFile(place, detail)
  if (opened.has(file) || requests.has(file)) return
  if (failures.has(file) && !again) return
  failures.delete(file)
  const request = fetch(`${possibleGroup.base}/${file}`)
    .then((response) => {
      if (!response.ok) throw new Error(`pack ${file}: ${response.status}`)
      return response.json()
    })
    .then((pack) => {
      opened.set(file, openPack(pack))
    })
    .catch(() => {
      failures.add(file)
    })
    .finally(() => {
      requests.delete(file)
      notify()
    })
  requests.set(file, request)
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
export function usePack(
  place: PackPlace | undefined,
  detail: boolean,
): {
  data: PlaceData | undefined
  failed: boolean
} {
  const file = place && packFile(place, detail)
  const data = useSyncExternalStore(
    subscribe,
    () => (file ? opened.get(file) : undefined),
    () => undefined,
  )
  const failed = useSyncExternalStore(
    subscribe,
    () => (file ? failures.has(file) : false),
    () => false,
  )
  return { data, failed }
}
