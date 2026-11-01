# 0045: Google identity and revocable sessions

## Context

Spec #556 introduces optional accounts. Google verifies identity, but the site
must not retain the reader's email, Google name or photo. Later tickets need the
same account for comments, curator access and synchronization.

## Decision

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
