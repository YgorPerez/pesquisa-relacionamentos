import { createServerFn } from '@tanstack/react-start'
import type {
  CommentActionResult,
  CuratorDecision,
  PublicCommentResult,
  PublicCommentWrite,
} from './public-comment-record'
import { publicPageText } from './site-search-view'

/** The passage's text on the server, by which a reader without JS learns that
 * a passage changed. The page corrects it when it can look (`ui/public-comments.tsx`). */
async function pageTextReader() {
  const { default: library } = await import('virtual:library')
  return (path: string) => publicPageText(library, path)
}

export const readPublicComments = createServerFn({ method: 'GET' })
  .validator((path: string) => path)
  .handler(async ({ data }) => {
    const [{ createPublicComments }, { getRequest, setResponseHeader }] =
      await Promise.all([
        import('#/platform/public-comments'),
        import('@tanstack/react-start/server'),
      ])
    const comments = createPublicComments().list(data, getRequest())
    // Called by the page's loader, so this header is the whole document's:
    // only what carries the reader's own buttons turns off the caches.
    if (comments.some((comment) => comment.own || comment.canReply))
      setResponseHeader('Cache-Control', 'private, no-store')
    if (!comments.length) return comments
    const text = (await pageTextReader())(data)
    return comments.map((comment) => ({
      ...comment,
      changed: !text.includes(comment.quote),
    }))
  })

/** A failed notice never fails the report (`platform/public-comments.ts`). */
export const reportPublicComment = createServerFn({ method: 'POST' })
  .validator((id: number) => id)
  .handler(async ({ data }): Promise<CommentActionResult> => {
    const [
      { createPublicComments, PublicCommentRefusal },
      { getRequest, setResponseHeader },
      { reportNotifier },
      { serverEnv },
    ] = await Promise.all([
      import('#/platform/public-comments'),
      import('@tanstack/react-start/server'),
      import('./report-issue'),
      import('#/platform/server-env'),
    ])
    setResponseHeader('Cache-Control', 'private, no-store')
    const comments = createPublicComments({
      notify: (comment) =>
        reportNotifier({
          fetch,
          token: serverEnv().COMMENT_GITHUB_TOKEN,
        })(comment),
    })
    try {
      await comments.report(getRequest(), data)
      return { ok: true }
    } catch (error) {
      if (error instanceof PublicCommentRefusal)
        return { ok: false, problem: error.message }
      throw error
    }
  })

/** `null` for anyone but the curator, whom the store checks on every read. */
export const readCuratorDesk = createServerFn({ method: 'GET' })
  .validator((before: number | undefined) => before)
  .handler(async ({ data }) => {
    const [{ createPublicComments }, { getRequest, setResponseHeader }] =
      await Promise.all([
        import('#/platform/public-comments'),
        import('@tanstack/react-start/server'),
      ])
    setResponseHeader('Cache-Control', 'private, no-store')
    return createPublicComments().curatorDesk(getRequest(), data)
  })

export const decideComment = createServerFn({ method: 'POST' })
  .validator((decision: CuratorDecision) => decision)
  .handler(async ({ data }): Promise<CommentActionResult> => {
    const [
      { createPublicComments, PublicCommentRefusal },
      { getRequest, setResponseHeader },
    ] = await Promise.all([
      import('#/platform/public-comments'),
      import('@tanstack/react-start/server'),
    ])
    setResponseHeader('Cache-Control', 'private, no-store')
    try {
      createPublicComments().decide(getRequest(), data)
      return { ok: true }
    } catch (error) {
      if (error instanceof PublicCommentRefusal)
        return { ok: false, problem: error.message }
      throw error
    }
  })

export const writePublicComment = createServerFn({ method: 'POST' })
  .validator((input: PublicCommentWrite) => input)
  .handler(async ({ data }): Promise<PublicCommentResult> => {
    const [
      { createPublicComments, PublicCommentRefusal },
      { getRequest, setResponseHeader },
      read,
    ] = await Promise.all([
      import('#/platform/public-comments'),
      import('@tanstack/react-start/server'),
      pageTextReader(),
    ])
    setResponseHeader('Cache-Control', 'private, no-store')
    const comments = createPublicComments({
      isPage: (path) => read(path) !== '',
    })
    try {
      return { ok: true, id: comments.write(getRequest(), data) }
    } catch (error) {
      if (error instanceof PublicCommentRefusal)
        return { ok: false, problem: error.message }
      throw error
    }
  })
