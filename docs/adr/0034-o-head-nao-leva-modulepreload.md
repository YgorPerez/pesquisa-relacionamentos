# O `<head>` não leva `modulepreload`

O TanStack Start põe no `<head>` um `modulepreload` para cada chunk que a rota importa: dez no início. Eles saem no mesmo instante que o CSS e as duas fontes da primeira tela, e no 4G lento dividem a banda com eles. O plugin `frontend/vite/manifesto-sem-preload.ts`, copiado do Festival dos Macacos, apaga os `preloads` de toda rota no manifesto do Start. O navegador pede o CSS, as fontes e a entrada (o `<script>` do `<head>`), e acha o resto do JS lendo a entrada.

O corte é no manifesto, e não no HTML: o servidor desenha o `<head>` com ele e o manda ao navegador, que desenha o `<head>` de novo ao hidratar. Tirar as tags só do HTML faria os dois divergirem.

## Consequências

- No #59, o LCP caiu uns 40 ms em toda página (ADR 0033). O JS chega um pouco depois da primeira pintura, o que é o objetivo.
- Um TanStack que gere o módulo do manifesto de outro jeito derruba o build, com o nome do módulo no erro, em vez de voltar a pôr os chunks no `<head>` calado.
