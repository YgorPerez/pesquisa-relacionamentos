---
reference: "Li P, Hu Y. *Evaluating online doctor–patient communication quality and its effects: Text analysis approach*. Digital Health 11, 2025."
link: https://doi.org/10.1177/20552076251395547
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Conversas de uma só plataforma chinesa de consultas médicas, fora do namoro, numa análise que só observa; a satisfação é lida por um programa nos mesmos textos dos pacientes de onde sai a semelhança, a direção de duas das três ligações com a satisfação se inverte entre a correlação simples e a regressão, e o artigo traz números que não fecham entre si (asteriscos e estatísticas t, textos por médico, tamanho dos coeficientes)."
countries: [China]
period: "2024 (coleta em agosto e novembro)"
sample:
  n: 1616
  description: "1.616 médicos da plataforma chinesa de consultas online Chunyu Doctor, com 19.392 textos de conversa coletados da plataforma por um programa (9.696 de médicos e 9.696 de pacientes). Os autores dizem focar em consultas sobre cânceres ginecológicos e ter pegado as 30 interações mais recentes de cada médico; o artigo não diz como os médicos foram escolhidos. É uma relação entre médico e paciente, não de namoro."
  representative: false
design: platform
conflict: "Financiado pela National Natural Science Foundation of China (projeto 72404094); os autores declaram não ter conflito de interesse."
covers: {}
---

# Li & Hu (2025): semelhança entre as mensagens de médico e paciente numa plataforma chinesa de consultas

## O que mediu

O estudo não é sobre namoro: ele olha consultas médicas por texto na Chunyu Doctor, uma plataforma chinesa. Para cada médico, programas de análise de texto mediram três tipos de semelhança entre as respostas dele e as mensagens dos pacientes: de temas, de termos médicos e de emoção (o tom positivo ou negativo e a intensidade, por dicionários de palavras). Depois, os autores compararam essas semelhanças com duas coisas: a procura pelo médico (o número de consultas; o texto a define como o aumento entre agosto e novembro de 2024) e a satisfação dos pacientes, que um programa treinado com 2.000 textos marcados por dois médicos leu nos textos dos próprios pacientes. A conta é uma regressão que leva em conta cargo, anos de prática, departamento, nível do hospital, riqueza da cidade e oferta de hospitais da província. Também testaram se o preço da consulta e o número de respostas do médico mudam essas ligações.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Médicos na análise | Depois da limpeza dos dados, ficaram 1.616 médicos | Methods, p. 5 | "the ﬁnal valid sample comprised: 1616 unique doctors" |
| Textos na análise | Esses médicos somam 19.392 textos de conversa, 9.696 escritos por médicos e 9.696 por pacientes | Methods, p. 6 | "19,392 doctor–patient communication texts (9696 doctor texts and 9696 patient texts)" |
| Semelhança e procura pelo médico | Na regressão, levando em conta as características do médico, do hospital e da região, os médicos cujas respostas tinham mais semelhança de temas, de termos médicos e de emoção com as mensagens dos pacientes tiveram mais consultas (β = 2,134; 2,070; 1,537). Sem levar nada em conta, as três semelhanças quase não andaram junto com a procura (linha abaixo) | Results, Empirical results, p. 11 | "(β = 2.134, p < 0.001; β = 2.070, p < 0.001; β = 1.537, p < 0.001)" |
| Semelhança e procura, sem ajuste | Na correlação simples entre médicos, sem levar nada em conta, a procura pelo médico andou muito pouco junto com a semelhança de termos (r = 0,039) e a de temas (r = 0,045); a de termos não tem asterisco na tabela e pode ser acaso. A de emoção também ficou perto de zero na mesma coluna | Tabela 6, coluna 1 (consultas), linhas TermSimilarity e TopicSimilarity, p. 12 | "0.039 0.045" |
| Semelhança e satisfação | Na regressão, levando em conta as mesmas características, os médicos com mais semelhança de temas, de termos e de emoção com os pacientes tiveram mais textos de pacientes lidos pelo programa como satisfeitos (β = 1,946; 1,465; 0,025). Sem levar nada em conta, a semelhança de termos e a de emoção andaram no sentido contrário (linhas abaixo) | Results, Empirical results, p. 11 | "(β = 1.946, p < 0.001; β = 1.465, p < 0.001; β = 0.025, p < 0.001)" |
| Temas e satisfação, sem ajuste | Na correlação simples entre médicos, sem levar nada em conta, mais semelhança de temas com os pacientes andou junto com um pouco mais de satisfação (r = 0,187), o mesmo sentido da regressão | Tabela 6, coluna 2 (satisfação), linha TopicSimilarity, p. 12 | "0.187" |
| Termos e satisfação, sem ajuste | Na correlação simples entre médicos, sem levar nada em conta, mais semelhança de termos médicos com os pacientes andou junto com um pouco menos de satisfação (r = −0,164), o sentido contrário ao da regressão | Tabela 6, coluna 2 (satisfação), linha TermSimilarity, p. 12 | "−0.164" |
| Emoção e satisfação, sem ajuste | Na correlação simples entre médicos, sem levar nada em conta, mais semelhança de emoção com os pacientes andou junto com um pouco menos de satisfação (r = −0,076), o sentido contrário ao da regressão | Tabela 6, coluna 2 (satisfação), linha EmotionSimilarity, p. 12 | "−0.076" |
| Satisfação numa segunda regressão | Numa regressão própria para proporções, levando em conta as mesmas características, as três semelhanças seguiram andando junto com mais satisfação lida no texto dos pacientes (efeito médio = 0,125 para temas, 0,092 para termos e 0,001 para emoção; p < 0,001, p = 0,010 e p = 0,020) | Results, Robustness checks, p. 11, e Tabela 9, p. 14 | "(AME = 0.125, p < 0.001), TermSimilarity (AME = 0.092, p = 0.010), and EmotionSimilarity (AME = 0.001, p = 0.020) remain positive" |
| Quanto da satisfação o programa achou | O programa leu satisfação em 92,3% dos 9.696 textos de pacientes; na amostra marcada à mão pelos dois médicos, eram 91,75% | Methods, p. 11 | "The trained Bi-LSTM model predicted satisfaction labels for all 9696 patient texts, with 92.3% classiﬁed as satisﬁed. This closely matched the manual annotation rate (91.75%)" |
| Preço da consulta | Entre médicos de consulta mais cara, a ligação entre as três semelhanças e a procura foi mais forte, segundo a regressão (interações β = 1,503; 2,626; 1,965) | Results, Empirical results, p. 11 | "(β = 1.503, p < 0.001; β = 2.626, p < 0.001; β = 1.965, p <" |
| Respostas do médico | Entre médicos que respondem mais vezes por consulta, a ligação entre as três semelhanças e a procura foi mais forte, segundo a regressão (interações β = 0,394; 0,455; 0,443) | Results, Empirical results, p. 11 | "(β = 0.394, p < 0.001; β = 0.455, p < 0.001; β = 0.443, p <" |

