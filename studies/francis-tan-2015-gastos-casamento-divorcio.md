---
reference: "Francis-Tan A, Mialon HM. *\"A diamond is forever\" and other fairy tales: The relationship between wedding expenses and marriage duration*. Economic Inquiry 53(4):1919–1930, 2015. Texto completo aberto (PDF da versão publicada, numa página de docente da Sacramento State): https://www.csus.edu/faculty/m/fred.molitor/docs/wedding%20expenses%20and%20marriage%20duration1.pdf; SSRN: https://papers.ssrn.com/abstract=2501480"
link: https://doi.org/10.1111/ecin.12206
status: verified
verified_on: 2026-10-25
strength: weak
strength_reason: "Amostra de conveniência do Amazon Mechanical Turk (3.151 pessoas, mais jovens, mais escolarizadas e de renda menor que a população), questionário retrospectivo de 5 minutos e desenho transversal; os pesos populacionais corrigem só parte disso."
countries: [EUA]
period: "questionário aplicado em julho e agosto de 2014, sobre o casamento atual ou o primeiro"
sample:
  n: 3151
  description: "3.151 pessoas que já foram casadas com alguém do outro sexo e não são viúvas (1.455 homens e 1.696 mulheres), recrutadas no Amazon Mechanical Turk por US$ 0,50 a 0,75. Das 3.370 que responderam, saíram as de IP fora dos EUA, casamento entre pessoas do mesmo sexo, mais de 60 anos ou respostas incoerentes. Comparada com a ACS 2012, a amostra é mais jovem, mais branca, mais escolarizada e de renda menor; as regressões principais usam pesos populacionais."
  representative: false
design: cross-sectional
conflict: "Os dois autores são do Departamento de Economia da Emory University. O artigo não declara financiamento nem conflito de interesse."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 60 }
  couple: different-sex
---

# Francis-Tan & Mialon (2015): gastos com casamento e duração do casamento

## O que mediu

Se o gasto com o anel de noivado e com a festa se associa à duração do casamento. O questionário online tinha cerca de 40 perguntas sobre o casamento atual, ou o primeiro de quem se divorciou. A análise é um modelo de riscos proporcionais de Cox para a separação, com pesos populacionais montados a partir da ACS 2012.

Os controles incluem idade, idade ao casar, sexo, raça, escolaridade, emprego, renda familiar, região, frequência religiosa, diferenças de idade, raça e escolaridade entre os cônjuges, filhos, tempo de namoro antes do pedido, lua de mel, número de convidados e se "aparência" ou "riqueza" do parceiro pesaram na decisão de casar. Uma subamostra só com quem casou de 2008 em diante testa se a lembrança dos gastos muda o resultado.

## Achados

