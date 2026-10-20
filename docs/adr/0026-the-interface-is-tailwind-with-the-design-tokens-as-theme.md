# The interface is Tailwind, with the DESIGN.md tokens as the theme

As in Festival dos Macacos, the site is styled with Tailwind v4 classes on the component itself, not with one `.css` file per piece. The theme is the YAML header of `DESIGN.md`: `frontend/src/ui/tokens.css` is an `@theme static` with `--color-papel`, `--radius-mao`, `--spacing-md`, `--font-label` and `--text-label` (with the type's line height, weight and letter spacing), and `tokens.test.ts` checks each one. The Tailwind scales that DESIGN.md does not have (colors, fonts, font sizes) are dropped with `initial`, and `bg-red-500` does not exist here.

Unlike the Festival, Tailwind comes in without the preflight. The preflight resets the browser's margins, lists and headings, and the site's base has always been the browser's, with the touch-ups in `styles.css`; with it, every page would change. That is why a border on one side only uses `fio-pontilhado` and `fio-tracejado`: `border-dotted` puts the style on all four sides, and without the preflight the side with no width would get the browser's `medium` width.

What Tailwind does not cover lives in `ui/drawings.css`, with the reason for each block: the hand-drawn SVG drawings (the halftone, the ruler, the highlighter, the reference ring, the Myth's strike), the HTML that comes out of the library's Markdown, which has no `className` (`.prosa`, `.ref`, `.nw`, `.numero-chave`, `.marca-texto`, the closed list in `content/safe-html.ts`), and the animation of the loop around the Fact sheet.

## Consequences

- Tailwind's `hover:` only applies where there is a mouse; the site redefines the variant so it applies on touch too, as the CSS did before.
- Focus (`:focus-visible`) sits in the utilities layer, after them: it beats a class of the same weight and loses to `focus:outline-none`, as before.
- The migration did not change the look: the before and after captures of the pages on mobile and desktop match pixel for pixel, except for 7 pixels of a dotted line in the Possible group after changing the Requirements, 3 color levels apart.
