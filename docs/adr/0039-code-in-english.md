# Code, ADRs, issues and commits are in English; what the visitor sees stays in PT-BR

The repository started out entirely in Portuguese, from file names to frontmatter keys. On 2026-10-20 the user decided that the code moves to English (#65), and so do ADRs, issues, pull requests and commit messages.

## Decision

These are in English:

- file and folder names, identifiers, comments, and CLI, build and log messages;
- package names and `package.json` commands;
- the content folders (`studies/`, `tips/`, `data/`, `sources/`, `reports/`, `prototypes/`), frontmatter keys and the values of closed lists;
- `localStorage` keys, migrated from the old keys so a saved Profile survives;
- analytics event names;
- ADRs, issues, pull requests and commit messages.

Each domain term has an English name, written in `GLOSSARY.md`, and every identifier uses that name.

These stay in PT-BR:

- public URLs: the fixed paths (`/estudos`, `/dicas`, `/prioridades`, `/grupo-possivel`, `/privacidade`) and the Topic, Guide, Fact sheet and Tip slugs, which are the content file names. That is why the files in `frontend/src/routes/` keep their Portuguese segments;
- the parameters and values of the shared-link query (ADR 0001);
- interface copy and the prose of the content (Fact sheets, Tips, reports);
- `GLOSSARY.md`, `AGENTS.md` and `docs/agents/`, whose prose is the domain vocabulary and the house rules.

## Why

The site is for Brazilian visitors, so what they see or share stays in their language: a URL a search engine indexed, a link someone sent a friend, the copy on the page. Everything else is read only by whoever maintains the repository.

`localStorage` and analytics changed despite being stored outside the code: the key migration keeps saved data, and analytics only keeps 31 days, so the break in the event series is short.

## Consequences

- New code, ADRs, issues and commits are written in English. A domain name missing from the glossary goes there before it becomes an identifier.
- Someone reading a URL or a link and looking for the code goes through the glossary: `/grupo-possivel` is the `possible-group` route.
- Git history keeps its Portuguese commit messages; they are not rewritten.
