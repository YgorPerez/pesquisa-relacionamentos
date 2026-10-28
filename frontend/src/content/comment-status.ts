/** Only these three states may leave the private tracker. */
export type CommentStatus = 'received' | 'corrected' | 'not-planned'
export interface IssueStatus {
  issue: number
  status: CommentStatus
}

export function readIssueNumbers(raw: unknown): number[] {
  if (
    !Array.isArray(raw) ||
    raw.length > 100 ||
    raw.some((n) => typeof n !== 'number' || !Number.isSafeInteger(n) || n < 1)
  )
    throw new Error('Invalid status request.')
  return [...new Set(raw as number[])]
}

function statusOf(raw: unknown): CommentStatus | null {
  if (typeof raw !== 'object' || raw === null) return null
  if ('pull_request' in raw) return null
  if ('state' in raw && raw.state === 'open') return 'received'
  if (!('state' in raw) || raw.state !== 'closed' || !('state_reason' in raw))
    return null
  if (raw.state_reason === 'completed') return 'corrected'
  return raw.state_reason === 'not_planned' ? 'not-planned' : null
}

/** Process-local cache; errors leave the browser's last known status intact. */
export function issueStatuses(fetch: typeof globalThis.fetch, now = Date.now) {
  const cache = new Map<number, { status: CommentStatus; at: number }>()
  const get = async (
    issue: number,
    token: string,
  ): Promise<IssueStatus | null> => {
    const saved = cache.get(issue)
    if (saved && now() - saved.at < 600_000)
      return { issue, status: saved.status }
    cache.delete(issue)
    try {
      const response = await fetch(
        `https://api.github.com/repos/YgorPerez/pesquisa-relacionamentos-fontes/issues/${issue}`,
        {
          headers: {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${token}`,
            'x-github-api-version': '2022-11-28',
          },
        },
      )
      if (!response.ok) return null
      const status = statusOf(await response.json())
      if (!status) return null
      // Bound memory even when callers supply numbers this browser never sent.
      if (cache.size >= 1000) cache.clear()
      cache.set(issue, { status, at: now() })
      return { issue, status }
    } catch {
      return null
    }
  }
  return async (
    issues: readonly number[],
    token: string | undefined,
  ): Promise<IssueStatus[]> => {
    if (!token) return []
    const answers = await Promise.all(issues.map((issue) => get(issue, token)))
    return answers.filter((answer) => answer !== null)
  }
}
