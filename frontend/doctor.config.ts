// As exceções do React Doctor, cada uma presa aos arquivos listados e com o
// motivo, como no Festival dos Macacos (ADR 0005). Um arquivo novo que caia
// numa destas regras falha o gate como qualquer outro. Uma exceção nova
// espera uma pessoa ler, como uma supressão (ADR 0017 daqui, que veio da
// ADR-0036 do Festival:
// https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0036-a-new-suppression-waits-for-a-person.md).

import { defineConfig } from 'react-doctor/api'

export default defineConfig({
  ignore: {
    // O build não é código-fonte, e o e2e o refaz enquanto o doctor roda.
    files: ['.output/**', 'storybook-static/**'],
    overrides: [
      {
        // O `Html` é o único lugar do app que injeta HTML: o que o servidor
        // montou com o `marked` a partir do Markdown do acervo (`estudos/`,
        // `dicas/`, os Guias). A entrada é sanitizada em
        // `src/conteudo/html-seguro.ts`, por onde passam o `html` e o
        // `htmlEmLinha` de `src/conteudo/vista.ts`: lista fechada de tags e
        // atributos, `href` só http(s), âncora ou caminho relativo. Nada que
        // o visitante digita ou que vem na URL chega aqui.
        rules: ['react-doctor/dangerous-html-sink'],
        files: ['src/ui/guia.tsx'],
      },
    ],
  },
})
