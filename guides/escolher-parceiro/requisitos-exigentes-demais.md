---
question: Meus Requisitos são ==exigentes== demais?
confidence: moderate
findings:
  - text: No Brasil, 3.309.733 mulheres de 25 a 29 anos não moravam com companheiro(a) em 2022, 42,4% das mulheres dessa idade.
    fact_sheets: [ibge-2022-censo-amostra]
    applies_to: { seeks: [women] }
  - text: No Brasil, 3.939.138 homens de 25 a 29 anos não moravam com companheiro(a) em 2022, 51,9% dos homens dessa idade.
    fact_sheets: [ibge-2022-censo-amostra]
    applies_to: { seeks: [men] }
  - text: Num estado só, o grupo encolhe. No estado de São Paulo, 747.507 mulheres de 25 a 29 anos não moravam com companheiro(a) em 2022.
    fact_sheets: [ibge-2022-censo-amostra]
    applies_to: { seeks: [women] }
  - text: Entre os brasileiros de 25 a 29 anos, cerca de um terço vivia em união sem casamento (31,6% dos homens e 34,3% das mulheres). No papel são solteiros, mas moram com alguém.
    fact_sheets: [ibge-2022-censo-unioes]
  - text: O Censo só registra a união de quem mora com o cônjuge. Quem namora, ou tem companheiro(a) morando em outra casa, conta como "não vivia em união".
    fact_sheets: [ibge-2022-censo-amostra, ibge-2022-censo-unioes]
  - text: Entre 18 e 29 anos, 4,8% se declararam homossexuais ou bissexuais. Com 60 anos ou mais, 0,2%. Por isso a conta da orientação depende da idade.
    fact_sheets: [ibge-2019-pns]
  - text: Entre todos os adultos, 1,2% se declararam homossexuais e 0,7% bissexuais, e 3,4% não souberam ou não quiseram responder.
    fact_sheets: [ibge-2019-pns]
  - text: Num site de namoro dos EUA, homens e mulheres escreveram em média para quem estava uns 25% acima deles num ranking de desejabilidade. Quanto maior a distância, menor a chance de resposta.
    fact_sheets: [bruch-2018-aspirational-pursuit]
    applies_to: { genders: [man, woman], couple: different-sex }
  - text: Em 43 países, Brasil incluído, ter um parceiro que bate traço a traço com a própria lista teve efeito muito pequeno sobre o quanto se gosta dele.
    fact_sheets: [eastwick-2024-preferencias-43-paises]
  - text: Em 43 estudos com casais, o ideal de parceiro, a lista do que se espera de alguém, ajudou a prever a satisfação em só 10% das vezes em que foi testado.
    fact_sheets: [joel-2020-machine-learning-43-datasets]
    period: publicado em 2020
tips: [nao-filtre-pela-lista, mensagem-um-pouco-acima]
related:
  [
    o-que-digo-querer-me-atrai,
    que-caracteristicas-preveem,
    precisamos-ser-parecidos,
  ]
calculator: possible-group
---

Nenhum estudo do acervo diz quantos Requisitos é demais, mas dá para ver quanto cada um custa. Pelo Censo 2022, no Brasil havia ==3,9 milhões de homens e 3,3 milhões de mulheres== de 25 a 29 anos que não moravam com companheiro(a) [@ibge-2022-censo-amostra], e cada Requisito a mais corta esse grupo. Do outro lado, bater com a própria lista pesou pouco em quem as pessoas gostam [@eastwick-2024-preferencias-43-paises].

## Varia conforme o Perfil?

A conta parte do seu Perfil. A orientação entra pelas proporções da PNS por sexo e idade [@ibge-2019-pns], porque o Censo não pergunta orientação sexual nem identidade de gênero e registra só o sexo atribuído ao nascer [@ibge-2022-censo-amostra]. Para quem marcou gênero "outro", a conta não desconta orientação, e o número é um teto.

O Censo só pergunta sobre filhos às mulheres [@ibge-2022-censo-amostra]. Por isso "sem filhos" não funciona quando você procura homens e, quando procura ambos, vale só para as mulheres.

Os estudos de fora do Brasil não trazem resultado para quem procura alguém do mesmo sexo. O do site de namoro deixou de fora gays e bissexuais [@bruch-2018-aspirational-pursuit].

## Limitações

- O Censo é de julho de 2022. Renda e escolaridade mudam.
- O arquivo público do Censo vai só até o estado, com a idade em grupos de 5 anos. Para o município e a idade exata, a conta reparte pela população de cada cidade e de cada idade, supondo que dentro do estado a composição é a mesma.
- "Não mora com companheiro(a)" inclui quem namora. O Censo não separa esses casos.
- A pergunta de orientação sexual da PNS é nova e provavelmente subdeclarada, e os dados são de 2019, aplicados ao Censo de 2022. A altura é quase toda a que a pessoa informou, não a medida.
- O acervo não tem estudo que teste se ter menos Requisitos leva a uma relação melhor ou pior.
