import { createFileRoute } from '@tanstack/react-router'
import { readAccountPage } from '#/content/account'
import { isMethodNotice, type MethodNotice } from '#/content/method-notice'
import {
  NICKNAME_INVALID,
  NICKNAME_TAKEN,
  type NicknameRefusal,
} from '#/content/nickname-refusal'
import { AccountPage } from '#/ui/account'

export const Route = createFileRoute('/conta')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { recusa?: NicknameRefusal; metodo?: MethodNotice } => ({
    ...(search['recusa'] === NICKNAME_INVALID ||
    search['recusa'] === NICKNAME_TAKEN
      ? { recusa: search['recusa'] }
      : {}),
    ...(isMethodNotice(search['metodo']) ? { metodo: search['metodo'] } : {}),
  }),
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
  const { account, methods, deleted } = Route.useLoaderData()
  const { recusa, metodo } = Route.useSearch()
  return (
    <AccountPage
      account={account}
      deleted={deleted}
      nicknameRefusal={recusa}
      methods={methods}
      methodNotice={metodo}
    />
  )
}
