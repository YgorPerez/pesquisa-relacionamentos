---
reference: "Araújo GE, Ponti M, Candido Junior A, Leal S, Casanova E, Silva RM, Oliveira Jr. M, Santos AB, Lopes GW, Aluísio S. *Certas Palavras: A 1980s-90s Brazilian Radio Corpus to Test TTS Models in Noisy Multi-Speaker Dialogues*. Proceedings of the 17th International Conference on Computational Processing of Portuguese (PROPOR 2026), vol. 1, pp. 819–829, 2026. Dados: https://huggingface.co/datasets/nilc-nlp/certas_palavras."
link: https://aclanthology.org/2026.propor-1.81
license: "CC BY 4.0 (Creative Commons Attribution 4.0 International License, como diz a ACL Anthology para o que foi publicado a partir de 2016)"
status: verified
verified_on: 2026-11-26
strength: weak
strength_reason: "Corpus de um programa de rádio só, dos anos 1980 e 1990, com dois apresentadores e convidados do meio literário e artístico; transcrição revista à mão, mas os falantes não são amostra de nenhuma população."
countries: [Brasil]
period: "anos 1980 e 1990 (as gravações); a revisão das transcrições foi de novembro de 2023 a maio de 2024"
sample:
  n: 190
  description: "70,98 horas de áudio do programa de rádio Certas Palavras, guardado pelo CEDAE (Centro de Documentação Cultural Alexandre Eulalio), com 190 falantes: os dois apresentadores, um coapresentador recorrente e 187 convidados; 42.486 trechos com transcrição revista à mão e com tempo."
  representative: false
design: cross-sectional
conflict: "Feito no C4AI (USP), com apoio da FAPESP e da IBM Corporation, do Ministério da Ciência, Tecnologia e Inovações (PPI-SOFTEX) e da CAPES. Um dos autores é da NVIDIA e outro da Venturus."
covers:
  genders: [man, woman]
---

# Araújo et al. (2026): o Certas Palavras, 70 horas de diálogo de rádio brasileiro

## O que mediu

Certas Palavras foi um programa de rádio sobre livros e ideias, com entrevistas, debates e reportagens, apresentado por Jorge Vasconcellos e Claudiney Ferreira e transmitido até meados dos anos 1990. Os autores digitalizaram as fitas, transcreveram o áudio com o WhisperX e puseram uma equipe para revisar à mão a transcrição e dizer quem fala em cada trecho. As regras de transcrição marcam pausas preenchidas, hesitações, sons expressivos como o riso, palavras incompreensíveis e trechos com música. O corpus foi feito para testar síntese de voz em condições difíceis, e o artigo treina dois modelos com 9 horas da voz de um dos apresentadores.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| O que é | 70 horas de um programa de rádio brasileiro transmitido nos anos 1980 e 1990 | 1. Introduction | "a 70-hour archival corpus drawn from a Brazilian radio program broadcasted between the 1980s and 1990s" |
| Tamanho | 190 falantes, 689.574 palavras, 70,98 horas e 42.486 trechos de 5,95 segundos em média | Tabela 2 | "Total 190 689,574 70.98 42,486 5.95" |
| Quem fala | Além dos dois apresentadores e de um coapresentador, 187 convidados: 133 homens e 54 mulheres | 3.2 Corpus | "the corpus contains contributions from 187 guest speakers, of whom 133 are male and 54 are female" |
| Revisão humana | As transcrições automáticas foram revistas e completadas à mão por 12 anotadores | 3.1 Audio Processing and Annotation | "the automatically generated transcripts were subsequently manually verified and enriched by a team of 12 annotators" |
| Concordância | Na marcação de quem fala, a concordância entre os anotadores ficou em 0,809 e 0,962 (kappa de Fleiss) nos dois programas testados | 3.1 Audio Processing and Annotation | "The kappa values were 0.809 and 0.962, respectively." |
| Regras de transcrição | A transcrição seguiu 11 regras, para o que é dito e para o que não é fala | 3.1 Audio Processing and Annotation | "The final transcripts followed a structured set of 11 annotation guidelines addressing both verbal and non-verbal phenomena." |
| Riso e outros sons | Uma das regras marca sons expressivos ou emotivos, como o riso | 3.1 Audio Processing and Annotation | "expressive or emotional sounds (e.g., laughter)" |
| Pausas e emoção | 8.968 frases com pausa preenchida e 594 com conteúdo emotivo | Tabela 2 | "972 8968 594 609 1807" |
| Licença dos dados | O artigo dá a licença do corpus como CC BY-NC 4.0 (uso sem fins comerciais) | Tabela 1, última linha | "CC-BY 4.0 CC BY-NC 4.0" |

O kappa mede o quanto os anotadores concordam além do acaso: 0 é o acaso, 1 é concordância total.

## Limitações

- É um programa só, de rádio, com apresentadores e convidados do meio literário e artístico, gravado há 30 a 40 anos. Não é conversa a dois do dia a dia, nem por mensagem.
- A fala é desigual entre as pessoas: o apresentador principal é a voz mais presente, com 9 das 70 horas.
- O áudio foi reduzido a 16 kHz, e a avaliação de síntese usa só a voz de um apresentador, como os próprios autores dizem.
- A página do Hugging Face (consultada em 2026-11-26) lista 27.480 trechos em três partes e não mostra licença; o artigo conta 42.486 trechos e dá CC BY-NC 4.0.
- A Tabela 2 conta as frases com conteúdo emotivo, mas o artigo não diz quantas são de riso.

## Como usamos

- [Catálogo de bases de conversa e encontros](../reports/2026-11-26-bases-de-conversa-e-encontros.md): a novidade em português, diálogo espontâneo com transcrição revista à mão.
