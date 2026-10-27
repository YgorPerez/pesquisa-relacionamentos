# Comments become issues in the private sources repo

A reader can select a passage and send the curator a Comentário (#332): a type and free text, always anonymous. Until now the site sent nothing of the reader's to the server and had no contact channel. On 2026-10-27 the user decided where a Comentário goes.

## Decision

- **A server function opens an issue in `YgorPerez/pesquisa-relacionamentos-fontes`**, the private repo of the private sources (ADR 0040), labelled by the Comentário's type. The body carries the quote, the link to the sentence and the reader's text. Nothing else: no contact field, no IP, no user agent.
- **The credential is a fine-grained token that can only write issues in that repo.** It is not the read-only deploy key from ADR 0040, which stays as it is.
- **Anti-spam lives in the server's memory** (a honeypot and a per-IP rate limit). No IP is written to disk, a log or the issue.
- What turns into work is copied by hand into the public repo's queue.

## Why

What a reader writes about a relationship can be personal, so it cannot land in a public issue. Opening an issue keeps the Comentário in the tracker the curator already triages, with no database or inbox to run on the VPS. Reusing the private repo that already exists avoids creating and granting access to another one.

## Options considered

**An issue in this public repo.** Same triage, but everything the reader writes would be public, and a warning on the form does not stop someone from writing something personal.

**A new private repo just for comments.** A cleaner separation, but one more repo and one more grant. The user preferred to reuse the sources repo.

**A prefilled GitHub issue link or a `mailto:`.** No server needed, but most readers have no GitHub account, the issue would be public, and `mailto:` exposes an address and does nothing on a phone with no mail app.

## Consequences

- The private sources repo now mixes licensed sources with reader comments. Its issues are the comments; its files are the sources.
- `/privacidade` has to say what a Comentário sends and where it goes.
- Rotating or revoking the token only stops comments. The rest of the site keeps working.
