# One narrative Guide per Topic, in Chapters, with Visuals drawn from the content

Until October 2026 each Question had its own Guide page, about 300 words long. Readers finished one with more doubts than answers, unless it ended in a Tip, and nothing on the site was visual except the Calculators. On 2026-10-25 the user settled a new model in a grilling session (#180): one Guide per Topic, a section per Question. The pilot of that model went live on 2026-10-26 and read as the old Guides glued together, because every Question repeated the same blocks ("O que a evidência diz", "E no Brasil?", "Varia conforme o Perfil?", "Ajudou?"). A second grilling the same day (#194) replaced the per-Question template with Chapters.

## Decision

### The Guide is the text of a Topic, in Chapters

- Each Topic has one Guide, at `/<tema>`: one narrative, cut into Chapters that follow the reasoning, not the list of Questions. A Chapter can answer no Question, one or several.
- Where the reasoning reaches a Question, a discreet note shows the Question, its short answer and its Confidence, anchored by the Question's slug. With a Profile, the note says whether its key number is the reader's ("Para o seu Perfil").
- The page, top to bottom: the title and the table of Chapters; "Em resumo", with each Question, the first sentence of its short answer and its Confidence; the Profile box; the opening; the Chapters, with Visuals, Tips, Myths and the calculator card (right after the answer of the Question that hosts it) where they matter; "O que levar"; "O que não se sabe", a short prose Chapter with the gaps that weigh on the conclusion; "Para ler além daqui", the Topic's Readings of Neighbor sites, absent when it has none (#179); one list of Fact sheets numbered in page order; one "Ajudou?"; the Questions of other Topics.
- The findings are not listed on the page. They stay in the content as what each answer rests on: the build checks them, and a sentence can mark one with `{{you:<finding>}}`.
- Brazil and the Profile are woven into the sentences where they matter, with two small marks: `{{brazil}}` ("no Brasil", ink and paper) and `{{you:<finding>}}` ("vale para você", yellow, shown only when the saved Profile is in the finding's sample). The prose must still say when no Brazilian data exists; the reviewer checks that, not the build.
- Each Study's limitations live on its Fact sheet's page; the Guide no longer groups them.

### One file per Guide

- `guides/<tema>.md`. The frontmatter holds the Topic (`title`, `position`, `previous`, `seo`) and:
  - `questions`: slug, question, short answer (`answer`), Confidence, the ids of the `findings` the answer rests on, and optionally `calculator` and `previous`;
  - `findings`, each with an `id`;
  - `myths`, each with an `id`;
  - `visuals`;
  - `takeaways` ("O que levar") and `related` (Questions of other Topics).
- The body holds the opening (before the first `##`), one `##` per Chapter and, last, "## O que não se sabe". A heading may end in its own anchor, `## Title {#anchor}`. Lines of their own place the blocks: `{{question:<slug>}}` (each Question once), `{{tip:<slug>}}`, `{{myth:<id>}}` (each Myth once) and `{{visual:<id>}}` (each Visual once). The short answer stays plain text: "Em resumo" and the search show it too.
- The Confidence ceiling is checked per Question, against the Fact sheets of the findings it names: never above the strongest, and at most moderate when all of them are 🟡.
- Each old `/<tema>/<question>` answers with a 301 to `/<tema>#<question>`: a redirect target may carry a fragment, and the query goes before it. A Question's path is an old path of its Guide's file, so it stays out of the sitemap and the check against the last published sitemap still passes. Two Questions of one file cannot claim the same old path.
- The usage count has one "Ajudou?" per Guide, keyed by the Topic (`helped/yes/<tema>`), and a Fact sheet opened from the Guide counts by the Topic too. The per-Question series stopped on 2026-10-26 (`analytics/events.ts`).
- One page per Guide. If a Guide breaks the mobile target (ADR 0033), the Topic splits in two.
- In the code the file's thing is a `Topic` (with its `chapters`), each Question a `Question` (`library.questions`), and the page's view is `GuideView`.

### Visuals are data in the content, drawn on the server

- Four kinds: bar comparison, time line, table of Studies, relation diagram. An answer gets a Visual whenever it compares two or more numbers, and never as decoration.
- Each number comes from a ✅ or 🟡 Fact sheet, or from an own calculation on those numbers, labelled "conta nossa". The build fails when a number is not in the cited Fact sheet, and it recomputes each own calculation. The Fact sheet must be cited in the Guide's text, so it has a number in the page's list.
- In the diagram every arrow is a finding with Fact sheets. The stroke says whether a study tested the cause (solid), only found an association (dashed), or is our inference (marked).
- A Visual is data in the Guide's file. The style is the zine's with an exact scale, as `DESIGN.md` says: precise axes and bars, hand-drawn touches only for the highlight, the arrow and the margin note.
- **SVG from the server, interaction on top** (#470, #471). Bar comparisons and Study tables whose numbers share one unit (one dot per Study) are drawn by TanStack Charts (`@tanstack/charts` and `@tanstack/react-charts`, pinned to 1.1.0). The server renders the library's complete SVG, so the chart reads without JS. The library is not in the page's first JavaScript: it is a separate chunk the browser fetches when a chart comes within half a screen of the viewport, or is touched, and only then does React hydrate the chart and adopt the server's SVG (`ui/visual-chart-loader.ts`). On top of it: a tap, click or Enter on a mark opens the exact value, the "conta nossa" expression and the Fact sheet's ring; one row of country chips per Guide lights a country in every chart that has it (`?pais=<país>`, read by the server too and kept by the share link; an unknown value is ignored); Brazil is ringed for everyone, and a Study whose `covers` include the saved Profile gets the yellow "você". The pink marker, Brazil's ring and "você" are our own SVG layer injected into the library's markup (`ui/chart-overlay.ts`). A point may name its `country`, `year` and `definition`; without a `country`, it takes its Fact sheet's when that lists one country. When Studies define the measure differently, the Visual lists its `definitions` (at most four), each with its own mark shape and legend.
- The time line, Study tables of mixed units and the relation diagram stay hand-drawn as static SVG and HTML inside the body; the diagram is not a data chart, and its stroke encodes the evidence. Which Visuals the library draws is `LIBRARY_VISUALS` in `content/chart-view.ts` until #472–#475 move the rest.
- Why lazy: loaded with the page, the library put the Guide's JS 42 KB over its measured size; loaded on demand, the page's JS is the same as with hand-drawn charts (#471 measured 333.9 KB before and 339.8 KB after, the difference being the chips and the detail, with the library's 40 KB chunk not fetched during the load). The Guide's real JS is above ADR 0033's 260 KB with or without the library; that budget is a separate problem.

## Why

A narrative that follows the reasoning can link the answers and carry the context a 300-word page had no room for. A template repeated per Question breaks that narrative into stacked sections, which is what the user found on the live pilot. Keeping the findings as data, and not on the page, keeps the build's checks (Fact sheets that exist and were verified, the Confidence ceiling) without the list that made each section read like a report. One file per Guide lets the curator write the narrative in one place; the Question slugs survive as anchors, so shared links still land on the answer they pointed to.

The Visuals obey the same rule as every claim on the site: a number reaches the page only from a verified Fact sheet. Checking it at build time keeps a chart from drifting away from its source when the Fact sheet changes, and drawing on the server keeps the page within the mobile target.

## Migration

"Onde conhecer pessoas" is the pilot (#194); the other five Topics wait for the user to approve it, and #184–#188 rewrite them. Until each rewrite, their files are a mechanical conversion: one Chapter per old Question (with the anchor `capitulo-<slug>`), the old sections as `###` inside it, and the Tips and Myths at the end of the Chapter. "## O que não se sabe" is optional until the last rewrite, which makes it required.

## Consequences

- A link inside the app to a Question goes to `/$tema` with `hash` set to the slug; the `/$tema/$slug` route only redirects.
- A Question's slug and a Chapter's anchor cannot be one of the page's own anchors (`RESERVED_ANCHORS` in `items.ts`), nor each other.
- A Fact sheet's page lists as "Citada em" the Questions whose answer, findings or Chapter cite it, and a Tip's page the Questions answered in the Chapters that place it.
- The measurement of ADR 0033 opens the fixture Guide at `/onde-conhecer-pessoas`; the real Guides are longer and need their own measurement when each Topic is rewritten.
