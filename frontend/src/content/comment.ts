// "Comentar" (#337, ADR 0043): the server function that turns a Comentário
// into an issue in the private sources repo (`comment-issue.ts`). It is a
// POST, so what the reader wrote goes in the body, which the request log
// never reads (`platform/request-log.ts`).
//
// `COMMENT_GITHUB_TOKEN` is read on each comment, through T3 Env (ADR 0032):
// without it the site runs as before, and each comment replies that it was
// not sent. The anti-spam lives in this process's memory. The server-only
// modules come in inside the handler, which the browser bundle drops.
import { createServerFn } from '@tanstack/react-start'
import {
  clientIp,
  commentDesk,
  postIssue,
  readComment,
  type CommentReply,
} from './comment-issue'

/** Five comments per IP per hour. */
const desk = commentDesk({ limit: 5, windowMs: 60 * 60 * 1000 })

export const sendComment = createServerFn({ method: 'POST' })
  .validator(readComment)
  .handler(async ({ data }): Promise<CommentReply> => {
    const [{ getRequestHeader, getRequestIP }, { optionalSecret, readEnv }] =
      await Promise.all([
        import('@tanstack/react-start/server'),
        import('../../../scripts/env.ts'),
      ])
    const { COMMENT_GITHUB_TOKEN: token } = readEnv(
      { COMMENT_GITHUB_TOKEN: optionalSecret },
      process.env,
    )
    return desk.deliver(data, {
      ip: clientIp(getRequestHeader('x-forwarded-for'), getRequestIP()),
      token,
      now: Date.now(),
      post: postIssue(fetch),
    })
  })
