# A PR that changes a screen shows before and after

No check compares screens. A reviewer only sees that a screen changed if the PR shows it, and a screenshot does not show an animation's entrance or what a tap opens. From Festival dos Macacos's `screen-evidence.ts`.

## Decision

- **A PR that changes a screen file carries, in its `## Screen` section, at least two screenshots and two different videos**, before and after. A screen file is one that lives in `frontend/src/` or `frontend/public/`, except tests, stories, types, `platform/`, `analytics/`, `server.ts` and the generated route tree.
- **`- [x] No screen change` passes**, for a refactor that leaves every screen the same. The PR says why.
- **`screen-evidence.yml` checks** on every push and every description edit. It counts from the API's `body_html`: only the HTML tells whether an attachment is an image or a video.
- **`frontend/scripts/capture.ts` takes both**, on mobile and desktop, and the `test-app` skill says how to start the before and the after.
- **It also runs on drafts**, unlike Festival: it takes seconds, and the draft already shows what will be missing.

## Consequences

- A change only to the library (`studies/`, `tips/`) does not need screenshots: the Fact sheet has its own review (the `library` skill).
- Attachments stay in the PR, never in git (`AGENTS.md`, "Documentação").
