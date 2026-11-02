import { Section } from './section'
import { SiteButton } from './button'
import { EMAIL_CONFIRMATION } from './email-confirmation.copy'
import { TokenPage } from './token-page'

/** Either the form that spends the link, or why this link does nothing here. */
export function EmailConfirmation({
  token,
  email,
  message,
}: {
  token?: string
  email?: string
  message?: string
}) {
  const live = token && email
  return (
    <TokenPage
      title={EMAIL_CONFIRMATION.title}
      lead={live ? EMAIL_CONFIRMATION.explanation(email) : undefined}
      message={message}
      back={EMAIL_CONFIRMATION.back}
    >
      {live && (
        <Section>
          <p>{EMAIL_CONFIRMATION.note}</p>
          <form action="/auth/confirm-email" method="post" className="mt-md">
            <input type="hidden" name="token" value={token} />
            <SiteButton type="submit">{EMAIL_CONFIRMATION.submit}</SiteButton>
          </form>
        </Section>
      )}
    </TokenPage>
  )
}
