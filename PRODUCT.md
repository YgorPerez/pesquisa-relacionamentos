# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decidida no mapa (#1): a mesma do Festival dos Macacos. Monorepo pnpm neste repositório, TanStack Start (React 19, Router, Query), Base UI e Storybook no front; Effect 4 com Drizzle/libSQL no back; contratos compartilhados; Vitest e Playwright; um contêiner por ambiente numa VPS. Os protótipos em `prototipos/` são HTML estático descartável.

## Users

Adultos no Brasil, de qualquer Perfil (gênero, quem procura, idade). O público mais provável, e o que guia as decisões, tem de 18 a 30 anos e quer um relacionamento. Chegam com uma dúvida concreta ("onde conhecer alguém da minha idade?", "isso que eu exijo importa?") e querem uma resposta curta em que possam confiar, com o caminho até a fonte se quiserem conferir.

## Product Purpose

Site público, em PT-BR, que responde com evidência onde conhecer pessoas e como escolher parceiro. Cada Guia responde uma Pergunta, e cada afirmação dele aponta para uma Ficha. Dois cálculos completam os Guias: o Grupo possível (quantas pessoas no Brasil atendem ao Perfil procurado e aos Requisitos) e Prioridades vs. evidência (o que o usuário valoriza comparado ao que prevê atração, satisfação e duração).

O site deu certo quando o usuário sai sabendo o que a evidência diz, com que confiança, e o que ela não sabe.

## Positioning

Toda afirmação é rastreável até a fonte primária, com o Status de verificação da Ficha e a Força da evidência à vista. A resposta curta leva um rótulo de Confiança que nunca passa da Ficha mais forte. O site diz quando não há evidência para o Perfil do usuário, separa atração, satisfação e duração, e desmonta Mitos que circulam sem fonte. Conselho de relacionamento comum não faz nada disso.

## Operating Context

- A maioria abre o site no celular.
- Sem login. O Perfil, os Requisitos e as Prioridades ficam no navegador e podem ser compartilhados por link.
- O conteúdo (Fichas, Guias, Dicas) é markdown neste repositório e é a fonte da verdade. Agentes escrevem Fichas e um humano revisa em PR.
- Vocabulário em `GLOSSARY.md`; convenções de Fichas no `README.md`.

## Capabilities and Constraints

- Temas do MVP: onde conhecer pessoas (Perguntas A1–A4) e escolher parceiro (B1–B5). Prioridades fica em B1, Grupo possível em B5.
- Guia em 7 seções mais Perguntas relacionadas (#7). Só cita Fichas ✅ ou 🟡; com só 🟡, a Confiança vai no máximo a moderada. Inferência aparece marcada como "inferência nossa".
- Perfil opcional (#5): nada some. O que cobre o Perfil ganha "vale para você", o resto leva aviso da amostra.
- Grupo possível (#8): número em faixa, "o que mais pesa", Requisito sem dado desabilitado com o motivo.
- Prioridades (#9): o usuário ordena; a evidência agrupa em degraus por desfecho, sem nota de compatibilidade.
- Fora do MVP: guias de comportamento/atração e de apps na prática, chat com IA, contas, outras línguas e países.
- Em aberto: nome do site e domínio, deploy, SEO e URLs, privacidade do estado no link, analytics.

## Brand Commitments

- Nome: ainda não existe.
- Voz: um amigo que leu os estudos. Direto, PT-BR coloquial, franco sobre o que a evidência não sabe. Sem jargão, sem paternalismo, sem tom de coach.
- Linha ética: evidência, nunca táticas de manipulação.
- Toda prosa passa pela skill `unslop`.

## Evidence on Hand

- `estudos/`: cerca de 30 Fichas. Pela decisão do #6, todas contam como ⬜ até serem refeitas com Fonte local e trecho conferido.
- `relatorios/`, `pesquisas/` e `dicas/`: sínteses internas, base para os Guias.
- `fontes/pdfs/`: Fontes locais de acesso aberto.
- `prototipos/prioridades.prototype.html`: protótipo descartável de Prioridades vs. evidência.
- Não há depoimentos, usuários, métricas de uso nem imprensa. Nada disso pode ser inventado.

## Product Principles

1. A fonte vem junto com a afirmação. Sem Ficha, não entra.
2. Dizer o que não se sabe é parte da resposta, não uma falha dela.
3. Ninguém fica de fora: o Perfil destaca, nunca esconde.
4. Informar sem empurrar. Nada de nota de compatibilidade, urgência ou tática.
5. Resposta curta primeiro, profundidade para quem quiser.

## Accessibility & Inclusion

- WCAG 2.2 AA: contraste, teclado e leitor de tela.
- Celular primeiro. Sliders e ordenação funcionam sem arrastar.
- Gênero inclui "outro" e quem procura inclui "ambos"; a orientação decorre do Perfil e não é perguntada.
