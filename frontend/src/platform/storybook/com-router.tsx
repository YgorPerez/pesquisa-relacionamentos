// Um router em memória para a peça que usa `Link`: a story fica na raiz
// dele. Sem router, o `Link` do TanStack quebra (como no Festival). A story
// que precisa do estado da entrada do histórico (o "Voltar para <Pergunta>")
// o dá em `parameters.historico`.
import type { Decorator } from '@storybook/react-vite'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
  type HistoryState,
} from '@tanstack/react-router'
import { createContext, use, useState, type ReactNode } from 'react'

const Conteudo = createContext<ReactNode>(null)

function Raiz() {
  return use(Conteudo)
}

function ComRouter({
  children,
  historico,
}: {
  children: ReactNode
  historico: HistoryState | undefined
}) {
  const [router] = useState(() => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    if (historico) history.replace('/', historico)
    return createRouter({
      routeTree: createRootRoute({ component: Raiz }),
      history,
    })
  })
  return (
    <Conteudo value={children}>
      <RouterProvider router={router} />
    </Conteudo>
  )
}

export const comRouter: Decorator = (Story, { parameters }) => (
  <ComRouter historico={parameters.historico as HistoryState | undefined}>
    <Story />
  </ComRouter>
)
