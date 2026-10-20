# Controls are Base UI, dressed by the shadcn components

As in Festival dos Macacos (`frontend/components.json` with the `base-nova` style), the site's controls are Base UI primitives, brought in by the shadcn CLI to `frontend/src/ui/shadcn/` and redrawn with the DESIGN.md tokens: `Button` (the `SiteButton`, `primary` and `light`, and the `arrow` shape of the link that looks like a button), `Toggle` (the top 3 chips), `RadioGroup` (the Profile options, the outcome selector and the Possible group options), `Checkbox`, `Switch` (the switch for not being counted), `Input` and `Collapsible` (the folds). The Possible group steppers are Base UI's `NumberField` used directly, since shadcn does not ship it. Base UI handles the keyboard, focus and ARIA; the accessibility e2e (axe) still passes.

The aliases are the Festival's: `@/ui`, `@/ui/shadcn` and `@/platform/cn`. `cn` comes from the `cn` package, with tables generated from `@theme` (`pnpm cn:tables`, checked by `cn.test.ts`), so it knows `text-label` is a size and not a color.

## Consequences

- What came from `base-nova` was replaced by the site's design; the CLI's file is only the starting point. A new shadcn component goes through the same redesign before it goes in.
- The site's icons are hand-drawn (DESIGN.md, Shapes): `lucide-react` does not go in, and `cohesion/hand-drawn-icons` rejects the import. The `iconLibrary` in `components.json` stays `lucide` because the CLI requires one.
- Tests find the pieces by role or by `data-slot` (`[data-slot="selo-voce"]`), as in shadcn, and not by class.
