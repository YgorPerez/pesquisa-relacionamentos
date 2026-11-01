# 0047: Reports hide a public comment until the curator decides

## Context

Public comments go live unreviewed (spec #556). The user decided that the first report tells the curator through an issue in the private repo, and that reports from three different accounts hide the comment until the curator decides in `/curadoria`. These rules leave a few choices that are easy to get wrong later.

## Decision

- **A report needs a finished account.** One account counts once per comment, for good. An author cannot report their own comment. An account has 20 reports per hour, because each comment's first report opens an issue.
- **Restoring closes the round.** The comment shows again and its reports stop counting, but they stay in the table. An account that already reported that comment cannot count again, so hiding it again takes three accounts that never reported it. "Keeping" a reported comment that is still up is the same action. The cost is that an old reporter cannot report a restored comment even after its author edits it.
- **Each round tells the curator once, at most.** The report's transaction claims the notice. GitHub is called after the commit, with a five-second limit, and the claim is never given back. So a failed notice cannot block the report or the hiding, and a timeout that did create the issue cannot produce a second one. `/curadoria` says which notices did not go out. A restore releases the claim: the next report is a new round with its own issue.
- **The issue carries links only**: the comment's id and the links to `/curadoria` and to the page. It goes through `postIssue` and `COMMENT_GITHUB_TOKEN` (ADR 0043). No comment text and no nickname, so a removed comment does not live on in the private repo, and nothing about the reporter. It has no label, because a label the repo lacks could cost the notice.
- **The curator is one Google subject**, `CURATOR_GOOGLE_SUB` in the runtime environment. Without it nobody is the curator. A session from any login method of the account holding the subject counts ([ADR 0045](0045-google-identity-and-revocable-sessions.md)). The store checks it on every read and write (`platform/public-comments.ts`), not the page. The curator's view never has a Google subject or says who reported.

## Consequences

If a notice fails, nothing tells the curator until they next open `/curadoria`. `/privacidade` has to say that a report keeps the account that sent it (#562). Deleting an account deletes its reports, but a hidden comment stays hidden until the curator decides.
