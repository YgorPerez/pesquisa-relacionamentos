---
reference: "Joel S, Eastwick PW, Finkel EJ. *Is Romantic Desire Predictable? Machine Learning Applied to Initial Romantic Attraction*. Psychological Science 28(10):1478–1489, 2017. A Fonte local é a versão online antecipada, com paginação de 1 a 12. Texto completo: https://static1.squarespace.com/static/504114b1e4b0b97fe5a520af/t/59b9c89dcf81e018075e8b94/1505347745447/JoelEastwickFinkel2017PSci.pdf"
link: https://doi.org/10.1177/0956797617714580
status: verified
verified_on: 2026-10-26
strength: weak
strength_reason: "Duas amostras de conveniência de universitários jovens, sem representatividade, embora o estudo separe atração geral de interesse pelo par e teste a previsão numa segunda amostra."
countries: []
period: "2005 e 2007"
sample:
  description: "Amostra A: 163 universitários (81 mulheres e 82 homens), em sete eventos de 2005. Amostra B: 187 universitários (93 mulheres e 94 homens), em oito eventos de 2007. Idade média de 19,6 anos nas duas amostras; recrutamento por cartazes no campus e e-mails, para conhecer pessoas do outro sexo. O artigo não identifica explicitamente o país da coleta."
  representative: false
design: cross-sectional
conflict: "Bolsa de pós-doutorado do Social Sciences and Humanities Research Council of Canada para Samantha Joel. Os autores declararam não ter conflitos de interesse."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Joel et al. (2017): traços e preferências não previram a atração específica por cada par

## O que mediu

Antes dos eventos, os participantes responderam a um questionário sobre personalidade, valores, bem-estar, estratégias de relacionamento, características próprias e preferências por um parceiro ideal. As análises usaram 182 medidas na amostra A e 112 na B, incluindo gênero nos modelos individuais. Depois de cada encontro de quatro minutos, cada pessoa avaliou quanto gostou do par, sentiu atração sexual e pretendia dizer "sim" a ele.

Os autores separaram a tendência geral a desejar outras pessoas, a tendência geral a ser desejado e o interesse específico por cada par que restava depois dessas duas tendências. Modelos de florestas aleatórias tentaram prever cada componente com os dados coletados antes dos encontros. Uma análise adicional treinou os modelos na amostra A e os testou na B, usando as medidas disponíveis nas duas.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tendência geral a desejar os outros | O questionário de antes dos encontros explicou de cerca de 5% a 18% das diferenças entre as pessoas | Random forests results, p. 6; Tabela 2 | "5% to 18% of the variance in actor desire" |
| Tendência geral a ser desejado | O questionário de antes dos encontros explicou de cerca de 18% a 27% das diferenças entre as pessoas | Random forests results, p. 6; Tabela 2 | "18% to 27% of the variance in partner desire" |
| Interesse específico por um par | Treinadas num grupo de speed dating e testadas noutro, as contas previram, no melhor caso, menos de 0,1% desse interesse | Training and testing analyses, p. 7; Tabela 3 | "less than 0.1%" |

O resultado quase nulo diz respeito ao interesse específico pelo par, descontadas as tendências gerais. Vários modelos tiveram erro maior que prever a média para todos os pares. Já as avaliações da interação, coletadas depois de cada encontro junto com a medida de desejo, permitiram prever parte desse interesse específico. Isso não é uma previsão feita antes de as pessoas se conhecerem.

## Limitações

- São universitários jovens que aceitaram participar de encontros rápidos. Os autores observam que uma amostra mais diversa poderia revelar combinações por idade, condição socioeconômica, cultura ou religião que este desenho não captou.
- O desfecho é atração logo após uma conversa breve, não formação, contentamento ou duração de um relacionamento. O artigo não testa um algoritmo de compatibilidade de longo prazo.
- O fracasso destes modelos não prova que toda previsão seja impossível. Os autores consideram tanto medidas ainda desconhecidas quanto muitos efeitos de interação pequenos, que exigiriam amostras maiores.
- Os traços e as preferências foram autorrelatados. O estudo testa sua capacidade conjunta de prever o interesse, sem mostrar que cada preferência declarada deixa de importar em qualquer situação.
- A amostra A já foi analisada em publicações anteriores, incluindo [Eastwick & Finkel (2008)](eastwick-2008-preferencias-speed-dating.md). Essas Fichas não contam como replicações independentes entre si.
- Para os modelos principais, usamos as faixas do corpo do artigo e da Tabela 2. O resumo apresenta faixas com limites inferiores diferentes.

## Como usamos

- [Relatório de leituras conferidas de 2026-10-26](../reports/2026-10-26-leituras-conferidas.md): a leitura sobre inteligência artificial pode se apoiar na dificuldade de prever o interesse específico pelo par antes do encontro. A expressão de que as preferências são abandonadas ao conhecer alguém é mais ampla que o resultado testado aqui.
