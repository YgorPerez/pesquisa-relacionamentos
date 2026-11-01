import { Sheet, Column, Display, Lead } from './sheet'
import { Section } from './section'
import { SiteButton } from './button'
import { EMAIL_CONFIRMATION } from './email-confirmation.copy'

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
  return (
    <Sheet>
      <Column>
        <Display>{EMAIL_CONFIRMATION.title}</Display>
        {message && (
          <Section>
            <p role="status">{message}</p>
          </Section>
        )}
        {token && email && (
          <>
            <Lead>{EMAIL_CONFIRMATION.explanation(email)}</Lead>
            <Section>
              <p>{EMAIL_CONFIRMATION.note}</p>
              <form action="/auth/confirm-email" method="post" className="mt-md">
                <input type="hidden" name="token" value={token} />
                <SiteButton type="submit">{EMAIL_CONFIRMATION.submit}</SiteButton>
              </form>
            </Section>
          </>
        )}
        <p className="mt-lg">
          <a href="/conta">{EMAIL_CONFIRMATION.back}</a>
        </p>
      </Column>
    </Sheet>
  )
}
