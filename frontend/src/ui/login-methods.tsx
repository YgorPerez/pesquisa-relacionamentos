import type { ReactNode } from 'react'
import {
  isMethodRefusal,
  type AccountMethods,
  type MethodNotice,
} from '#/content/method-notice'
import { SiteButton } from './button'
import { FoldArrow } from './fold-arrow'
import { Field, FieldForm } from './field'
import { Headline, Notice, Section } from './section'
import { LOGIN_METHODS, METHOD_NOTICE } from './login-methods.copy'

/** The rare form, folded: the browser's `<details>` opens without JavaScript. */
function MethodFold({
  title,
  open,
  children,
}: {
  title: string
  open: boolean
  children: ReactNode
}) {
  return (
    <details open={open} className="group mt-md">
      <summary className="flex min-h-toque cursor-pointer list-none items-center gap-2.5 font-title text-title [&::-webkit-details-marker]:hidden">
        <FoldArrow className="group-open:rotate-90" />
        {title}
      </summary>
      {children}
    </details>
  )
}

/** What a form about methods came back with, at the top of the page: the reader
 * lands there after the redirect, on a phone too. */
export function MethodMessage({ notice }: { notice: MethodNotice }) {
  return (
    <Notice
      className="mt-md"
      role={isMethodRefusal(notice) ? 'alert' : 'status'}
    >
      {METHOD_NOTICE[notice]}
    </Notice>
  )
}

function RemoveMethod({
  method,
  label,
}: {
  method: 'google' | 'email'
  label: string
}) {
  return (
    <FieldForm action="/auth/remove-method">
      <input type="hidden" name="method" value={method} />
      <SiteButton type="submit" variant="light">
        {label}
      </SiteButton>
    </FieldForm>
  )
}

function GoogleMethod({
  methods,
  removable,
}: {
  methods: AccountMethods
  removable: boolean
}) {
  return (
    <>
      <p>{methods.google ? LOGIN_METHODS.googleOn : LOGIN_METHODS.googleOff}</p>
      {methods.canLinkGoogle && (
        <FieldForm action="/auth/link-google">
          <SiteButton type="submit" variant="light">
            {LOGIN_METHODS.linkGoogle}
          </SiteButton>
        </FieldForm>
      )}
      {methods.curator ? (
        <Notice className="mt-md mb-0">
          {LOGIN_METHODS.curatorKeepsGoogle}
        </Notice>
      ) : (
        removable && (
          <RemoveMethod method="google" label={LOGIN_METHODS.removeGoogle} />
        )
      )}
    </>
  )
}

function EmailMethod({
  email,
  removable,
}: {
  email: string | null
  removable: boolean
}) {
  return (
    <>
      {email ? (
        <p className="mt-md wrap-anywhere">
          {LOGIN_METHODS.emailOn} <strong>{email}</strong>
        </p>
      ) : (
        <p className="mt-md">{LOGIN_METHODS.emailOff}</p>
      )}
      {removable && email && (
        <RemoveMethod method="email" label={LOGIN_METHODS.removeEmail} />
      )}
    </>
  )
}

function AddEmail({
  pendingEmail,
  refused,
}: {
  pendingEmail: string | null
  refused: boolean
}) {
  return (
    <MethodFold
      title={LOGIN_METHODS.addTitle}
      open={refused || pendingEmail !== null}
    >
      <p>{LOGIN_METHODS.addExplanation}</p>
      {pendingEmail && (
        <p className="wrap-anywhere">{LOGIN_METHODS.pending(pendingEmail)}</p>
      )}
      <FieldForm action="/auth/add-email">
        <Field
          id="add-email"
          label={LOGIN_METHODS.addEmail}
          name="email"
          type="email"
          maxLength={254}
          autoComplete="email"
        />
        <Field
          id="add-email-password"
          label={LOGIN_METHODS.addPassword}
          name="password"
          type="password"
          minLength={8}
          maxLength={1024}
          autoComplete="new-password"
        />
        <SiteButton type="submit">{LOGIN_METHODS.addSubmit}</SiteButton>
      </FieldForm>
    </MethodFold>
  )
}

function ChangePassword({ refused }: { refused: boolean }) {
  return (
    <MethodFold title={LOGIN_METHODS.passwordTitle} open={refused}>
      <p>{LOGIN_METHODS.passwordNote}</p>
      <FieldForm action="/auth/change-password">
        <Field
          id="current-password"
          label={LOGIN_METHODS.passwordCurrent}
          name="current"
          type="password"
          maxLength={1024}
          autoComplete="current-password"
        />
        <Field
          id="new-password"
          label={LOGIN_METHODS.passwordNew}
          name="password"
          type="password"
          minLength={8}
          maxLength={1024}
          autoComplete="new-password"
        />
        <SiteButton type="submit">{LOGIN_METHODS.passwordSubmit}</SiteButton>
      </FieldForm>
    </MethodFold>
  )
}

/** Plain forms with the browser's own checks, so all of this works without
 * JavaScript; the server checks everything again and answers in `?metodo=`. */
export function LoginMethods({
  methods,
  notice,
}: {
  methods: AccountMethods
  /** A refused form comes back open, for the reader to try again. */
  notice?: MethodNotice
}) {
  const removable = methods.google && methods.email !== null
  return (
    <Section aria-labelledby="account-methods">
      <Headline id="account-methods">{LOGIN_METHODS.title}</Headline>
      <p>{LOGIN_METHODS.sessions}</p>
      <GoogleMethod methods={methods} removable={removable} />
      <EmailMethod email={methods.email} removable={removable} />
      {!removable && !methods.curator && <p>{LOGIN_METHODS.onlyOne}</p>}
      {methods.canAddEmail && (
        <AddEmail
          pendingEmail={methods.pendingEmail}
          refused={
            notice === 'email-em-uso' ||
            notice === 'email-invalido' ||
            notice === 'email-nao-enviado'
          }
        />
      )}
      {methods.canChangePassword && (
        <ChangePassword
          refused={notice === 'senha-errada' || notice === 'senha-curta'}
        />
      )}
    </Section>
  )
}
