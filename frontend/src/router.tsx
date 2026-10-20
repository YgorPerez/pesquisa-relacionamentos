import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { criarQueryClient } from '#/conteudo/leituras'
import { routeTree } from './routeTree.gen'

// O servidor cria um router por pedido, e cada um tem o seu `queryClient`.
// A integração manda ao navegador, junto do HTML, o que os loaders leram, e
// põe o `QueryClientProvider` em volta do app (ADR 0031).
export function getRouter() {
  const queryClient = criarQueryClient()
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
