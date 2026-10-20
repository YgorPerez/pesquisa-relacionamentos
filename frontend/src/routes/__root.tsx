import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { ORIGIN } from '@tem-estudo/content/search'
import type { ReactNode } from 'react'
import { Header } from '#/ui/header'
import { Footer } from '#/ui/counting'
import { BRAND_COLORS } from '#/ui/brand'
import { useCountVisits } from '#/analytics/counting'
import bricolage from '../fonts/bricolage-grotesque-latin-wght-normal.woff2?url'
import atkinson from '../fonts/atkinson-hyperlegible-latin-400-normal.woff2?url'
import css from '../styles.css?url'

/** Any page's link preview carries the site's fixed image
 * (`public/og.png`, made by `scripts/og-image.ts`). The Guide swaps the
 * title and the description; the calculator with state, the whole preview
 * (#34). */
const SITE_META = [
  { charSet: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  { title: 'Tem estudo?' },
  {
    name: 'description',
    content:
      'Onde conhecer pessoas e como escolher parceiro, com o estudo de onde saiu cada resposta.',
  },
  { name: 'theme-color', content: BRAND_COLORS.papel },
  { property: 'og:site_name', content: 'Tem estudo?' },
  { property: 'og:locale', content: 'pt_BR' },
  { property: 'og:type', content: 'website' },
  { property: 'og:image', content: `${ORIGIN}/og.png` },
  { property: 'og:image:width', content: '1200' },
  { property: 'og:image:height', content: '630' },
  {
    property: 'og:image:alt',
    content: 'Tem estudo? Dúvida de relacionamento, com a fonte junto.',
  },
  { name: 'twitter:card', content: 'summary_large_image' },
]

const SITE_LINKS = [
  { rel: 'stylesheet', href: css },
  // The brand's icons and manifest (`scripts/brand-icons.ts`): the tab, the
  // iPhone home screen, which does not read the manifest, and Android's.
  { rel: 'icon', href: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
  { rel: 'apple-touch-icon', href: '/icone-180.png' },
  { rel: 'manifest', href: '/manifest.webmanifest' },
  // The first screen's title and body fonts; the CSS would only request them
  // after it arrives.
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

/** The page path without a trailing slash: the canonical one. */
const withoutTrailingSlash = (path: string) =>
  path.length > 1 ? path.replace(/\/+$/, '') : '/'

/** What every loader receives: the reads' `queryClient`
 * (`content/reads.ts`). */
interface RouterContext {
  readonly queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: ({ matches }) => {
    const leaf = matches[matches.length - 1]
    const canonical = `${ORIGIN}${withoutTrailingSlash(leaf?.pathname ?? '/')}`
    // The query keeps state (the Profile, the calculator's count): the URL
    // with it stays out of search and points to the one without query (#15).
    const withQuery = Object.keys(leaf?.search ?? {}).length > 0
    return {
      meta: [
        ...SITE_META,
        { property: 'og:url', content: canonical },
        ...(withQuery ? [{ name: 'robots', content: 'noindex' }] : []),
      ],
      links: [{ rel: 'canonical', href: canonical }, ...SITE_LINKS],
    }
  },
  component: Root,
})

function Root() {
  useCountVisits()
  return (
    <Document>
      <Header />
      <Outlet />
      <Footer />
    </Document>
  )
}

function Document({ children }: { children: ReactNode }) {
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
