# O `pnpm check` junta `vp check`, cobertura, fallow e React Doctor

Como no Festival (ADR-0017 e 0019 de lá), um comando faz todas as checagens estáticas, e o CI roda o mesmo. O `pnpm check` da raiz roda `vp check` (formato, lint e tipos), os testes de cada pacote com cobertura (`vp run -r test:coverage`), a fallow do app (`dead-code`, `dupes` e `health` com a cobertura) e o React Doctor com `--blocking warning`.

## Consequências

- A cobertura tem piso em cada pacote: o valor medido, arredondado para baixo. O piso sobe quando a cobertura sobe e nunca desce. O do app conta a lógica e os testes de tela no jsdom (ADR 0035). Com eles, subiu de 12% para 62% das linhas. O e2e e as stories continuam fora dessa conta.
- A `fallow health` falha abaixo de `--min-score 90`, o score de hoje, sem folga. O score depende do histórico do git, e o CI clona com `fetch-depth: 0`.
- O `.fallowrc.jsonc` só descreve o que o grafo estático não vê. São os scripts que rodam na mão (a imagem do Open Graph, os ícones da marca, a captura de tela), o `doctor.config.ts` e o servidor falso dos testes de tela, que entra por alias. Também tira do `dupes` o `routeTree.gen.ts`, que o gerador reescreve a cada build. Nada ali afrouxa um limite. A fallow achou 28 exports e tipos sem uso e dois nomes de tipo repetidos, que perderam o `export`, e o `nitro` virou dependência de desenvolvimento (o build já o leva para dentro de `.output`).
- O React Doctor achou 14 pontos. Treze foram corrigidos. O que sobrou é o `Html` de `src/ui/guia.tsx`, que injeta o HTML que o servidor montou a partir do Markdown do acervo. Ele é o único lugar que injeta HTML e só aceita o tipo `HtmlSeguro`, que só sai do filtro de `src/conteudo/html-seguro.ts`. Ele fica no `doctor.config.ts` como exceção presa ao arquivo, com o motivo, e espera uma pessoa ler, como na ADR-0036 do Festival.
