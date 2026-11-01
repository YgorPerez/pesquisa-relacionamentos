import { createServerFn } from '@tanstack/react-start'

/** Project only the nickname into the browser. Identity stays server-side. */
export const readAccount = createServerFn({ method: 'GET' }).handler(
  async () => {
    const [{ getRequest, setResponseHeader }, { getCurrentAccount }] =
      await Promise.all([
        import('@tanstack/react-start/server'),
        import('#/platform/accounts'),
      ])
    setResponseHeader('Cache-Control', 'private, no-store')
    const account = getCurrentAccount(getRequest())
    return account ? { nickname: account.nickname } : null
  },
)
