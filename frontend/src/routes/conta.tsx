import { createFileRoute } from '@tanstack/react-router'
import { readAccount } from '#/content/account'
import { AccountPage } from '#/ui/account'

export const Route = createFileRoute('/conta')({
  head: () => ({
    meta: [
      { title: 'Sua conta · Tem estudo?' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  loader: () => readAccount(),
  component: Account,
})
function Account() {
  return <AccountPage account={Route.useLoaderData()} />
}
