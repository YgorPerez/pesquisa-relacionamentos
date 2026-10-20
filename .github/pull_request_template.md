<!-- Title: the ticket and what changed, as in commits ("Ticket #57: the PR flow"). One subject per PR; if the description needs an "also", split it. -->

## Why

<!-- The problem, as someone using the site or the repository sees it. -->

## What changed

<!-- What changed and where. What was left out, if someone will look for it. -->

## Screen

<!-- A PR that changes a screen brings, for each screen that changed, the screenshot and video from before and after:
`node frontend/scripts/capture.ts <route> --video` on each side (the `testar-app` skill). The
"Evidência de tela" check fails without at least two screenshots and two videos. Write the table with
local paths and attach with `gh pr edit <n> --body-file body.md --attach ./before.png --attach ./before.mp4 ...`:
gh replaces each path with the attachment. If the screen does not change, tick the box, say why and delete the table.
How: docs/agents/evidencia-de-tela.md -->

- [ ] No screen change

|                   | Before                        | After                       |
| ----------------- | ----------------------------- | --------------------------- |
| Screenshot, phone | ![before](./before-phone.png) | ![after](./after-phone.png) |
| Video, phone      | [before](./before-phone.mp4)  | [after](./after-phone.mp4)  |

## Verification

<!-- The minimal proof that ran (`node scripts/minimal-proof.ts`, ADR 0016): which tests, types and lint, and the result. Each new suppression, and why. -->

Closes #

<!-- The model and environment that did the work, for example: Claude Opus 5.5, in Claude Code. -->
