import { useEffect, type ReactNode } from 'react'
import type { NicknameRefusal } from '#/content/nickname-refusal'
import {
  decideSync,
  forgetDeletedAccount,
  refreshSync,
  returnToAccountData,
  stopDeviceSync,
  useSyncStatus,
  type SyncStatus,
} from '#/state/account-sync'
import { useLinkFields } from '#/state/sync-device'
import { AccountDeletion } from './account-deletion'
import { DELETION } from './account-deletion.copy'
import { Sheet, Column, Display, Lead } from './sheet'
import { SiteButton } from './button'
import { Input } from './shadcn/input'
import { Section, Headline } from './section'
import {
  ACCOUNT,
  ACCOUNT_INTRO,
  ACCOUNT_RULES,
  EMAIL_ACCOUNT,
  NICKNAME_REFUSAL,
  SYNC_ACTIVE,
  SYNC_DECLINED,
  SYNC_DEVICE,
  SYNC_EXPLANATION,
  SYNC_FAILED,
  SYNC_LINK,
  SYNC_STOP_NOTE,
} from './account.copy'

function SyncChoice({
  status,
  decide,
}: {
  status: 'ask' | 'device' | 'declined'
  decide: (accept: boolean) => void
}) {
  return (
    <>
      {status === 'declined' && <p>{SYNC_DECLINED}</p>}
      <p>{SYNC_EXPLANATION}</p>
      {status === 'device' && <p>{SYNC_DEVICE}</p>}
      <div className="mt-md flex flex-wrap gap-sm">
        <SiteButton onClick={() => decide(true)}>{ACCOUNT.join}</SiteButton>
        {status === 'ask' && (
          <SiteButton variant="light" onClick={() => decide(false)}>
            {ACCOUNT.keepHere}
          </SiteButton>
        )}
      </div>
    </>
  )
}

function SyncActive({ linkFields }: { linkFields: boolean }) {
  return (
    <>
      <p>{SYNC_ACTIVE}</p>
      {linkFields && (
        <>
          <p>{SYNC_LINK}</p>
          <SiteButton
            variant="light"
            onClick={() => {
              void returnToAccountData()
            }}
          >
            {ACCOUNT.backToAccount}
          </SiteButton>
        </>
      )}
      <p className="mt-md text-nota text-tinta-2">{SYNC_STOP_NOTE}</p>
      <SiteButton variant="light" onClick={stopDeviceSync}>
        {ACCOUNT.stop}
      </SiteButton>
    </>
  )
}

function SyncSettings({
  status,
  decide,
  linkFields,
}: {
  status: SyncStatus
  decide: (accept: boolean) => void
  linkFields: boolean
}) {
  if (status === 'loading' || status === 'anonymous') return null
  return (
    <Section aria-labelledby="account-sync">
      <Headline id="account-sync">{ACCOUNT.syncTitle}</Headline>
      {status === 'failed' ? (
        <>
          <p>{SYNC_FAILED}</p>
          <SiteButton
            variant="light"
            onClick={() => {
              void refreshSync()
            }}
          >
            {ACCOUNT.retry}
          </SiteButton>
        </>
      ) : status === 'active' ? (
        <SyncActive linkFields={linkFields} />
      ) : (
        <SyncChoice status={status} decide={decide} />
      )}
    </Section>
  )
}

/** The browser's own checkbox: the Base UI one does not toggle without
 * JavaScript, and this is what a reader must tick to get a nickname. */
function Agreement({ name, children }: { name: string; children: ReactNode }) {
  return (
    <label className="flex min-h-toque items-center gap-xs font-bold">
      <input
        type="checkbox"
        name={name}
        required
        className="size-5 flex-none accent-tinta"
      />
      {children}
    </label>
  )
}

/** A plain form with the browser's own checks, so it works without JavaScript;
 * the server checks all of it again, and a refusal comes back to this page. */
function NicknameForm({ refusal }: { refusal?: NicknameRefusal }) {
  return (
    <form
      action="/auth/nickname"
      method="post"
      className="mt-md flex flex-col items-start gap-sm"
    >
      {refusal && <p role="alert">{NICKNAME_REFUSAL[refusal]}</p>}
      <label className="flex w-full flex-col gap-xs" htmlFor="nickname">
        {ACCOUNT.nickname}
        <Input
          id="nickname"
          name="nickname"
          className="w-full"
          minLength={2}
          maxLength={40}
          required
          autoComplete="off"
        />
      </label>
      <p>{ACCOUNT_RULES}</p>
      <Agreement name="adult">{ACCOUNT.adult}</Agreement>
      <Agreement name="rules">{ACCOUNT.rules}</Agreement>
      <p className="text-nota text-tinta-2">{ACCOUNT.ageNote}</p>
      <SiteButton type="submit">{ACCOUNT.createNickname}</SiteButton>
    </form>
  )
}

