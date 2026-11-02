import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { EmailConfirmation } from '#/ui/email-confirmation'
import { PasswordRecovery } from '#/ui/password-recovery'
import css from '../styles.css?url'

/** Deliberately outside the app shell: no JS, analytics or third-party requests.
 * A token sits in the address of these pages. Origin-only referrers retain the
 * Origin header on native form POSTs. */
function tokenPage(title: string, body: ReactElement, status: number) {
  const html = renderToStaticMarkup(
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="strict-origin" />
        <meta name="robots" content="noindex" />
        <title>{title}</title>
        <link rel="stylesheet" href={css || undefined} />
      </head>
      <body>{body}</body>
    </html>,
  )
  return new Response(`<!doctype html>${html}`, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'referrer-policy': 'strict-origin',
      'content-security-policy':
        "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      'x-robots-tag': 'noindex',
    },
  })
}

export const recoveryPage = (
  props: Parameters<typeof PasswordRecovery>[0],
  status = 200,
) =>
  tokenPage(
    'Recuperar senha · Tem estudo?',
    <PasswordRecovery {...props} />,
    status,
  )

export const emailConfirmationPage = (
  props: Parameters<typeof EmailConfirmation>[0],
  status = 200,
) =>
  tokenPage(
    'Confirmar e-mail · Tem estudo?',
    <EmailConfirmation {...props} />,
    status,
  )
