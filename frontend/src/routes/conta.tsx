import { createFileRoute } from '@tanstack/react-router'
import { readAccountPage } from '#/content/account'
import { isEmailRefusal, type EmailRefusal } from '#/content/email-refusal'
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
  ): {
    recusa?: NicknameRefusal
    metodo?: MethodNotice
    entrar?: EmailRefusal
    criar?: EmailRefusal
  } => ({
    ...(search['recusa'] === NICKNAME_INVALID ||
    search['recusa'] === NICKNAME_TAKEN
      ? { recusa: search['recusa'] }
      : {}),
    ...(isMethodNotice(search['metodo']) ? { metodo: search['metodo'] } : {}),
    ...(isEmailRefusal(search['entrar']) ? { entrar: search['entrar'] } : {}),
    ...(isEmailRefusal(search['criar']) ? { criar: search['criar'] } : {}),
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
  const { recusa, metodo, entrar, criar } = Route.useSearch()
  return (
    <AccountPage
      account={account}
      deleted={deleted}
      nicknameRefusal={recusa}
      loginRefusal={entrar}
      signUpRefusal={criar}
      methods={methods}
      methodNotice={metodo}
    />
  )
}
