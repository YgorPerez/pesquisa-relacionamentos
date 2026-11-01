import { createServerFn } from '@tanstack/react-start'
import type { PublicCommentWrite } from './public-comment-record'
import { publicPageText } from './site-search-view'

export const readPublicComments = createServerFn({ method: 'GET' })
  .validator((path: string) => path)
  .handler(async ({ data }) => {
    const [{ createPublicComments }, { getRequest, setResponseHeader }] =
      await Promise.all([
        import('#/platform/public-comments'),
        import('@tanstack/react-start/server'),
      ])
    setResponseHeader('Cache-Control', 'private, no-store')
    const comments = createPublicComments().list(data, getRequest())
    if (!comments.length) return comments
    const { default: library } = await import('virtual:library')
    const text = publicPageText(library, data)
    return comments.map((comment) => ({
      ...comment,
      changed: !text.includes(comment.quote.replace(/\s+/g, ' ').trim()),
    }))
  })

export const writePublicComment = createServerFn({ method: 'POST' })
  .validator((input: PublicCommentWrite) => input)
  .handler(async ({ data }) => {
    const [{ createPublicComments }, { getRequest, setResponseHeader }] =
      await Promise.all([
        import('#/platform/public-comments'),
        import('@tanstack/react-start/server'),
      ])
    setResponseHeader('Cache-Control', 'private, no-store')
    return createPublicComments().write(getRequest(), data)
  })