Razões de risco (hazard ratios) de divórcio no modelo multivariado com pesos populacionais. Na tabela do artigo, um asterisco marca significância a 10%, dois a 5% e três a 1%; aqui, "significativo" é a 5% ou menos e "marginal" é só a 10%. Os Trechos das linhas de tabela são a sequência em que o texto extraído do PDF traz o número, sem os asteriscos.

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Amostra final | 3.151 pessoas | Seção II | "After these filters, the final sample consisted of 3,151 respondents." |
| Homens: anel de US$ 2.000 a 4.000 contra anel de US$ 500 a 2.000 | 1,3 vez o risco | Seção III, Tabela 2 | "in the sample of men, spending between $2,000 and $4,000 on an engagement ring is associated with a 1.3 times greater hazard of divorce as compared with spending between $500 and $2,000" |
| Festa até US$ 1.000 (homens) e festa de US$ 20.000 ou mais (mulheres), contra US$ 5.000 a 10.000 | metade do risco nos homens; 1,6 vez o risco nas mulheres | Seção III, Tabela 2 | "spending less than $1,000 is associated with half the hazard of divorce in the sample of men, and spending $20,000 or more is associated with 1.6 times the hazard of divorce in the sample of women" |
| Todos: festa até US$ 1.000, contra US$ 5.000 a 10.000 | HR = 0,642, significativo | Tabela 2, multivariado, todos | "(0.148) 0.642" |
| Todos: festa de US$ 20.000 ou mais, contra US$ 5.000 a 10.000 | HR = 1,323, marginal | Tabela 2, multivariado, todos | "(0.115) 1.323" |
| Mulheres casadas desde 2008: festa de mais de US$ 20.000 contra US$ 5.000 a 10.000 | 3,5 vezes o risco | Seção III, Tabela 3 | "in the sample of women, the hazard of divorce associated with spending more than $20,000 on the wedding is 3.5 times higher than the hazard of divorce associated with spending between $5,000 and $10,000" |
| Festa até US$ 1.000 e a chance de dizer que a dívida do casamento estressou a relação | 82% a 93% menos | Seção III, Tabela 4 | "spending less than $1,000 on the wedding is associated with an 82%–93% decrease in the odds of reporting wedding-related debt stress" |
| Diferença de idade entre os cônjuges (por ano) | HR = 1,022, significativo | Tabela 2, multivariado, todos | "(0.007) 1.022" |
| Diferença de raça entre os cônjuges | HR = 1,180, marginal | Tabela 2, multivariado, todos | "(0.114) 1.180" |
| Diferença de escolaridade entre os cônjuges | HR = 1,248, significativo | Tabela 2, multivariado, todos | "(0.086) 1.248" |
| Frequenta serviço religioso regularmente, contra nunca | HR = 0,625, significativo | Tabela 2, multivariado, todos | "(0.045) 0.625" |
| Renda familiar de US$ 125 mil ou mais, contra menos de US$ 25 mil | HR = 0,390, significativo | Tabela 2, multivariado, todos | "(0.045) 0.390" |
| "Conhecia muito bem o cônjuge" | HR = 0,564, significativo | Tabela 2, multivariado, todos | "(0.035) 0.564" |
| Namoro de 3 anos ou mais antes do pedido, contra menos de 1 ano | HR = 0,764, significativo | Tabela 2, multivariado, todos | "(0.046) 0.764" |
| "Riqueza do parceiro foi importante" na decisão de casar | HR = 1,338, marginal | Tabela 2, multivariado, todos | "(0.218) 1.338" |
| "Aparência do parceiro foi importante" na decisão de casar | HR = 1,294, significativo | Tabela 2, multivariado, todos | "(0.092) 1.294" |
| Homens: "aparência do parceiro foi importante" | HR = 1,485, significativo | Tabela 2, multivariado, homens | "1.122 1.485" |
| Mulheres: "riqueza do parceiro foi importante" | HR = 1,570, marginal | Tabela 2, multivariado, mulheres | "0.980 1.570" |
| Mulheres: "aparência do parceiro foi importante" | HR = 0,993, não significativo | Tabela 2, multivariado, mulheres | "0.993 0.900 1.092" |
| Casados desde 2008: diferença de idade entre os cônjuges (por ano) | HR = 1,034, significativo | Tabela 3, todos | "1.034" |
| Casados desde 2008: o HR de 1,034 por ano acumulado em 5 e em 10 anos de diferença (conta nossa, não do artigo) | 1,18 e 1,40 | Tabela 3, todos | "1.034" | `scripts/calculations/francis-tan-2015-gastos-casamento-divorcio.ts` |
| Casados desde 2008: diferença de escolaridade entre os cônjuges | HR = 1,437, significativo | Tabela 3, todos | "1.111 1.437" |

- Sem controles, não ter anel e gastar menos de US$ 1.000 na festa se associam a **mais** divórcio. Com os controles (renda, sobretudo), o sinal da festa barata se inverte.
- Muitos convidados e ter lua de mel, qualquer que seja o custo dela, se associam a menos divórcio.
- Os autores dizem que os achados podem ser **não causais**: o tipo de casal que gasta pouco pode ser mais compatível. O estresse com a dívida do casamento é um canal possível, que eles exploram na Tabela 4.

## Limitações

- Amostra do mTurk, não probabilística. Os autores dizem que uma amostra probabilística nacional seria preferível, mas nenhuma pergunta sobre gasto com casamento.
- Questionário retrospectivo e transversal: o gasto e a duração são lembrados pela própria pessoa, e só um dos cônjuges responde. Para reduzir o erro de lembrança, os gastos entram em faixas largas, e há a subamostra de casados desde 2008.
- **O artigo não explica como a diferença de idade foi codificada.** A média na Tabela 1 é −0,87, com 1,14 para homens e −2,59 para mulheres, o que sugere diferença com sinal (respondente menos cônjuge), e não diferença absoluta. Assim, "HR 1,022 por ano" deve ser lido com cautela.
- "Diferença de escolaridade" e "diferença de raça" entram como variáveis binárias (médias de 0,59 e 0,18 na Tabela 1), sem definição no texto.
- Os números muito citados na imprensa, "5 anos de diferença = 18% mais divórcio" e "10 anos = 39%", **não aparecem no artigo**. Batem, porém, com o HR de 1,034 por ano da subamostra de casados desde 2008 (Tabela 3) acumulado ano a ano: 1,034 elevado a 5 dá 1,18, e elevado a 10 dá 1,40. É a origem provável. A conta estica para 10 anos um efeito por ano medido só numa subamostra de um questionário fraco; na amostra inteira, o HR por ano é 1,022.
- Muitos resultados só passam a 10%, e os efeitos por sexo vêm de amostras menores (1.455 homens, 1.696 mulheres; 870 e 757 na subamostra recente).

## Como usamos

- [Relatório 2026-10-18: características do parceiro](../reports/2026-10-18-caracteristicas-parceiro.md): diferença de idade e de escolaridade, religião, renda e "casar pela aparência". Toda essa evidência é fraca.
