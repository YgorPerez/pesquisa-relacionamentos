---
reference: "Geng S, He Y, Duan L, Yang C, Wu X, Liang G, Niu B. *The Association Between Linguistic Characteristics of Physicians' Communication and Their Economic Returns: Mixed Method Study*. Journal of Medical Internet Research 26:e42850, 2024."
link: https://doi.org/10.2196/42850
status: verified
verified_on: 2026-11-15
strength: moderate
strength_reason: "Dados reais de 40.563 consultas pagas de 528 médicos numa plataforma chinesa de saúde online, coletados por pesquisadores independentes, mas num corte só, sem experimento e fora do namoro: o preço é fixado sobretudo pelo médico, as ligações são pequenas, e o artigo conta como efeito de moderação um resultado com p = 0,09 e dá a escala das palavras como de 0 a 1 com máximos acima de 1."
countries: [China]
period: "consultas de setembro de 2016 a dezembro de 2022, coletadas em junho de 2021 e em dezembro de 2022"
sample:
  n: 40563
  description: "40.563 consultas online pagas, por mensagem e sem ser ao mesmo tempo, de 528 médicos do site Dingxiang Doctor, na China, em quatro especialidades (tumores malignos, doenças do coração, digestivas e endócrinas), coletadas por um programa que leu as páginas públicas das consultas. Dos médicos, 54 eram diretores, 154 diretores associados, 231 assistentes e 89 residentes. Os pacientes não são descritos. Não é um estudo de namoro: são médicos respondendo a pacientes que pagam pela consulta."
  representative: false
design: platform
conflict: "Financiado pela National Natural Science Foundation of China, pela Guangdong Basic and Applied Basic Research Foundation, pelo Guangdong Philosophy and Social Science Planning Project e pelo Guangdong Province Innovation Team. Os autores declaram não ter conflitos de interesse. Um dos autores é do Shenzhen Health Development Research and Data Management Center."
license: "CC BY 4.0 (Creative Commons Attribution License, como diz a última página do artigo)"
covers: {}
---

# Geng et al. (2024): palavras do médico, mensagem de voz e valor pago na consulta online

## O que mediu

A equipe coletou consultas pagas do Dingxiang Doctor, uma plataforma chinesa em que o paciente manda a dúvida por mensagem e o médico responde por texto ou por voz. Um programa de contagem de palavras para o chinês (Textmind, baseado no LIWC) mediu, nas respostas do médico, a proporção de palavras de nove tipos: compreensão (*insight*), causa, discrepância ("deveria", "seria"), hesitação, certeza, emoção positiva, ansiedade, raiva e tristeza. Os autores chamam os cinco primeiros de comunicação instrumental e os quatro últimos de comunicação afetiva.

O desfecho é o valor que o médico recebeu pela consulta, em logaritmo. A primeira análise liga cada tipo de palavra a esse valor levando em conta o cargo e os anos de trabalho do médico, o nível e a posição no ranking do hospital, o porte da cidade e a especialidade. A segunda compara as ligações entre consultas respondidas por voz e por texto. A terceira separa as consultas em quatro grupos pela sequência de palavras nas respostas e compara o valor pago em cada grupo.

