// "Comentar" (#337, ADR 0043): the server functions that turn a Comentário
// into an issue in the private sources repo and let the device that sent it
// edit it (#442) (`comment-issue.ts`). They are POSTs, so what the reader
// wrote and the edit key go in the body, which the request log never reads
// (`platform/request-log.ts`).
//
// `COMMENT_GITHUB_TOKEN` is read on each comment, through T3 Env (ADR 0032):
// without it the site runs as before, and each comment replies that it was
// not sent. The anti-spam lives in this process's memory, one count per IP
// for sends and edits. The server-only modules come in inside the handler,
// which the browser bundle drops.
import { createServerFn } from '@tanstack/react-start'
import {
  clientIp,
  commentDesk,
  githubIssues,
  postIssue,
  readComment,
  readEdit,
  type CommentReply,
  type EditReply,
} from './comment-issue'

/** Five sends or edits per IP per hour. */
const desk = commentDesk({ limit: 5, windowMs: 60 * 60 * 1000 })

/** What each call needs of the request: the reader's IP and the token. */
async function requestContext() {
  const [{ getRequestHeader, getRequestIP }, { serverEnv }] = await Promise.all(
    [import('@tanstack/react-start/server'), import('#/platform/server-env')],
  )
  return {
    ip: clientIp(getRequestHeader('x-forwarded-for'), getRequestIP()),
    token: serverEnv().COMMENT_GITHUB_TOKEN,
    now: Date.now(),
  }
}

export const sendComment = createServerFn({ method: 'POST' })
  .validator(readComment)
  .handler(async ({ data }): Promise<CommentReply> =>
    desk.deliver(data, { ...(await requestContext()), post: postIssue(fetch) }),
  )

export const editComment = createServerFn({ method: 'POST' })
  .validator(readEdit)
  .handler(async ({ data }): Promise<EditReply> =>
    desk.edit(data, {
      ...(await requestContext()),
      github: githubIssues(fetch),
    }),
  )
