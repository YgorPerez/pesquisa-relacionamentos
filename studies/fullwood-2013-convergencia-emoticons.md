---
reference: "Fullwood C, Orchard LJ, Floyd SA. *Emoticon convergence in Internet chat rooms*. Social Semiotics 23(5):648–662, 2013. Lido o manuscrito aceito, depositado no repositório da University of Gloucestershire: https://eprints.glos.ac.uk/11780/9/11780-Fullwood-%282013%29-Emoticon-convergence.pdf"
link: https://doi.org/10.1080/10350330.2012.739000
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Observação de uma hora em cada uma de quatro salas públicas de bate-papo, com 703 pessoas que não representam ninguém; os percentuais da Tabela 1 usam o denominador errado, as diferenças de piscadela e abraço só passam do limite usual num teste de um lado, e a 'convergência' do título é uma leitura dos autores, não algo que o estudo mediu."
countries: [Reino Unido]
period: "junho de 2009 (2, 9 e 16 de junho)"
sample:
  n: 703
  description: "465 homens e 238 mulheres que escreveram na tela principal de quatro salas de bate-papo britânicas do Noesis (antes Lycos), a '18 plus', a '30-something', a '40 plus' e a '50 plus', todas do grupo 'Romance' do site. Cada sala foi observada por uma hora, em duas meias horas. O sexo é o que o usuário escolheu (cor do nome) e a idade é a do perfil, de 18 a 68 anos, média de 37,30; a idade só pôde ser lida em 622 perfis. Usaram emoticons 114 pessoas (60 homens e 54 mulheres), num total de 441 emoticons. O texto não diz onde os usuários moravam. Não é app de namoro: são salas públicas de bate-papo entre desconhecidos."
  representative: false
design: platform
conflict: "O manuscrito aceito não traz declaração de financiamento nem de conflito de interesse."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 68 }
---

# Fullwood et al. (2013): emoticons em salas de bate-papo

## O que mediu

Alguém da equipe entrou com uma conta em quatro salas de bate-papo do Noesis, separadas por faixa de idade e listadas no grupo "Romance" do site, e copiou a tela principal por uma hora em cada uma, sem conversar com ninguém. Depois a equipe contou quem usou emoticons, de que tipo (dez tipos, pela classificação do MSN), para quem cada um foi dirigido (homem, mulher, várias pessoas ou impossível dizer) e se a pessoa tinha foto no perfil. Uma segunda pessoa, às cegas, codificou parte dos dados de novo, com concordância (kappa) acima de 0,7 em todas as medidas. As comparações são testes qui-quadrado, testes t e análise de variância.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Uso de emoticons por sexo | Nas salas observadas, 54 das 238 mulheres que escreveram na tela principal usaram ao menos um emoticon (22,7%), contra 60 dos 465 homens (12,9%) | Tabela 1, p. 6 | "60 (14.81%) 54 (29.19%) 114 (19.35%) 465 238 703" | `scripts/calculations/fullwood-2013-convergencia-emoticons.ts` |
| Uso de emoticons por idade | Entre as quatro faixas de idade do perfil, não apareceu diferença na chance de usar emoticons (χ² = 1,674; p = 0,643) | Tabela 2, p. 6 | "Chi-square analysis indicates a non-significant association across the categories (χ2 (df = 3) = 1.674; p=0.643)" | |
| Para quem iam os emoticons | Dos 236 emoticons que os homens mandaram, 120 foram dirigidos a mulheres e 15 a homens; dos 205 das mulheres, 135 foram a homens e 33 a mulheres. O resto foi a várias pessoas (9 e 10) ou a equipe não conseguiu dizer a quem (92 e 27) | Tabela 3, p. 6 | "Male 15 120 9 92 236 Female 135 33 10 27 205" | |
| Tipos de emoticon por sexo | Entre quem usou emoticons, não apareceu diferença entre homens e mulheres na parcela de cada tipo; o artigo não dá os números dessas comparações | Results, p. 6 | "Overall, there were no significant sex differences in the percentage of all types of emoticons used, meaning that men and women who used emoticons expressed each type of emoticon similarly." | |
| Emoticon atrevido por idade | Entre quem usou emoticons, a faixa de 18 a 29 anos usou uma parcela maior do emoticon que o artigo chama de *cheeky* (atrevido) do que a de 40 anos ou mais (p < 0,001) | Results, p. 6; Tabela 4 | "Post hoc analyses (Bonferroni correction) reveal a significant difference (p<0.001) between the ‘18-29’ and ‘40+’ groups." | |
| Piscadela e foto no perfil | Entre quem usou emoticons, a piscadela foi em média 24,29% dos emoticons de quem não tinha foto no perfil e 11,56% dos de quem tinha (t = 1,908); o artigo trata essa diferença como improvável por acaso (p < 0,05), mas num teste de dois lados, que o artigo não diz se usou, ela pode ser acaso | Tabela 6, p. 7 | "Winking 11.56 (26.06) 24.29 (42.65) t(105) = -1.908; p <0.05" | |
| Abraço e foto no perfil | Entre quem usou emoticons, o abraço foi em média 4,80% dos emoticons de quem tinha foto no perfil e nenhum (0,00%) dos de quem não tinha (t = 1,724); o artigo trata essa diferença como improvável por acaso (p < 0,05), mas num teste de dois lados, que o artigo não diz se usou, ela pode ser acaso | Tabela 6, p. 8 | "Hug 4.80 (16.45) 0.00 (0.00) t(105) = 1.724; p <0.05" | |

