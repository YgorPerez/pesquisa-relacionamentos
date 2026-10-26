# One narrative Guide per Topic, with Visuals drawn from the content

Until October 2026 each Question had its own Guide page, about 300 words long. Readers finished one with more doubts than answers, unless it ended in a Tip, and nothing on the site was visual except the Calculators. On 2026-10-25 the user settled a new model in a grilling session (#180).

## Decision

### The Guide is the text of a Topic

- Each Topic has one Guide, at `/<tema>`. It answers the Topic's Questions in order, as one narrative that links each answer to the next and says why, so what, where the studies disagree and whether it holds in Brazil.
- A Question is a section of the Guide, anchored by its slug. The section has the short answer and its Confidence, the narrative, "E no Brasil?", what varies by Profile, the Myths and Tips next to the finding they belong to (`findings[].tips` and `findings[].myths`), the Calculator card, and "Ajudou?".
- The frame around the sections: an index with each Question, its Confidence and only the first sentence of its short answer (the whole answer opens the section; the user chose this in the pilot, #183, to keep the index short on a phone), the opening, "O que levar" with the strongest Tips, the Limitations grouped by Study, one list of Fact sheets numbered in page order, and links to Questions in other Topics.
- The content stays one file per Question (`guides/<tema>/<question>.md`). `_topic.md` holds the order, the opening (its body before the first `##`), `takeaways` and "## Limitações", where each `### [@slug]` heading opens the group of one Study (another `###` fails the build; text before the first one is about the whole Guide).
- Each old `/<tema>/<question>` answers with a 301 to `/<tema>#<question>`: a redirect target may carry a fragment, and the query goes before it. A Question's path is an old path of its own file, so it leaves the sitemap and the check against the last published sitemap still passes.
- The keys of the usage count do not change: "Ajudou?" and a Fact sheet opened inside a section still count by the Question's slug. A Fact sheet opened from the shared list counts by the Topic.
- One page per Guide. If a Guide breaks the mobile target (ADR 0033), the Topic splits in two.
- The code still calls a Question file a guide (`Guide`, `GuideFrontmatter`, `guides/`), the name it had when each Question had a page. The view of the page is `GuideView`, and each section is a `QuestionView`.

### Visuals are data in the content, drawn on the server

- Four kinds: bar comparison, time line, table of Studies, relation diagram. A Question gets a Visual whenever its answer compares two or more numbers, and never as decoration.
- Each number comes from a ✅ or 🟡 Fact sheet, or from an own calculation on those numbers, labelled "conta nossa". The build fails when a number is not in the cited Fact sheet, and it recomputes each own calculation.
- In the diagram every arrow is a finding with Fact sheets. The stroke says whether a study tested the cause (solid), only found an association (dashed), or is our inference (marked).
- A Visual is data in the Question's file, and the server draws it as SVG inside the body's HTML: no JavaScript, light on a phone. The style is the zine's with an exact scale, as `DESIGN.md` says: precise axes and bars, hand-drawn touches only for the highlight, the arrow and the margin note.

## Why

One narrative can link the answers and carry the context a 300-word page had no room for. The Questions stay as files because the curator writes, verifies and links them one at a time, and their slugs are what the GoatCounter series and the old links already use. A fragment keeps each shared link landing on the answer it pointed to.

The Visuals obey the same rule as every claim on the site: a number reaches the page only from a verified Fact sheet. Checking it at build time keeps a chart from drifting away from its source when the Fact sheet changes, and drawing on the server keeps the page within the mobile target.

## Migration

The rollout goes Topic by Topic, starting with "Onde conhecer pessoas" as the pilot (#183); the other five wait for the user to approve it. Until each Topic's rewrite:

- "E no Brasil?" is optional in a Question file, but never empty. The last rewrite makes it required (`REQUIRED_SECTIONS` in `packages/content/src/items.ts`).
- A Question file may keep its own "## Limitações". The Guide shows it in its Limitations block, under the Question's title, after the Study groups of `_topic.md`. The rewrite moves each item to `_topic.md`, under the Study it is about.

## Consequences

- A link inside the app to a Question goes to `/$tema` with `hash` set to the slug; the `/$tema/$slug` route only redirects.
- A Question slug cannot be one of the page's own anchors (`RESERVED_ANCHORS` in `publication.ts`).
- The Confidence ceiling stays per Question, and the Limitations do not count as backing.
- The measurement of ADR 0033 opens the fixture Guide at `/onde-conhecer-pessoas`; the real Guides are longer and need their own measurement when each Topic is rewritten.
