# Pages read the library through TanStack Query, with SSR

As in the Festival dos Macacos (`frontend/src/router.tsx`, `platform/leituras.ts`), each server function a page reads has a read in `src/content/reads.ts`. The loader requests it with `context.queryClient.query(...)` and the screen reads it with `useSuspenseQuery(...)`. `router.tsx` creates one `QueryClient` per router (the server creates one per request, so what one visitor read does not leak to another) and wires up `setupRouterSsrQueryIntegration` from `@tanstack/react-router-ssr-query`. With that, what the server read goes along with the HTML, and hydration requests nothing new.

Unlike the Festival, every read is `staleTime: 'static'`. The library goes into the build (`vite/library.ts`) and only changes on the next deploy. Before, going back to a page already seen requested the data again, because the router considers the loader stale right after it runs; now it comes from the cache.

## Consequences

- The loader returns only what the `head` and the header read (`search`, `topic`, `topicTitle`, the link preview). The whole view goes through the `queryClient`; if the loader returned it too, it would go twice into the HTML.
- A new read: one entry in `reads`, the loader requests it, the screen reads it. `e2e/reads.e2e.ts` fails if a page requests a server function while hydrating.
- State from outside React still goes through `useSyncExternalStore` (`state/`), not through a query: the React Compiler breaks the direct read (ADR 0003).
