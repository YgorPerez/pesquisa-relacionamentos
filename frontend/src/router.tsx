import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { createQueryClient } from '#/content/reads'
import { routeTree } from './routeTree.gen'

// The server creates one router per request, each with its own
// `queryClient`. The integration sends the browser, along with the HTML, what
// the loaders read, and puts the `QueryClientProvider` around the app
// (ADR 0031).
export function getRouter() {
  const queryClient = createQueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
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
