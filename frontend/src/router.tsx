import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// O servidor cria um router por pedido.
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
