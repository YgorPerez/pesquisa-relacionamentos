import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { ORIGEM } from '@tem-estudo/conteudo/busca'
import type { ReactNode } from 'react'
import { Topo } from '#/ui/topo'
import { Rodape } from '#/ui/contagem'
import { useContarVisitas } from '#/analytics/contagem'
import bricolage from '../fontes/bricolage-grotesque-latin-wght-normal.woff2?url'
import atkinson from '../fontes/atkinson-hyperlegible-latin-400-normal.woff2?url'
import css from '../styles.css?url'

/** A prévia de link de qualquer página leva a imagem fixa do site
 * (`public/og.png`, gerada por `scripts/imagem-og.ts`). O Guia troca o
 * título e a descrição; a calculadora com estado, a prévia inteira (#34). */
const META_DO_SITE = [
  { charSet: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  { title: 'Tem estudo?' },
  {
    name: 'description',
    content:
      'Onde conhecer pessoas e como escolher parceiro, com o estudo de onde saiu cada resposta.',
  },
  { name: 'theme-color', content: '#f5f8f8' },
  { property: 'og:site_name', content: 'Tem estudo?' },
  { property: 'og:locale', content: 'pt_BR' },
  { property: 'og:type', content: 'website' },
  { property: 'og:image', content: `${ORIGEM}/og.png` },
  { property: 'og:image:width', content: '1200' },
  { property: 'og:image:height', content: '630' },
  {
    property: 'og:image:alt',
    content: 'Tem estudo? Dúvida de relacionamento, com a fonte junto.',
  },
  { name: 'twitter:card', content: 'summary_large_image' },
]

const LINKS_DO_SITE = [
  { rel: 'stylesheet', href: css },
  // O título e o corpo da primeira tela; o CSS só as pediria depois de chegar.
  {
    rel: 'preload',
    href: bricolage,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const,
  },
  {
    rel: 'preload',
    href: atkinson,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const,
  },
]

/** O caminho da página sem barra final: o do canonical. */
const semBarraFinal = (caminho: string) =>
  caminho.length > 1 ? caminho.replace(/\/+$/, '') : '/'

export const Route = createRootRoute({
  head: ({ matches }) => {
    const folha = matches[matches.length - 1]
    const canonico = `${ORIGEM}${semBarraFinal(folha?.pathname ?? '/')}`
    // A query guarda estado (o Perfil, a conta da calculadora): a URL com ela
    // fica fora da busca e aponta a sem query (#15).
    const comQuery = Object.keys(folha?.search ?? {}).length > 0
    return {
      meta: [
        ...META_DO_SITE,
        { property: 'og:url', content: canonico },
        ...(comQuery ? [{ name: 'robots', content: 'noindex' }] : []),
      ],
      links: [{ rel: 'canonical', href: canonico }, ...LINKS_DO_SITE],
    }
  },
  component: Raiz,
})

function Raiz() {
  useContarVisitas()
  return (
    <Documento>
      <Topo />
      <Outlet />
      <Rodape />
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
