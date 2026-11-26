---
ticket: 947
---

# Fala espontânea, mas em público: muletas, ritmo e pausas no Certas Palavras

**Data:** 2026-11-26 · **Ticket:** [#947](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/947)
**Status de verificação:** este relatório é uma **reanálise nossa** do [Certas Palavras](https://huggingface.co/datasets/nilc-nlp/certas_palavras) (NILC/USP; [Araújo et al. 2026, PROPOR](https://aclanthology.org/2026.propor-1.81)), que ainda não tem Ficha. Os autores não publicaram nenhuma destas contagens: elas saíram das nossas contas sobre a planilha de segmentos e o áudio que eles distribuem, sem revisão de fora. O que o corpus é vem do artigo.

A pergunta é a mesma da [reanálise do CORAA](2026-11-25-fala-informal-brasileira-coraa.md), noutro tipo de fala: quantas muletas, de que tamanho são os pedaços, que palavras de palestra aparecem, e agora também a que velocidade se fala e quanto tempo passa entre um turno e outro. O Certas Palavras é conversa sem roteiro, mas entre adultos instruídos, no ar, num programa de rádio sobre livros e ideias dos anos 1980 e 1990. Fica entre a conversa informal do CORAA e a palestra. Não é sobre namoro nem sobre chat.

## Resposta curta

- **Conversa sem roteiro, mas em público, tem tão poucas muletas quanto uma palestra.** Com a mesma lista de 20 marcadores do CORAA, os convidados tiveram 2,4 por 100 palavras e os apresentadores 1,6, contra 4,7 a 5,8 na fala informal do CORAA e 2,0 no TEDx. Pouca muleta não quer dizer fala lida: quer dizer registro cuidado.
- **As palavras de palestra aparecem aqui tanto quanto na palestra.** "Apenas", "portanto", "ou seja", "este", "extremamente", "absolutamente" e "sobretudo" saem de 10 a mais de 100 vezes mais que na fala informal do CORAA, e no nível do TEDx ou acima. Outras sete passam no mesmo critério nos dois corpora: "esta", "desta", "espécie", "sabemos", "podemos", "significa" e "breve".
- **Fala-se a 2,8 palavras por segundo**, contando as pausas dentro do segmento (2,7 nos apresentadores, 2,8 nos convidados). Em trechos de 12 segundos ou mais, onde cabem mais pausas, cai para 2,5. Dos 154 falantes com 5 minutos ou mais, a mediana é 2,8 e 9 em cada 10 ficam entre 2,3 e 3,2.
- **Entre pausas, a fala sai em pedaços de umas 8 palavras.** Contando pausas de 250 ms ou mais no áudio, o pedaço mediano tem 8 palavras (de 5 a 11 na metade do meio; 9 em 10 até 16). Pela pontuação da transcrição, o pedaço mediano tem 4 palavras e só 0,4% passa de 25.
- **Entre um turno e outro, a pausa mediana fica perto de 0,2 s**, e metade das trocas leva até 200 ms. Uma em quatro passa de 1 s. A sobreposição e o riso não dão para medir com estes dados (seção 5).

## Os dados e o método

**Fonte.** Duas versões, baixadas em 2026-11-26:

- a planilha `certaspalavras_metadata.csv` do [repositório dos autores no GitHub](https://github.com/GustavoEvangelistaAraujo/CertasPalavras): 38.977 segmentos de 146 episódios (63,96 h), cada um com episódio, falante, texto, sinalizações (hesitação, música) e o início e o fim em segundos no nome do arquivo;
- os 27.480 clipes do Hugging Face (5,4 GB, áudio a 16 kHz), com texto e falante, mas sem episódio nem tempo fora do nome do arquivo.

A planilha do GitHub é a base das contas de texto e de tempo, porque cobre todos os episódios. O áudio do Hugging Face entra no que só o som mede: as pausas dentro do clipe e a correção das pausas entre turnos. As duas casam pelo nome do arquivo (27.478 dos 27.480 clipes). Nos clipes do conjunto de validação, 91% dos textos são iguais nas duas versões, e os nomes de falante do GitHub estão normalizados. O artigo fala em 42.486 segmentos e 70,98 h; nenhuma das versões abertas chega a isso.

**Licença.** CC BY-NC 4.0, dita na Tabela 1 do artigo e no README do GitHub. A página do Hugging Face não mostra licença.

**O corpus.** Pelo artigo: entrevistas e debates de um programa de rádio sobre livros, de dois apresentadores, um co-apresentador e 187 convidados (escritores, jornalistas, acadêmicos, políticos), 133 homens e 54 mulheres. Dos 190 falantes, metade nasceu em São Paulo ou no Rio, e um terço não tem o dado. A transcrição saiu do WhisperX e foi revista à mão por 12 anotadores, com regras para hesitação, riso, música e correção de segmento. A data de cada episódio não vem nos arquivos abertos.

**Os grupos.** O corpus não marca o que é diálogo, monólogo ou locução. Separamos assim:

- **papel**, pelo nome do falante: apresentadores (os três fixos) e convidados; ficam de fora os segmentos de música, sem falante ou com falante desconhecido (3.525 segmentos, 4,9 h);
- **locução (aproximação)**: falas dos apresentadores que citam o nome do programa, a rádio, o intervalo ou a hora. São 1.400 segmentos, e o resto dos apresentadores entra como "apresentadores sem locução";
- **tamanho do turno**: o turno junta os segmentos seguidos do mesmo falante. Turno curto tem menos de 15 s, médio de 15 a 60 s e longo 60 s ou mais. O turno longo do convidado é o mais perto de um monólogo que o corpus tem.

**Contagem.** Texto em minúsculas, palavras por expressão regular, expressões de várias palavras como sequência exata. As hesitações transcritas ("eh", "ah", "ãh" e variantes) ficam fora do total de palavras, como na reanálise do CORAA. Taxas por milhão de palavras (/M) ou por 100 palavras.

**Ritmo.** Palavras do segmento divididas pela duração dele (fim menos início), em segmentos de 1 s ou mais. Os cortes são justos na voz: no áudio, 82% dos clipes começam sem silêncio e 70% terminam sem silêncio, e 9 em 10 terminam com até 0,16 s de silêncio. A conta inclui as pausas dentro do segmento.

**Pausas no áudio.** Energia em quadros de 20 ms. Um quadro é silêncio quando fica abaixo do maior de dois limiares: 30 dB abaixo do percentil 95 do clipe, ou 6 dB acima do percentil 10, que é o chiado da fita. Pausa é silêncio de 250 ms ou mais dentro do clipe. Clipes sem contraste suficiente (1.215) ficam de fora. Com um limiar mais estrito (20 dB e 10 dB), num sétimo do áudio, o pedaço entre pausas cai de 7,0 para 6,5 palavras na mediana. Os números dependem do limiar, e nenhum foi conferido de ouvido.

## Resultados

### 1. As muletas

**Densidade**, com os 20 marcadores da reanálise do CORAA (né, aí, assim, tipo, então, sabe, nossa, cara, olha, entendeu, mano, pô, velho, daí, enfim, uai, ué, sei lá, tá ligado, acho que), sem as hesitações:

| Grupo | Palavras | Marcadores por 100 palavras | Os mais comuns |
|---|---|---|---|
| Convidados, turno curto | 53.316 | 2,4 | né 27%, então 21%, acho que 20% |
| Convidados, todos | 374.402 | 2,4 | né 27%, então 23%, acho que 14%, aí 9%, assim 9% |
| Convidados, turno longo | 209.419 | 2,3 | né 27%, então 24%, acho que 12% |
| Apresentadores, turno curto | 37.575 | 1,9 | né 39%, assim 15%, então 15% |
| Apresentadores sem locução | 180.367 | 1,6 | né 24%, assim 18%, então 14%, aí 12% |
| Locução (aproximação) | 32.726 | 0,4 | então 22%, aí 18% |
| Todos os falantes | 587.495 | 2,0 | né 26%, então 21%, acho que 13%, assim 11%, aí 10% |

Para comparar, do relatório do CORAA: SP2010 5,8, conversa do C-ORAL 5,4, ALIP 5,0, monólogo e diálogo do C-ORAL 4,7, diálogo do NURC-Recife 3,3, entrevista do NURC-Recife 2,7, TEDx 2,0, aula do NURC-Recife 1,5.

Com a lista mais curta de 15 marcadores que inclui "véi" (sei lá, acho que, tá ligado, né, aí, tipo, então, assim, sabe, mano, pô, véi, velho, cara, nossa), a densidade fica um pouco abaixo: 2,2 nos convidados, 1,5 nos apresentadores sem locução, 1,9 no total.

**Por marcador** (por milhão de palavras):

| Marcador | Apresentadores sem locução | Convidados | Convidados, turno longo | CORAA: SP2010 | CORAA: C-ORAL conversa | CORAA: TEDx |
|---|---|---|---|---|---|---|
| né | 3.964 | 6.293 | 6.313 | 15.624 | 9.249 | 4.034 |
| então | 2.323 | 5.326 | 5.644 | 9.126 | 3.869 | 4.736 |
| acho que | 1.264 | 3.365 | 2.770 | 7.389 | 2.055 | 578 |
| assim | 2.883 | 2.089 | 2.034 | 11.353 | 7.677 | 2.122 |
| aí | 1.891 | 2.163 | 2.154 | 5.877 | 14.388 | 3.392 |
| olha | 449 | 1.015 | 936 | 681 | 1.511 | 522 |
| tipo | 765 | 721 | 683 | 1.154 | 2.418 | 576 |
| enfim | 715 | 660 | 731 | – | – | – |
| sabe | 554 | 654 | 745 | 1.618 | 1.995 | 763 |
| entendeu | 283 | 235 | 220 | 837 | 725 | 73 |
| cara | 227 | 200 | 181 | 1.013 | 1.632 | 689 |
| pô | 205 | 29 | 33 | 116 | 302 | 115 |
| sei lá | 94 | 51 | 57 | 634 | 363 | 74 |
| mano | 6 | 0 | 0 | 22 | 60 | 27 |

"Aí", "assim", "então", "olha", "cara", "sabe" e "nossa" também têm uso comum fora do papel de muleta, então as taxas são teto, como no CORAA. "Acho que" é a muleta que mais separa este corpus da palestra: 3.365/M nos convidados, contra 578 no TEDx. É a fala de quem dá opinião. "Aí" é a que mais o separa da conversa informal: 2.163/M, contra 14.388 na conversa do C-ORAL. Só 0,6% dos segmentos abrem com "aí" (no monólogo informal do C-ORAL, 10,3%).

**Hesitações.** A transcrição marca "eh", "ah", "ãh" e variantes de forma regular: 1,4 a cada 100 palavras, perto disso em todos os grupos, e 0,5 na locução.

### 2. O tamanho do pedaço de fala

| Medida | Mediana (palavras) | Quartis | 90% até | Acima de 20 | Acima de 25 |
|---|---|---|---|---|---|
| Segmento (corte do áudio), todos | 13 | 7 a 22 | 33 | 28,5% | – |
| Segmento, convidados em turno longo | 15 | 8 a 24 | 36 | 32,3% | – |
| Entre pausas de 250 ms no áudio, todos | 8 | 5 a 11 | 16 | – | – |
| Entre vírgula, ponto, "?" ou "…", todos | 4 | 2 a 8 | 11 | 1,2% | 0,4% |

O segmento é o corte que o WhisperX e os anotadores fizeram, até 30 s, e não serve para comparar com o trecho do CORAA. O pedaço entre pausas, medido no som, é o que mais se aproxima do que alguém diz de um fôlego. O tamanho e a velocidade são quase os mesmos para apresentadores e convidados, e para turno curto e longo: mediana de 8 palavras e cerca de 2,5 s de fala por pedaço. Há 7,6 pausas a cada 100 palavras, de 0,44 s em média, e as pausas ocupam 9% do tempo dos clipes.

Pela pontuação, que é a medida que o `critica.py` do repositório que usa estes números aplica a um texto, o pedaço é ainda mais curto. Mas a pontuação é escolha de quem transcreve, então este número diz mais da transcrição que da fala.

Nos segmentos, 22% abrem com um conectivo (aí, e, mas, então, daí, porque, que, né, só, tipo), 27% no turno longo do convidado, contra 39% no monólogo informal do C-ORAL. O conectivo de abrir aqui é o "e" (10%), não o "aí".

### 3. Palavras de palestra e formas cheias

**As palavras da lista do CORAA.** Na reanálise do CORAA, entrou na lista a palavra com até 30/M na fala informal e pelo menos 6 vezes isso na palestra. Aqui, a mesma palavra nos convidados (por milhão):

| Palavra | CORAA informal | CORAA TEDx | Convidados | Apresentadores sem locução |
|---|---|---|---|---|
| apenas | 25 | 288 | 342 | 273 |
| portanto | 12 | 139 | 300 | 131 |
| ou seja | 27 | 241 | 363 | 120 |
| este | 19 | 201 | 337 | 180 |
| extremamente | 26 | 165 | 269 | 104 |
| absolutamente | 14 | 113 | 195 | 169 |
| sobretudo | 0 | 39 | 197 | 16 |
| reflexão | 0 | 102 | 200 | 279 |
| de fato | 25 | 264 | 132 | 5 |
| certamente | 8 | 41 | 92 | 27 |
| obviamente | 5 | 70 | 76 | 5 |
| no entanto | 4 | 57 | 63 | 87 |
| algo | 76 | 627 | 126 | 98 |
| porém | 6 | 72 | 13 | 66 |

Nesta tabela, o "CORAA informal" é o SP2010, o C-ORAL e o ALIP inteiros, contando a leitura do SP2010, e o "TEDx" é só o TEDx, sem a aula do NURC-Recife. Por isso os números diferem um pouco dos do relatório do CORAA. Quase toda a lista aparece nos convidados de 5 a mais de 100 vezes mais que na fala informal, muitas vezes acima do TEDx. As exceções são "algo" e "porém", que nos convidados ficam a 2 vezes a fala informal. A lista marca o registro público e instruído, falado ou lido.

**Palavras novas que passam nos dois corpora** (até 30/M na fala informal do CORAA, 6 vezes isso ou mais no TEDx e nos convidados do Certas Palavras):

| Palavra | CORAA informal | TEDx | Convidados | Na fala informal |
|---|---|---|---|---|
| esta | 21 | 167 | 261 | essa |
| desta | 6 | 52 | 63 | dessa |
| espécie | 12 | 87 | 184 | tipo ("uma espécie de" → "tipo um") |
| sabemos | 6 | 74 | 116 | a gente sabe |
| podemos | 14 | 277 | 118 | a gente pode |
| significa | 18 | 182 | 137 | quer dizer |
| breve | 0 | 28 | 26 | logo, daqui a pouco |

Ficaram de fora por pouco ou por só um corpus: "evidentemente" (19/M na fala informal, 255 nos convidados, mas só 3 no TEDx), "naturalmente" (5,7 vezes no TEDx), "aspectos" (5,7 vezes) e "propriamente", "haver" e "seguramente", que sobem aqui e não no TEDx. Muitas delas parecem palavras da época e da gente culta, não da fala preparada em geral. A coluna da direita é a troca que a fala informal usa, uma sugestão de leitura nossa e não uma contagem.

**Formas cheias.** Não dá para medir. A transcrição escreve a forma cheia: "pra" aparece 7 vezes e "para" 6.047, "tô" nenhuma vez e "estou" 356, "tá" 189 e "está" 2.244. O WhisperX normaliza, e a revisão manteve. "Cê" aparece 1.043 vezes, mas quase metade é a sigla da rádio soletrada na locução.

### 4. Ritmo

Palavras por segundo, sem hesitações, em segmentos de 1 s ou mais, contando as pausas dentro do segmento:

| Grupo | Ritmo | Mediana por segmento (de 3 s ou mais) | 10% a 90% dos segmentos |
|---|---|---|---|
| Todos os falantes | 2,75 | 2,74 | 1,96 a 3,72 |
| Apresentadores sem locução | 2,70 | 2,66 | 1,94 a 3,62 |
| Convidados | 2,79 | 2,78 | 1,97 a 3,78 |
| Convidados, turno curto | 2,89 | 2,82 | 2,01 a 3,82 |
| Locução (aproximação) | 2,64 | 2,69 | 2,09 a 3,45 |

- **Por falante**, com 5 minutos ou mais de fala (154 falantes): mediana de 2,80, 10% abaixo de 2,33 e 10% acima de 3,17; o mais lento fica em 1,71 e o mais rápido em 3,68. Os três apresentadores ficam em 2,55, 2,80 e 2,84.
- **Pelo tamanho do segmento**: 3,38 abaixo de 3 s, 2,97 de 3 a 6 s, 2,70 de 6 a 12 s e 2,50 de 12 s em diante. Quanto mais longo o trecho, mais pausas ele tem. Em segmentos de 20 a 30 s, cabem 62 palavras em 25 s.
- **Sem as pausas** de 250 ms ou mais (taxa de articulação), sobe para 3,1 palavras por segundo (3,0 nos apresentadores, 3,1 nos convidados). No sétimo do áudio refeito com o limiar mais estrito, vai de 3,2 para 3,3.

### 5. Pausas entre turnos, sobreposição e riso

**Pausa entre turnos.** Um turno passa para outro falante quando o segmento seguinte do episódio é de outra pessoa. Contamos só os 124 episódios em que nenhum segmento começa antes de o anterior acabar (veja abaixo).

| Medida | Trocas | Mediana | 75% até | 90% até | Até 200 ms | Mais de 1 s |
|---|---|---|---|---|---|---|
| Pelos tempos da planilha | 5.229 | 0,02 s | 0,72 s | 3,08 s | 60% | 20% |
| Corrigida pelo silêncio na borda dos clipes | 2.031 | 0,20 s | 0,97 s | 4,24 s | 50% | 24% |
| Entre dois segmentos do mesmo falante, corrigida | 13.335 | 0,24 s | 0,68 s | 1,21 s | 49% | 13% |

Na planilha, 49% das trocas têm o segmento seguinte começando no milésimo de segundo em que o anterior acaba, o que é corte e não medida. A segunda linha soma o silêncio que o áudio mostra no fim de um clipe e no começo do outro. Mesmo assim, um terço das trocas fica em zero. O apresentador demora um pouco mais para passar a vez ao convidado (pausa mediana, quando há pausa, de 0,77 s) do que o convidado para devolver (0,69 s). A pausa entre turnos fica no mesmo tamanho da pausa entre dois segmentos do mesmo falante. Só a cauda é mais longa.

**Sobreposição: não dá para medir.** Em 127 dos 146 episódios, nenhuma troca de falante se sobrepõe; em 124, nenhum segmento começa antes de o anterior acabar. Nesses, o corte não representa fala simultânea, embora o artigo diga que ela existe. Em 14 episódios, todos com dois a doze convidados, de 66% a 84% das trocas se sobrepõem, por 2 s na mediana, o que parece efeito do corte e não conversa. Cinco outros têm de 2% a 16%. Nenhum desses números descreve a conversa.

**Riso: não dá para medir.** O artigo diz que a transcrição marca sons expressivos, como o riso, e mostra "(risos)" no texto e na sinalização de um exemplo. Conta 594 frases com conteúdo emocional. Nas versões abertas, a sinalização só traz hesitação, música e erro de grafia. A palavra aparece no texto 3 vezes na planilha do GitHub e 1 vez no Hugging Face.

## Limites

- **É uma reanálise nossa**, descritiva, sem registro prévio e sem revisão de fora.
- **É fala de rádio, de outra época e de outra gente.** Adultos instruídos, no ar, dos anos 1980 até meados dos 1990, metade nascida em São Paulo ou no Rio, falando de livros, política e cultura. Não é conversa entre amigos, nem gente jovem, nem fala de hoje. A gíria quase não aparece ("mano" 1 vez em 587 mil palavras).
- **A separação entre diálogo, monólogo e locução é nossa.** O corpus não a marca. A locução é uma aproximação por palavras-chave, e o turno longo do convidado não é um monólogo de verdade: o apresentador escuta e pode ter interrompido sem que o corte mostre.
- **Duas versões que não batem.** O GitHub e o Hugging Face diferem em número de segmentos, nomes de falante e parte dos textos, e nenhuma chega aos números do artigo.
- **Transcrição normalizada.** As formas reduzidas saem como cheias, então a razão "pra" × "para" não existe aqui. O texto das muletas depende do que o WhisperX ouviu e os anotadores mantiveram.
- **As medidas de áudio dependem do limiar** de silêncio, que nenhum ouvido conferiu. Fita analógica tem chiado, e uma pausa curta pode ter passado por voz.
- **Os tempos não medem sobreposição** e marcam muitas trocas como contínuas. A pausa entre turnos é um piso.

## Relatórios que tocam o tema

- [Fala informal brasileira no CORAA](2026-11-25-fala-informal-brasileira-coraa.md): a mesma conta na conversa informal e na palestra. Este relatório é o meio entre os dois: fala sem roteiro, em público.
- [Bases de conversa e de encontros além do CANDOR](2026-11-26-bases-de-conversa-e-encontros.md): o catálogo onde o Certas Palavras apareceu, com a licença e o que se sabia antes de baixar.
- [Emoji, risada escrita, figurinha e áudio](2026-11-15-emoji-risada-figurinha-e-audio.md): os estudos sobre mensagem de voz.

## O que isso muda nos Guias e nas Dicas

Nada. Os Guias e as Dicas tratam do que funciona para conhecer alguém, e este relatório não mede nenhum desfecho. Se um dia o Certas Palavras ganhar Ficha, ela passa a ser a fonte do que o corpus é, e o link daqui muda para ela.
