# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decidida no mapa (#1): a mesma do Festival dos Macacos. Monorepo pnpm neste repositório, TanStack Start (React 19, Router, Query), Base UI e Storybook no front; renderização no servidor sem banco no MVP (o conteúdo entra no build); Vitest e Playwright. Roda num contêiner Docker atrás do Nginx numa VPS própria da Hostinger, só em produção, publicado a cada merge na main (#20). Os protótipos em `prototypes/` são HTML estático descartável.

## Users

Adultos no Brasil, de qualquer Perfil (gênero, quem procura, idade). O público mais provável, e o que guia as decisões, tem de 18 a 30 anos e quer um relacionamento. Chegam com uma dúvida concreta ("onde conhecer alguém da minha idade?", "isso que eu exijo importa?") e querem uma resposta curta em que possam confiar, com o caminho até a fonte se quiserem conferir.

## Product Purpose

Site público, em PT-BR, que responde com evidência o que se pergunta de um relacionamento: onde conhecer pessoas, como escolher parceiro, sexo e histórico antes de assumir, como conversar e se conectar, como manter a relação, e apps na prática e saúde mental. Cada Guia responde uma Pergunta, e cada afirmação dele aponta para uma Ficha. Dois cálculos completam os Guias: o Grupo possível (quantas pessoas no Brasil atendem ao Perfil procurado e aos Requisitos) e Prioridades vs. evidência (o que o usuário valoriza comparado ao que prevê atração, satisfação e duração).

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
- Temas depois do MVP (mapa #136, nomes provisórios): sexo e histórico antes de assumir, conversar e se conectar, manter a relação, e apps na prática e saúde mental. Todo Relatório de `reports/` vira Guia; um Tema sem Relatório começa pela pesquisa.
- Guia em 7 seções mais Perguntas relacionadas (#7). Só cita Fichas ✅ ou 🟡; com só 🟡, a Confiança vai no máximo a moderada. Inferência aparece marcada como "inferência nossa".
- Perfil opcional (#5): nada some. O que cobre o Perfil ganha "vale para você", o resto leva aviso da amostra.
- Grupo possível (#8): número em faixa, "o que mais pesa", Requisito sem dado desabilitado com o motivo.
- Prioridades (#9, #19): o usuário toca nas três características que mais importam, na ordem; a evidência agrupa em degraus por desfecho, sem nota de compatibilidade.
- Fora do escopo: chat com IA, contas, outras línguas e países.
- Analytics (#21): GoatCounter na própria VPS, sem Perfil nos eventos, 31 dias e opt-out por GPC/DNT ou chave no rodapé; "Ajudou?" no fim do Guia mede se ele ajudou.

## Brand Commitments

- Nome: **Tem estudo?**, em temestudo.cloud.
- Voz: um amigo que leu os estudos. Direto, PT-BR coloquial, franco sobre o que a evidência não sabe. Sem jargão, sem paternalismo, sem tom de coach.
- Linha ética: evidência, nunca táticas de manipulação. Em conversa e atração, conexão e não conquista: nada de técnica para fazer alguém te querer, mesmo com estudo por trás.
- Toda prosa passa pela skill `unslop`.

## Evidence on Hand

- `studies/`: cerca de 30 Fichas. Pela decisão do #6, todas contam como ⬜ até serem refeitas com Fonte local e trecho conferido.
- `reports/` e `tips/`: sínteses internas, base para os Guias.
- `sources/`: Fontes locais de licença aberta. As outras ficam num repo privado, clonado em `sources/private/`, fora do git deste.
- Fila do acervo: issues com o label `acervo`, trabalhadas pela skill `library` (#37).
- `prototypes/prioridades.prototype.html`: protótipo descartável de Prioridades vs. evidência.
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
