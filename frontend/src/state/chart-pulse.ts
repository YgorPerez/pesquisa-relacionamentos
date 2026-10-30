// Whether a chart has pulsed in this visit (#500): it lasts as long as the tab's
// session, not on the device, so it stays out of `stored.ts`.
import { PREFIX } from './stored'

const PULSED = `${PREFIX}chart-pulsed`
let pulsedWithoutStorage = false

/** True for the first chart that asks in this visit. */
export function claimPulse() {
  try {
    if (sessionStorage.getItem(PULSED)) return false
    sessionStorage.setItem(PULSED, '1')
    return true
  } catch {
    if (pulsedWithoutStorage) return false
    pulsedWithoutStorage = true
    return true
  }
}
