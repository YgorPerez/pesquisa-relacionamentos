---
reference: "Ma Y, Zhang, Li, Mao. *The Power of Voice: The Impact of Voice Messaging on Dual-sided Performance in Online Medical Consultations*. Preprint SSRN 5890302, sem revisão por pares, 2025. Na listagem do SSRN o título é outro: *Voice versus Text? An Empirical Analysis on the Impact of Physicians' Voice Messages in Online Medical Consultations* (HEC Paris Research Paper No. 1592, dezembro de 2025). O arquivo lido é um manuscrito sem nome de autor; os nomes vêm da listagem."
link: https://doi.org/10.2139/ssrn.5890302
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Registros de uma só plataforma chinesa de consulta médica online, fora do namoro, num preprint sem revisão por pares; o uso do áudio não foi sorteado, e os autores tentam isolar o efeito com variáveis instrumentais (feriado e volume de perguntas de outros pacientes) cuja validade não dá para conferir no texto, porque os testes estão num suplemento que não veio no arquivo; alguns coeficientes têm tamanho difícil de acreditar."
countries: [China]
period: "dezembro de 2021 a março de 2022"
sample:
  n: 164151
  description: "164.151 consultas online feitas por 3.626 médicos de 623 hospitais, em oito especialidades (entre elas hipertensão, doença coronariana, diabetes, depressão e ansiedade), numa grande plataforma chinesa de consulta médica que os autores não nomeiam. Os dados incluem mais de 1,5 milhão de mensagens e 265.028 áudios gravados pelos médicos. Os pacientes não são contados um a um: a privacidade impediu identificá-los. Não é um estudo de namoro: são conversas pagas entre médico e paciente."
  representative: false
design: platform
conflict: "O arquivo lido é um manuscrito anônimo, sem nomes de autor, sem financiamento e sem declaração de conflito de interesse. A listagem do SSRN o põe na série de working papers da HEC Paris."
covers: {}
---

# Ma et al. (2025): mensagem de voz do médico numa consulta online

## O que mediu

Os autores juntaram as consultas pagas de uma plataforma chinesa de consulta médica online e compararam as consultas em que o médico respondeu com ao menos uma mensagem de voz com as em que ele só escreveu. Mediram duas coisas: a eficiência, contada como rodadas de resposta do médico por unidade de tempo da consulta, e se o paciente, ao fim, marcou a consulta como útil. Ninguém sorteou o áudio: o médico escolheu usá-lo. Para separar o efeito do áudio do tipo de médico e de paciente que usa áudio, os autores compararam cada médico com ele mesmo, levaram em conta a semana, a doença, a idade e o gênero do paciente e o histórico do médico, e usaram como instrumento duas coisas que mudam a chance de o médico mandar áudio sem, supõem eles, mudar o resultado: a consulta cair num feriado ou fim de semana e o número de perguntas de outros pacientes naquele dia e no anterior. Depois, com modelos de aprendizado de máquina que leram o áudio e o texto, mediram o apoio emocional e informativo de cada consulta e testaram em que tipo de conteúdo o áudio fez mais diferença. Não é um estudo de namoro.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quem entrou | 164.151 consultas de 3.626 médicos de 623 hospitais, em oito especialidades, de dezembro de 2021 a março de 2022 | Seção 4, Empirical Context and Data | "Our data covers December 2021 to March 2022, comprising 164,151 consultation sessions conducted by 3,626 physicians from 623 hospitals across eight disease departments" | |
| Quantas mensagens | Mais de 1,5 milhão de mensagens e 265.028 áudios gravados pelos médicos | Seção 4, Empirical Context and Data | "In total, over 1.5 million messages and 265,028 physician-generated audio recordings are included." | |
| Quantas consultas tiveram áudio | O médico mandou ao menos uma mensagem de voz em 17,9% das consultas | Tabela 1, linha Voice use | "Voice use Whether physicians adopt voice messages in 0.179 0.383 0 1" | scripts/calculations/ma-2025-mensagens-de-voz-medicos.ts |
| Quantas consultas foram marcadas como úteis | O paciente marcou a consulta como útil em 9,8% delas | Tabela 1, linha Helpfulness | "Helpfulness Whether the patient posts a useful rating after 0.098 0.297 0 1" | scripts/calculations/ma-2025-mensagens-de-voz-medicos.ts |
| Eficiência média | As consultas tiveram, em média, 1,319 rodada de resposta do médico por unidade de tempo, de 0,001 a 6,714 | Tabela 1, linha Efficiency | "Number of physicians' reply rounds in unit 1.319 1.061 0.001 6.714" | |
| Áudio e eficiência, sem instrumento | Comparando cada médico com ele mesmo, as consultas com áudio tiveram mais rodadas de resposta por unidade de tempo que as só com texto (b = 0,843) | Tabela 2, coluna (1) | "(1) (2) Efficiency Helpfulness 0.843" | |
| Áudio e eficiência, com os dois instrumentos | Na conta com feriado e volume de perguntas como instrumentos, a diferença na eficiência foi parecida (b = 0,914) | Tabela 2, coluna (5) | "(5) (6) Efficiency Helpfulness 0.914" | |
| Depressão e ansiedade | A ligação entre áudio e consulta marcada como útil foi mais forte nas consultas de depressão e ansiedade que nas de doenças físicas (interação b = 0,505); na eficiência, a diferença entre os dois grupos de doença pode ser acaso (b = 0,436) | Tabela 3 | "Efficiency Helpfulness 0.436 0.505***" | |
| Consultas por semana | Médicos que usaram áudio atenderam mais consultas por semana (b = 0,146, no logaritmo do número de consultas semanais) | Seção 6.3, Tabela 5, coluna (1) | "voice message use significantly increases physicians' weekly consultation volume (β = 0.146, p < 0.01)" | |
| Rodadas por consulta | Consultas com áudio tiveram mais rodadas de mensagens (b = 7,629) | Seção 6.3, Tabela 5, coluna (4) | "the number of message rounds per consultation ( β = 7.629, p < 0.01)" | |
| Áudio com empatia e afirmação | A ligação do áudio com a consulta marcada como útil foi mais forte nas consultas em que o médico mostrou mais empatia ou mais afirmação do que o paciente sentia, pela leitura dos modelos de máquina; encorajamento e cuidado não mudaram essa ligação, e nenhum dos quatro tipos de apoio emocional mudou a ligação do áudio com a eficiência | Seção 7.1, Tabela 6 | "two components of emotional support significantly enhance the positive effect of voice message usage on patients' perceived helpfulness (empathy in Column (2) and affirmation in Column (6)). However, none of the components of emotional supports are significantly moderate the impacts of voice message adoption on the efficiency of OMC service." | |
| Áudio com informação concreta e simples | A ligação do áudio com a eficiência e com a consulta marcada como útil foi maior quando a fala do médico era mais concreta e menor quando era mais rebuscada; a quantidade de palavras não mudou a ligação | Seção 7.2, Tabela 7 | "Information sophistication negatively moderates these effects on both efficiency of service delivery and patient helpfulness (Columns (3) and (4))." | |

