# A interface é Tailwind, com os tokens do DESIGN.md como tema

Como no Festival dos Macacos, o site se veste com as classes do Tailwind v4 no próprio componente, e não com um `.css` por peça. O tema é o cabeçalho YAML do `DESIGN.md`: `frontend/src/ui/tokens.css` é um `@theme static` com `--color-papel`, `--radius-mao`, `--spacing-md`, `--font-label` e `--text-label` (com entrelinha, peso e espaçamento do tipo), e o `tokens.test.ts` confere cada um. As escalas do Tailwind que o DESIGN.md não tem (as cores, as fontes, os tamanhos de letra) saem com `initial`, e `bg-red-500` não existe aqui.

Diferente do Festival, o Tailwind entra sem o preflight. Ele zera as margens, as listas e os títulos do navegador, e a base do site sempre foi a do navegador com os retoques de `styles.css`; com ele, toda página mudava. Por isso a borda de um lado só usa `fio-pontilhado` e `fio-tracejado`: o `border-dotted` põe o estilo nos quatro lados, e sem o preflight o lado sem largura ganharia a largura `medium` do navegador.

O que o Tailwind não cobre fica em `ui/desenhos.css`, com o motivo de cada bloco: os desenhos à mão em SVG (a retícula, a régua, o marca-texto, o anel da referência, o risco do Mito), o HTML que sai do Markdown do acervo, que não tem `className` (`.prosa`, `.ref`, `.nw`, `.numero-chave`, `.marca-texto`, a lista fechada de `conteudo/html-seguro.ts`), e a animação do laço da Ficha.

## Consequências

- O `hover:` do Tailwind só vale onde há mouse; o site redefine a variante para valer no toque também, como o CSS de antes.
- O foco (`:focus-visible`) fica na camada das utilidades, depois delas: ganha de uma classe do mesmo peso e perde para `focus:outline-none`, como antes.
- A migração não mudou o visual: as capturas de antes e depois das páginas no celular e no desktop batem pixel a pixel, salvo 7 pixels de um pontilhado no Grupo possível depois de mexer nos Requisitos, a 3 níveis de cor de diferença.
