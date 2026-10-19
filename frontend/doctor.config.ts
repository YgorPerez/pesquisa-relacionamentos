// As exceções do React Doctor, cada uma presa aos arquivos listados e com o
// motivo, como no Festival dos Macacos (ADR 0005). Um arquivo novo que caia
// numa destas regras falha o gate como qualquer outro. Uma exceção nova
// espera uma pessoa ler (ADR 0036 do Festival).

import { defineConfig } from 'react-doctor/api'

export default defineConfig({
  ignore: {
    // O build não é código-fonte, e o e2e o refaz enquanto o doctor roda.
    files: ['.output/**', 'storybook-static/**'],
    overrides: [
      {
        // O `Html` é o único lugar do app que injeta HTML: o que o servidor
        // montou com o `marked` a partir do Markdown do acervo (`estudos/`,
        // `dicas/`, os Guias), que está no repositório e passa por revisão.
        // Nada que o visitante digita ou que vem na URL chega aqui.
        rules: ['react-doctor/dangerous-html-sink'],
        files: ['src/ui/guia.tsx'],
      },
    ],
  },
})
