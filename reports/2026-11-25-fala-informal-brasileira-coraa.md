---
ticket: 936
---

# Como o brasileiro fala quando fala solto: muletas, palavras de palestra e tamanho do enunciado no CORAA

**Data:** 2026-11-25 · **Ticket:** [#936](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/936)
**Status de verificação:** este relatório é uma **reanálise nossa** das transcrições do [CORAA](../studies/candido-2022-coraa-fala-espontanea.md) (🟡, força moderada), que junta trechos de cinco projetos de fala, entre eles o [C-ORAL-BRASIL I](../studies/raso-2012-c-oral-brasil.md) (✅, moderada) e o [SP2010](../studies/mendes-2012-sp2010-fala-paulistana.md) (🟡, fraca). Os autores do CORAA não publicaram nenhuma dessas contagens: elas saíram das nossas contas sobre as planilhas de transcrição que eles distribuem, sem revisão de fora. As Fichas são a fonte do que cada corpus é.

A pergunta é descritiva: na fala espontânea e informal de brasileiros, quais palavras de apoio ("né", "aí", "assim", "tipo") aparecem e quanto, que palavras quase só aparecem em fala preparada, como aula e palestra, e de que tamanho são os pedaços em que a fala sai. Não é sobre namoro nem sobre texto de chat: é fala, gravada em entrevista, conversa de família ou monólogo. Serve de referência para saber como soa a fala solta em português e o que soa a texto lido.

## Resposta curta

- **A fala espontânea tem umas três vezes mais muletas que a fala preparada.** Somando 20 marcadores ("né", "aí", "assim", "tipo", "então", "sabe", "acho que", "sei lá" e outros), a fala informal teve de 4,7 a 5,8 por 100 palavras nos três corpora informais (SP2010, C-ORAL-BRASIL e ALIP); a palestra TEDx em português brasileiro, 2,0; a aula e a conferência do NURC-Recife, 1,5.
- **As muletas mais comuns são "né", "aí", "assim" e "então", e mudam de lugar para lugar.** Na entrevista paulistana do SP2010, "né" é o primeiro (27% dos marcadores); na conversa mineira do C-ORAL, "aí" (27%), e no monólogo informal mineiro, "aí" chega a 34%. "Tipo" e "cara" existem, mas bem abaixo desses. Gíria como "mano", "pô" e "bagulho" quase não aparece, o que diz mais da idade e da época dos falantes que da fala em geral.
- **Há palavras que a fala solta quase não usa e a palestra usa de 6 a mais de 20 vezes mais:** "apenas", "somente", "porém", "no entanto", "portanto", "de fato", "ou seja", "obviamente", "extremamente", "este", e palavras de tema como "jornada", "propósito", "conexão", "compartilhar", "desafio" e "gratidão". Na fala informal, as trocas são "só", "mas", "então", "mesmo", "tipo", "muito", "esse".
- **Na fala informal, as formas reduzidas ganham das cheias por muito.** Na conversa do C-ORAL, que transcreve como se fala, "pra" saiu 27 vezes para cada "para", "tá" 43 para cada "está", "tava" 20 para cada "estava" e "tô" 9,5 para cada "estou".
- **A fala solta sai em pedaços curtos, e quanto mais planejada, mais longos.** No C-ORAL, o trecho mediano tem 4 palavras na conversa em família, 7 no monólogo em família e 10 no monólogo em público. No monólogo informal, 4 de cada 10 pedaços começam com um conectivo ("aí", "e", "mas", "então", "porque"), e 1 em cada 10 com "aí".

## Os dados e o método

**Fonte.** As três planilhas de transcrição do CORAA ASR v1.1 (`metadata_train_final.csv`, `metadata_dev_final.csv` e `metadata_test_final.csv`), baixadas do espelho `gabrielrstan/CORAA-v1.1` no Hugging Face, sem o áudio: 402 mil trechos, cada um com o projeto de origem, o gênero da fala e o texto. A licença é CC BY-NC-ND 4.0. Nenhum trecho transcrito entra neste relatório ou no acervo, só contagens.

**Os grupos.**

- **Fala informal:** SP2010 (capital paulista, entrevista sociolinguística, de 2012 e 2013), C-ORAL-BRASIL I (Minas Gerais, conversa, diálogo e monólogo espontâneos, separados pelo código de cada arquivo em família ou público) e ALIP (interior paulista, entrevista e diálogo).
- **Para comparar:** o NURC-Recife, de gente com curso superior, em diálogo entre dois informantes, entrevista e elocução formal (aula e conferência), e as palestras TEDx em português brasileiro.
- **Tirado do SP2010:** os trechos de leitura em voz alta que fazem parte da entrevista (um texto, uma notícia e uma lista de palavras), achados pelas frases conhecidas desses textos e pelos trechos de 3 palavras ou mais sem nenhuma palavra gramatical: 2.924 trechos e 21 mil palavras. Sobram 43.558 trechos e 319 mil palavras.

O "informal" das contas de palavras é o SP2010 sem a leitura, o C-ORAL sem o monólogo em público e o ALIP: **743.656 palavras**. O "preparado" é o TEDx em português brasileiro e a elocução formal do NURC-Recife: **710.187 palavras**.

**Contagem.** Texto em minúsculas, palavras por expressão regular, expressões de várias palavras contadas como sequência exata. As taxas são por milhão de palavras (/M). Os arquivos não trazem idade, sexo nem quem fala, então não dá para separar por faixa de idade nem tirar o entrevistador.

**Critério para as palavras de palestra.** No máximo 30 por milhão na fala informal e pelo menos 6 vezes mais frequente na fala preparada, com contagem exata e acento.

## Resultados

### 1. As muletas, corpus por corpus (por milhão de palavras)

| Marcador | SP2010 | C-ORAL conversa (família) | C-ORAL diálogo (família) | ALIP | NURC diálogo | NURC aula | TEDx |
|---|---|---|---|---|---|---|---|
| né | 15.624 | 9.249 | 9.687 | 12.372 | 8.991 | 2.285 | 4.034 |
| assim | 11.353 | 7.677 | 6.446 | 9.474 | 4.721 | 2.124 | 2.122 |
| então | 9.126 | 3.869 | 4.665 | 6.831 | 6.376 | 6.068 | 4.736 |
| acho que | 7.389 | 2.055 | 2.564 | 2.100 | 3.187 | 389 | 578 |
| aí | 5.877 | 14.388 | 12.109 | 11.747 | 3.999 | 1.379 | 3.392 |
| ah | 9.371 | 7.798 | 8.191 | 3.203 | 1.926 | 1.456 | 1.301 |
| sabe | 1.618 | 1.995 | 2.030 | 1.951 | 1.805 | 381 | 763 |
| tipo | 1.154 | 2.418 | 1.567 | 873 | 1.020 | 821 | 576 |
| tipo assim | 56 | 423 | 285 | 101 | 25 | 0 | 8 |
| cara | 1.013 | 1.632 | 2.066 | 614 | 495 | 59 | 689 |
| entendeu | 837 | 725 | 570 | 503 | 666 | 85 | 73 |
| sei lá | 634 | 363 | 356 | 197 | 310 | 34 | 74 |
| olha | 681 | 1.511 | 1.282 | 623 | 290 | 102 | 522 |
| falei | 828 | 1.269 | 1.531 | 1.075 | 86 | 102 | 714 |
| falou | 718 | 2.297 | 2.742 | 1.865 | 299 | 76 | 598 |
| legal | 1.603 | 725 | 534 | 551 | 69 | 34 | 348 |
| mano | 22 | 60 | 36 | 12 | 0 | 0 | 27 |
| pô | 116 | 302 | 36 | 45 | 14 | 0 | 115 |

"Assim", "então", "cara", "olha", "sabe" e "aí" também têm uso comum, fora do papel de muleta (advérbio, substantivo, verbo, lugar), então os números delas são um teto. "Nossa" ficou fora da tabela porque é também o possessivo, que domina no TEDx.

**Densidade.** Somando né, aí, assim, tipo, então, sabe, nossa, cara, olha, entendeu, mano, pô, velho, daí, enfim, uai, ué, sei lá, tá ligado e acho que, sem as hesitações ("eh", "ah", "uh"), que cada projeto transcreve de um jeito:

| Corpus | Marcadores por 100 palavras | Os mais comuns |
|---|---|---|
| SP2010 | 5,8 | né 27%, assim 20%, então 16%, acho que 13%, aí 10% |
| C-ORAL conversa (família) | 5,4 | aí 27%, né 17%, assim 14%, então 7%, nossa 6% |
| ALIP | 5,0 | né 25%, aí 24%, assim 19%, então 14% |
| C-ORAL monólogo (família) | 4,7 | aí 34%, né 22%, assim 17%, então 10% |
| C-ORAL diálogo (família) | 4,7 | aí 26%, né 20%, assim 14%, então 10% |
| NURC-Recife diálogo | 3,3 | né 27%, então 19%, assim 14% |
| NURC-Recife entrevista | 2,7 | então 26%, né 22% |
| TEDx (português brasileiro) | 2,0 | então 24%, né 20%, aí 17% |
| NURC-Recife aula e conferência | 1,5 | então 41% |

A fala espontânea ficou entre 4,7 e 5,8 marcadores por 100 palavras, perto de um a cada 20 palavras; a preparada, entre 1,5 e 2,0. É a diferença mais clara da análise, umas três vezes, e aparece nos três corpora informais. O NURC-Recife, mais antigo e de gente com curso superior, fica no meio mesmo no diálogo.

**A fala relatada.** "Falei" e "falou" ("aí eu falei", "ela falou") aparecem bem mais no monólogo informal mineiro, onde a pessoa conta uma história: 3.063 e 2.802 por milhão, contra 714 e 598 no TEDx. No SP2010, "falei" fica em 828 por milhão, então só um corpus mostra a diferença com força.

### 2. O tamanho do pedaço de fala

O CORAA não traz duração nem falante, e o trecho é o corte de áudio que cada projeto fez, não a frase. No C-ORAL o corte segue o mesmo critério em todos os gêneros, então dá para comparar dentro dele:

| Corpus | Mediana (palavras) | Quartis | 90% até | Acima de 20 palavras | Abrem com conectivo | Abrem com "aí" |
|---|---|---|---|---|---|---|
| C-ORAL conversa (família) | 4 | 2 a 7 | 12 | 1,8% | 23% | 5,2% |
| C-ORAL diálogo (família) | 5 | 2 a 8 | 13 | 2,8% | 25% | 4,6% |
| C-ORAL monólogo (família) | 7 | 4 a 14 | 23 | 12,0% | 39% | 10,3% |
| C-ORAL monólogo (público) | 10 | 5 a 19 | 34 | 22,4% | 42% | 5,5% |
| SP2010 | 6 | 2 a 11 | 16 | 3,8% | 28% | 2,1% |
| ALIP | 6 | 3 a 10 | 15 | 3,8% | 27% | 4,1% |
| TEDx (português brasileiro) | 17 | 16 a 18 | 21 | 10,6% | 17% | 0,4% |

Os conectivos contados no começo do pedaço são aí, e, mas, então, daí, porque, que, né, só e tipo. O TEDx é cortado em janelas quase fixas (quartis de 16 a 18 palavras) e o NURC-Recife em pedaços curtos em todos os gêneros, então nenhum dos dois serve para comparar tamanho. No C-ORAL, quanto mais planejada a fala, mais longo o pedaço: 4 palavras na conversa, 7 no monólogo em família, 10 no monólogo em público. Um monólogo informal anda em pedaços de 4 a 14 palavras, e 4 em cada 10 começam com um conectivo.

O artigo do C-ORAL mede outra coisa parecida, o enunciado (a unidade que a entonação fecha), e acha o mesmo sentido: em diálogos e conversas, 58,7% dos enunciados têm um só bloco de entonação; em monólogos, 56,8% têm dois ou mais ([Raso 2012](../studies/raso-2012-c-oral-brasil.md)).

### 3. Formas reduzidas

Cada projeto transcreve de um jeito. O SP2010 escreve "pra", mas normaliza "tá" para "está" e "cê" para "você" (nele, "tá" sai 480 vezes por milhão contra 1.349 de "está", e "cê" 132 contra 9.537 de "você"). O C-ORAL transcreve como se fala, e por isso é a referência aqui:

| Na conversa do C-ORAL (família) | Reduzida /M | Cheia /M | Razão |
|---|---|---|---|
| pra × para | 8.040 | 302 | 27 : 1 |
| tá × está | 12.876 | 302 | 43 : 1 |
| tava × estava | 2.479 | 121 | 20 : 1 |
| tô × estou | 2.297 | 242 | 9,5 : 1 |
| cê × você | 12.030 | 1.209 | 10 : 1 |

No SP2010, "pra" × "para" fica em 43 : 1. "A gente" × "nós" foi 5 : 1 no SP2010 e 3 : 1 no C-ORAL, mas 2,9 : 1 no TEDx também, então essa troca não separa a fala informal da preparada. O "cê" é forte em Minas, de onde vem o C-ORAL.

### 4. Palavras de palestra

As que passaram no critério (no máximo 30 por milhão na fala informal e pelo menos 6 vezes mais na preparada):

| Palavra | Informal, vezes (/M) | Preparada, vezes (/M) | Razão | Na fala informal |
|---|---|---|---|---|
| algo | 58 (78) | 430 (605) | 7,8 | alguma coisa, um negócio |
| apenas | 19 (26) | 251 (353) | 13,8 | só |
| somente | 14 (19) | 126 (177) | 9,4 | só |
| contigo | 0 | 8 (11) | – | com você |
| lhe | 7 (9) | 85 (120) | 12,7 | te |
| porém | 5 (7) | 63 (89) | 13,2 | mas |
| no entanto | 3 (4) | 55 (77) | 19,2 | mas |
| entretanto | 0 | 13 (18) | – | mas |
| portanto | 9 (12) | 108 (152) | 12,6 | então |
| sobretudo | 0 | 39 (55) | – | principalmente |
| afinal | 7 (9) | 47 (66) | 7,0 | no fim |
| além disso | 7 (9) | 49 (69) | 7,3 | e também, fora que |
| de fato | 19 (26) | 169 (238) | 9,3 | mesmo |
| ou seja | 15 (20) | 187 (263) | 13,1 | tipo, quer dizer |
| certamente | 5 (7) | 32 (45) | 6,7 | com certeza |
| obviamente | 2 (3) | 41 (58) | 21,5 | lógico, claro |
| absolutamente | 10 (13) | 67 (94) | 7,0 | muito, demais |
| extremamente | 18 (24) | 106 (149) | 6,2 | muito, demais |
| profundamente | 2 (3) | 39 (55) | 20,4 | muito |
| finalmente | 5 (7) | 51 (72) | 10,7 | até que enfim |
| este / neste / deste | 11 / 9 / 4 | 122 / 66 / 50 | 11,6 / 7,7 / 13,1 | esse, nesse, desse |
| jornada | 0 | 78 (110) | – | – |
| propósito | 2 (3) | 133 (187) | 69,6 | – |
| conexão / conectar | 4 / 0 | 86 / 69 | 22,5 / – | – |
| compartilhar | 0 | 134 (189) | – | contar, mostrar |
| essência | 1 | 37 | 38,7 | – |
| reflexão | 0 | 72 (101) | – | – |
| desafio | 0 | 152 (214) | – | – |
| inspiração | 0 | 41 (58) | – | – |
| gratidão | 0 | 29 (41) | – | – |
| empatia | 1 | 62 (87) | 64,9 | – |
| momentos | 11 (15) | 93 (131) | 8,9 | – |
| sentimento | 11 (15) | 132 (186) | 12,6 | – |
| perspectiva | 6 (8) | 63 (89) | 11,0 | visão ("na minha visão") |
| vivência / experiências | 6 / 7 | 40 / 99 | 7,0 / 14,8 | – |
| incríveis | 2 (3) | 41 (58) | 21,5 | – |

A razão compara as taxas por milhão, porque os dois grupos têm tamanhos um pouco diferentes. A coluna da direita é a troca que aparece na fala informal com o mesmo sentido, quando existe; é uma sugestão de leitura nossa, não uma contagem. Ficaram fora por não passar no critério "realmente", "simplesmente", "de alguma forma", "incrível", "especial" e "nós". "Faz sentido" é rara no CORAA (8 por milhão), mas a expressão é recente e o corpus é de gente mais velha.

## Limites

- **É uma reanálise nossa**, descritiva, sem registro prévio e sem revisão de fora. As contagens dependem da expressão regular, da lista de marcadores e do filtro de leitura do SP2010, que pode ter tirado alguns trechos curtos de conversa e deixado algum pedaço lido.
- **É fala, não chat.** Nada aqui mede texto escrito, mensagem de aplicativo nem o que funciona numa conversa de namoro. Não há desfecho: as contagens dizem como se fala, não o que agrada.
- **Outra gente, outro tempo.** O NURC-Recife é dos anos 1970 a 1990 e de gente com curso superior; o C-ORAL é de Belo Horizonte (o "cê" e o "uai" são de lá); o ALIP é do interior paulista; o SP2010 é a capital, de 2012 e 2013, mas em entrevista com pesquisador e com gente de todas as idades. Ninguém foi escolhido por ser jovem, e a gíria de hoje quase não aparece. O CORAA não serve para medir gíria.
- **Sem idade e sem falante.** Os arquivos não trazem idade, sexo nem quem fala; entrevistador e entrevistado vêm juntos.
- **Transcrição desigual.** O SP2010 normaliza "tá" e "cê", e o ALIP em parte; só o C-ORAL mostra as formas reduzidas como faladas. As hesitações também são transcritas de jeitos diferentes, por isso ficaram fora da densidade.
- **Trecho não é frase.** O tamanho depende de como cada projeto cortou o áudio; só a comparação dentro do C-ORAL é justa.
- **Marcadores com dois sentidos.** "Assim", "então", "aí", "cara", "sabe", "olha" e "nossa" também têm uso comum; as taxas são teto.
- **A fala preparada** é palestra TEDx e aula ou conferência do NURC-Recife, que é mais antiga. Uma palavra pode ser rara na fala informal por ser de outra época, não só por ser formal.

## Relatórios que tocam o tema

- [Abreviar e escrever em internetês](2026-11-15-abreviacao-e-internetes.md): a escrita informal brasileira em chats e redes, descrita por estudos de linguística. Este relatório é o lado falado: mostra o que é informal na fala, não na escrita.
- [Emoji, risada escrita, figurinha e áudio](2026-11-15-emoji-risada-figurinha-e-audio.md): os estudos sobre mensagem de voz. Quem grava um áudio fala, e as contagens daqui dizem como a fala solta costuma soar.
- [Espelhar o estilo do outro por texto](2026-11-15-espelhar-o-estilo-por-texto.md): o ajuste de estilo entre duas pessoas. Aqui não há duas pessoas identificadas, só o estilo médio de cada tipo de fala.
- [Perguntas de continuidade e simpatia](2026-11-25-perguntas-de-continuidade-e-simpatia.md): a outra reanálise do mesmo ticket, sobre conversas por texto em inglês.

## O que isso muda nos Guias e nas Dicas

Nada. Os Guias e as Dicas tratam do que funciona para conhecer alguém, e este relatório não mede nenhum desfecho. Se um Guia um dia falar de mensagem de voz ou de como soar natural, pode citar as Fichas do [C-ORAL-BRASIL I](../studies/raso-2012-c-oral-brasil.md) e do [CORAA](../studies/candido-2022-coraa-fala-espontanea.md) para dizer o que esses corpora são, mas não estes números, que são uma conta nossa sem estudo publicado por trás.
