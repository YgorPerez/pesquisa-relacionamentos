// The issue a first report opens in the private repo (ADR 0047), through the
// path a Comentário already uses (ADR 0043). It carries links only: no comment
// text, nickname or account, so a comment the curator removes does not live on
// in the issue, and the curator reads it in `/curadoria`.
import { ORIGIN } from '@tem-estudo/content/search'
import { postIssue, type Issue } from './comment-issue'

/** A hung GitHub must not hold the reader's report open. */
const TIMEOUT_MS = 5000

function reportIssue({ id, path }: { id: number; path: string }): Issue {
  return {
    title: `Denúncia: comentário público ${id}`,
    // A label the repo does not have could cost the notice.
    labels: [],
    body: [
      'Um comentário público recebeu a primeira denúncia.',
      '',
      `**Decidir:** ${ORIGIN}/curadoria#comentario-${id}`,
      '',
      `**Página:** ${ORIGIN}${path}#comentario-${id}`,
    ].join('\n'),
  }
}

export function reportNotifier({
  fetch,
  token,
  timeoutMs = TIMEOUT_MS,
}: {
  fetch: typeof globalThis.fetch
  /** `COMMENT_GITHUB_TOKEN`; blank, no notice goes out. */
  token: string | undefined
  timeoutMs?: number
}) {
  const post = postIssue((url, init) =>
    fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) }),
  )
  return async (comment: { id: number; path: string }) =>
    token ? post(reportIssue(comment), token) : null
}
