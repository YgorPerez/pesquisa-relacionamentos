import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { createQueryClient } from '#/content/reads'
import { routeTree } from './routeTree.gen'

/** The document opened on a Text Fragment (`#…:~:text=`). The browser
 * strips the directive from `location`; only the navigation entry keeps
 * it. */
function openedOnText(): boolean {
  const [entry] = performance.getEntriesByType('navigation')
  return entry?.name.includes(':~:') ?? false
}

// The server creates one router per request, each with its own
// `queryClient`. The integration sends the browser, along with the HTML, what
// the loaders read, and puts the `QueryClientProvider` around the app
// (ADR 0031).
export function getRouter() {
  const queryClient = createQueryClient()
  let firstRender = true
  const router = createRouter({
    routeTree,
    context: { queryClient },
    // On the first render after a page opened on a Text Fragment (the
    // site search's links, #275), the browser has already scrolled to the
    // sentence, and the router would take the page back to the top or to
    // the anchor. Every later navigation restores as usual.
    scrollRestoration: () => {
      const skip = firstRender && openedOnText()
      firstRender = false
      return !skip
    },
    defaultPreload: 'intent',
  })
  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
