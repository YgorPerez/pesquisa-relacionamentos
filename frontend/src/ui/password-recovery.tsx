import { Sheet, Column, Display, Lead } from './sheet'
import { Section } from './section'
import { Input } from './shadcn/input'
import { SiteButton } from './button'
import { RECOVERY } from './password-recovery.copy'

export function PasswordRecovery({ token, message, disabled = false }: {
  token?: string
  message?: string
  disabled?: boolean
}) {
  return <Sheet><Column>
    <Display>{token ? RECOVERY.resetTitle : RECOVERY.title}</Display>
    <Lead>{token ? RECOVERY.note : RECOVERY.explanation}</Lead>
    {message && <Section><p role="status">{message}</p></Section>}
    {!disabled && <Section>
      <form action={token ? '/auth/reset' : '/auth/forgot'} method="post" className="flex flex-col gap-md">
        {token && <input type="hidden" name="token" value={token} />}
        <label htmlFor="recovery-field" className="flex w-full flex-col gap-xs">
          {token ? RECOVERY.password : RECOVERY.email}
          <Input id="recovery-field" name={token ? 'password' : 'email'} type={token ? 'password' : 'email'} autoComplete={token ? 'new-password' : 'email'} minLength={token ? 8 : undefined} maxLength={token ? 1024 : 254} required />
        </label>
        <SiteButton type="submit">{token ? RECOVERY.save : RECOVERY.send}</SiteButton>
      </form>
    </Section>}
    <p className="mt-lg"><a href="/conta">{RECOVERY.back}</a></p>
  </Column></Sheet>
}
