# O `pnpm check` junta `vp check`, cobertura, fallow e React Doctor

Como no Festival (ADR-0017 e 0019 de lá), um comando faz todas as checagens estáticas, e o CI roda o mesmo. O `pnpm check` da raiz roda `vp check` (formato, lint e tipos), os testes de cada pacote com cobertura (`vp run -r test:coverage`), a fallow do app (`dead-code`, `dupes` e `health` com a cobertura) e o React Doctor com `--blocking warning`.

## Consequências

- A cobertura tem piso em cada pacote: o valor de quando ele entrou, arredondado para baixo. O piso sobe quando a cobertura sobe e nunca desce. O do app é baixo (12% das linhas) porque as telas são testadas pelo e2e e pelas stories, que não entram nessa conta.
- A `fallow health` falha abaixo de `--min-score 90`, o score de hoje, sem folga. O score depende do histórico do git, e o CI clona com `fetch-depth: 0`.
- O `.fallowrc.jsonc` só descreve o que o grafo estático não vê: o script que roda na mão e o `doctor.config.ts`. A fallow achou 28 exports e tipos sem uso e dois nomes de tipo repetidos, que perderam o `export`, e o `nitro` virou dependência de desenvolvimento (o build já o leva para dentro de `.output`).
- O React Doctor achou 14 pontos. Treze foram corrigidos. O que sobrou é o `Html` de `src/ui/guia.tsx`, que injeta o HTML que o servidor montou a partir do Markdown do acervo. Ele fica no `doctor.config.ts` como exceção presa ao arquivo, com o motivo, e espera uma pessoa ler, como na ADR-0036 do Festival.
