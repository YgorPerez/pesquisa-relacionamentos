import type { IssueStatus } from '#/content/comment-status'
import { readSentComments, updateCommentStatuses } from './sent-comments'
import { stored } from './stored'

const checked = stored('comment-status-checked', (raw) =>
  typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 ? raw : null,
)

/** One check for this document's lifetime, including client-side navigation. */
export function commentStatusVisit() {
  let visited = false
  return async (
    lookup: (issues: number[]) => Promise<IssueStatus[]>,
    now = Date.now(),
  ) => {
    if (visited) return
    visited = true
    const last = checked.read()
    if (last !== null && now - last < 6 * 60 * 60 * 1000) return
    const issues = [
      ...new Set(
        readSentComments()
          .filter((c) => (c.status ?? 'received') === 'received')
          .map((c) => c.issue),
      ),
    ]
    if (!issues.length) return
    checked.write(now)
    try {
      for (let offset = 0; offset < issues.length; offset += 100)
        updateCommentStatuses(await lookup(issues.slice(offset, offset + 100)))
    } catch {
      // Offline: keep the last known states and check again on a later visit.
    }
  }
}

export const checkStatusesThisVisit = commentStatusVisit()
