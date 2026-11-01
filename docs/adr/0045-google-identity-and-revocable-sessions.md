# 0045: Google identity and revocable sessions

## Context

Spec #556 introduces optional accounts. Spec #572 adds email and password
accounts and reverses the prohibition on retaining an email for that method.
Google's email, name and photo are still discarded. Both methods use the same
account for comments, curator access and synchronization.

## Decision

Password recovery uses 256-bit random tokens, stored only as SHA-256 hashes.
One live token per account expires after 30 minutes; a new request replaces it.
Consumption, password update and revocation of every account session share one
SQLite transaction. Account data stays. Known addresses receive the link;
unknown addresses receive a plain notice. Both and rate-limited/provider-failed
requests return the same page before deferred delivery starts. `allowEmailAttempt`
bounds mail by email and IP. A process restart may lose pending delivery.
`account-email.ts` owns the Resend transport for recovery and later linking.
Recovery pages have no scripts or analytics, use a restrictive CSP and
origin-only referrer policy, and remain outside the sitemap. Links use `APP_ORIGIN` only.

Use an authorization-code flow with PKCE and the `openid` scope only. Exchange
the code on the server and request Google's authenticated UserInfo endpoint.
Retain only `sub`; discard tokens and other claims. Provider failures return
fixed messages without logging their response or exception.

An OAuth attempt expires after ten minutes. Its state and browser-binding cookie
are independently random and stored as hashes; the attempt is consumed atomically
before exchange. The PKCE verifier stays server-side until consumption.

Sessions use random tokens, with only their hashes in SQLite. They expire after
30 days and are revoked on logout. Production cookies use the `__Host-` prefix,
Secure, HttpOnly, SameSite=Lax and Path=/. HTTP cookies are allowed only on
localhost for development. POSTs must carry the configured origin.

`getCurrentAccount(request)` in `frontend/src/platform/accounts.ts` is the
server-only account lookup. It returns the account id, Google subject and
nickname. A null nickname means the reader has not completed onboarding; public
actions must require a nickname. Never return the subject to the browser.
The account loader projects only the nickname and disables response caching.

`googleSub` is nullable. `email_credentials` holds a unique normalized email
(trimmed, lowercased) in plain text and a salted scrypt hash, and cascades on
account deletion. An account may have either identity or both; never merge
accounts by matching email. Google subjects remain the curator identity.
Email signup requires the nickname, adult declaration and rules acceptance.
Passwords require eight characters without composition rules. Scrypt uses
N=32768, r=8, p=1 with a fresh 16-byte salt; comparison is constant-time. An
unknown email still runs scrypt with the same parameters and has the same
login refusal as a wrong password. Signup explicitly reports an email in use.

Email login stays off without `EMAIL_RATE_LIMIT_KEY` and `APP_ORIGIN`.
Login and signup share a limit of ten attempts per fifteen minutes for each
normalized email and IP. Only HMAC-SHA256 keys and counters are stored. Expired
rows are erased on attempts, on server startup and hourly, including idle
periods. Nginx appends `$remote_addr` to X-Forwarded-For; only the last address
is used. The deploy binds app ports to loopback, so visitors cannot bypass
Nginx to choose that final address. Missing or invalid addresses share a bucket.
The email is used only for login and recovery, not shown in the curator desk.

The first nickname records the time of the adult declaration and rules acceptance
and the rules version. Age is self-declared. Accounts do not send the device's
Profile, Highlights or Notes; synchronization has its own consent in #561.

A nickname belongs to one account, or a reader could pose as another and the
operator could read the wrong subject when naming the curator. The rule lives in
`nickname_key`, with a unique index: the app writes it folded (Unicode forms, case
in any alphabet, repeated spaces), which SQLite's `lower` cannot do. "leitor
removido" is refused, since it names a deleted account's comments. A nickname
already equal when the migration ran keeps no key rather than stop the database
from opening, and deleting an account frees its nickname.

## Consequences

Reading requires neither OAuth configuration nor a database connection. The
curator cannot contact account holders using their Google identity. Revocable
sessions need a database read for authenticated account operations. Google client
creation and a real-provider acceptance test remain manual setup steps.
