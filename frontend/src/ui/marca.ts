// A marca fora do CSS: o que o `<head>` e os ícones do site precisam saber
// sem ler o tema do Tailwind. A `theme-color` do navegador, o manifesto e
// os ícones (`scripts/icones-da-marca.ts`) leem daqui. As cores são as do
// DESIGN.md, e o `marca.test.ts` confere que continuam sendo.

const NOME_DO_SITE = 'Tem estudo?'

/** As cores do DESIGN.md que a marca usa fora do CSS. */
export const CORES_DA_MARCA = {
  papel: '#f5f8f8',
  folha: '#fcfdfd',
  tinta: '#1a1c1c',
  'amarelo-voce': '#ecd36f',
} as const

/** Os ícones que o script grava em `public/`: o da aba, o da tela de início
 * do iPhone (que não lê o manifesto) e os do manifesto. */
export const ICONES_DO_SITE = [
  { arquivo: 'favicon-32.png', lado: 32 },
  { arquivo: 'icone-180.png', lado: 180 },
  { arquivo: 'icone-192.png', lado: 192 },
  { arquivo: 'icone-512.png', lado: 512 },
] as const

/** O manifesto, para o celular pôr o site na tela de início com o nome e o
 * ícone certos. Não é app: abre no navegador, sem service worker. */
export function manifesto() {
  return {
    name: NOME_DO_SITE,
    short_name: NOME_DO_SITE,
    lang: 'pt-BR',
    start_url: '/',
    display: 'browser',
    background_color: CORES_DA_MARCA.papel,
    theme_color: CORES_DA_MARCA.papel,
    icons: ICONES_DO_SITE.filter(({ lado }) => lado >= 192).map(
      ({ arquivo, lado }) => ({
        src: `/${arquivo}`,
        sizes: `${lado}x${lado}`,
        type: 'image/png',
        purpose: 'any',
      }),
    ),
  }
}
