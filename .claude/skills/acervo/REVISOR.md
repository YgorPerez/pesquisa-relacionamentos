# Revisar um PR de acervo

O revisor é outra sessão, nunca a que escreveu o PR. Ele faz o merge sozinho do que passa em tudo abaixo, pede mudança no que falha e entrega ao humano só a dúvida ética. Um item que você não conseguiu conferir conta como falha.

1. **Pegar o PR.** `gh pr checkout <pr>` e `gh pr view <pr> --comments`. O PR fecha uma issue `acervo` e mexe só em `estudos/`, `relatorios/`, `fontes/` e `scripts/calculations/`. Um PR que toca Guia ou Dica volta ao autor.

2. **Fonte local.** A Fonte de cada Ficha nova ou refeita está em `fontes/<slug>.*` ou em `fontes/privado/<slug>.*`. Se a privada não está na sua máquina, baixe da URL do corpo do PR para `fontes/privado/`. Em `fontes/`, confirme na página do editor que a licença é aberta e que o campo `licenca` a registra; sem licença aberta, o arquivo vai para `fontes/privado/`.

3. **Conferência.** Leia cada script de `scripts/calculations/` do PR antes de rodar, porque o `pnpm verify` executa esses scripts. Depois rode `pnpm verify estudos/<slug>.md` para cada Ficha, mais `pnpm build` e `pnpm test`. Qualquer saída diferente de 0 bloqueia o merge: `gh pr review <pr> --request-changes` com a saída colada.

4. **Força.** A `forca` bate com a rubrica do `README.md`, e `forca_porque` dá o motivo que a rubrica pede: amostra pequena, comercial ou com conflito é fraca, mesmo com número bonito.

5. **Limitações e conflito.** `## Limitações` traz as que o artigo declara e as óbvias do desenho (autorrelato, transversal, painel com cotas). `conflito` diz quem financiou e os vínculos dos autores, conferidos na seção de financiamento da Fonte local.

6. **Sentido.** O script confere o número, não o que ele quer dizer. Abra a Fonte local no Onde de cada linha e veja se a Medida descreve o que o Trecho mede, com a mesma população e o mesmo período. `paises`, `periodo`, `amostra` e `cobre` batem com os métodos.

7. **Guias.** Num PR de Guia, toda frase factual da prosa cita uma Ficha e diz o que a Ficha diz: "maioria" quando a Ficha diz 39% barra o merge.

8. **Linha ética.** Evidência, nunca tática para pressionar, enganar ou explorar alguém. Qualquer dúvida aqui: sem merge, comente o que levantou a dúvida e `gh pr edit <pr> --add-label ready-for-human`.

9. **Merge.** Tudo passou: `gh pr merge <pr> --squash --delete-branch`. A issue fecha pelo `Closes #<n>` do PR.
