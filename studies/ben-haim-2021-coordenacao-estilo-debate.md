---
reference: "Ben-Haim A, Tsur O. *Open-Mindedness and Style Coordination in Argumentative Discussions*. Proceedings of the 16th Conference of the European Chapter of the Association for Computational Linguistics (EACL 2021): Main Volume, p. 1876–1886, 2021. Também em arXiv:2101.10164. Texto completo aberto: https://aclanthology.org/2021.eacl-main.161.pdf"
link: https://doi.org/10.18653/v1/2021.eacl-main.161
license: "CC BY 4.0 (Creative Commons Attribution 4.0 International License, como diz o rodapé da ACL Anthology para o material publicado a partir de 2016; o PDF traz só o ©2021 da Association for Computational Linguistics)"
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Registros reais e numerosos de um fórum do Reddit, mas só observacionais: os resultados aparecem apenas em gráficos com asteriscos, o texto não dá o tamanho de nenhuma diferença, são dezenas de testes t sem correção e o mesmo usuário entra várias vezes; é um artigo de conferência de linguística computacional."
countries: []
period: "janeiro de 2018 a junho de 2020"
sample:
  n: 9374
  description: "9.374 discussões em inglês do fórum Change My View (CMV), do Reddit, abertas por 4.873 autores entre janeiro de 2018 e junho de 2020, com 1.301.545 mensagens de 86.941 usuários. Em cada discussão, quem abre posta uma opinião e se diz disposto a mudá-la; os outros respondem tentando convencer. O texto não traz dados de quem são os usuários."
  representative: false
design: platform
conflict: "O artigo não traz declaração de financiamento nem de conflito de interesse."
covers: {}
---

# Ben-Haim & Tsur (2021): ajuste de estilo e abertura a mudar de ideia em debates do Reddit

## O que mediu

No fórum Change My View, quem abre a discussão posta uma opinião e se diz disposto a mudá-la. Quem é convencido por um argumento dá ao autor dele um delta (∆), um sinal que precisa ser justificado e só pode ir para quem defende a posição contrária. Os autores tomam duas coisas como sinal de mente aberta: ser quem abriu a discussão e dar um delta. Depois mediram o ajuste de estilo: o quanto o uso de uma classe de palavras por uma pessoa (artigos, advérbios, quantificadores, conjunções, pronomes, preposições, verbos auxiliares e outras categorias do programa LIWC) aumenta a chance de quem responde diretamente a ela usar a mesma classe. Compararam esse ajuste entre grupos de usuários e entre ramos da discussão com e sem delta, com testes t.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tamanho dos dados | 9.374 discussões em inglês, abertas por 4.873 autores entre janeiro de 2018 e junho de 2020, com 1.301.545 mensagens de 86.941 usuários | 1.3, p. 1877 | "Our corpus consists of 9,374 English discussions initiated by 4873 OPs between January 2018 and June 2020. It contains 1,301,545 posts (utterances) by 86,941 unique users." |
| Deltas dados | Foram dados 8.659 deltas, 877 deles por usuários que não eram quem abriu a discussão | 1.3, p. 1877 | "8,659 Deltas were awarded, 877 of them by users that are not the OP." |
| Quem abriu a discussão | Na própria discussão, quem a abriu se ajustou mais ao estilo dos outros do que os demais participantes, em todas as classes de palavras e nas três formas de somar as classes (p < 0,001) | 4.1, p. 1881; Figura 1a | "We reject the null hypothesis H1.1 with p < 0.001 for all markers and measures and confirm that OPs present significantly higher levels of coordination, compared to regular users" |
| Mesma pessoa, com e sem o papel de quem abriu | As mesmas pessoas se ajustaram mais ao estilo dos outros nas discussões que abriram do que quando participavam da discussão de outro; a força desse resultado varia entre as classes de palavras | 4.1, p. 1881; Figura 1b | "Similarly, we reject the null hypothesis H1.2 , though significance values vary between markers (Figure 1b)." |
| Quem já abriu discussões, na discussão de outro | Participando da discussão de outro, quem já tinha aberto discussões e quem nunca abriu não mostraram diferença no ajuste de estilo | 4.1, p. 1881 | "Indeed, we find no significant difference between their coordination levels." |
| Quem deu delta sem ter aberto a discussão | Os participantes que deram um delta sem serem quem abriu a discussão se ajustaram mais ao estilo dos outros do que os que não deram delta, na maioria das classes de palavras e nas três formas de somar | 4.1, p. 1881; Figura 2 | "We reject the null hypothesis (H2 ) for most markers and all aggregate types (Figure 2). This result confirms that non-OP Delta givers present higher levels of coordination compared to users that did not give Delta." |
| Ramos da discussão com e sem delta | Nos ramos da discussão em que alguém deu um delta, o ajuste de estilo entre todos os participantes foi menor do que nos ramos sem delta, na maioria das classes de palavras | 4.1, p. 1881; Figura 3 | "Surprisingly, we find that the levels of accommodation are higher in branches where no Delta was awarded" |
| Ajuste dos outros a quem deu delta | Contando só as mensagens anteriores ao delta, o ajuste dos outros ao estilo de quem deu delta, comparado ao ajuste a quem não deu, foi diferente em algumas classes de palavras (quantificadores, advérbios, preposições e pronomes pessoais) e em duas formas de somar, mas não na terceira nem nas outras classes. Onde houve diferença, o ajuste a quem deu delta foi em geral menor; só nas preposições foi maior. Os autores chamam o resultado de misto | 4.2, p. 1881; Figura 4 | "Significance is observed for some markers (quantifiers, adverbs, prepositions and personal pronouns) and for Aggregate 1 and 2, but not for Aggregate 3" |
| Ajuste dos outros a quem deu delta sem ter aberto | Não apareceu diferença entre o ajuste dos outros ao estilo de quem deu delta sem ter aberto a discussão e o ajuste a quem não deu delta | 4.2, p. 1881; Figura 5a | "While we cannot reject H4.1 (Figure 5a)" |
| Ajuste dos outros a quem abriu e deu delta | Contando só as mensagens anteriores ao delta, os outros tinham se ajustado mais ao estilo de quem abriu a discussão e depois deu delta do que ao de quem abriu e não deu, de cujo estilo em geral se afastavam. A diferença aparece nas três formas de somar e na maioria das classes de palavras (p < 0,001); o texto exclui só os advérbios, mas o gráfico também não marca diferença nos quantificadores | 4.2, p. 1881; Figura 5b | "we do reject H4.2 (Figure 5b), as significance (p < 0.001) is observed for all markers and aggregate measures but for adverbs. That is, while regular ∆-givers do not experience any special accommodation, we do observe a dramatic difference in accommodation patterns toward ∆-giving OPs vs. OPs that did not award a ∆ – OPs are inclined to award a ∆ in discussion threads that are accommodating toward them" |
| Ajuste dos outros a quem abriu a discussão | Comparado ao ajuste dirigido aos demais participantes, o ajuste dos outros a quem abriu a discussão foi menor em todas as classes de palavras e nas três formas de somar. Na maioria das classes, como artigos, conjunções e preposições, os outros chegaram a se afastar do estilo de quem abriu em vez de se ajustar a ele; nos quantificadores e advérbios ainda houve ajuste, só menor | 4.2, p. 1882; Figura 6 | "This hypothesis is rejected with significance of p < 0.001 for all markers. However, we see that users tend to diverge from the OPs, rather than accommodate toward them (Figure 6)." |
| Leitura dos autores, resumo | No resumo, os autores dizem que as discussões que chegam a um acordo têm menos ajuste de estilo. Isso vale para o ajuste entre todos os participantes do ramo; o ajuste dos outros a quem abriu a discussão e depois deu delta andou no sentido contrário (linhas acima) | Resumo, p. 1876 | "On the discussion level, we surprisingly find that discussions that reach agreement present lower levels of accommodation." |

