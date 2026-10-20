// An in-memory router for the piece that uses `Link`: the story sits at its
// root. Without a router, TanStack's `Link` breaks (as in the Festival). The
// story that needs the history entry's state (the "Voltar para <Pergunta>")
// gives it in `parameters.history`.
import type { Decorator } from '@storybook/react-vite'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
  type HistoryState,
} from '@tanstack/react-router'
import { createContext, use, useState, type ReactNode } from 'react'

const Content = createContext<ReactNode>(null)

function Root() {
  return use(Content)
}

function WithRouter({
  children,
  historyState,
}: {
  children: ReactNode
  historyState: HistoryState | undefined
}) {
  const [router] = useState(() => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    if (historyState) history.replace('/', historyState)
    return createRouter({
      routeTree: createRootRoute({ component: Root }),
      history,
    })
  })
  return (
    <Content value={children}>
      <RouterProvider router={router} />
    </Content>
  )
}

export const withRouter: Decorator = (Story, { parameters }) => (
  <WithRouter historyState={parameters.history as HistoryState | undefined}>
    <Story />
  </WithRouter>
)
