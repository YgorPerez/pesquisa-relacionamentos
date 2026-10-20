# `pnpm check` joins `vp check`, coverage, fallow and React Doctor

As in the Festival (its ADR-0017 and 0019), one command runs every static check, and CI runs the same one. The root `pnpm check` runs `vp check` (format, lint and types), each package's tests with coverage (`vp run -r test:coverage`), fallow on the app (`dead-code`, `dupes` and `health` with coverage) and React Doctor with `--blocking warning`.

## Consequences

- Coverage has a floor in each package: the measured value, rounded down. The floor rises when coverage rises and never goes down. The app's floor counts the logic and the screen tests in jsdom (ADR 0035). With them, it rose from 12% to 62% of lines. e2e and the stories stay out of that count.
- `fallow health` fails below `--min-score 90`, today's score, with no slack. The score depends on git history, and CI clones with `fetch-depth: 0`.
- `.fallowrc.jsonc` only describes what the static graph does not see. Those are the scripts run by hand (the Open Graph image, the brand icons, the screenshot), `doctor.config.ts` and the screen tests' fake server, which comes in through an alias. It also takes `routeTree.gen.ts`, which the generator rewrites on every build, out of `dupes`. Nothing there loosens a limit. fallow found 28 unused exports and types and two repeated type names, which lost their `export`, and `nitro` became a dev dependency (the build already bundles it into `.output`).
- React Doctor found 14 spots. Thirteen were fixed. What remains is the `Html` in `src/ui/guide.tsx`, which injects the HTML the server built from the library's Markdown. It is the only place that injects HTML and only accepts the `SafeHtml` type, which only comes out of the filter in `src/content/safe-html.ts`. It stays in `doctor.config.ts` as an exception tied to the file, with the reason, and waits for a person to read it, as in the Festival's ADR-0036.
