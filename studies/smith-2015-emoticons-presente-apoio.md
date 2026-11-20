---
reference: "Smith KA. *Assessing the Supportiveness of Gift Emoticons in Care Scenarios*. CHI'15 Extended Abstracts on Human Factors in Computing Systems (Student Research Competition), pp. 151–156, 2015."
link: https://doi.org/10.1145/2702613.2726969
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Um só experimento fora do namoro, num resumo estendido de seis páginas da competição de estudantes do CHI, com 150 trabalhadores do Mechanical Turk dos EUA que julgaram uma única troca de mensagens inventada entre uma cuidadora e uma amiga; o texto não diz quantas pessoas ficaram em cada uma das cinco versões, e a análise trata as quatro notas de cada pessoa como se fossem pessoas diferentes."
countries: [EUA]
period: "não informado no texto lido"
sample:
  n: 150
  description: "150 trabalhadores do Amazon Mechanical Turk, só dos EUA, com taxa de aprovação acima de 90% e aprovados num teste curto de compreensão do inglês: 94 homens e 56 mulheres; 36 de 16 a 25 anos, 89 de 26 a 40, 23 de 41 a 65 e 2 acima de 65. Cada um recebeu US$ 0,50. Não eram necessariamente cuidadores. Não é um estudo de namoro: a mensagem era de uma amiga para uma cuidadora."
  representative: false
design: experiment
conflict: "O texto não declara financiamento nem conflito de interesse. A autora é da Computing Science da University of Aberdeen, e a mensagem de apoio e o cenário vêm de um trabalho anterior dela."
covers:
  genders: [man, woman]
---

# Smith (2015): flores como emoticon numa mensagem de apoio a uma cuidadora

## O que mediu

Cada participante leu um trecho de conversa por mensagem instantânea: Alice, que cuida de uma pessoa sem receber por isso, conta a uma amiga, Sally, que teve um dia difícil, e Sally responde "I understand how stressful it must be". O sorteio decidiu entre cinco versões: a resposta sozinha, a resposta com "\*flowers\*" escrito no fim, a resposta com uma figura de buquê no fim, ou a resposta seguida de um balão à parte dizendo que Sally mandou um presente, em texto ("a gift of flowers") ou com a figura. Depois, a pessoa deu notas de 1 a 9 ao quanto o apoio foi adequado, útil, eficaz e sensível, e explicou as notas por escrito. A ideia da autora era saber se um assistente virtual que conversa com cuidadores deveria pôr esse emoticon de presente nas mensagens. Não é um estudo de namoro, e é um resumo estendido curto, da competição de estudantes do CHI.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quem participou | 150 trabalhadores do Mechanical Turk dos EUA, 94 homens e 56 mulheres, pagos com US$ 0,50 cada | Methods | "There were 150 participants (94 male, 56 female). 36 were aged 16-25, 89 were 26-40, 23 were 41-65 and 2 were over 65, paid $0.50 each." |
| As cinco versões | Houve diferença entre as cinco versões na nota de apoio, a média das quatro notas (F = 2,95; p < 0,05) | Results, Effects of Condition | "I performed a 1-way 5 level ANOVA of Condition on Supportedness Rating. This was signiﬁcant (F(4,595)=2.95 p<0.05)." |
| Médias de cada versão | Nota de apoio: figura de flores no fim 7,32; balão de presente com a figura 7,19; balão de presente em texto 7,15; sem flores 6,77; "\*flowers\*" escrito no fim 6,74 | Table 2 | "IP EP ET 7.32 7.19 7.15 2 ET C IT 7.15 6.77 6.74" |
| Figura de flores no fim da mensagem | Nas comparações uma a uma, a resposta com a figura de flores no fim ficou acima da resposta sem flores e da com "\*flowers\*" escrito; o balão de presente com a figura só ficou acima da com "\*flowers\*" escrito | Results, Effects of Condition | "Post-hoc comparisons showed that IP rated signiﬁcantly better than C & IT and that EP was rated signiﬁcantly better than IT at p<0.05." |
| Balão de presente em texto | O balão dizendo que Sally mandou "a gift of flowers", em palavras, não se distinguiu de nenhuma das outras quatro versões, nem da resposta sem flores | Results, Effects of Condition | "ET was not signiﬁcantly different from any condition." |
| Figura contra texto | Juntando as quatro versões com flores, a figura teve nota de apoio maior que o texto (F = 5,46; p < 0,05); dizer que era um presente ou não dizer não fez diferença | Results, Effects of Condition | "A 2×2 ANOVA of Explicitness × Pictureness conﬁrmed that a picture of ﬂowers was better than text (F(1,484)=5.46, p<0.05), but there was no difference between implicit and explicit gifting." |
| Tipo de nota | Em todas as versões, a resposta pareceu mais adequada e sensível do que útil e eficaz; a utilidade ficou com a nota mais baixa (F = 55,39) | Results, Effects of Condition | "This was signiﬁcant at (F(3,447)=55.39 p<0.01)." |
| O que os participantes escreveram | Nas versões com flores, em figura ou em texto, 25 participantes leram as flores como um esforço de Sally para animar Alice, e não só para mostrar que entendia | Qualitative Analysis | "participants recognised that this was an effort by Sally to ‘cheer Alice up’, rather than solely sympathise (n=25)" |
| Dúvida sobre a sinceridade | Só na versão sem flores, três participantes duvidaram que Sally entendesse de fato; a autora supõe que o gesto das flores deixe a empatia com cara de mais genuína | Qualitative Analysis | "In the Control condition, three participants questioned whether Sally “really understand”s." |

