import { useEffect, useState } from 'react'
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
import { Checkbox } from './shadcn/checkbox'
import { Section, Headline } from './section'
import {
  ACCOUNT_INTRO,
  ACCOUNT_RULES,
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
        <SiteButton onClick={() => decide(true)}>
          Juntar e sincronizar
        </SiteButton>
        {status === 'ask' && (
          <SiteButton variant="light" onClick={() => decide(false)}>
            Manter só neste aparelho
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
            Voltar aos dados da conta
          </SiteButton>
        </>
      )}
      <p className="mt-md text-nota text-tinta-2">{SYNC_STOP_NOTE}</p>
      <SiteButton variant="light" onClick={stopDeviceSync}>
        Parar neste aparelho
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
      <Headline id="account-sync">Seus dados nos seus aparelhos</Headline>
      {status === 'failed' ? (
        <>
          <p>{SYNC_FAILED}</p>
          <SiteButton
            variant="light"
            onClick={() => {
              void refreshSync()
            }}
          >
            Tentar de novo
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

function NicknameForm() {
  const [adult, setAdult] = useState(false)
  const [rules, setRules] = useState(false)
  const [nickname, setNickname] = useState('')
  return (
    <form
      action="/auth/nickname"
      method="post"
      className="mt-md flex flex-col items-start gap-sm"
    >
      <label className="flex w-full flex-col gap-xs" htmlFor="nickname">
        Apelido
        <Input
          id="nickname"
          name="nickname"
          className="w-full"
          minLength={2}
          maxLength={40}
          required
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          autoComplete="off"
        />
      </label>
      <p>{ACCOUNT_RULES}</p>
      <Checkbox name="adult" checked={adult} onCheckedChange={setAdult}>
        Declaro ter 18 anos ou mais
      </Checkbox>
      <Checkbox name="rules" checked={rules} onCheckedChange={setRules}>
        Li e aceito as regras acima
      </Checkbox>
      <p className="text-nota text-tinta-2">
        A idade é uma declaração sua; o site não a verifica.
      </p>
      <SiteButton
        type="submit"
        disabled={!adult || !rules || nickname.trim().length < 2}
      >
        Criar apelido
      </SiteButton>
    </form>
  )
}

function SignedIn({ nickname }: { nickname: string | null }) {
  return (
    <>
      {nickname === null ? (
        <Section aria-labelledby="account-nickname">
          <Headline id="account-nickname">Como você quer aparecer?</Headline>
          <p>
            O apelido será público nos comentários que você publicar. Evite usar
            seu nome completo.
          </p>
          <NicknameForm />
        </Section>
      ) : (
        <Section>
          <p>Você entrou como {nickname}.</p>
        </Section>
      )}
      <form action="/auth/logout" method="post" className="mt-lg">
        <SiteButton type="submit" variant="light">
          Sair da conta
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
}: {
  account: { nickname: string | null } | null
  syncStatus?: SyncStatus
  onSyncDecision?: (accept: boolean) => void
  /** The account was deleted on the request that led here. */
  deleted?: boolean
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
        <Display>Sua conta</Display>
        <Lead>{ACCOUNT_INTRO}</Lead>
        {deleted && (
          <Section>
            <p role="status">{DELETION.done}</p>
            <p>{DELETION.doneDevice}</p>
          </Section>
        )}
        {account ? (
          <SignedIn nickname={account.nickname} />
        ) : (
          <Section>
            <a
              href="/auth/google"
              className="inline-flex min-h-toque items-center font-bold"
            >
              Entrar com Google
            </a>
          </Section>
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
          Sair da conta mantém o que está salvo neste aparelho.{' '}
          <a href="/privacidade">Veja o que o site guarda.</a>
        </p>
      </Column>
    </Sheet>
  )
}
