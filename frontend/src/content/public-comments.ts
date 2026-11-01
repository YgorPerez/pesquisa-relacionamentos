import { createServerFn } from '@tanstack/react-start'
import type { PublicCommentWrite } from './public-comment-record'

export const readPublicComments = createServerFn({ method: 'GET' })
  .validator((path: string) => path)
  .handler(async ({ data }) => {
    const { createPublicComments } = await import('#/platform/public-comments')
    const { getRequest, setResponseHeader } = await import('@tanstack/react-start/server')
    setResponseHeader('Cache-Control', 'private, no-store')
    return createPublicComments().list(data, getRequest())
  })

export const writePublicComment = createServerFn({ method: 'POST' })
  .validator((input: PublicCommentWrite) => input)
  .handler(async ({ data }) => {
    const { createPublicComments } = await import('#/platform/public-comments')
    const { getRequest, setResponseHeader } = await import('@tanstack/react-start/server')
    setResponseHeader('Cache-Control', 'private, no-store')
    return createPublicComments().write(getRequest(), data)
  })
