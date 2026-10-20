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
  carregarAcervo,
  formatarProblemas,
  lerArquivos,
  type Acervo,
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
  let montado: Acervo | null = null

  const carregar = (
    avisar: (mensagem: string) => void,
    falhar: (mensagem: string) => never,
  ): Acervo => {
    const resultado = carregarAcervo(
      raiz,
      anterior ? { sitemapAnterior: readFileSync(anterior, 'utf8') } : {},
    )
    for (const aviso of resultado.avisos) avisar(aviso.mensagem)
    if (!resultado.ok) {
      falhar(
        `O conteúdo em ${relative(process.cwd(), raiz) || '.'} tem ${resultado.erros.length} erro(s):\n${formatarProblemas(resultado.erros)}`,
      )
    }
    return resultado.acervo
  }

  return {
    name: 'tem-estudo:acervo',
    resolveId(id) {
      return id === ID ? RESOLVIDO : undefined
    },
    load(id) {
      if (id !== RESOLVIDO) return undefined
      for (const arquivo of lerArquivos(raiz))
        this.addWatchFile(resolve(raiz, arquivo.caminho))
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
