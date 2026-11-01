import { createFileRoute } from '@tanstack/react-router'
import { readAccountPage } from '#/content/account'
import { AccountPage } from '#/ui/account'

export const Route = createFileRoute('/conta')({
  loader: () => readAccountPage(),
  head: () => ({
    meta: [
      { title: 'Sua conta · Tem estudo?' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Account,
})
function Account() {
  const { account, deleted } = Route.useLoaderData()
  return <AccountPage account={account} deleted={deleted} />
}
