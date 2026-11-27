---
ticket: 954
---

# Como são as frases marcadas como flerte: tinderflirting e flirty_or_not

**Data:** 2026-11-27 · **Ticket:** [#954](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/954)
**Status de verificação:** este relatório é uma **reanálise nossa** de duas bases públicas do Hugging Face, [aidanzhou/tinderflirting](https://huggingface.co/datasets/aidanzhou/tinderflirting) e [ieuniversity/flirty_or_not](https://huggingface.co/datasets/ieuniversity/flirty_or_not). Nenhuma das duas tem artigo, método de coleta publicado ou licença declarada. Por isso nenhuma das duas tem Ficha, e as contas daqui não têm revisão de fora.

As duas bases trazem frases soltas, em inglês, com o rótulo "flerte" ou "não flerte". A pergunta: o que separa uma frase rotulada como flerte das outras, e o rótulo bate com o de um leitor que não o vê? Não há desfecho. Ninguém registrou se a outra pessoa respondeu, gostou ou sumiu.

## Resposta curta

- **As duas bases são quase a mesma.** 1.408 frases aparecem nas duas, e o flirty_or_not tem só 646 que não estão no tinderflirting. Sem repetidas, sobram 3.905 frases: 1.711 de flerte e 2.194 de não flerte.
- **A frase de flerte junta "eu" e "você"**: 45% das de flerte têm os dois, contra 8% das outras. Ela tem menos pergunta (8% contra 20%) e menos riso escrito (3% contra 11%).
- **Pouco do que se chama flerte ali é conversa de app.** Um leitor cego (um modelo de linguagem) classificou 100 frases sorteadas. Das 50 rotuladas como flerte, ele leu 22 como conversa de casal ("you just left and I already miss you"), 12 como sexting e só 13 como chat entre desconhecidos de app.
- **Três em cada cinco frases de flerte soam como frase pronta.** O leitor marcou 30 das 50 como cantada ou fórmula que serviria para qualquer pessoa, contra 1 das 50 de não flerte.
- **O leitor concordou com o rótulo em 90 das 100.** Quase todas as discordâncias são respostas comuns de chat de app que quem montou a base marcou como flerte e o leitor não ("fair enough, i'm on holidays right now").

## Os dados e o método

O tinderflirting tem 3.754 frases (1.390 de flerte) e o flirty_or_not tem 2.114 (metade de flerte). As duas misturam mensagens de chat de app, frases de site de cantada, mensagens entre casais e sexting. Juntei as duas e tirei as frases repetidas, comparando o texto em minúsculas e sem pontuação. Também tirei 20 frases que aparecem com rótulos diferentes.

**Medidas.** Para cada frase contei as palavras e marquei, por expressão regular:
- pergunta (`?`);
- segunda pessoa (*you*, *your*, *u*, *ur*) e primeira pessoa (*I*, *me*, *my*), cada uma sozinha e as duas na mesma frase;
- elogio (*beautiful*, *cute*, *pretty*, *gorgeous*, *hot*, *sexy*, *smile*, *eyes*...);
- palavra sexual (*bed*, *kiss*, *naked*, *body*, *tonight*, *come over*...);
- emoji, piscadela (`;)`, `:P`), riso escrito (*lol*, *haha*) e exclamação;
- fórmula clássica de cantada (*are you a*, *did it hurt*, *if you were a*).

**Leitor cego.** Sorteei 100 frases com pelo menos 3 palavras, 50 de cada rótulo, e embaralhei a ordem. Um agente de modelo de linguagem (Claude Opus 5.5), sem acesso aos rótulos nem à origem das frases, marcou três coisas em cada uma:
- se ela flerta;
- se soa como cantada pronta ou fórmula que serviria para qualquer pessoa;
- em que fase ela parece estar: chat entre desconhecidos de app, casal ou gente que já se viu, sexting explícito, ou sem como saber.

O agente seguiu as regras de um assistente de mensagens de app que manda evitar fórmula e piada pronta. Não há modelo estatístico nem teste. Os números são descritivos, e a amostra do leitor é pequena.

## Resultados

**Medidas por rótulo (3.905 frases sem repetidas)**

| Medida | Flerte | Não flerte |
|---|---|---|
| Palavras (mediana) | 10 | 7 |
| "Eu" e "você" na mesma frase | 45% | 8% |
| Segunda pessoa | 62% | 24% |
| Primeira pessoa | 64% | 41% |
| Pergunta | 8% | 20% |
| Palavra sexual | 15% | 1% |
| Elogio | 8% | 3% |
| Riso escrito | 3% | 11% |
| Piscadela | 4% | 0% |
| Emoji | 5% | 5% |
| Exclamação | 2% | 3% |
| Fórmula clássica de cantada | 1% | 0% |

**Leitor cego contra o rótulo (100 frases)**

| | Rótulo flerte (50) | Rótulo não flerte (50) |
|---|---|---|
| O leitor viu flerte | 43 | 3 |
| O leitor não viu flerte | 7 | 47 |
| Soa como frase pronta | 30 | 1 |
| Fase: chat de app | 13 | 33 |
| Fase: casal | 22 | 1 |
| Fase: sexting | 12 | 1 |
| Fase: sem como saber | 3 | 15 |

Das 43 frases em que rótulo e leitor viram flerte, só 7 parecem chat de app, e 4 dessas 7 soam como frase pronta.

## Limites

- **Não se sabe como as bases foram montadas**, nem quem pôs o rótulo. "Flerte" aqui é o julgamento de quem montou a base, não de quem recebeu a mensagem.
- **Não há desfecho.** Nada aqui diz que tipo de frase de flerte rende resposta ou encontro.
- **O leitor é um modelo de linguagem**, e a amostra é de 100 frases. Concordar com o rótulo em 90% mostra que ele e quem rotulou entendem "flerte" de modo parecido, não que os dois acertam o que a outra pessoa sentiu.
- **A fase foi um palpite do leitor** sobre uma frase sem contexto. Em 18 das 100 ele não teve como dizer.
- **As medidas por palavra-chave são grosseiras**, e o retrato vale para frases em inglês.

## Relatórios que tocam o tema

- [Primeira mensagem e resposta](2026-11-14-primeira-mensagem-e-resposta.md): o que se sabe da primeira mensagem, inclusive cantada original contra cantada pronta ([berkes-2021-cantadas-originais](../studies/berkes-2021-cantadas-originais.md)).

## O que isso muda nos Guias e nas Dicas

Nada. As bases mostram o que alguém chamou de flerte, e isso é sobretudo conversa de casal, sexting e frase pronta, sem saber se funcionou. Elas não servem para dizer como flertar num chat de app. Servem, no máximo, para saber que um leitor automático separa flerte de conversa comum mais ou menos como uma pessoa separa.