O artigo não é sobre namoro: é a conversa paga entre um médico e um paciente que não se conhecem. O preço é fixado de início pelo médico, que pode cobrar valores diferentes de pacientes diferentes; os autores tratam o valor como decidido pelos dois lados, porque o paciente escolhe entre médicos.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Consultas e médicos | 40.563 consultas online de 528 médicos, de setembro de 2016 a dezembro de 2022 | Data Collection (p. 4) | "ultimately analyzed 40,563 consultation instances generated from 528 physicians between September 2016 and December 2022" |
| Valor médio da consulta | Entre os médicos estudados, a consulta custou em média 36,53 yuans (5,10 dólares), e eles tinham em média 14,34 anos de trabalho | Data Collection (p. 4) | "The studied physicians had worked for an average of 14.34 (SD 7.01) years, and their average consultation fees were RMB 36.53 (US $5.10; SD 21.37)." |
| Consultas respondidas por voz | A variável que marca a resposta por voz (1) ou por texto (0) teve média 0,090 entre as consultas | Tabela 1 (p. 6) | "Voice service 0.090 (0.285; 0-1)" |
| Palavras de compreensão, causa, hesitação e certeza | Nas consultas em que o médico usou mais palavras de compreensão, de causa, de hesitação e de certeza, o valor pago foi um pouco maior, levando em conta cargo, anos de trabalho, hospital, cidade e especialidade (B = 0,248, 0,155, 0,189 e 0,528) | Direct Effect, a partir da Tabela 2 (p. 7) | "instrumental communication using words indicating insight (B=0.248; P<.001), causation (B=0.155; P<.001), tentativeness (B=0.189; P<.001), and certainty (B=0.528; P<.001) was positively associated with the economic returns of physicians" |
| Palavras de emoção positiva | Nas consultas em que o médico usou mais palavras de emoção positiva, o valor pago foi um pouco maior, levando em conta as mesmas variáveis (B = 0,283) | Direct Effect, a partir da Tabela 2 (p. 7) | "Affective communication using language expressing positive emotion (B=0.283; P<.001) was also linked with high economic returns." |
| Palavras de discrepância | Nas consultas em que o médico usou mais palavras de discrepância, como "deveria" e "seria", o valor pago foi um pouco menor, levando em conta as mesmas variáveis (B = −0,294) | Direct Effect, a partir da Tabela 2 (p. 7) | "In contrast, the use of terms conveying discrepancy (B=−0.294; P<.001) by physicians was negatively related to their economic returns." |
| Palavras de ansiedade, raiva e tristeza | Entre as palavras de ansiedade, de raiva e de tristeza do médico e o valor pago, não apareceu ligação: pode ser acaso (p = 0,57, 0,60 e 0,14) | Direct Effect, a partir da Tabela 2 (p. 7) | "the use of words related to anxiety (B=0.048; P=.57), anger (B=0.132; P=.60), and sadness (B=−0.228; P=.14) did not affect the economic returns of physicians" |
| Compreensão na escala padronizada | Na escala padronizada, que permite comparar variáveis, a ligação das palavras de compreensão do médico com o valor pago foi pequena: 0,053 | Tabela 2 (p. 7) | "Insight 0.248 (0.025) .053" |
| Discrepância na escala padronizada | Na escala padronizada, a ligação das palavras de discrepância com o valor pago foi −0,072 | Tabela 2 (p. 7) | "Discrepancy −0.294 (0.026) −.072" |
| Posição do hospital na escala padronizada | Na escala padronizada, a ligação da posição do hospital no ranking com o valor pago foi 0,239, a maior da tabela | Tabela 2 (p. 7) | "Hospital rank 0.216 (0.004) .239" |
| Voz e palavras de causa | Nas consultas respondidas por voz, a ligação entre palavras de causa e valor pago foi maior que nas respondidas por texto (diferença B = 0,403, p = 0,005) | Moderating Effect, a partir da Tabela 3 (p. 7) | "causation (B=0.403; P=.005), tentativeness (B=0.268; P<.001), and certainty (B=0.839; P<.001)" |
| Voz e palavras de hesitação e certeza | Nas consultas respondidas por voz, a ligação entre o valor pago e as palavras de hesitação e de certeza também foi maior que nas respondidas por texto (diferença B = 0,268 e 0,839) | Moderating Effect, a partir da Tabela 3 (p. 7) | "causation (B=0.403; P=.005), tentativeness (B=0.268; P<.001), and certainty (B=0.839; P<.001)" |
| Voz e palavras de compreensão | Na ligação entre palavras de compreensão e valor pago, a diferença entre consultas por voz e por texto pode ser acaso (B = 0,169, p = 0,09); os autores a contam entre os efeitos da voz | Moderating Effect, a partir da Tabela 3 (p. 7) | "The findings reveal that communication media function significantly in moderating the influencing paths from the use of insight (B=0.169; P=.09)" |
| Voz, discrepância e emoção positiva | Nas palavras de discrepância e de emoção positiva, não apareceu diferença entre consultas por voz e por texto na ligação com o valor pago: pode ser acaso (p = 0,21 e 0,12) | Moderating Effect, a partir da Tabela 3 (p. 7) | "However, communication media do not influence the use of words related to discrepancy (B=0.097; P=.21) and positive emotion (B=−0.159; P=.12)." |
| Grupo de consultas com maior valor | Dos quatro grupos de consultas separados pela sequência de palavras, o terceiro teve o maior valor pago: segundo os autores, 12,2% acima do primeiro grupo, 21,2% acima do segundo e 14,6% acima do quarto | Communication Patterns, a partir da Tabela 4 (p. 10) | "The mean revenue from consultations in the third group was 12.2% higher than the average earnings of the first group, 21.2% higher than the standard remunerations of the second group, and 14.6% higher than the average payments received by the fourth group." |
| Como respondia o grupo de maior valor | Segundo os autores, os médicos do terceiro grupo responderam mais vezes, usaram mais palavras de emoção positiva no começo da consulta e deram mais orientação prática depois | Communication Patterns, Figura 5 (p. 11) | "signifying that physicians designated to the third group replied more frequently. These physicians also used more terms related to positive emotions at the beginning of their consultations and later offered more instrumental suggestions." |

