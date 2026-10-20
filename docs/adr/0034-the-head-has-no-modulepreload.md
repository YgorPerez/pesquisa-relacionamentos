# The `<head>` has no `modulepreload`

TanStack Start puts a `modulepreload` in the `<head>` for each chunk the route imports: ten on the home page. They go out at the same instant as the CSS and the two first-screen fonts, and on slow 4G they share the bandwidth with them. The `frontend/vite/manifest-without-preload.ts` plugin, copied from the Festival dos Macacos, deletes the `preloads` of every route in Start's manifest. The browser requests the CSS, the fonts and the entry (the `<script>` in the `<head>`), and finds the rest of the JS by reading the entry.

The cut is in the manifest, not in the HTML: the server renders the `<head>` from it and sends it to the browser, which renders the `<head>` again when hydrating. Removing the tags only from the HTML would make the two diverge.

## Consequences

- In #59, LCP dropped about 40 ms on every page (ADR 0033). The JS arrives a little after the first paint, which is the goal.
- A TanStack version that generates the manifest module differently breaks the build, with the module name in the error, instead of silently putting the chunks back in the `<head>`.
