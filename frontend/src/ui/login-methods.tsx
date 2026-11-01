import type { ComponentProps, ReactNode } from 'react'
import {
  isMethodRefusal,
  type AccountMethods,
  type MethodNotice,
} from '#/content/method-notice'
import { Agreement } from './agreement'
import { SiteButton } from './button'
import { Headline, Notice, Section } from './section'
import { Input } from './shadcn/input'
import { LOGIN_METHODS, METHOD_NOTICE } from './login-methods.copy'

const FORM = 'mt-md flex flex-col items-start gap-sm'

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

function Field({
  label,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  return (
    <label htmlFor={props.id} className="flex w-full flex-col gap-xs">
      {label}
      <Input className="w-full" required {...props} />
    </label>
  )
}

function RemoveMethod({
  method,
  children,
  label,
}: {
  method: 'google' | 'email'
  label: string
  children?: ReactNode
}) {
  return (
    <form action="/auth/remove-method" method="post" className={FORM}>
      <input type="hidden" name="method" value={method} />
      {children}
      <SiteButton type="submit" variant="light">
        {label}
      </SiteButton>
    </form>
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
        <form action="/auth/link-google" method="post" className={FORM}>
          <SiteButton type="submit" variant="light">
            {LOGIN_METHODS.linkGoogle}
          </SiteButton>
        </form>
      )}
      {removable && (
        <RemoveMethod method="google" label={LOGIN_METHODS.removeGoogle}>
          {methods.curator && (
            <>
              <Notice className="mb-0">{LOGIN_METHODS.curatorWarning}</Notice>
              <Agreement name="lose-curator">
                {LOGIN_METHODS.curatorConfirm}
              </Agreement>
            </>
          )}
        </RemoveMethod>
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
        <p className="mt-md">
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

function AddEmail({ pendingEmail }: { pendingEmail: string | null }) {
  return (
    <>
      <h3 className="mt-lg font-bold">{LOGIN_METHODS.addTitle}</h3>
      <p>{LOGIN_METHODS.addExplanation}</p>
      {pendingEmail && <p>{LOGIN_METHODS.pending(pendingEmail)}</p>}
      <form action="/auth/add-email" method="post" className={FORM}>
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
      </form>
    </>
  )
}

function ChangePassword() {
  return (
    <>
      <h3 className="mt-lg font-bold">{LOGIN_METHODS.passwordTitle}</h3>
      <p>{LOGIN_METHODS.passwordNote}</p>
      <form action="/auth/change-password" method="post" className={FORM}>
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
      </form>
    </>
  )
}

/** Plain forms with the browser's own checks, so all of this works without
 * JavaScript; the server checks everything again and answers in `?metodo=`. */
export function LoginMethods({ methods }: { methods: AccountMethods }) {
  const removable = methods.google && methods.email !== null
  return (
    <Section aria-labelledby="account-methods">
      <Headline id="account-methods">{LOGIN_METHODS.title}</Headline>
      <p>{LOGIN_METHODS.sessions}</p>
      <GoogleMethod methods={methods} removable={removable} />
      <EmailMethod email={methods.email} removable={removable} />
      {!removable && <p>{LOGIN_METHODS.onlyOne}</p>}
      {methods.canAddEmail && <AddEmail pendingEmail={methods.pendingEmail} />}
      {methods.canChangePassword && <ChangePassword />}
    </Section>
  )
}
