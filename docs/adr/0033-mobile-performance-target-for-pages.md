# Mobile performance target for pages

Each of the five pages (home, Guide, Fact sheet, Possible group, Priorities) has a target in `frontend/scripts/measure-pages-meta.ts`, and `pnpm --filter frontend measure` measures against it. The target is the median of five loads in a clean Chrome, with Lighthouse mobile's screen, network and CPU (slow 4G: 562.5 ms per request, 1.6 Mbps, CPU 4× slower):

- LCP ≤ 2.5 s and INP ≤ 200 ms, the Core Web Vitals "good". The INP comes from a tap right after `load`, when the page may still be hydrating.
- CSS ≤ 15 KB and JS per page, gzipped: home 200 KB, Guide 260, Fact sheet 210, Possible group 250, Priorities 240. These are the values measured in #59 with about 15% headroom, so that a chunk that bloats the page fails the measurement. Whoever raises a ceiling says why in the PR.

The measurement runs in Playwright, without Lighthouse: the four numbers come from Chrome itself (`PerformanceObserver` and the CDP network events), and the same measurement serves the local `pnpm start` and the live site (`--site`). On localhost, a proxy compresses like the VPS's Nginx, reading the `gzip_types` from `nginx/temestudo.conf`: the app server does not compress, and without the proxy the measurement would weigh the raw JS. Local serves over HTTP/1.1 and the VPS over HTTP/2, so local is a bit slower than the site.

## Before and after

e2e build (fixture), median of 5. Before: the tip of `spec/23-mvp` at 50f0f48. After: JS gzip in Nginx and the manifest without preload (ADR 0034), on top of the tip with #56.

| Page           | JS before → after | LCP before → after | INP before → after |
| -------------- | ----------------- | ------------------ | ------------------ |
| home           | 420 → 173 KB      | 1.53 → 1.49 s      | 40 → 48 ms         |
| Guide          | 546 → 226 KB      | 1.59 → 1.49 s      | 184 → 32 ms        |
| Fact sheet     | 441 → 182 KB      | 1.53 → 1.51 s      | 40 → 40 ms         |
| Possible group | 530 → 220 KB      | 1.52 → 1.48 s      | 112 → 32 ms        |
| Priorities     | 494 → 205 KB      | 1.53 → 1.50 s      | 48 → 48 ms         |

The CSS stayed at 10 KB. Most of the gain came from Nginx: the app sends JS as `text/javascript`, and `gzip_types` only listed `application/javascript`, so the JS arrived raw. With the real library, home, the Fact sheet and Possible group give the same numbers; the library has no Guide yet.

## Consequences

- The measurement does not run in CI: it takes minutes and varies with the machine. Run it in the PR that changes a page's JS, or the `<head>`, and paste the table.
- A new page goes into `pages()` with its target.
