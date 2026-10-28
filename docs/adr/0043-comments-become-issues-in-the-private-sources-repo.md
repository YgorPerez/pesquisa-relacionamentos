# Comments become issues in the private sources repo

A reader can select a passage and send the curator a Comentário (#332): a type and free text, always anonymous. Until now the site sent nothing of the reader's to the server and had no contact channel. On 2026-10-27 the user decided where a Comentário goes.

## Decision

- **A server function opens an issue in `YgorPerez/pesquisa-relacionamentos-fontes`**, the private repo of the private sources (ADR 0040), labelled by the Comentário's type. The body carries the quote, the link to the sentence and the reader's text. Nothing else: no contact field, no IP, no user agent.
- **The credential is a fine-grained token with Issues read and write in that repo only.** It is not the read-only deploy key from ADR 0040, which stays as it is.
- **Anti-spam lives in the server's memory** (a honeypot and a per-IP rate limit). No IP is written to disk, a log or the issue.
- **The reply carries the issue's number** (amended 2026-10-28, spec #346). The reader's browser keeps the sent Comentário with that number, so "Seus trechos" (`/trechos`) can list it. A comment the anti-spam drops gets a made-up number, 1 to 3 past the highest number returned, real or made-up (or 1 to 100 before the first reply since a restart). Each made-up reply advances that baseline, so repeated drops return distinct, increasing numbers. A made-up number can match a real issue; the most that leaks is that issue's status, never its text. The user accepted that.
- What turns into work is copied by hand into the public repo's queue.
- **Status lookup sends only issue numbers in a POST body**, never in the URL or logs (amended 2026-10-28, #348). The reply contains only the number and status: open is Recebido, closed completed is Corrigido, closed not planned is Não vamos mudar. Missing issues, failures and unrecognized states leave the device's last known status intact. No issue text leaves the server.
- **The browser checks once per visit, at most every six hours**, only still-open comments. The server caches successful GitHub answers in memory for ten minutes. The device keeps each status and the last one seen. Unread changes put a dot on the footer link. Opening the list does not acknowledge offscreen comments: each changed status is marked seen only when its comment enters the viewport, including updates received while the list is already open. Its highlight stays for that visit so the reader can find the update they just saw.

## Why

What a reader writes about a relationship can be personal, so it cannot land in a public issue. Opening an issue keeps the Comentário in the tracker the curator already triages, with no database or inbox to run on the VPS. Reusing the private repo that already exists avoids creating and granting access to another one.

## Options considered

**An issue in this public repo.** Same triage, but everything the reader writes would be public, and a warning on the form does not stop someone from writing something personal.

**A new private repo just for comments.** A cleaner separation, but one more repo and one more grant. The user preferred to reuse the sources repo.

**A prefilled GitHub issue link or a `mailto:`.** No server needed, but most readers have no GitHub account, the issue would be public, and `mailto:` exposes an address and does nothing on a phone with no mail app.

## Consequences

- The private sources repo now mixes licensed sources with reader comments. Its issues are the comments; its files are the sources.
- `/privacidade` has to say what a Comentário sends and where it goes, and what the device keeps of it.
- A Comentário sent before the reply carried the number is not on the reader's device, and there is no way to recover it.
- Rotating or revoking the token stops sending comments and refreshing their status. The rest of the site keeps working.
