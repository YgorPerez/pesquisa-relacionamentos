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
