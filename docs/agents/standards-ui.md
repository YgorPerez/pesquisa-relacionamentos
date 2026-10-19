# Padrões de interface do front

Como o front monta a interface. Siga ao escrever uma tela e confira a mudança contra isto ao revisar (a skill `code-review` lê este arquivo como fonte de padrões). Adaptado do `standards-ui.md` do Festival dos Macacos, que veio do revisor `ui-consistency` do t3code.

O lint já recusa o `localStorage` fora do `armazenado()`, a classe que o Tailwind não conhece, a cor e o valor arbitrário fora do tema, o retoque num componente de `ui/shadcn/`, o `<h1>` fora do `Display`, a retícula fora de `src/ui/`, a cor escrita à mão e o `title` do HTML (os plugins do `vite.config.ts` da raiz, ADRs 0028 e 0029). O `tokens.test.ts` confere cada token contra o `DESIGN.md`. Não repita esses achados: procure o que uma regra de lint não vê.

Ao revisar, olhe só as linhas que a mudança tocou. Não builde o projeto nem peça captura. Se o diff não deixa a violação óbvia, não há achado.

## 1. A peça compartilhada, não uma cópia dela

Os controles são primitivos do Base UI vestidos em `frontend/src/ui/shadcn/` (ADR 0027): `Button` (por trás do `Botao`, `principal` e `leve`, e a forma `seta`), `Toggle` (o chip), `RadioGroup`, `Checkbox`, `Switch`, `Input` e `Collapsible`. As peças de página moram em `ui/pagina.tsx` (`Folha`, `Coluna`, `Display`, `Lead`) e `ui/secao.tsx` (`Secao`, `Headline`, `Painel`, `Aviso`); as do site em `ui/`: `Degraus`, `StatusDeVerificacao`, `ForcaDaEvidencia`, `MetaDaFicha`, `SeloVoce`, `FichasCitadas`, a linha grande da Pergunta, a `Faixa` do Grupo possível, o `Rodape`.

- Aponte um `<button>`, `<input>`, `<select>` ou rádio cru com cara de controle quando a peça existe. O controle novo é Base UI, nunca o elemento do HTML com o estado na mão.
- Um visual que o `DESIGN.md` nomeia (o bloco "Components") é uma variante da peça, como o `Button` faz com `principal` e `leve`. Aponte o mesmo visual escrito à mão na chamada. A correção é uma variante em `ui/shadcn/` ou na peça.
- Não aponte o elemento cru que de propósito não é controle: a referência numerada (`.ref`), uma linha de tabela do acervo, o `<details>` do Markdown.

## 2. Os tokens do DESIGN.md, não um valor solto

- Uma cor, um raio, um espaço, uma fonte ou um tamanho de letra é uma classe do tema de `ui/tokens.css` (`bg-papel`, `rounded-mao`, `p-md`, `font-label`, `text-nota`). O `text-label` e os outros seis tipos do DESIGN.md já trazem entrelinha e peso: aponte o tipo usado só pelo tamanho sem a entrelinha e o peso que a peça quer.
- Um valor novo ganha nome no YAML do `DESIGN.md` e em `tokens.css` na mesma mudança, e o `pnpm cn:tabelas` roda junto.
- Aponte um `style={{ ... }}` novo com um valor fixo. Um valor calculado em tempo de execução (a largura de uma fatia da barra) pode.

## 3. As classes no componente, o CSS à mão só no que o Tailwind não cobre

- O estilo vai nas classes do próprio componente. Aponte um `.css` novo ao lado de uma peça ou uma regra nova em `styles.css`.
- `ui/desenhos.css` guarda só o que o Tailwind não cobre (ADR 0026): os desenhos em SVG e pseudo-elemento, o HTML do Markdown do acervo e a animação do laço. Aponte uma regra lá que dava para escrever com classes.
- O teste acha a peça pelo papel ou pelo `data-slot`, nunca por uma classe do Tailwind.

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
