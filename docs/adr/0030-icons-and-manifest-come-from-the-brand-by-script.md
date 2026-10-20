# Icons and manifest come from the brand by script

As in the Festival dos Macacos (`frontend/scripts/brand-icons.ts`), the site's icons are drawn by a script from the brand, not by hand in an editor. `node frontend/scripts/brand-icons.ts` draws in Chrome the "?" of the title in Bricolage over the yellow highlighter, on the paper, and writes to `frontend/public/` the `favicon-32.png`, the `icone-180.png` (for the iPhone, which does not read the manifest), the 192 and 512px ones and the `manifest.webmanifest`. The colors, sizes and manifest come from `src/ui/brand.ts`, which `brand.test.ts` checks against DESIGN.md and against what is in `public/`. The `<head>` links all three (`__root.tsx`), and the `theme-color` also reads from `brand.ts`.

## Consequences

- The manifest does not make the site an app: `display: browser`, no service worker (spec #23 leaves the PWA out).
- If the brand changes, run the script again; the test fails if the written manifest is not the one from `brand.ts`.
