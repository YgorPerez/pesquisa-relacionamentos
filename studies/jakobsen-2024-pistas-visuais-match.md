---
reference: "Jakobsen JMW, Hoang V. *Eyes on the Price: How Visual Cues Influence Users' Matching Decision in Online Dating*. Dissertação de mestrado (M.Sc. in Business Administration and Digital Business), Copenhagen Business School, 2024. Orientador: Rob Gleasure. A cópia lida, do portal de pesquisa da CBS, fica no repositório privado das Fontes."
link: https://research.cbs.dk/files/117063120/2015548_Eyes_on_The_Price_How_Visual_Cues_Influence_Users_Matching_Decision_in_Online_Dating.pdf
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Dissertação de mestrado com 26 pessoas no laboratório, parte delas conhecidas das autoras, e 189 num painel online, diante de 48 fotos de perfil sem texto, com respostas de sim ou não sem consequência; as regressões e o texto se contradizem (um coeficiente digitado dez vezes maior, porcentagens trocadas entre condições, uma regressão que dá efeito forte onde as contagens são iguais), e as regressões não dizem levar em conta que as 48 respostas de cada pessoa vêm da mesma pessoa."
countries: [Dinamarca]
period: "fotos coletadas em julho de 2024; experimentos nas semanas 38 a 40 de 2024"
sample:
  n: 26
  description: "Laboratório: 26 pessoas de 25 a 29 anos que moram e trabalham em Copenhague, recrutadas pelo NeuroLab da CBS e pela rede das autoras, pagas com um ingresso de cinema patrocinado pela Carlsbergfondet; o texto diz 14 homens e 12 mulheres, e a tabela, o contrário. O rastreador do olhar funcionou em 23. Painel online: 189 pessoas do Prolific (86 mulheres e 103 homens), de 18 a 72 anos e de vários países, sem rastreador."
  representative: false
design: experiment
conflict: "Os ingressos de cinema dados aos participantes do laboratório foram patrocinados pela Carlsbergfondet. A dissertação não declara outro financiamento nem conflitos."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 72 }
---

# Jakobsen & Hoang (2024): sorriso e foto em grupo, sim ou não, numa dissertação dinamarquesa

## O que mediu

Numa dissertação de mestrado, as autoras montaram 48 fotos de perfil com a cara do Tinder para cada sexo, em quatro tipos de 12: sorrindo sozinho, sem sorrir sozinho, sorrindo com outras pessoas e sem sorrir com outras pessoas. Cada participante viu as 48 fotos do sexo que procura, uma por vez, e respondeu sim ou não. Segundo as limitações da dissertação, as fotos vieram sem bio, nome, idade ou local; a seção sobre os estímulos fala em nome de usuário e descrição curta. No laboratório da Copenhagen Business School, um rastreador do olhar mediu onde e por quanto tempo as pessoas olhavam; o mesmo questionário rodou online no Prolific, sem rastreador.

