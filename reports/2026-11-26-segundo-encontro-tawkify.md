---
ticket: 945
---

# Quem quer um segundo encontro depois do primeiro: os dados da Tawkify

**Data:** 2026-11-26 · **Ticket:** [#945](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/945)
**Status de verificação:** este relatório é uma **reanálise nossa** dos dados abertos de [Eastwick et al. 2025](../studies/eastwick-2025-encontros-tawkify.md) (✅, força fraca), listados no [catálogo de bases de conversa e encontros](2026-11-26-bases-de-conversa-e-encontros.md). O artigo é sobre idade, e as contas daqui, de taxa de segundo encontro, não estão nele.

A Tawkify é uma agência de casamenteiros dos Estados Unidos. Ela marca um primeiro encontro entre dois clientes e, depois, pergunta a cada um como foi e se quer um segundo. A pergunta deste relatório: depois de um primeiro encontro de verdade, quantos querem o segundo, quantas vezes os dois querem, e o que acompanha esse sim? Não há conversa nos dados, só o questionário de depois.

## Resposta curta

- **Pouco mais da metade quer um segundo encontro, e os dois juntos só em um terço.** Disseram que querem 59,5% dos homens e 55,7% das mulheres. Os dois quiseram em 35,2% dos encontros, só um em 44,5% e nenhum em 20,3%.
- **Entre as mulheres de até 30 anos, menos da metade quis** (44,6%, 177 relatos), contra 66,4% dos homens dessa idade. Nos pares em que ela tinha até 30, os dois quiseram em 26%. Nas outras faixas de idade, homens e mulheres ficaram perto de 55% a 60%.
- **O sim acompanha de perto a nota que a pessoa deu ao encontro.** Com nota 3 de 5, de 14% a 18% quiseram. Com nota 4, de 61% a 69%. Com nota 5, de 89% a 93%. Entre as mulheres de até 30, foi 13%, 56% e 96%.
- **O sim de um pesa pouco no do outro.** Quando ele quis, ela quis em 59%. Quando ele não quis, ela quis em 50%.
- **Entre quem tem menos de 40, as mulheres disseram menos sim a parceiros mais velhos.** Com o parceiro 4 anos ou mais novo, 66%. Com a mesma idade, 53%. Com 4 a 6 anos mais velho, 49%. Com 7 ou mais, 41%. Acima do limite de idade que a pessoa tinha declarado, o sim caiu uns 10 pontos, para os dois gêneros.

## Os dados

O arquivo `DateFeedbackForUpload.sav`, do [OSF rkm2d](https://osf.io/rkm2d/?view_only=a0fe91dae0464077af7772e6890a8151) (link view-only citado no artigo), tem 9.084 relatos de 6.262 pessoas sobre 4.542 primeiros encontros, entre 16 de outubro de 2023 e 10 de janeiro de 2024. Os encontros foram presenciais ou por vídeo, mas o arquivo não diz qual. Cada relato traz:

- a idade de quem responde, arredondada para baixo;
- o gênero (homem ou mulher). Todos os 4.542 encontros têm os dois relatos, e 4.363 são de um homem e uma mulher;
- a diferença de idade do parceiro e se ele estava acima do limite de idade que a pessoa tinha declarado;
- o **desejo**, média de três itens de 1 a 5;
- a **nota geral do encontro**, de 1 a 5;
- **quer um segundo encontro** (sim ou não).

A idade mediana de quem responde é 46 anos, e só 460 relatos são de gente com até 30. A licença dos dados não está declarada. O artigo é CC BY.

## Método

Proporções simples, por gênero, por faixa de idade, por nota do encontro e por faixa de desejo. Para a reciprocidade, os 4.363 encontros de homem e mulher com os dois relatos. A diferença de idade é a do parceiro menos a de quem responde, só entre quem tem menos de 40 (2.832 relatos). Não há modelo nem teste: os números são descritivos.

## Resultados

**Quer um segundo encontro, por idade de quem responde**

| Idade | Homens | Mulheres |
|---|---|---|
| 22 a 30 | 66% (283) | 45% (177) |
| 31 a 40 | 61% (1.556) | 57% (1.054) |
| 41 a 50 | 59% (1.171) | 58% (1.297) |
| 51 a 60 | 55% (977) | 54% (1.171) |
| 61 ou mais | 60% (536) | 55% (793) |

**Quer um segundo encontro, pela nota que deu ao encontro**

| Nota do encontro | Homens | Mulheres | Mulheres até 30 |
|---|---|---|---|
| 1 | 0% (59) | 1% (134) | 0% (5) |
| 2 | 4% (84) | 1% (165) | 0% (10) |
| 3 | 14% (886) | 18% (1.239) | 13% (54) |
| 4 | 61% (1.963) | 69% (1.971) | 56% (80) |
| 5 | 89% (1.531) | 93% (997) | 96% (28) |

**Quer um segundo encontro, pelo desejo (1 a 5)**

| Desejo | Homens | Mulheres |
|---|---|---|
| 1 a 2 | 1% | 4% |
| 2 a 3 | 23% | 36% |
| 3 a 4 | 81% | 90% |
| 4 a 5 | 97% | 99% |

**Os dois relatos do mesmo encontro**

| | Os dois querem | Só um | Nenhum |
|---|---|---|---|
| Todos os encontros (4.542) | 35,2% | 44,5% | 20,3% |
| Ela com até 30 (167) | 26% | | |

**Menos de 40 anos: quer um segundo encontro, pela idade do parceiro**

| Parceiro | Homens | Mulheres |
|---|---|---|
| 4 anos ou mais novo | 65% (844) | 66% (150) |
| 1 a 3 mais novo | 57% (402) | 60% (263) |
| mesma idade | 64% (125) | 53% (119) |
| 1 a 3 mais velho | 56% (241) | 53% (316) |
| 4 a 6 mais velho | 57% (81) | 49% (180) |
| 7 ou mais velho | 50% (10) | 41% (78) |

Com o parceiro acima do limite de idade declarado, quiseram 51% dos homens e 48% das mulheres. Dentro do limite, 61% e 57%.

## Limites

- **É uma agência paga, nos Estados Unidos, com clientes de idade mediana de 46.** Os jovens são poucos (460 relatos até 30), e o encontro foi marcado por um casamenteiro, não por um match de app.
- **"Quer um segundo encontro" é o que a pessoa disse à agência**, não se o encontro aconteceu.
- **Nota e sim saem do mesmo questionário**, preenchido ao mesmo tempo. A nota acompanha o sim, mas não o explica.
- **A diferença de idade e o limite declarado se misturam:** o parceiro mais velho é também o que mais passa do limite que a mulher declarou.
- **O arquivo não separa presencial de vídeo.**
