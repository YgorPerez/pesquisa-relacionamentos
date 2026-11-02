import { useState, type FormEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import {
  EMAIL_INVALID,
  EMAIL_TAKEN,
  EMAIL_UNAVAILABLE,
  isEmailRefusal,
  PASSWORD_SHORT,
  type EmailRefusal,
} from '#/content/email-refusal'
import { NICKNAME_INVALID, NICKNAME_TAKEN } from '#/content/nickname-refusal'
import { Agreement } from './agreement'
import { ACCOUNT, ACCOUNT_RULES } from './account.copy'
import { EMAIL_REFUSAL, ENTRY } from './account-entry.copy'
import { SiteButton } from './button'
import { Field, FieldForm } from './field'
import { useInBrowser } from './navigation'
import { Headline, Notice, Section } from './section'

const STEPS = [ENTRY.accessStep, ENTRY.nicknameStep, ENTRY.rulesStep]
/** The step whose field a refusal is about; the others stay where the reader is. */
const REFUSED_STEP: Partial<Record<EmailRefusal, number>> = {
  [EMAIL_INVALID]: 0,
  [PASSWORD_SHORT]: 0,
  [EMAIL_TAKEN]: 0,
  [NICKNAME_INVALID]: 1,
  [NICKNAME_TAKEN]: 1,
}

/** Sends a form without leaving the page, so a refusal keeps what was typed. A
 * response that is not a refusal of ours, or none, is the server's failure. */
async function sendForm(
  action: string,
  form: HTMLFormElement,
): Promise<EmailRefusal | null> {
  try {
    const response = await fetch(action, {
      method: 'POST',
      headers: { accept: 'application/json' },
      // Success is the redirect with the session's cookie; there is nothing to
      // read at its end.
      redirect: 'manual',
      body: new URLSearchParams(
        [...new FormData(form)].map(([key, value]) => [
          key,
          typeof value === 'string' ? value : '',
        ]),
      ),
    })
    if (response.type === 'opaqueredirect') return null
    if (response.ok) return EMAIL_UNAVAILABLE
    const body = (await response.json()) as { refusal?: unknown }
    return isEmailRefusal(body.refusal) ? body.refusal : EMAIL_UNAVAILABLE
  } catch {
    return EMAIL_UNAVAILABLE
  }
}

/** The form's refusal, from the address at first and from `send` after that. On
 * success the page opens again with the session. */
function useEmailForm(action: string, initial?: EmailRefusal) {
  const [refusal, setRefusal] = useState(initial ?? null)
  const [sending, setSending] = useState(false)
  const send = async (form: HTMLFormElement) => {
    setSending(true)
    const refused = await sendForm(action, form)
    if (!refused) {
      window.location.assign('/conta')
      return null
    }
    setSending(false)
    setRefusal(refused)
    return refused
  }
  return { refusal, setRefusal, sending, send }
}

function Refusal({ refusal }: { refusal: EmailRefusal | null }) {
  return (
    refusal && (
      <Notice className="mt-md mb-0" role="alert">
        {EMAIL_REFUSAL[refusal]}
      </Notice>
    )
  )
}

function GoogleEntry() {
  return (
    <div className="mt-lg">
      <a
        href="/auth/google"
        className="flex min-h-toque w-full items-center justify-center gap-sm rounded-mao border-(length:--traco-controle) border-tinta bg-folha px-4 py-3 font-label text-label font-bold text-tinta no-underline hover:-translate-y-px active:translate-y-px motion-reduce:hover:translate-none motion-reduce:active:translate-none"
      >
        <img src="/google-g.svg" alt="" width={22} height={22} />
        {ENTRY.google}
      </a>
      <p className="mt-xs text-nota text-tinta-2">{ENTRY.googleNote}</p>
    </div>
  )
}

function Login({ refusal: initial }: { refusal?: EmailRefusal }) {
  const { refusal, sending, send } = useEmailForm('/auth/login', initial)
  return (
    <Section aria-labelledby="ja-tenho-conta" className="mt-xs">
      <Headline id="ja-tenho-conta">{ENTRY.loginTitle}</Headline>
      <Refusal refusal={refusal} />
      <FieldForm
        action="/auth/login"
        onSubmit={(event) => {
          event.preventDefault()
          void send(event.currentTarget)
        }}
      >
        <Field
          id="login-email"
          label={ENTRY.emailLogin}
          name="email"
          type="email"
          maxLength={254}
          autoComplete="email"
        />
        <Field
          id="login-password"
          label={ENTRY.passwordLogin}
          name="password"
          type="password"
          maxLength={1024}
          autoComplete="current-password"
        />
        <SiteButton type="submit" variant="light" disabled={sending}>
          {ENTRY.login}
        </SiteButton>
      </FieldForm>
      <p className="mt-md flex flex-col items-start">
        <a href="/auth/forgot" className="inline-flex min-h-toque items-center">
          {ENTRY.forgot}
        </a>
        <span>
          {ENTRY.noAccount}{' '}
          <a
            href="#criar-conta"
            className="inline-flex min-h-toque items-center"
          >
            {ENTRY.toSignUp}
          </a>
        </span>
      </p>
    </Section>
  )
}

function StepProgress({ step }: { step: number }) {
  return (
    <div aria-hidden className="flex w-full gap-xs">
      {STEPS.map((name, index) => (
        <span
          key={name}
          className={`h-3 flex-1 rounded-mao-2 border-2 border-tinta ${index <= step ? 'bg-tinta' : 'bg-folha'}`}
        />
      ))}
    </div>
  )
}

function Step({
  index,
  hidden,
  children,
}: {
  index: number
  hidden: boolean
  children: ReactNode
}) {
  const id = `sign-up-step-${index}`
  return (
    <fieldset
      aria-labelledby={id}
      hidden={hidden}
      // `flex` would win over the `hidden` attribute.
      className={
        hidden
          ? 'hidden'
          : 'm-0 flex w-full min-w-0 flex-col items-start gap-sm border-0 p-0'
      }
    >
      <h3
        id={id}
        tabIndex={-1}
        className="m-0 font-title text-title outline-none"
      >
        {ENTRY.step(index + 1, STEPS[index]!)}
      </h3>
      {children}
    </fieldset>
  )
}

/** One form and one POST, whatever the reader sees: without JavaScript every step
 * shows and the browser checks them all. With it, one shows at a time, and the
 * hidden fields keep what was typed. */
function SignUp({ refusal: initial }: { refusal?: EmailRefusal }) {
  const stepping = useInBrowser()
  const [step, setStep] = useState(0)
  const { refusal, setRefusal, sending, send } = useEmailForm(
    '/auth/register',
    initial,
  )
  const last = STEPS.length - 1
  const goTo = (form: HTMLFormElement, next: number) => {
    // The heading must be on screen before it can take the focus.
    flushSync(() => setStep(next))
    form.querySelectorAll('h3')[next]?.focus()
  }
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const fields = form.querySelectorAll('fieldset')[step]!
    if (![...fields.querySelectorAll('input')].every((i) => i.reportValidity()))
      return
    if (step < last) {
      setRefusal(null)
      goTo(form, step + 1)
      return
    }
    const refused = await send(form)
    const back = refused && REFUSED_STEP[refused]
    if (typeof back === 'number') goTo(form, back)
  }
  const hiddenStep = (index: number) => stepping && step !== index
  return (
    <Section aria-labelledby="criar-conta">
      <Headline id="criar-conta">{ENTRY.signUpTitle}</Headline>
      <Refusal refusal={refusal} />
      <FieldForm
        action="/auth/register"
        className="gap-lg"
        // The hidden steps' fields would stop the browser's own check.
        noValidate={stepping}
        onSubmit={(event) => void onSubmit(event)}
      >
        {stepping && <StepProgress step={step} />}
        <Step index={0} hidden={hiddenStep(0)}>
          <p className="m-0">{ENTRY.emailKept}</p>
          <Field
            id="register-email"
            label={ENTRY.emailRegister}
            name="email"
            type="email"
            maxLength={254}
            autoComplete="email"
          />
          <Field
            id="register-password"
            label={ENTRY.passwordRegister}
            name="password"
            type="password"
            minLength={8}
            maxLength={1024}
            autoComplete="new-password"
          />
          <p className="m-0 text-nota text-tinta-2">{ENTRY.passwordNote}</p>
        </Step>
        <Step index={1} hidden={hiddenStep(1)}>
          <p className="m-0">{ACCOUNT.nicknameExplanation}</p>
          <Field
            id="register-nickname"
            label={ACCOUNT.nickname}
            name="nickname"
            minLength={2}
            maxLength={40}
            autoComplete="off"
          />
        </Step>
        <Step index={2} hidden={hiddenStep(2)}>
          <p className="m-0">{ACCOUNT_RULES}</p>
          <Agreement name="adult">{ACCOUNT.adult}</Agreement>
          <Agreement name="rules">{ACCOUNT.rules}</Agreement>
          <p className="m-0 text-nota text-tinta-2">{ACCOUNT.ageNote}</p>
        </Step>
        <div className="flex flex-wrap gap-sm">
          <SiteButton type="submit" disabled={sending}>
            {stepping && step < last ? ENTRY.next : ENTRY.register}
          </SiteButton>
          {stepping && step > 0 && (
            <SiteButton
              variant="light"
              onClick={(event) => {
                const { form } = event.currentTarget as HTMLButtonElement
                if (form) goTo(form, step - 1)
              }}
            >
              {ENTRY.back}
            </SiteButton>
          )}
        </div>
      </FieldForm>
    </Section>
  )
}

/** What a reader without a session sees: Google first, since it both enters and
 * creates, and then email in its two sections. */
export function AccountEntry({
  loginRefusal,
  signUpRefusal,
}: {
  loginRefusal?: EmailRefusal
  signUpRefusal?: EmailRefusal
}) {
  return (
    <>
      <GoogleEntry />
      <p className="mt-lg mb-0 font-label text-label font-bold">
        {ENTRY.orEmail}
      </p>
      <Login refusal={loginRefusal} />
      <SignUp refusal={signUpRefusal} />
    </>
  )
}
