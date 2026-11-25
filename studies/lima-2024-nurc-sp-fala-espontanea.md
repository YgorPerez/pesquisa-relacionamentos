---
reference: "Lima R, Leal SE, Candido Junior A, Aluísio SM. *A Large Dataset of Spontaneous Speech with the Accent Spoken in São Paulo for Automatic Speech Recognition Evaluation*. Preprint arXiv:2409.15350, 2024. Lidos: o resumo do preprint, o cartão do corpus no Hugging Face (https://huggingface.co/datasets/nilc-nlp/CORAA-NURC-SP-Audio-Corpus) e o README do repositório (https://github.com/nilc-nlp/nurc-sp)."
link: https://arxiv.org/abs/2409.15350
status: partial
verified_on: 2026-11-25
strength: moderate
strength_reason: "Corpus grande, de 239 horas e 401 falantes, com transcrição revisada; é fala culta de São Paulo gravada pelo Projeto NURC, que começou em 1969, sem sorteio dos falantes, e foi conferido só nas páginas do corpus."
countries: [Brasil]
period: "não informado nas páginas lidas; o Projeto NURC começou em 1969"
sample:
  n: 401
  description: "401 falantes (204 mulheres e 197 homens) de inquéritos do Projeto NURC gravados na capital paulista: diálogos entre dois informantes, entrevistas e elocuções formais, cortados em mais de 170 mil trechos de áudio com transcrição."
  representative: false
design: cross-sectional
conflict: "Acadêmico (NILC, USP); as páginas lidas não falam em financiamento."
covers:
  genders: [man, woman]
---

# Lima et al. (2024): o NURC-SP, 239 horas de fala culta paulistana transcrita

## O que mediu

O NURC-SP Audio Corpus põe em formato digital, com transcrição revisada, as gravações do Projeto NURC em São Paulo, que desde 1969 registra a fala de pessoas com curso superior em capitais brasileiras. O artigo descreve o corpus e testa modelos de reconhecimento automático de fala treinados nele. Cada trecho traz o gênero da fala, o sexo, a faixa de idade e um código do falante.

Ficha parcial: conferida no resumo do preprint e nas páginas do corpus, não no texto completo.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Falantes e horas | 401 falantes, 204 mulheres e 197 homens, em 239,30 horas de gravação transcrita | Resumo do preprint | "The NURC-SP Audio Corpus comprises 401 different speakers (204 females, 197 males) with a total of 239.30 hours of transcribed audio recordings." |
| Trechos | 239,68 horas de áudio (239,30 depois de tirar os trechos sem transcrição), em mais de 170 mil trechos | Cartão do Hugging Face | "containing 239.68 hours of audios (239.30 when filtered) and their respective transcriptions (170k+ segmented audios)." |
| O acervo de origem | O NURC de São Paulo digitalizado tem 375 inquéritos em 334 horas de gravação | README do repositório | "The digitized NURC/SP comprises 375 inquiries in 334 hours of recordings taken in Sao Paulo capital." |
| O que é o NURC | Um projeto de 1969 que estuda a fala culta urbana em cinco capitais brasileiras | README do repositório | "The NURC Project that started in 1969 to study the cultured linguistic urban norm spoken in five Brazilian capitals" |

## Como obter os dados

Download livre no Hugging Face (`nilc-nlp/CORAA-NURC-SP-Audio-Corpus`), na licença CC BY-NC-ND 4.0, como diz o cartão do corpus. O texto vem dentro dos arquivos Parquet junto com o áudio: pelo cartão, cerca de 27 GB por configuração (a original e a filtrada). Os modelos e as receitas de treino estão no Hugging Face e no GitHub do grupo, como diz o resumo. Consultado em 2026-11-25.

## Limitações

- É fala culta, de gente com curso superior, gravada pelo NURC; as páginas lidas não dizem os anos de cada gravação.
- Parte é elocução formal (aula, conferência), não conversa.
- Não há desfecho nem conversa entre desconhecidos interessados um no outro.
- A Ficha não leu o artigo inteiro: a divisão por gênero de fala e por faixa de idade está no texto completo.
