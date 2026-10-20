// The received link (#34, stories 64–65): the calculator opened with the
// "Copiar link" query saves the link's state in place of the saved one and
// removes the query from the bar, so the URL is clean again (story 68) and a
// reload does not apply the link again. Only a link query (with `v`) goes;
// any other stays.
//
// Each calculator saves its own parts (`saveLink`). The opt-out of being
// counted (#35) is not part of any.
import { useRouter } from '@tanstack/react-router'
import {
  isLink,
  readLink,
  type LinkCalculator,
  type LinkState,
} from '@tem-estudo/rules/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { saveRequirements } from './possible-group'
import { saveProfile, savedProfile } from './profile'
import { savePriorities } from './priorities'

/** Saves on the device, in place of the saved one, the state the link
 * brought. */
function saveLink(state: LinkState) {
  if (state.calculator === 'grupo-possivel') {
    saveProfile(state.profile)
    saveRequirements(state.requirements)
    return
  }
  // The Priorities link carries only the gender: the saved sought gender and
  // age stay.
  if (state.gender)
    saveProfile({ ...savedProfile.read(), gender: state.gender })
  savePriorities(state.priorities)
}

/** The link applied on this page. It is born outside React, from the bar
 * read after hydration, and so it is a store: the effect marks it and
 * `useSyncExternalStore` reads it, without a `setState` inside the
 * effect. */
function createReceived() {
  let received: LinkState | null = null
  const listeners = new Set<() => void>()
  return {
    read: () => received,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    mark: (state: LinkState) => {
      received = state
      for (const listener of listeners) listener()
    },
  }
}

/** Applies the bar's link once, after hydration, and returns the state it
 * saved (`null` with no link, or with an invalid one), for the page to say
 * so. `ids` are the traits Priorities knows. */
export function useReceivedLink(
  calculator: LinkCalculator,
  ids?: ReadonlyArray<string>,
): LinkState | null {
  const router = useRouter()
  const [applied] = useState(createReceived)
  const received = useSyncExternalStore(
    applied.subscribe,
    applied.read,
    () => null,
  )
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    const { pathname, search, hash } = window.location
    if (!isLink(search)) return
    const state = readLink(calculator, search, ids)
    if (state?.calculator === calculator) {
      saveLink(state)
      applied.mark(state)
    }
    router.history.replace(`${pathname}${hash}`)
  }, [calculator, ids, router, applied])

  return received
}