function EmailForm({ register = false }: { register?: boolean }) {
  const prefix = register ? 'register' : 'login'
  return (
    <Section aria-labelledby={`email-${prefix}`}>
      <Headline id={`email-${prefix}`}>{register ? EMAIL_ACCOUNT.register : EMAIL_ACCOUNT.login}</Headline>
      <form action={`/auth/${prefix}`} method="post" className="mt-md flex flex-col items-start gap-sm">
        <label htmlFor={`${prefix}-email`} className="flex w-full flex-col gap-xs">
          {register ? EMAIL_ACCOUNT.emailRegister : EMAIL_ACCOUNT.emailLogin}
          <Input id={`${prefix}-email`} name="email" type="email" maxLength={254} required autoComplete="email" />
        </label>
        <label htmlFor={`${prefix}-password`} className="flex w-full flex-col gap-xs">
          {register ? EMAIL_ACCOUNT.passwordRegister : EMAIL_ACCOUNT.passwordLogin}
          <Input id={`${prefix}-password`} name="password" type="password" minLength={register ? 8 : undefined} maxLength={1024} required autoComplete={register ? 'new-password' : 'current-password'} />
        </label>
        {register && <EmailRegistration />}
        <SiteButton type="submit">{register ? EMAIL_ACCOUNT.register : EMAIL_ACCOUNT.login}</SiteButton>
      </form>
    </Section>
  )
}

function EmailRegistration() {
  return <>
    <p className="text-nota text-tinta-2">{EMAIL_ACCOUNT.passwordNote}</p>
    <label htmlFor="register-nickname" className="flex w-full flex-col gap-xs">
      {ACCOUNT.nickname}
      <Input id="register-nickname" name="nickname" minLength={2} maxLength={40} required autoComplete="off" />
    </label>
    <p>{ACCOUNT_RULES}</p>
    <Agreement name="adult">{ACCOUNT.adult}</Agreement>
    <Agreement name="rules">{ACCOUNT.rules}</Agreement>
    <p className="text-nota text-tinta-2">{ACCOUNT.ageNote}</p>
  </>
}

function SignedIn({
  nickname,
  refusal,
}: {
  nickname: string | null
  refusal?: NicknameRefusal
}) {
  return (
    <>
      {nickname === null ? (
        <Section aria-labelledby="account-nickname">
          <Headline id="account-nickname">{ACCOUNT.nicknameTitle}</Headline>
          <p>{ACCOUNT.nicknameExplanation}</p>
          <NicknameForm refusal={refusal} />
        </Section>
      ) : (
        <Section>
          <p>{ACCOUNT.signedInAs(nickname)}</p>
        </Section>
      )}
      <form action="/auth/logout" method="post" className="mt-lg">
        <SiteButton type="submit" variant="light">
          {ACCOUNT.signOut}
        </SiteButton>
      </form>
    </>
  )
}

/** The account is separate from the device's Profile. */
export function AccountPage({
  account,
  syncStatus,
  onSyncDecision = decideSync,
  deleted = false,
  nicknameRefusal,
}: {
  account: { nickname: string | null } | null
  syncStatus?: SyncStatus
  onSyncDecision?: (accept: boolean) => void
  /** The account was deleted on the request that led here. */
  deleted?: boolean
  /** Why the server sent the nickname form back. */
  nicknameRefusal?: NicknameRefusal
}) {
  const currentSyncStatus = useSyncStatus()
  const linkFields = useLinkFields()
  const signedIn = Boolean(account?.nickname)
  useEffect(() => {
    if (signedIn && !syncStatus) void refreshSync()
  }, [signedIn, syncStatus])
  useEffect(() => {
    if (deleted) forgetDeletedAccount()
  }, [deleted])
  return (
    <Sheet>
      <Column>
        <Display>{ACCOUNT.title}</Display>
        <Lead>{ACCOUNT_INTRO}</Lead>
        {deleted && (
          <Section>
            <p role="status">{DELETION.done}</p>
            <p>{DELETION.doneDevice}</p>
          </Section>
        )}
        {account ? (
          <SignedIn nickname={account.nickname} refusal={nicknameRefusal} />
        ) : (
          <>
          <Section>
            <a
              href="/auth/google"
              className="inline-flex min-h-toque items-center font-bold"
            >
              {ACCOUNT.signIn}
            </a>
          </Section>
          <EmailForm />
          <EmailForm register />
          </>
        )}
        {account?.nickname && (
          <SyncSettings
            status={syncStatus ?? currentSyncStatus}
            decide={onSyncDecision}
            linkFields={Boolean(linkFields?.length)}
          />
        )}
        {account && <AccountDeletion canPublish={signedIn} />}
        <p className="mt-lg text-nota text-tinta-2">
          {ACCOUNT.leaving} <a href="/privacidade">{ACCOUNT.whatIsKept}</a>
        </p>
      </Column>
    </Sheet>
  )
}
