import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'

/** Project only the nickname into the browser. Identity stays server-side. */
export const readAccount = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getCurrentAccount } = await import('#/platform/accounts')
    setResponseHeader('Cache-Control', 'private, no-store')
    const account = getCurrentAccount(getRequest())
    return account ? { nickname: account.nickname } : null
  },
)

/** `/conta`: the account, and whether it was deleted on the way here. The
 * notice is read once. */
export const readAccountPage = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { deletionNoticeCookie, getCurrentAccount } =
      await import('#/platform/accounts')
    setResponseHeader('Cache-Control', 'private, no-store')
    const request = getRequest()
    const account = getCurrentAccount(request)
    const clearNotice = deletionNoticeCookie(request)
    if (clearNotice) setResponseHeader('Set-Cookie', clearNotice)
    return {
      account: account ? { nickname: account.nickname } : null,
      deleted: clearNotice !== null,
    }
  },
)
