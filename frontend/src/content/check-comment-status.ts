import { createServerFn } from '@tanstack/react-start'
import { issueStatuses, readIssueNumbers } from './comment-status'

const lookup = issueStatuses(fetch)

/** POST keeps the issue numbers out of request URLs and logs (ADR 0043). */
export const checkCommentStatus = createServerFn({ method: 'POST' })
  .validator(readIssueNumbers)
  .handler(async ({ data }) => {
    const { serverEnv } = await import('#/platform/server-env')
    return lookup(data, serverEnv().COMMENT_GITHUB_TOKEN)
  })
