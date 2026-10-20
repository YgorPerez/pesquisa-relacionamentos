// Opens an app screen by URL, with the real router (ADR 0035): the loader,
// `notFound` and the state saved on the device run as in the browser.
//
// The app root draws the whole document (`<html>`, the `<head>` with the
// stylesheets). In jsdom, the `<html>` inside the screen is badly nested
// HTML, and React would wait for the `load` of a stylesheet jsdom never
// loads. Here the root becomes only what sits in the `<body>`: the header,
// the page and the footer. The `<head>` (title, Open Graph, canonical) is
// the e2e's.
import {
  createMemoryHistory,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { getRouter } from '#/router'
import { Route as Root } from '#/routes/__root'
import { Footer } from '#/ui/counting'
import { Header } from '#/ui/header'

function RootBody() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

Root.update({ component: RootBody })

/** The site's router (`router.tsx`, with the `queryClient` and the Query
 * integration), each screen with its own, like each visit: what one read
 * does not leak into the next. Only the history becomes the memory one, at
 * the requested address. */
export function openScreen(url: string) {
  const router = getRouter()
  router.update({
    ...router.options,
    history: createMemoryHistory({ initialEntries: [url] }),
  })
  return { ...render(<RouterProvider router={router} />), router }
}
