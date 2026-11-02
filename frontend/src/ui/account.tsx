import { useEffect } from 'react'
import type { EmailRefusal } from '#/content/email-refusal'
import type { AccountMethods, MethodNotice } from '#/content/method-notice'
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
import { AccountEntry } from './account-entry'
import { ACCOUNT_INTRO } from './account-entry.copy'
import { Agreement } from './agreement'
import { LoginMethods, MethodMessage } from './login-methods'
import { Sheet, Column, Display, Lead } from './sheet'
import { SiteButton } from './button'
import { Field, FieldForm } from './field'
import { Section, Headline } from './section'
import {
  ACCOUNT,
  ACCOUNT_RULES,
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

/** A plain form with the browser's own checks, so it works without JavaScript;
 * the server checks all of it again, and a refusal comes back to this page. */
function NicknameForm({ refusal }: { refusal?: NicknameRefusal }) {
  return (
    <FieldForm action="/auth/nickname">
      {refusal && <p role="alert">{NICKNAME_REFUSAL[refusal]}</p>}
      <Field
        id="nickname"
        label={ACCOUNT.nickname}
        name="nickname"
        minLength={2}
        maxLength={40}
        autoComplete="off"
      />
      <p>{ACCOUNT_RULES}</p>
      <Agreement name="adult">{ACCOUNT.adult}</Agreement>
      <Agreement name="rules">{ACCOUNT.rules}</Agreement>
      <p className="text-nota text-tinta-2">{ACCOUNT.ageNote}</p>
      <SiteButton type="submit">{ACCOUNT.createNickname}</SiteButton>
    </FieldForm>
  )
}

function SignedIn({
  nickname,
  refusal,
}: {
  nickname: string | null
  refusal?: NicknameRefusal
}) {
  return (
    <Section aria-labelledby="account-identity">
      <Headline id="account-identity">
        {nickname === null ? ACCOUNT.nicknameTitle : ACCOUNT.identityTitle}
      </Headline>
      {nickname === null ? (
        <>
          <p>{ACCOUNT.nicknameExplanation}</p>
          <NicknameForm refusal={refusal} />
        </>
      ) : (
        <p>{ACCOUNT.signedInAs(nickname)}</p>
      )}
      <p className="mt-md text-nota text-tinta-2">
        {ACCOUNT.leaving} <a href="/privacidade">{ACCOUNT.whatIsKept}</a>
      </p>
      <form action="/auth/logout" method="post" className="mt-sm">
        <SiteButton type="submit" variant="light">
          {ACCOUNT.signOut}
        </SiteButton>
      </form>
    </Section>
  )
}

/** The account is separate from the device's Profile. */
export function AccountPage({
  account,
  syncStatus,
  onSyncDecision = decideSync,
  deleted = false,
  nicknameRefusal,
  loginRefusal,
  signUpRefusal,
  methods,
  methodNotice,
}: {
  account: { nickname: string | null } | null
  syncStatus?: SyncStatus
  onSyncDecision?: (accept: boolean) => void
  /** The account was deleted on the request that led here. */
  deleted?: boolean
  /** Why the server sent the nickname form back. */
  nicknameRefusal?: NicknameRefusal
  /** Why the server sent the login or the sign-up back, without JavaScript. */
  loginRefusal?: EmailRefusal
  signUpRefusal?: EmailRefusal
  /** The account's login methods; without them the page offers none. */
  methods?: AccountMethods | null
  /** What a form about methods came back with. */
  methodNotice?: MethodNotice
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
        {!account && <Lead>{ACCOUNT_INTRO}</Lead>}
        {methodNotice && <MethodMessage notice={methodNotice} />}
        {deleted && (
          <Section>
            <p role="status">{DELETION.done}</p>
            <p>{DELETION.doneDevice}</p>
          </Section>
        )}
        {account ? (
          <SignedIn nickname={account.nickname} refusal={nicknameRefusal} />
        ) : (
          <AccountEntry
            loginRefusal={loginRefusal}
            signUpRefusal={signUpRefusal}
          />
        )}
        {account?.nickname && (
          <SyncSettings
            status={syncStatus ?? currentSyncStatus}
            decide={onSyncDecision}
            linkFields={Boolean(linkFields?.length)}
          />
        )}
        {account && methods && (
          <LoginMethods methods={methods} notice={methodNotice} />
        )}
        {account && <AccountDeletion canPublish={signedIn} />}
        {!account && (
          <p className="mt-lg text-nota text-tinta-2">
            <a href="/privacidade">{ACCOUNT.whatIsKept}</a>
          </p>
        )}
      </Column>
    </Sheet>
  )
}
