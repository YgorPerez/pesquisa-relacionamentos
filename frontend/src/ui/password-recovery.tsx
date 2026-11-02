import { Section } from './section'
import { SiteButton } from './button'
import { Field, FieldForm } from './field'
import { RECOVERY } from './password-recovery.copy'
import { TokenPage } from './token-page'

export function PasswordRecovery({
  token,
  message,
  disabled = false,
}: {
  token?: string
  message?: string
  disabled?: boolean
}) {
  return (
    <TokenPage
      title={token ? RECOVERY.resetTitle : RECOVERY.title}
      lead={disabled ? undefined : token ? RECOVERY.note : RECOVERY.explanation}
      message={message}
      back={RECOVERY.back}
    >
      {!disabled && (
        <Section>
          <FieldForm
            action={token ? '/auth/reset' : '/auth/forgot'}
            className="mt-0 gap-md"
          >
            {token && <input type="hidden" name="token" value={token} />}
            <Field
              id="recovery-field"
              label={token ? RECOVERY.password : RECOVERY.email}
              name={token ? 'password' : 'email'}
              type={token ? 'password' : 'email'}
              autoComplete={token ? 'new-password' : 'email'}
              minLength={token ? 8 : undefined}
              maxLength={token ? 1024 : 254}
            />
            <SiteButton type="submit">
              {token ? RECOVERY.save : RECOVERY.send}
            </SiteButton>
          </FieldForm>
        </Section>
      )}
    </TokenPage>
  )
}
