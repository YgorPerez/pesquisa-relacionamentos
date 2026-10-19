---
name: handoff
description: Compact the current conversation into a handoff document for a new chat to pick up, or, in that new chat, resume from the latest handoff with "resume".
argument-hint: "What will the next session be used for? Or 'resume' to continue from the latest handoff."
disable-model-invocation: true
---

This skill has two modes, chosen by the arguments. They run in different chats: write mode in the chat that is ending, resume mode later in a new chat the user opens.

## Resume mode

If the first argument is `resume`, this chat is the new session: you pick up the work yourself, here in the main conversation. Do not write a new document. Load the latest handoff instead:

1. Find the handoffs directory: `handoffs/` inside the temporary directory of the user's OS (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows), the same one write mode used.
2. Pick the most recent `handoff-*.md` in it. File names start with a sortable timestamp, so the last name in sorted order is the newest. Break ties by modification time. If the user passed a path or name after `resume`, use that file instead.
3. If no handoff exists, tell the user and stop.
4. Read the whole document. Tell the user in one line which file you loaded and what the work is.
5. Call the Skill tool for each skill in its "suggested skills" section.
6. Re-check any state the document describes that may have moved on (git status, branches, open PRs) before relying on it.
7. Continue the work from its "next steps". If the document leaves a decision to the user, ask it.

## Write mode

Otherwise, write a handoff document summarising the current conversation so a new chat can continue the work.

Save it to `handoffs/` inside the temporary directory of the user's OS (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows) - not the current workspace. Create the directory if needed. Name the file `handoff-YYYYMMDD-HHMMSS-<short-kebab-slug>.md` using the current local time, so resume mode can find the newest one.

Include a "suggested skills" section in the document, naming which skills the next agent should call the Skill tool for.

End the document with a "next steps" section: what to do first, and any decision still waiting on the user.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

Write mode is done once the file is saved: finish by telling the user the full path and that `/handoff resume`, run in a new chat, will pick it up. Starting that new chat is the user's move, so your turn ends there.
