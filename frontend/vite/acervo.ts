// O acervo entra no app pelo módulo virtual `virtual:acervo`, montado no
// build pelo pacote de conteúdo. Conteúdo com erro derruba o build, com a
// lista inteira de problemas. Só o servidor importa o módulo (as funções de
// `src/conteudo/`), então o texto das Fichas não vai para o bundle do
// navegador.
//
// `CONTEUDO_RAIZ` troca a raiz do repositório: o e2e constrói sobre a pasta
// de fixture `e2e/acervo`.
import { relative, resolve } from 'node:path'
import { carregarAcervo, formatarProblemas, lerArquivos } from '@tem-estudo/conteudo'
import type { Plugin } from 'vite'

const ID = 'virtual:acervo'
const RESOLVIDO = `\0${ID}`

export function acervo(): Plugin {
  const raiz = resolve(import.meta.dirname, '..', process.env.CONTEUDO_RAIZ ?? '..')
  return {
    name: 'tem-estudo:acervo',
    resolveId(id) {
      return id === ID ? RESOLVIDO : undefined
    },
    load(id) {
      if (id !== RESOLVIDO) return undefined
      for (const arquivo of lerArquivos(raiz)) this.addWatchFile(resolve(raiz, arquivo.caminho))
      const resultado = carregarAcervo(raiz)
      for (const aviso of resultado.avisos) this.warn(aviso.mensagem)
      if (!resultado.ok) {
        this.error(
          `O conteúdo em ${relative(process.cwd(), raiz) || '.'} tem ${resultado.erros.length} erro(s):\n${formatarProblemas(resultado.erros)}`,
        )
      }
      return `export default ${JSON.stringify(resultado.acervo)}`
    },
  }
}
