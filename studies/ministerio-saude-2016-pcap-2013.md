---
reference: "Brasil. Ministério da Saúde, Secretaria de Vigilância em Saúde, Departamento de Vigilância, Prevenção e Controle das DST, Aids e Hepatites Virais. *Pesquisa de Conhecimentos, Atitudes e Práticas na População Brasileira – PCAP 2013*. Brasília: Ministério da Saúde, 2016 (Série G. Estatística e Informação em Saúde). PDF lido: cópia do Internet Archive de 25/01/2021, https://web.archive.org/web/20210125121702/http://www.aids.gov.br/pt-br/pub/2016/pesquisa-de-conhecimentos-atitudes-e-praticas-na-populacao-brasileira-pcap-2013"
link: http://www.aids.gov.br/pt-br/pub/2016/pesquisa-de-conhecimentos-atitudes-e-praticas-na-populacao-brasileira-pcap-2013
status: verified
verified_on: 2026-10-24
strength: moderate
strength_reason: "Amostra nacional de 12.000 pessoas de 15 a 64 anos, por conglomerados com cotas de sexo, idade e situação conjugal, com o módulo sexual autopreenchido em tablet; mas a contagem de parceiros vem em faixas, o relatório muda a base da proporção de mais de dez parceiros em relação a 2008 sem dizer, e o PDF é escaneado."
countries: [Brasil]
period: "2013"
sample:
  n: 12000
  description: "12.000 pessoas de 15 a 64 anos (5.867 homens e 6.133 mulheres), uma por domicílio, em setores censitários sorteados em 30 estratos (região, porte do município, capital, situação urbana ou rural), com 16 domicílios por setor e cotas de sexo, faixa etária e situação conjugal; amostra calibrada pelo Censo de 2010."
  representative: true
design: cross-sectional
conflict: "Pesquisa do Departamento de DST, Aids e Hepatites Virais do Ministério da Saúde, com trabalho de campo de empresa contratada; o relatório não cita outros financiadores."
covers:
  genders: [man, woman]
  ages: { min: 15, max: 64 }
---

# Ministério da Saúde (2016): PCAP 2013, parceiros na vida no Brasil

## O que mediu

A terceira PCAP repete as perguntas de 2004 e 2008 sobre práticas sexuais, no trecho do questionário que a própria pessoa responde no tablet, com entrevistador do mesmo sexo. Pergunta se a pessoa já teve mais de um parceiro sexual na vida e se teve mais de dez; no último ano, pergunta por parceiros fixos, casuais e conhecidos pela internet. O relatório traz as proporções por sexo, idade, estado conjugal, região, escolaridade, cor, classe e acesso à internet.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Amostra | 12.000 pessoas: 5.867 homens e 6.133 mulheres | p. 19 do PDF | "Do total de 12.000 entrevistados, 5.867 (48,9%) foram do sexo masculino e 6.133 (51,1%)" | |
| Cotas da seleção do morador | Sexo, faixa etária e situação conjugal | p. 14 do PDF | "sexo, faixa etária e situação conjugal" | |
| Modo de resposta | Parte do questionário preenchida pela própria pessoa | p. 15 do PDF | "uma parte do questionário foi preenchida pelo(a) próprio(a) entrevistado(a)" | |
| Pergunta sobre mais de dez parceiros | Feita depois da pergunta sobre mais de um parceiro | p. 162 do PDF, questionário, questão 3 | "Você já teve mais do que 10 parceiros sexuais em toda sua vida?" | |
| Sexualmente ativos com mais de um parceiro na vida; mais de dez, como o relatório calcula | 69,2%; 43,9% | p. 97 do PDF | "A proporção de pessoas que tiveram mais de uma parceria sexual na vida foi de 69,2%, e 43,9% declararam ter tido mais de dez parcerias" | |
| Mais de dez parceiros, como o relatório calcula: homens; mulheres | 56,6%; 26,3% | p. 97 do PDF | "enquanto a proporção de homens com mais dez parcerias foi de 56,6%, entre as mulheres foi de 26,3%" | |
| Mais de dez parceiros, como o relatório calcula, por idade | 35 a 44 anos 47,0%; 25 a 34 anos 46,4%; 15 a 24 anos 35,4% | p. 97 do PDF | "A proporção de pessoas com mais de dez parcerias na vida foi maior na faixa de 35 a 44 anos (47,0%), seguida das pessoas entre 25 e 34 anos (46,4%) e daquelas entre 15 e 24 anos de idade (35,4%)" | |
| Mais de dez parceiros por estado conjugal (vive ou não com companheiro) | Sem diferença significativa (p = 0,173) | p. 98 do PDF | "Não foram observadas diferenças estatisticamente significativas quanto à proporção de pessoas com mais de dez parcerias na vida segundo estado conjugal (p-valor = 0,173)" | |
| Sexualmente ativos com mais de dez parceiros na vida, sobre todos os sexualmente ativos (cálculo nosso: 69,2% × 43,9%) | Cerca de 30,4% | p. 97 do PDF | "A proporção de pessoas que tiveram mais de uma parceria sexual na vida foi de 69,2%, e 43,9% declararam ter tido mais de dez parcerias" | `scripts/calculations/ministerio-saude-2016-pcap-2013.ts` |
| Mais de cinco parceiros casuais no último ano, entre quem fez sexo no período | 12,1% | p. 97 do PDF | "12,1% tiveram mais de cinco parcerias casuais" | |
| Sexo no último ano com alguém conhecido pela internet: total | 4,7% | p. 97 do PDF | "4,7% com pessoas que conheceram pela internet" | |
| Idem: homens; mulheres | 7,0%; 2,2% | p. 97 do PDF | "7,0% dos homens e 2,2% das mulheres tiveram relação sexual com pessoas que conheceram pela internet" | |
| Idem: jovens de 15 a 24 anos | 9,1% | p. 98 do PDF | "e 9,1% informaram ter se relacionado com pessoas que conheceram pela internet" | |