"B" é quanto o logaritmo do valor pago muda quando a proporção daquele tipo de palavra sobe uma unidade inteira, levando em conta as outras variáveis; a escala padronizada (β na Tabela 2) põe as variáveis na mesma régua e permite comparar o tamanho das ligações. Na comparação entre voz e texto, o B da linha é quanto a ligação de um tipo de palavra com o valor pago é maior nas consultas por voz do que nas por texto. "p" é a chance de uma ligação daquele tamanho aparecer só por acaso. As variáveis do médico, do hospital, da cidade e da especialidade, juntas com as palavras, explicam 31,9% da variação do valor pago.

## Limitações

- Não é um estudo de namoro nem de mensagens entre desconhecidos que se escolhem: é uma consulta médica paga, com um médico de um lado e um paciente do outro. Mensagem de voz aqui é a resposta do médico gravada, num serviço que o paciente pagou.
- O desenho só observa. O médico fixa o preço, a forma de responder e as palavras, e o mesmo médico pode usar mais voz e cobrar mais por outro motivo. O estudo não testa se a voz ou as palavras mudam o valor pago, e os autores falam em "efeito" e em "magnificar" para uma ligação.
- O artigo diz que conta como efeito de moderação a diferença entre voz e texto nas palavras de compreensão, com p = 0,09, acima do corte comum de 0,05; a Figura 3 a marca com um asterisco à parte.
- O texto diz que as proporções de palavras vão de 0 a 1, mas a Tabela 1 mostra máximos acima de 1 (1,162 para compreensão, 1,551 para discrepância, 1,083 para hesitação e 1,048 para emoção positiva). O artigo não explica.
- O texto dá a consulta média de 36,53 yuans com desvio-padrão de 21,37 e 14,34 anos de trabalho com desvio-padrão de 7,01; a Tabela 1 dá as mesmas médias com desvios de 42,154 e 7,908. Uma leitura possível é que o texto conte por médico e a tabela por consulta, mas o artigo não diz, e com médias iguais essa leitura não fecha. A Tabela 1 também dá valor mínimo de 1 yuan, enquanto o texto diz que os preços vão de 30 a 699 yuans.
- A Tabela 4 diz que as diferenças entre grupos estão em porcentagem, mas a análise é do logaritmo do valor; os autores leem 0,122 como 12,2%, o que só vale de forma aproximada.
- A variável de voz marca a mensagem, mas a análise é por consulta; o artigo não diz como uma consulta com mensagens de voz e de texto foi classificada.
- Os autores apontam que os dados vêm de uma só plataforma de um só país, que não é um painel ao longo do tempo e que faltam dados dos pacientes, como a escolaridade.
- Os quatro grupos e as descrições de cada um vêm de apêndices e figuras que a Ficha não conferiu além do que o texto do artigo diz.