O β é o coeficiente da regressão: quanto a procura (em logaritmo) ou a satisfação muda para cada unidade a mais de semelhança, com as outras características fixas. Os β de cada coluna não se comparam entre si, e a Ficha não lê o tamanho deles (ver Limitações). O r vai de −1 a 1 e mede o quanto duas coisas andam juntas: perto de zero é quase nada. O efeito médio da segunda regressão é a mudança média na proporção de textos satisfeitos para uma unidade a mais de semelhança. O p é a chance de uma diferença desse tamanho aparecer só por acaso.

## Limitações

- O estudo não é sobre namoro nem sobre conversa entre iguais: é a troca de mensagens entre médico e paciente numa plataforma chinesa de consultas pagas, com um lado que sabe mais que o outro.
- Os dados só observam: médicos que escrevem de um jeito mais parecido com o dos pacientes podem diferir em outras coisas que o modelo não mede. Os próprios autores lembram que os dados são de um só momento e de uma só plataforma. O texto fala em "efeitos", mas nada foi sorteado ou provocado.
- A satisfação sai dos mesmos textos dos pacientes de onde saem as três semelhanças, lida por um programa; o artigo não discute se isso mistura as duas medidas. Na Tabela 8, com outras medidas, a semelhança de temas na coluna da satisfação fica só no limiar de 10% (0,056, t = 1,939); o artigo diz que trocou a medida de temas por outra e a satisfação pela nota da plataforma, mas não diz qual troca está em qual coluna.
- A direção de duas das três ligações com a satisfação se inverte: sem ajuste, a semelhança de termos e a de emoção andam junto com menos satisfação; na regressão, com mais. O artigo não comenta a inversão.
- O tamanho dos coeficientes não fecha com a Tabela 6: a satisfação média por médico é 0,98, de 0,79 a 1, e a semelhança de temas vai de 0,09 a 0,91; um β de 1,946 nessa escala passaria do intervalo possível da satisfação. O artigo não diz se as variáveis foram padronizadas. Por isso a Ficha dá o sentido das ligações e não lê o tamanho.
- A nota da Tabela 7 define *** como p < 0,001, e o texto repete p < 0,001 para todas as ligações, mas várias estatísticas t da tabela ficam perto de 2,6 (2,640 para emoção e procura; 2,629 para temas vezes preço), o que não chega a p < 0,001 com uma amostra desse tamanho. Por isso os valores-p da regressão não entram na tabela.
- Os números de textos não fecham com clareza: os autores dizem ter pegado as 30 interações mais recentes de cada médico e juntado os vários textos de cada consulta num só, e 9.696 textos de pacientes para 1.616 médicos dão exatamente 6 por médico, o que sugere 6 consultas por médico, mas o artigo não diz isso. Com o mesmo número de textos por médico, a média por médico deveria ser igual aos 92,3% de textos lidos como satisfeitos, mas a Tabela 6 dá 0,98.
- A procura é definida no texto como o aumento de consultas entre agosto e novembro de 2024, mas a Tabela 1 fala em volume de consultas em logaritmo, e a Tabela 6 dá de 76 a 265.128 consultas, números que parecem o total.
- O artigo diz focar em consultas sobre cânceres ginecológicos, mas não descreve como os médicos foram escolhidos, e um dos exemplos da Tabela 2 é de sangue na urina.
