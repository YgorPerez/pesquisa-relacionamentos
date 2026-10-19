---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round, give your recommended answer to each question, then wait for the user's answers before the next round.

## Asking a round

Every round goes through the harness's native question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex), so the user answers each question by picking an option. Shape each question like so:

- **Header**: the question title, in a word or two.
- **Question**: the question itself, in a sentence or two. Context that needs more room goes in your message text just before the call.
- **Options**: the distinct answers, each a short label with its trade-off in the description. Your recommended answer comes first, its label ending in `(Recommended)` written in the conversation's language (`(Recomendado)` in Portuguese), its description saying why you recommend it. An open question gets options too: offer the likely answers, and the tool adds a free-text choice for anything else.

Stay within the tool's limits on questions per call and options per question. A frontier wider than one call takes several calls back to back; the round closes when the last one is answered. An option that needs more than a line or two means the question is really two questions.

Without a native question tool (some Copilot surfaces), ask the round in text, formatted as [TEXT-ROUND.md](TEXT-ROUND.md) shows.

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

## Reading the user's answers

- **Free-text answer.** It is the user's decision, as binding as a picked option. Any new branch it opens joins the frontier.
- **Unanswered question.** If the user skips a question from the round or dismisses the call, adopt your recommended answer for it. Treat it as settled.
- **"DA" (Default to All).** If the user answers `DA`, in a free-text field or in a message, adopt your recommended answer for every question of _that round_ the user did not answer explicitly. It settles that round only. Recompute the frontier, ask the next round in full, and wait for the answers like any other round. `DA` is never standing permission to answer for the user from there on, and never a reason to skip a round.

Open each new round, in your message text before its first call, with a short list of the decisions you adopted by default since the last one, so the user can overturn any of them.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
