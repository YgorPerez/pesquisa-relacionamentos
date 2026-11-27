---
ticket: 953
---

# O que as mulheres escreviam no perfil do OkCupid: 10.097 perfis de 2012

**Data:** 2026-11-27 · **Ticket:** [#953](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/953)
**Status de verificação:** este relatório é uma **reanálise nossa** da base de perfis do OkCupid de Kim e Escobedo-Land (2015, *Journal of Statistics Education*), na cópia do Hugging Face [SpiceeChat/OkCupid-59k-Anonymized-Profiles](https://huggingface.co/datasets/SpiceeChat/OkCupid-59k-Anonymized-Profiles) (Apache-2.0). Os autores não publicaram nenhuma destas contagens. Saíram de contas por palavra-chave, sem revisão de fora. A base não tem Ficha no acervo.

A pergunta: o que uma mulher jovem põe no próprio perfil de app? Quanto escreve em cada campo, de que assuntos fala, o que pede no "me mande mensagem se" e com que frequência aparece um detalhe concreto que dá assunto para a primeira mensagem? A base não diz quantas mensagens cada perfil recebeu, então nada daqui mostra o que funciona. É um retrato, e serve para escrever perfis de teste realistas e para saber que gancho é comum e qual é raro.

## Resposta curta

- **Elas escreviam bastante.** Na mediana, foram 274 palavras somando os 10 campos, e 76 só no "sobre mim". Na mediana, 9 dos 10 campos estavam preenchidos, e 44% preencheram todos. Os homens da mesma idade escreviam um pouco menos no "sobre mim" (69 palavras).
- **Comida, música, livros e amigos aparecem em sete de cada dez perfis, e filmes em seis.** São tão comuns que, sozinhos, não distinguem uma pessoa da outra. Cachorro aparece em 17%, gato em 10% e yoga em 8%.
- **No "me mande mensagem se", três em cada quatro descrevem quem querem** ("you're...", "you like..."). Só 4% pedem que a pessoa puxe assunto de algo do perfil, e só 3% dizem quem não deve escrever.
- **Detalhe concreto sobre a própria vida é minoria.** Só 8% falam do próprio bicho ("my dog") e 8% de uma atividade que fazem ou estão aprendendo ("I play", "learning to"). O "ask me about" quase não aparece (0,6%).
- **Um em cada quatro perfis tem "adventure" ou "adventurous", e 11% se dizem sarcásticos.** "Easy going" ou "laid back" aparece em 9%.

## Os dados e o método

São 59.946 perfis da região de San Francisco, raspados com permissão do OkCupid em junho de 2012. Cada um traz idade, gênero, orientação, hábitos e os 10 campos de texto livre que o OkCupid tinha na época: sobre mim, o que faço da vida, no que sou bom, o que reparam primeiro em mim, livros, filmes, música e comida favoritos, seis coisas sem as quais não vivo, no que passo o tempo pensando, sexta à noite, algo privado que admito e me mande mensagem se. A base não tem foto, conversa nem desfecho.

O recorte são as **mulheres heterossexuais de 18 a 30 anos: 10.097 perfis**, com idade mediana de 26. Tirei as tags HTML e os links do texto e contei as palavras por espaço. Os temas foram contados por expressão regular, em qualquer campo, e cada perfil conta uma vez por tema. Por exemplo, "comida" é *cook*, *food*, *foodie*, *restaurant* ou *baking*, e "ar livre" é *hiking*, *camping*, *outdoors*, *beach* ou *ocean*. No "me mande mensagem se" contei os 7.672 campos preenchidos. Não há modelo nem teste: os números são descritivos.

## Resultados

**Tamanho de cada campo (mulheres de 18 a 30)**

| Campo | Em branco | Palavras (mediana) | 25% a 75% |
|---|---|---|---|
| Sobre mim | 11% | 76 | 37 a 136 |
| O que faço da vida | 13% | 30 | 14 a 54 |
| No que sou boa | 17% | 16 | 7 a 31 |
| O que reparam primeiro | 19% | 9 | 5 a 19 |
| Livros, filmes, música, comida | 17% | 74 | 39 a 128 |
| Seis coisas sem as quais não vivo | 17% | 13 | 9 a 21 |
| No que passo o tempo pensando | 25% | 14 | 7 a 29 |
| Sexta à noite | 21% | 16 | 8 a 27 |
| Algo privado que admito | 36% | 12 | 7 a 22 |
| Me mande mensagem se | 24% | 19 | 9 a 39 |

O campo mais pulado é o mais pessoal ("algo privado que admito"). Uma em cada três o deixa em branco. No campo dos favoritos, a mediana é de 14 itens separados por vírgula.

**Temas citados (% dos perfis que citam em qualquer campo)**

| Tema | % | Tema | % |
|---|---|---|---|
| Comida, cozinhar | 72 | Ar livre, trilha, praia | 32 |
| Música | 70 | Dança | 31 |
| Livros, ler | 70 | Vinho, cerveja | 25 |
| Amigos | 70 | Arte, museu | 21 |
| Filmes | 64 | Academia, corrida | 21 |
| Riso, humor | 54 | Cachorro | 17 |
| Séries, TV | 53 | Café | 16 |
| Família | 53 | Gato | 10 |
| Viagem | 39 | Yoga | 8 |
| | | Jogos | 6 |

**O que pede o "me mande mensagem se" (7.672 campos)**

| Pedido | % |
|---|---|
| Descreve quem ela quer ("you're...", "you have...", "you like...") | 76 |
| Genérico ("if you want to", "why not") | 22 |
| Humor ("make me laugh", "funny", "witty") | 15 |
| Sair ou fazer algo junto ("grab a drink", "go out", "adventure") | 11 |
| Conversa ("conversation", "talk") | 10 |
| Puxar assunto do perfil ("anything above", "in common") | 4 |
| Quem não deve escrever, ou "hook up" como recusa | 3 |
| Altura | 2 |

As categorias se sobrepõem. O campo tem 19 palavras na mediana.

**Frases feitas (% dos perfis)**

| Frase | % |
|---|---|
| "adventure" ou "adventurous" | 25 |
| "sarcastic" | 11 |
| "easy going" ou "laid back" | 9 |
| "love to laugh" | 4 |
| "down to earth" | 3 |
| "work hard, play hard" | 1 |
| "partner in crime" | 1 |

## Limites

- **É 2012, em San Francisco, num app que pedia 10 textos.** O perfil de hoje no Tinder ou no Hinge tem uma bio curta e três prompts. O tamanho e a quantidade de campos não se transferem, mas a frequência relativa dos temas talvez sim.
- **Não há desfecho.** A base não diz quem recebeu mensagem, nem quem respondeu, então não mostra que perfil ou que gancho funciona. Isso fica nos estudos com dados do próprio OkCupid listados abaixo.
- **Os temas foram contados por palavra-chave**, em inglês. "Read" pega "I read" e "ready to read"; "art" pega só a palavra inteira. O erro deve ser de alguns pontos, para mais ou para menos.
- **É uma raspagem de perfis públicos**, com permissão do OkCupid e anonimizada, mas os textos são de pessoas reais. Por isso este relatório não cita nenhum trecho.

## Relatórios que tocam o tema

- [Texto do perfil](2026-11-15-texto-do-perfil.md) e [O que um perfil diz](2026-11-14-o-que-um-perfil-diz.md): o que se sabe sobre o efeito do texto do perfil, com estudos que medem resposta.
- [Primeira mensagem e resposta](2026-11-14-primeira-mensagem-e-resposta.md): o que os dados do OkCupid de 2009 dizem das palavras da primeira mensagem ([okcupid-2009-palavras-primeira-mensagem](../studies/okcupid-2009-palavras-primeira-mensagem.md)).

## O que isso muda nos Guias e nas Dicas

Nada por enquanto. Sem desfecho, a base não sustenta uma Dica. O que ela dá é uma taxa de base: um gancho que sete em cada dez perfis oferecem (gostar de música, de comida) diz pouco sobre aquela pessoa, e um detalhe da vida dela (o bicho, algo que ela faz) aparece em menos de um em cada dez. Se um estudo com desfecho mostrar que a abertura num detalhe raro rende mais resposta, esta tabela mostra quão raro ele é.
