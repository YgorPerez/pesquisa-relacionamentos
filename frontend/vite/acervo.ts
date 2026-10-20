// O acervo entra no app pelo módulo virtual `virtual:acervo`, montado no
// build pelo pacote de conteúdo. Conteúdo com erro derruba o build, com a
// lista inteira de problemas. Só o servidor importa o módulo (as funções de
// `src/conteudo/` e `src/server.ts`), então o texto das Fichas não vai para
// o bundle do navegador.
//
// No build do navegador, o plugin grava `sitemap.xml` e `robots.txt` na raiz
// do que vai para o `public` do servidor.
//
// `CONTEUDO_RAIZ` troca a raiz do repositório: o e2e constrói sobre a pasta
// de fixture `e2e/acervo`. `SITEMAP_ANTERIOR` é o caminho do `sitemap.xml`
// que está no ar, que o CI e o deploy baixam de temestudo.cloud antes do build:
// com ele, o build falha se um caminho publicado sumiu sem `antes`. As duas
// chegam aqui validadas por `vite/ambiente.ts`.
import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import {
  loadLibrary,
  formatProblems,
  readFiles,
  type Library,
} from '@tem-estudo/content'
import { robotsTxt, sitemapXml } from '@tem-estudo/content/search'
import type { Plugin } from 'vite-plus'

const ID = 'virtual:acervo'
const RESOLVIDO = `\0${ID}`

/** `raiz` e `anterior` vêm já validados (`vite/ambiente.ts`). */
export function acervo({
  raiz,
  anterior,
}: {
  raiz: string
  anterior: string | undefined
}): Plugin {
  let montado: Library | null = null

  const carregar = (
    avisar: (mensagem: string) => void,
    falhar: (mensagem: string) => never,
  ): Library => {
    const resultado = loadLibrary(
      raiz,
      anterior ? { previousSitemap: readFileSync(anterior, 'utf8') } : {},
    )
    for (const aviso of resultado.warnings) avisar(aviso.message)
    if (!resultado.ok) {
      falhar(
        `O conteúdo em ${relative(process.cwd(), raiz) || '.'} tem ${resultado.errors.length} erro(s):\n${formatProblems(resultado.errors)}`,
      )
    }
    return resultado.library
  }

  return {
    name: 'tem-estudo:acervo',
    resolveId(id) {
      return id === ID ? RESOLVIDO : undefined
    },
    load(id) {
      if (id !== RESOLVIDO) return undefined
      for (const arquivo of readFiles(raiz))
        this.addWatchFile(resolve(raiz, arquivo.path))
      montado = carregar(
        (m) => this.warn(m),
        (m) => this.error(m),
      )
      return `export default ${JSON.stringify(montado)}`
    },
    generateBundle() {
      if (this.environment.name !== 'client') return
      montado ??= carregar(
        (m) => this.warn(m),
        (m) => this.error(m),
      )
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapXml(montado),
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt(),
      })
    },
  }
}
