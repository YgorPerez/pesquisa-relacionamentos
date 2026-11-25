---
reference: "Candido Junior A, Casanova E, Soares A, de Oliveira FS, Oliveira L, Fernandes Junior RC, da Silva DPP, Fayet FG, Carlotto BB, Gris LRS, Aluísio SM. *CORAA ASR: a large corpus of spontaneous and prepared speech manually validated for speech recognition in Brazilian Portuguese*. Language Resources and Evaluation 57(3):1139–1171, 2023 (online em 2022). Lidos: o README do repositório do corpus (https://github.com/nilc-nlp/CORAA) e o resumo do preprint (https://arxiv.org/abs/2110.15731)."
link: https://doi.org/10.1007/s10579-022-09621-4
status: partial
verified_on: 2026-11-25
strength: moderate
strength_reason: "Corpus grande, de 290,77 horas com transcrição revisada à mão, que junta fala espontânea de três regiões e fala preparada para comparar; não é amostra sorteada da população, e os projetos de origem têm épocas e jeitos de transcrever diferentes."
countries: [Brasil, Portugal]
period: "não informado nas páginas lidas"
sample:
  description: "Trechos curtos de áudio (mais de 400 mil) com a transcrição, tirados de cinco projetos: ALIP (interior paulista), C-ORAL-BRASIL I (Minas Gerais), NURC-Recife, SP2010 (capital paulista) e palestras TEDx em português, com 4,69 horas de português europeu. Cada trecho traz o projeto, o gênero (entrevista, diálogo, conversa, monólogo, aula, palestra, leitura), o estilo (espontâneo, preparado ou lido) e o sotaque, sem quem fala."
  representative: false
design: cross-sectional
conflict: "Projeto TaRSila, do C4AI (USP); o README lista como parceiros e financiadores o C4AI, o CEIA, a UFG, a USP e a UTFPR."
covers: {}
---

# Candido Junior et al. (2022): o CORAA, quase 300 horas de fala brasileira transcrita, espontânea e preparada

## O que mediu

O CORAA ASR é um corpus feito para treinar e testar reconhecimento automático de fala em português brasileiro. Os autores juntaram o áudio de cinco projetos de pesquisa, cortaram em trechos de poucos segundos e revisaram ou fizeram à mão a transcrição de cada um. Diferente dos corpora que existiam, ele tem muita fala espontânea (entrevista, diálogo, conversa), ao lado de fala preparada (aula, palestra) e lida.

Ficha parcial: conferida no README do repositório e no resumo do artigo, não no texto completo.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tamanho | 290,77 horas de áudio com transcrição, em mais de 400 mil trechos | README, primeiro parágrafo | "containing 290.77 hours of audios and their respective transcriptions (400k+ segmented audios)" |
| De onde vem | Do áudio de 5 projetos: os de fala de Minas Gerais, de Recife, da capital e do interior paulista, e as palestras TEDx (a lista está no README) | README, primeiro parágrafo | "The dataset is composed of audios of 5 original projects:" |
| Português europeu | Tem também 4,69 horas de português de Portugal | Resumo do preprint | "CORAA also contains European Portuguese audios (4.69 hours)." |
| O que faltava | Os autores o fizeram porque os corpora públicos de então tinham só fala lida ou preparada | Resumo do preprint | "There is a lack of datasets including spontaneous speech, which are essential in different ASR applications." |
| Estilo de cada trecho | Cada trecho é marcado como fala espontânea, preparada ou lida | README, Metadata | "speech_style: Spontaneous Speech or Prepared Speech or Read Speech" |
| Sotaque | Os sotaques marcados são Minas Gerais, Recife, interior de São Paulo e capital paulista | README, Metadata | "accent: one of four accents (Minas Gerais, Recife, Sao Paulo cities, Sao Paulo capital)" |
| Licença | O corpus é livre, na licença CC BY-NC-ND 4.0 | Resumo do preprint | "All the corpora are publicly available at this https URL under the CC BY-NC-ND 4.0 license." |

## Como obter os dados

Download livre, sem cadastro, pelos links do README do repositório (https://github.com/nilc-nlp/CORAA): Google Drive, um servidor do grupo ou o Hugging Face (`gabrielrstan/CORAA-v1.1`). As transcrições e os metadados vêm em três planilhas CSV (`metadata_train_final.csv`, `metadata_dev_final.csv`, `metadata_test_final.csv`), separadas do áudio, que é bem maior. A licença é a Creative Commons Atribuição-NãoComercial-SemDerivações 4.0 (CC BY-NC-ND 4.0): uso sem fins comerciais, com crédito, e sem distribuir versão modificada. Consultado em 2026-11-25.

## Limitações

- Cada linha é um trecho de poucos segundos, sem quem fala, sem idade e sem sexo; entrevistador e entrevistado vêm juntos.
- Pelo que vimos nas transcrições (relatório em "Como usamos"), os projetos de origem transcrevem de jeitos diferentes: um escreve "tá" e "cê" como se fala, outro normaliza para "está" e "você". Comparar formas entre projetos pede cuidado.
- Pelo mesmo relatório, cada projeto cortou o áudio do seu jeito, então o tamanho do trecho não é o tamanho da frase e só se compara dentro de um mesmo projeto.
- É fala, não texto escrito nem conversa de aplicativo.
- A Ficha não leu o artigo inteiro: os números por projeto, as épocas das gravações e a validação estão no texto completo.

## Como usamos

- Relatório [2026-11-25: fala informal brasileira no CORAA](../reports/2026-11-25-fala-informal-brasileira-coraa.md), uma reanálise nossa das transcrições.