**A base do 43,9% não é a de 2008.** Na PCAP 2008, os 25,3% com mais de dez parceiros estão calculados sobre todos os sexualmente ativos (7.085 pessoas, a mesma base de "mais de um parceiro"; ver [PCAP 2008](ministerio-saude-2011-pcap-2008.md)). Em 2013, as contagens das Tabelas 7.1 e 7.4 mostram 3.265 pessoas com mais de dez parceiros, 7.544 com mais de um e 11.051 sexualmente ativas: 3.265 é 43% de 7.544 e 30% de 11.051. Ou seja, o 43,9% é a proporção entre quem teve mais de um parceiro. O questionário de 2013 não imprime o pulo da questão 2 para a 3; o de 2008, com as mesmas perguntas, imprime, e as contagens de 2013 batem com ele. Sobre todos os sexualmente ativos, a proporção fica perto de 30%, e não de 44%. O relatório não avisa da mudança. A conta é nossa e vem do texto; as células das tabelas, lidas no OCR, perderam a vírgula e não entram na conferência.

A linha da zona urbana no texto do relatório ("mais de dez parcerias sexuais na vida (70,1%)") não bate com o total e parece erro de digitação; a Ficha não a usa.

Fonte local: `sources/private/ministerio-saude-2016-pcap-2013.pdf`. O PDF original é escaneado (170 páginas sem texto); a Fonte local é ele mesmo com camada de texto do `ocrmypdf` em português. As páginas são as do PDF.

## Limitações

- Mede parceiros na vida, não antes do casamento, e em faixas (mais de um, mais de dez), sem média nem mediana.
- A proporção de mais de dez parceiros muda de base entre 2008 e 2013 (ver acima). Pôr 25,3% (2008) ao lado de 43,9% (2013) compara números diferentes; com a mesma base, a mudança é de cerca de 25% para cerca de 30%.
- Autorrelato, com grande diferença entre homens e mulheres na mesma população.
- Seleção do morador por cotas de sexo, idade e situação conjugal; a amostra foi calibrada pelo Censo de 2010, mas o relatório não informa taxa de resposta.
- O texto vem de OCR: as tabelas perderam vírgulas, e a Ficha usa só o texto corrido.
- "Conheceu pela internet" é sobre parceiros sexuais do último ano, não sobre o cônjuge.

## Como usamos

- [Relatório 2026-10-24: parceiros antes de casar](../reports/2026-10-24-parceiros-antes-de-casar.md): a contagem brasileira mais recente de parceiros na vida, a falta de diferença entre quem vive e quem não vive com companheiro, e o alerta sobre a base do 43,9%.