As autoras dizem que as fotos vieram do Unsplash, um banco de imagens grátis, e, noutra seção, que foram coletadas em dois lugares de Copenhague num dia de julho de 2024.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Laboratório | 26 pessoas de Copenhague, de 25 a 29 anos | 4.5.1 (p. 51) | "For this experiment, 26 participants were recruited, all residing in Copenhagen, Denmark. The group consisted of 14 men and 12 women, with ages ranging from 25 to 29" | |
| Painel online | 189 pessoas no Prolific, 86 mulheres e 103 homens | 5.1 (p. 64) | "The database from Prolific contained in total 189 participants where 86 were women and 103 were men" | |
| Respostas no laboratório | Sorrindo sozinho, 93 sim e 219 não; sem sorrir sozinho, 123 sim e 189 não; sorrindo com outras pessoas, 114 sim e 198 não; sem sorrir com outras pessoas, 78 sim e 234 não | Tabela 6 (p. 66) | "1 (Yes) 93 123 2 (No) 219 189 SM - Smiling Multiple NM - Non-Smiling Multiple 1 (Yes) 114 78 2 (No) 198 234" | |
| Parte de "sim" no laboratório | Sorrindo sozinho teve 29,8% de "sim"; sem sorrir sozinho, 39,4%; sorrindo com outras pessoas, 36,5%; sem sorrir com outras pessoas, 25,0% | Tabela 6 (p. 66) | "1 (Yes) 93 123 2 (No) 219 189 SM - Smiling Multiple NM - Non-Smiling Multiple 1 (Yes) 114 78 2 (No) 198 234" | `scripts/calculations/jakobsen-2024-pistas-visuais-match.ts neurolab` |
| Sorriso e grupo no laboratório, somados | Somando os tipos, as fotos sorrindo tiveram 33,2% de "sim" e as sem sorrir, 32,2%; as sozinho, 34,6%, e as com outras pessoas, 30,8% | Tabela 6 (p. 66) | "1 (Yes) 93 123 2 (No) 219 189 SM - Smiling Multiple NM - Non-Smiling Multiple 1 (Yes) 114 78 2 (No) 198 234" | `scripts/calculations/jakobsen-2024-pistas-visuais-match.ts neurolab` |
| Sorriso e grupo no laboratório, teste | Na regressão das autoras, nem o sorriso nem o grupo mudaram a chance de "sim" de um modo que passasse no teste (p = 0,445 nos dois) | 5.2.1.1 (p. 66) | "both Smiling (Estimate = -0.097, p = 0.445) and Multiple (Estimate = 0.97, p = 0.445) predictors are not statistically significant" | |
| Respostas no painel online | Sorrindo sozinho, 2.062 sim e 2.433 não; sem sorrir sozinho, 2.007 e 2.471; sorrindo com outras pessoas, 1.747 e 2.748; sem sorrir com outras pessoas, 2.322 e 2.156 | Tabela 8 (p. 70) | "1 (Yes) 2.062 2.007 2 (No) 2.433 2.471 SM - Smiling Multiple NM - Non-Smiling Multiple 1 (Yes) 1.747 2.322 2 (No) 2.748 2.156" | |
| Parte de "sim" no painel online | Sorrindo sozinho teve 45,9% de "sim"; sem sorrir sozinho, 44,8%; sorrindo com outras pessoas, 38,9%; sem sorrir com outras pessoas, 51,9% | Tabela 8 (p. 70) | "1 (Yes) 2.062 2.007 2 (No) 2.433 2.471 SM - Smiling Multiple NM - Non-Smiling Multiple 1 (Yes) 1.747 2.322 2 (No) 2.748 2.156" | `scripts/calculations/jakobsen-2024-pistas-visuais-match.ts prolific` |
| Sorriso e grupo no painel, somados | Somando os tipos, as fotos sorrindo tiveram 42,4% de "sim" e as sem sorrir, 48,3%; sozinho e com outras pessoas tiveram a mesma parte, 45,3% (4069 de 8973 nos dois) | Tabela 8 (p. 70) | "1 (Yes) 2.062 2.007 2 (No) 2.433 2.471 SM - Smiling Multiple NM - Non-Smiling Multiple 1 (Yes) 1.747 2.322 2 (No) 2.748 2.156" | `scripts/calculations/jakobsen-2024-pistas-visuais-match.ts prolific` |
| O que a regressão do painel diz | A regressão das autoras dá o grupo como fator forte (estimativa de 0,52658, p < 2e-16) e o sorriso como acaso, o contrário do que as contagens somadas mostram | Tabela 9 (p. 71) | "Multiple 0.52658 0.04303 12.239 <2e-16" | |
| Mulheres mais exigentes no laboratório | No laboratório, as mulheres disseram "não" mais vezes que os homens, em todos os tipos de foto (estimativa de 0,784665 para o sexo, p = 3,76e-8) | 5.2.2.5 (p. 75) | "with an Estimate of 0.784665 (Estimate = 0.784665, p = 3.76e-8, p < 0.05)" | |

As partes de "sim" e as somas são contas desta Ficha sobre as contagens das Tabelas 6 e 8. A dissertação escreve os milhares do painel online com ponto ("2.062" são 2.062 respostas). O p é a probabilidade de uma diferença desse tamanho aparecer por acaso; abaixo de 0,05 costuma-se tratar como improvável. As autoras não dizem se as regressões levam em conta que cada pessoa deu 48 respostas.

## Limitações

- Dissertação de mestrado, sem revisão por pares. No laboratório, 26 pessoas de 25 a 29 anos de uma cidade, parte da rede das próprias autoras, que elas dizem poder ter mudado o comportamento; no painel, 189 pessoas de vários países cujas variáveis de sexo, idade e país as autoras tiraram da análise por falta de codificação.
- O sim ou não não tinha consequência. Cada tipo de foto tem 12 fotos; a dissertação não diz se as mesmas pessoas aparecem em mais de um tipo, e a beleza delas não foi medida nem igualada.
- Os números não fecham entre si. A Tabela 7 dá 0,9712 para o grupo com o mesmo erro-padrão, valor z e p do sorriso (−0,09712), provavelmente um erro de digitação. No painel online, o texto dá 45,03% de "sim" para sorrindo com outras pessoas e 38,63% para sem sorrir sozinho, mas as contagens da Tabela 8 dão 38,9% e 44,8%. A regressão do painel dá o grupo como fator forte, mas as contagens somadas de sozinho e com outras pessoas são iguais; o texto lê o mesmo coeficiente ora como mais "sim", ora como mais "não". O texto também diz que sem sorrir com outras pessoas teve o maior número de "não", e a tabela mostra o menor.
- O painel online somou 17.946 respostas de 189 pessoas, cerca de 95 por pessoa, quando cada uma deveria ter visto 48 fotos; a dissertação não explica.
- As partes de "sim" por tipo de foto variam em sentidos opostos no laboratório e no painel (sem sorrir com outras pessoas foi o pior no laboratório e o melhor no painel), o que aponta mais para o efeito das fotos escolhidas que para o sorriso ou o grupo.
- As medidas do olhar (quantas vezes voltou à foto, tempo olhando) andaram junto com dizer "não", mas o "sim" e o "não" também mudam por quanto tempo a pessoa olha; e o texto chama essas medidas de resposta emocional sem ter medido emoção, já que a medida de suor da pele foi abandonada.

## Como usamos

O Relatório [Que fotos de perfil andam junto com mais curtidas, matches e mensagens?](../reports/2026-11-15-fotos-do-perfil.md) usa esta Ficha entre os perfis montados sobre sorriso e foto em grupo: no laboratório, nem o sorriso nem o grupo mudaram a parte de "sim" de modo claro, e no painel online as fotos sorrindo tiveram um pouco menos "sim", com contagens e regressões que não batem.
