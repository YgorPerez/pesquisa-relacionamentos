import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Topo } from '#/ui/topo'
import bricolage from '../fontes/bricolage-grotesque-latin-wght-normal.woff2?url'
import atkinson from '../fontes/atkinson-hyperlegible-latin-400-normal.woff2?url'
import css from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Tem estudo?' },
      {
        name: 'description',
        content:
          'Onde conhecer pessoas e como escolher parceiro, com o estudo de onde saiu cada resposta.',
      },
      { name: 'theme-color', content: '#f5f8f8' },
    ],
    links: [
      { rel: 'stylesheet', href: css },
      // O título e o corpo da primeira tela; o CSS só as pediria depois de chegar.
      { rel: 'preload', href: bricolage, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'preload', href: atkinson, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    ],
  }),
  component: Raiz,
})

function Raiz() {
  return (
    <Documento>
      <Topo />
      <Outlet />
    </Documento>
  )
}

function Documento({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
