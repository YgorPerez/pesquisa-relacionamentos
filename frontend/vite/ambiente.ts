// As variáveis que o build lê, validadas uma vez quando o `vite.config.ts`
// carrega (ADR 0032): uma errada para o `vp dev` e o `vp build` antes de
// qualquer plugin, com o nome dela e o que se esperava.
//
// `VITE_CONTAR_EM_LOCALHOST` vai também para o bundle, onde
// `analytics/contagem.ts` a lê como texto: validá-la aqui vale para os dois.
import { resolve } from 'node:path'
import {
  arquivoOpcional,
  lerVariaveis,
  ligada,
  pasta,
} from '../../scripts/variaveis.ts'

const FRONTEND = resolve(import.meta.dirname, '..')

export interface AmbienteDoBuild {
  /** A raiz do acervo (`vite/acervo.ts`, `vite/grupo-possivel.ts`). */
  readonly raizDoConteudo: string
  /** O sitemap no ar, para o build conferir que nenhum caminho sumiu. */
  readonly sitemapAnterior: string | undefined
  /** Se o build conta visitas também em localhost (o do e2e). */
  readonly contarEmLocalhost: boolean
}

/** Lê o build de `fonte`. A `CONTEUDO_RAIZ` relativa parte de `frontend/`,
 * como o `playwright.config.ts` a passa; o `SITEMAP_ANTERIOR`, de `onde`, a
 * pasta em que o comando rodou. */
export function lerAmbienteDoBuild(
  fonte: Record<string, string | undefined>,
  onde = process.cwd(),
): AmbienteDoBuild {
  const lidas = lerVariaveis(
    {
      CONTEUDO_RAIZ: pasta(FRONTEND, '..'),
      SITEMAP_ANTERIOR: arquivoOpcional(onde),
      VITE_CONTAR_EM_LOCALHOST: ligada(false),
    },
    fonte,
  )
  return {
    raizDoConteudo: lidas.CONTEUDO_RAIZ,
    sitemapAnterior: lidas.SITEMAP_ANTERIOR,
    contarEmLocalhost: lidas.VITE_CONTAR_EM_LOCALHOST,
  }
}
