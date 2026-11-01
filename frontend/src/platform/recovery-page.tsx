import { renderToStaticMarkup } from 'react-dom/server'
import { PasswordRecovery } from '#/ui/password-recovery'
import css from '../styles.css?url'

/** Deliberately outside the app shell: no JS, analytics or third-party requests.
 * Origin-only referrers retain the Origin header on native form POSTs. */
export function recoveryPage(
  props: Parameters<typeof PasswordRecovery>[0],
  status = 200,
) {
  const html = renderToStaticMarkup(
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="strict-origin" />
        <meta name="robots" content="noindex" />
        <title>Recuperar senha · Tem estudo?</title>
        <link rel="stylesheet" href={css || undefined} />
      </head>
      <body>
        <PasswordRecovery {...props} />
      </body>
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
