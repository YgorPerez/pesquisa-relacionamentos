import { resolve } from 'node:path'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'
import { acervo } from '../vite/acervo.ts'
import { grupoPossivel } from '../vite/grupo-possivel.ts'

/** O conteúdo das stories: a fixture do e2e, com uma Ficha de cada Status e
 * os dados do Acre. A story mostra sempre o mesmo, e o teste dela também. */
const CONTEUDO = resolve(import.meta.dirname, '..', 'e2e', 'acervo')

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // No site, a vista do Guia só se monta no servidor; aqui a story a monta no
  // navegador, e o `xss` dela é CommonJS: o Vite o empacota antes, ou o
  // import com nome falha.
  optimizeDeps: { include: ['xss'] },
  plugins: [
    tailwindcss(),
    viteReact(),
    // O React Compiler também, para a story renderizar como o site renderiza
    // (ADR 0003).
    babel({ presets: [reactCompilerPreset()] }),
    // O acervo e os pacotes do Grupo possível, como no app: a story de uma
    // peça do Guia monta a vista de um Guia da fixture, e a do cartão do
    // Grupo possível baixa os pacotes que o plugin serve.
    acervo({ raiz: CONTEUDO, anterior: undefined }),
    grupoPossivel({ raiz: CONTEUDO }),
  ],
})