Os percentuais de uso por sexo são calculados por nós a partir das contagens da Tabela 1: o artigo publica 29,19% e 14,81%, que dividem quem usou por quem não usou, e não pelo total de cada sexo. Com as contagens, a diferença entre mulheres e homens dificilmente é acaso (o artigo dá χ² = 11,096 e p < 0,001). As parcelas de cada tipo de emoticon são a média, entre as pessoas, da fração dos emoticons de cada uma que era daquele tipo. O p é a probabilidade de uma diferença desse tamanho aparecer por acaso se ela não existisse; abaixo de 0,05 costuma-se tratar como improvável. O χ² e o t são as estatísticas dos testes que dão esse p.

## Limitações

- O título fala em convergência, mas o estudo não a mediu. Ele não comparou uma mensagem com a resposta que ela recebeu, nem salas só de homens com salas mistas. A equipe não achou diferença entre homens e mulheres que usavam emoticons na parcela de cada tipo e leu isso como os homens se aproximando do jeito feminino de se expressar. O resumo fala em "variedade" de emoticons, mas o teste comparou a parcela de cada tipo.
- A Tabela 1 divide quem usou emoticons por quem não usou (60/405 = 14,81%) em vez de dividir pelo total do sexo (60/465 = 12,9%). A Tabela 2 faz o mesmo, e os 19,35% que o texto dá como parcela geral de usuários de emoticons são, pelas contagens, 114 de 703, ou 16,2%. A célula das mulheres que não usaram emoticons diz 185, mas o total de mulheres (238), o total da coluna (589) e o qui-quadrado publicado (11,096) só fecham com 184 (`scripts/calculations/fullwood-2013-convergencia-emoticons.ts chi-square`); os 29,19% dividem 54 por 185. As parcelas desta Ficha usam os totais de 465 e 238 e não dependem dessa célula.
- As diferenças de piscadela e de abraço aparecem como p < 0,05, mas com t = 1,908 e t = 1,724 e 105 graus de liberdade, o p de um teste de dois lados é 0,059 e 0,088 (`scripts/calculations/fullwood-2013-convergencia-emoticons.ts two-sided`). Só um teste de um lado passa do limite, e o artigo não diz qual usou. A equipe tinha previsto que quem não tem foto usaria emoticons mais "arriscados", mas não previu nada sobre o abraço. As duas diferenças podem ser acaso.
- A leitura de que a piscadela e o emoticon atrevido são de flerte vem de exemplos escolhidos pela equipe, não de uma codificação do conteúdo.
- Havia quase o dobro de homens nas salas, então era mais fácil um emoticon ir a um homem do que a uma mulher. O destinatário foi deduzido pela equipe a partir da conversa e dos nomes citados; em 119 dos 441 emoticons não deu para dizer.
- É uma hora de observação por sala, em junho de 2009, só na tela pública; as mensagens privadas ficaram de fora. A maioria das pessoas escreveu poucas vezes nesse tempo, como a própria equipe nota, e quem usou emoticons usou 3,86 em média, então a parcela de cada tipo por pessoa sai de poucos emoticons.
- Sexo e idade são os que o usuário declarou no perfil, sem conferência; alguns perfis já não abriam quando a equipe foi lê-los.
- As salas eram de um site de bate-papo, no grupo "Romance", mas não são app de namoro e ninguém mediu se as conversas levaram a encontros. As pessoas não representam nenhuma população.
- Foi lido o manuscrito aceito, depositado pela universidade, e não a versão da editora. O manuscrito não traz declaração de financiamento nem de conflito de interesse.