O ajuste de estilo de uma pessoa a outra é a diferença entre duas chances: a de ela usar uma classe de palavras ao responder a uma mensagem que usou essa classe e a de usá-la em qualquer resposta à mesma pessoa. Acima de zero, ela se ajusta; abaixo, se afasta. As três formas de somar juntam as classes de palavras de jeitos diferentes quando falta dado de alguma delas. O p é a probabilidade de uma diferença desse tamanho aparecer por acaso se ela não existisse; abaixo de 0,05 costuma-se tratar como improvável. O artigo só mostra os valores do ajuste em gráficos de barras, sem dar números no texto.

## Limitações

- O estudo não é sobre namoro. São debates entre desconhecidos num fórum público do Reddit sobre opiniões, com moderação forte e regras próprias, como a de que quem abre a discussão tem de responder a quem discorda.
- O texto não dá o tamanho de nenhuma diferença, só se ela passou nos limites de p < 0,05, 0,01 ou 0,001, marcados com asteriscos em gráficos. Com dezenas de milhares de usuários, diferenças muito pequenas passam nesses limites.
- São dezenas de testes t, um por classe de palavras e por forma de somar, sem correção para os vários testes. Cada usuário vira uma pessoa separada em cada discussão de que participa, então a mesma pessoa entra várias vezes nas comparações; o artigo não discute essa dependência.
- É um estudo de associação. "Mente aberta" é o papel de quem abriu a discussão ou o ato de dar um delta, não uma medida da pessoa, e nada foi manipulado.
- O resumo e a discussão leem que acordo vem com menos ajuste. Isso sai da comparação entre ramos com e sem delta, que mede o ajuste entre todos os participantes do ramo. A comparação do ajuste dirigido a quem abriu a discussão e deu delta vai no sentido contrário, e a dirigida a quem deu delta sem ter aberto não mostrou diferença.
- Na discussão, os autores escrevem que quem deu delta sem ter aberto a discussão tende a dá-lo em discussões de estilos afastados e levantam a hipótese de que o delta serve, sem a pessoa perceber, para aliviar a tensão. Nenhum teste do artigo separa os ramos pelo tipo de quem deu o delta, e a hipótese não foi testada.
- Em dois pontos o texto e os gráficos não batem. O texto diz que a diferença no ajuste dirigido a quem abriu a discussão passou de p < 0,001 em todas as classes, mas a Figura 6 marca os quantificadores com dois asteriscos (p < 0,01). E diz que o ajuste a quem abriu e deu delta difere em todas as classes menos os advérbios, mas a Figura 5b também deixa os quantificadores sem asterisco.
- O texto não diz de que países são os usuários nem traz idade ou gênero deles. Só entraram discussões em inglês.
- É um artigo de conferência de linguística computacional, de 11 páginas, revisado pelos pareceristas da conferência. O texto não diz quantas discussões ou usuários entraram em cada comparação; só as legendas dos gráficos trazem esses números.
