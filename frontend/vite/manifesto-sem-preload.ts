// Tira os `modulepreload` do manifesto do TanStack Start (#59, ADR 0034), no
// molde do `manifesto-sem-preload.ts` do Festival dos Macacos. O Start põe no
// `<head>` um `modulepreload` para cada chunk que a rota importa, dez no
// início, pedidos no mesmo instante que o CSS e as fontes. No 4G lento eles
// dividem a banda com o que pinta a primeira tela. Sem eles, o navegador pede
// o CSS, as fontes e a entrada (o `<script>` do `<head>`), e acha o resto do
// JS lendo a entrada.
//
// O corte é no manifesto, e não no HTML: o servidor desenha o `<head>` com ele
// e manda o mesmo manifesto ao navegador, que desenha o `<head>` de novo ao
// hidratar. Tirar as tags só do HTML faria os dois divergirem.

import type { Plugin } from 'vite'

/** O id do módulo virtual do manifesto, em `@tanstack/start-server-core`. */
const MANIFESTO = '\0tanstack-start-manifest:v'
const EXPORTACAO = 'export const tsrStartManifest ='

export function manifestoSemPreload(): Plugin {
  return {
    name: 'manifesto-sem-preload',
    enforce: 'post',
    applyToEnvironment: (ambiente) => ambiente.name === 'ssr',
    transform: {
      filter: { id: /^\0tanstack-start-manifest:v$/ },
      handler(codigo, id) {
        if (id !== MANIFESTO) return
        // Um TanStack novo que gere o módulo de outro jeito para o build aqui,
        // e não volta a pôr os chunks no `<head>` calado.
        if (!codigo.includes(EXPORTACAO))
          throw new Error(
            `manifesto-sem-preload: o manifesto do Start não tem mais "${EXPORTACAO}". Confira o módulo ${MANIFESTO}.`,
          )
        return `${codigo.replace(EXPORTACAO, 'const manifestoInteiro =')}
export const tsrStartManifest = () => {
  const manifesto = manifestoInteiro()
  for (const rota of Object.values(manifesto.routes)) delete rota.preloads
  return manifesto
}`
      },
    },
  }
}
