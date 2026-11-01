import { renderToStaticMarkup } from 'react-dom/server'
import { PasswordRecovery } from '#/ui/password-recovery'
import css from '../styles.css?url'

/** Deliberately outside the app shell: no JS, analytics or third-party requests.
 * A meta policy also applies behind Nginx's fixed strict-origin header. */
export function recoveryPage(props: Parameters<typeof PasswordRecovery>[0], status = 200) {
  const html = renderToStaticMarkup(<html lang="pt-BR"><head>
    <meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" /><meta name="robots" content="noindex" />
    <title>Recuperar senha · Tem estudo?</title><link rel="stylesheet" href={css} />
  </head><body><PasswordRecovery {...props} /></body></html>)
  return new Response(`<!doctype html>${html}`, { status, headers: {
    'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'x-robots-tag': 'noindex',
  } })
}