O b é quanto o desfecho muda entre a consulta com áudio e a só com texto, na escala do desfecho: na eficiência, rodadas de resposta por unidade de tempo; na consulta marcada como útil, um desfecho de 0 ou 1. Numa interação, o b diz quanto a ligação do áudio muda quando a outra coisa (a doença, o tipo de apoio) muda. "Pode ser acaso" quer dizer que o valor-p ficou acima de 0,10. As contas com instrumento tentam medir o efeito do áudio e não só a associação, mas dependem de o feriado e o volume de perguntas mexerem no resultado só pela escolha do áudio.

## Limitações

- Não é sobre namoro nem sobre conversa entre iguais: é consulta médica paga, numa plataforma chinesa, em que o médico manda o áudio e o paciente avalia o serviço. Diz pouco sobre áudio numa conversa de app de namoro.
- Preprint sem revisão por pares. O arquivo lido é um manuscrito sem nome de autor, gerado em agosto de 2026, com outro título que o da listagem do SSRN (dezembro de 2025, *Voice versus Text?*). Os testes dos instrumentos, as análises de robustez, as definições dos tipos de apoio e as figuras estão num suplemento ("E-companion") que não veio no arquivo.
- O áudio não foi sorteado. Os autores usam variáveis instrumentais e admitem que elas podem não eliminar o problema de quem escolhe usar áudio. Feriado e fim de semana podem mudar o médico e o paciente por outros caminhos, o que os autores discutem e testam só num subgrupo de infarto, no suplemento.
- Os tamanhos são difíceis de acreditar. Com os instrumentos, o coeficiente do áudio na consulta marcada como útil (0,246) é maior que a própria taxa de consultas marcadas como úteis (9,8%); lido como modelo linear, daria um ganho de quase 25 pontos percentuais sobre uma base de cerca de 10%, e os autores o descrevem como "24,6%" sem dizer se é ponto percentual ou aumento relativo. Na Tabela 5, o áudio aparece com coeficiente 5,495 no logaritmo da duração da consulta, o que, lido ao pé da letra, multiplicaria a duração por mais de 200; por isso esse número não entra nos Achados.
- A medida de "útil" é ambígua. A Tabela 1 a define como o paciente postar uma avaliação de útil; o texto fala de uma nota binária, útil ou não útil. Não fica claro se a consulta sem avaliação conta como zero.
- A eficiência é contada como rodadas de resposta "por unidade de tempo", sem dizer qual unidade.
- O apoio emocional foi medido por um modelo no áudio (acerto de 83,10% em validação cruzada) e por outro no texto (96,18%). Como cada formato tem a sua régua, parte da diferença entre áudio e texto nos tipos de apoio pode vir da medida. A dificuldade da linguagem foi medida pelo índice Flesch-Kincaid, feito para o inglês, em mensagens em chinês, sem dizer como foi adaptado.
- A descrição da plataforma diz que ela aceita "text messages and video messages", provavelmente um erro por mensagens de voz.
- Uma plataforma só, de um país só, em quatro meses; os autores também apontam que a análise é por consulta e não leva em conta diferenças de cada par médico-paciente.

## Como usamos

No Relatório [Emoji, risada escrita, figurinha e áudio](../reports/2026-11-15-emoji-risada-figurinha-e-audio.md), como dado de plataforma sobre mensagem de voz fora do namoro.