O Trecho das médias é a Tabela 2 como o texto extraído a lê, coluna por coluna; na tabela, cada versão tem a sua média na mesma linha, e o balão de presente em texto (7,15) aparece nos dois grupos de versões que não se distinguem entre si. A nota de apoio é a média das quatro notas de 1 a 9 (adequação, utilidade, eficácia e sensibilidade). O F compara as médias de grupos: quanto maior, menos provável que a diferença seja acaso. O p é a chance de uma diferença daquele tamanho aparecer só por acaso; abaixo de 0,05, a autora a trata como real. O artigo não dá o tamanho das diferenças em desvios-padrão.

## Limitações

- Não é sobre namoro, nem sobre quem manda a mensagem ser visto de um jeito ou de outro: os participantes julgaram o quanto o apoio de uma amiga a uma cuidadora parecia bom, olhando de fora uma única troca de mensagens inventada.
- A autora diz que os participantes não eram necessariamente cuidadores, que o estudo olhou uma só troca de mensagens e que mandar flores sempre pode perder o efeito com o tempo.
- O texto não diz quantas pessoas ficaram em cada versão. Os graus de liberdade (595 e 484) passam de 150 pessoas, o que indica que as quatro notas de cada pessoa entraram como observações separadas; isso faz diferenças parecerem menos ligadas ao acaso do que são.
- A figura no fim ficou acima da resposta sem flores, mas o balão de presente com a figura só ficou acima da versão com "\*flowers\*" escrito, e não da resposta sem flores. O ganho do emoticon sobre não mandar nada apareceu numa das duas versões com figura.
- Parte dos participantes não entendeu as versões em texto: alguns não souberam o que "\*flowers\*" queria dizer, e outros acharam que um buquê de verdade estava sendo mandado. A autora diz que isso pode ter puxado para baixo as notas do texto.
- Todas as cinco versões tiveram nota acima da que a mesma mensagem tivera num estudo anterior da autora (6,00), e ela atribui isso ao novo jeito de mostrar a conversa, em balões com horário.
- A parte qualitativa conta temas nos comentários de poucos participantes (de 3 a 27), sem comparar as versões com números.
