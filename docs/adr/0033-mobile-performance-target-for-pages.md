# A meta de desempenho das páginas no celular

Cada uma das cinco páginas (início, Guia, Ficha, Grupo possível, Prioridades) tem uma meta em `frontend/scripts/measure-pages-meta.ts`, e `pnpm --filter frontend measure` mede contra ela. A meta é a mediana de cinco aberturas num Chrome limpo, com a tela, a rede e a CPU do Lighthouse mobile (4G lento: 562,5 ms por pedido, 1,6 Mbps, CPU 4× mais lenta):

- LCP ≤ 2,5 s e INP ≤ 200 ms, o "bom" do Core Web Vitals. O INP sai de um toque logo depois do `load`, quando a página ainda pode estar hidratando.
- CSS ≤ 15 KB e JS por página, com o gzip: início 200 KB, Guia 260, Ficha 210, Grupo possível 250, Prioridades 240. É o medido no #59 com uns 15% de folga, para que um chunk que engorda a página reprove a medida. Quem sobe um teto diz por quê no PR.

A medida roda no Playwright, sem o Lighthouse: os quatro números saem do próprio Chrome (`PerformanceObserver` e os eventos de rede do CDP), e a mesma medida serve ao `pnpm start` local e ao site no ar (`--site`). Em localhost, um proxy comprime como o Nginx da VPS, lendo os `gzip_types` do `nginx/temestudo.conf`: o servidor do app não comprime, e sem o proxy a medida pesaria o JS cru. O local serve por HTTP/1.1 e a VPS por HTTP/2, então o local fica um pouco mais lento que o site.

## Antes e depois

Build do e2e (fixture), mediana de 5. Antes: a ponta do `spec/23-mvp` em 50f0f48. Depois: o gzip do JS no Nginx e o manifesto sem preload (ADR 0034), sobre a ponta com o #56.

| Página         | JS antes → depois | LCP antes → depois | INP antes → depois |
| -------------- | ----------------- | ------------------ | ------------------ |
| início         | 420 → 173 KB      | 1,53 → 1,49 s      | 40 → 48 ms         |
| Guia           | 546 → 226 KB      | 1,59 → 1,49 s      | 184 → 32 ms        |
| Ficha          | 441 → 182 KB      | 1,53 → 1,51 s      | 40 → 40 ms         |
| Grupo possível | 530 → 220 KB      | 1,52 → 1,48 s      | 112 → 32 ms        |
| Prioridades    | 494 → 205 KB      | 1,53 → 1,50 s      | 48 → 48 ms         |

O CSS ficou em 10 KB. A maior parte do ganho veio do Nginx: o app manda o JS como `text/javascript`, e o `gzip_types` só listava `application/javascript`, então o JS chegava cru. Com o acervo de verdade, o início, a Ficha e o Grupo possível dão os mesmos números; o acervo ainda não tem Guia.

## Consequências

- A medida não roda no CI: leva minutos e varia com a máquina. Rode-a no PR que muda o JS de uma página, ou o `<head>`, e cole a tabela.
- Uma página nova entra em `paginas()` com a meta dela.
