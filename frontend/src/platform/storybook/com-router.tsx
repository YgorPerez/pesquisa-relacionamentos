// Um router em memória para a peça que usa `Link`: a story fica na raiz
// dele. Sem router, o `Link` do TanStack quebra (como no Festival).
import type { Decorator } from '@storybook/react-vite'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { createContext, use, useState, type ReactNode } from 'react'

const Conteudo = createContext<ReactNode>(null)

function Raiz() {
  return use(Conteudo)
}

function ComRouter({ children }: { children: ReactNode }) {
  const [router] = useState(() =>
    createRouter({
      routeTree: createRootRoute({ component: Raiz }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    }),
  )
  return (
    <Conteudo value={children}>
      <RouterProvider router={router} />
    </Conteudo>
  )
}

export const comRouter: Decorator = (Story) => (
  <ComRouter>
    <Story />
  </ComRouter>
)
