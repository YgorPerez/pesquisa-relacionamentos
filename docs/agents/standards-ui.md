# Padrões de interface do front

Como o front monta a interface. Siga ao escrever uma tela e confira a mudança contra isto ao revisar (a skill `code-review` lê este arquivo como fonte de padrões). Adaptado do `standards-ui.md` do Festival dos Macacos, que veio do revisor `ui-consistency` do t3code.

O lint já recusa o `localStorage` fora do `armazenado()` (`estado/localstorage-pelo-armazenado`), e o `tokens.test.ts` confere cada token contra o `DESIGN.md`. Não repita esses achados: procure o que uma regra de lint não vê.

Ao revisar, olhe só as linhas que a mudança tocou. Não builde o projeto nem peça captura. Se o diff não deixa a violação óbvia, não há achado.

## 1. A peça compartilhada, não uma cópia dela

As peças do site moram em `frontend/src/ui/`: `Botao` (variantes `principal` e `leve`), `Degraus` e `DegrausCheios`, `StatusDeVerificacao`, `ForcaDaEvidencia` e `SeloVoce`, `FichasCitadas`, a `Faixa` do Grupo possível, o `Rodape`.

- Aponte um `<button>`, `<input>` ou `<select>` cru com cara de controle quando a peça existe.
- Um visual que o `DESIGN.md` nomeia (o bloco "Components") é uma variante da peça, como o `Botao` faz com `principal` e `leve`. Aponte o mesmo visual escrito à mão na chamada. A correção é uma variante.
- Não aponte o elemento cru que de propósito não é controle: um `<summary>`, a referência numerada (`.ref`), uma linha de tabela do acervo.

## 2. Os tokens do DESIGN.md, não um valor solto

- Uma cor, um raio, um espaço ou uma fonte vem de uma variável de `ui/tokens.css` (`--cor-*`, `--raio-*`, `--espaco-*`, `--tipo-*`). Aponte um hex, um `rgb()` ou um tamanho fixo novo no CSS de uma peça.
- Um valor novo ganha nome no YAML do `DESIGN.md` e em `tokens.css` na mesma mudança, nunca um valor de uma vez só.
- Aponte um `style={{ ... }}` novo com um valor fixo. Um valor calculado em tempo de execução (a largura do laço da Ficha circulada, por exemplo) pode.

## 3. O CSS no dono

- O estilo de uma peça vai no `.css` dela, ao lado do `.tsx` (`ui/perfil.css` com `ui/perfil.tsx`). Aponte uma regra nova em `styles.css` ou em `componentes.css` para algo que só uma peça renderiza.
- `styles.css` e `ui/componentes.css` ficam com o que vale para o site todo: a base do documento, as fontes, as classes que várias peças dividem (`.com-reticula`, `.botao`).

## 4. Composto, não copiado

- Aponte uma peça nova que copia um pedaço do markup e das classes de outra em vez de compô-la ou estendê-la.
- Aponte uma lista longa de classes que repete o tratamento de outra chamada. A correção é uma variante ou uma peça menor compartilhada.

## 5. Texto e estado

- Um `.tsx` de `ui/` exporta só componente. Os textos que a peça e o teste dividem moram em `ui/<peça>.textos.ts`, e um exemplo de dados em `ui/<peça>.exemplo.ts`.
- O estado que fica no aparelho é uma chamada nova de `armazenado('<chave>', validar)` (`estado/armazenado.ts`), lida com `useArmazenado`. Aponte um estado de fora do React lido no render sem `useSyncExternalStore`: o React Compiler o congela (ADR 0003).

## Antes de uma peça visual

Para quem a constrói, não é achado de revisão. Uma animação, um laço ou um ícone levou de 3 a 8 rodadas com o usuário cada vez que o alvo foi adivinhado. Antes, pergunte onde vai (a tela, o tamanho) e um alvo conferível (a duração, a referência). Guarde o retorno do usuário numa lista e confira cada item dela de novo antes de cada entrega.

## Relatório

Para cada violação, dê `arquivo:linha`, o nome da regra e a peça ou o lugar que o código deveria usar, e pare. Ordem de classes, gosto e código não tocado não são achado. Sem nada a relatar, diga `Tudo certo` e mais nada.
