// The brand outside the CSS: what the `<head>` and the site icons need to
// know without reading the Tailwind theme. The browser's `theme-color`, the
// manifest and the icons (`scripts/brand-icons.ts`) read from here. The
// colors are DESIGN.md's, and `brand.test.ts` checks they still are.

const SITE_NAME = 'Tem estudo?'

/** The DESIGN.md colors the brand uses outside the CSS. */
export const BRAND_COLORS = {
  papel: '#f5f8f8',
  folha: '#fcfdfd',
  tinta: '#1a1c1c',
  'amarelo-voce': '#ecd36f',
} as const

/** The icons the script writes to `public/`: the tab's, the iPhone home
 * screen's (which does not read the manifest) and the manifest's. The file
 * names are public URLs. */
export const SITE_ICONS = [
  { file: 'favicon-32.png', size: 32 },
  { file: 'icone-180.png', size: 180 },
  { file: 'icone-192.png', size: 192 },
  { file: 'icone-512.png', size: 512 },
] as const

/** The manifest, so the phone puts the site on the home screen with the
 * right name and icon. It is not an app: it opens in the browser, with no
 * service worker. */
export function manifest() {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    lang: 'pt-BR',
    start_url: '/',
    display: 'browser',
    background_color: BRAND_COLORS.papel,
    theme_color: BRAND_COLORS.papel,
    icons: SITE_ICONS.filter(({ size }) => size >= 192).map(
      ({ file, size }) => ({
        src: `/${file}`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any',
      }),
    ),
  }
}
