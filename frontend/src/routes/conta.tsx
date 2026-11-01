import { createFileRoute } from '@tanstack/react-router'
import { readAccountPage } from '#/content/account'
import {
  NICKNAME_INVALID,
  NICKNAME_TAKEN,
  type NicknameRefusal,
} from '#/content/nickname-refusal'
import { AccountPage } from '#/ui/account'

export const Route = createFileRoute('/conta')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { recusa?: NicknameRefusal } =>
    search['recusa'] === NICKNAME_INVALID || search['recusa'] === NICKNAME_TAKEN
      ? { recusa: search['recusa'] }
      : {},
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
  const { recusa } = Route.useSearch()
  return (
    <AccountPage account={account} deleted={deleted} nicknameRefusal={recusa} />
  )
}
