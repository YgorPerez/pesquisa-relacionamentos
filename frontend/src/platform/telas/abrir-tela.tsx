// Abre uma tela do app pela URL, com o router de verdade (ADR 0035): o
// loader, o `notFound` e o estado salvo no aparelho rodam como no navegador.
//
// A raiz do app desenha o documento inteiro (`<html>`, o `<head>` com as
// folhas de estilo). No jsdom, o `<html>` dentro da tela é HTML mal aninhado,
// e o React esperaria o `load` de uma folha que o jsdom nunca carrega. Aqui a
// raiz vira só o que fica no `<body>`: o topo, a página e o rodapé. O
// `<head>` (título, Open Graph, canonical) é do e2e.
import {
  createMemoryHistory,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { getRouter } from '#/router'
import { Route as Raiz } from '#/routes/__root'
import { Rodape } from '#/ui/contagem'
import { Topo } from '#/ui/topo'

function CorpoDaRaiz() {
  return (
    <>
      <Topo />
      <Outlet />
      <Rodape />
    </>
  )
}

Raiz.update({ component: CorpoDaRaiz })

/** O router do site (`router.tsx`, com o `queryClient` e a integração do
 * Query), cada tela com o seu, como cada visita: o que uma leu não vaza para
 * a próxima. Só o histórico vira o da memória, no endereço pedido. */
export function abrirTela(url: string) {
  const router = getRouter()
  router.update({
    ...router.options,
    history: createMemoryHistory({ initialEntries: [url] }),
  })
  return { ...render(<RouterProvider router={router} />), router }
}
