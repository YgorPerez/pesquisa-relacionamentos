// Os dados de exemplo das stories do Guia, montados pela vista de verdade
// (`conteudo/vista-guia.ts`) sobre a fixture do e2e, que o Storybook carrega
// pelo `virtual:acervo` (`.storybook/vite.config.ts`).
import { guiaPorSlug } from '@tem-estudo/content/queries'
import acervo from 'virtual:acervo'
import { trechoComReferencias, vistaDoGuia } from '#/conteudo/vista-guia'

/** O Guia da fixture com Dicas, divergência e Mitos. */
export const GUIA = (() => {
  const achado = guiaPorSlug(acervo, 'onde-os-casais-se-conhecem')
  if (!achado)
    throw new Error('a fixture não tem o Guia onde-os-casais-se-conhecem')
  return vistaDoGuia(achado, acervo)
})()

/** O HTML de um parágrafo do Guia, como o servidor o monta do markdown. */
export const trecho = trechoComReferencias
