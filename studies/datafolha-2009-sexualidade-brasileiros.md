---
reference: "Datafolha. *Sexualidade dos Brasileiros*. Relatório de tabelas, projeto PO3482, campo de 9 a 11 de setembro de 2009. Datafolha, Opinião Pública, 23 de fevereiro de 2010. PDF: http://media.folha.uol.com.br/datafolha/2013/05/02/sexualidade_23022010.pdf"
link: http://datafolha.folha.uol.com.br/opiniaopublica/2010/02/1223647-sexualidade-dos-brasileiros.shtml
status: verified
verified_on: 2026-10-20
strength: moderate
strength_reason: "Amostra nacional de 1.888 pessoas de 18 a 60 anos, por cotas de sexo e idade em pontos de fluxo, numa só onda de 2009; mede ter conhecido alguém pela internet, não onde o casal se conheceu."
countries: [Brasil]
period: "setembro de 2009"
sample:
  n: 1888
  description: "1.888 entrevistas com pessoas de 18 a 60 anos em 125 municípios de todas as regiões, abordadas em pontos de fluxo populacional, com cotas de sexo e idade e sorteio dos municípios por porte. Margem de erro de 2 pontos (95%)."
  representative: true
design: cross-sectional
conflict: "Pesquisa da Gerência de Pesquisas de Opinião do Datafolha, instituto do Grupo Folha; o relatório não cita contratante."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 60 }
---

# Datafolha (2009): Sexualidade dos Brasileiros

## O que mediu

Pesquisa nacional sobre hábitos e opiniões sexuais, repetindo um levantamento de 1997. Uma parte do questionário era respondida pelo entrevistador e outra preenchida pela própria pessoa e posta numa urna lacrada. Para o tema de onde os casais se conhecem, interessa a pergunta P.26: "Você alguma vez foi se encontrar com a pessoa com quem você conheceu pela Internet?". O relatório traz as respostas por sexo, idade, escolaridade, renda, região e estado conjugal.

A pesquisa não pergunta como a pessoa conheceu o parceiro atual. Até onde as buscas de 2026-10-20 acharam, é o único número de uma amostra nacional brasileira sobre conhecer alguém pela internet.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Desenho da amostra | Pontos de fluxo, com cotas de sexo e idade e sorteio aleatório | p. 1 do PDF, Metodologia | "A pesquisa do Datafolha é um levantamento por amostragem com abordagem em pontos de fluxo populacional com cotas sexo e idade e sorteio aleatório" |
| Tamanho e campo | 1.888 entrevistas em 125 municípios, de 9 a 11 de setembro de 2009 | p. 1 do PDF, Metodologia | "Nesse levantamento realizado entre os dias 09 e 11 de setembro de 2009, foram realizadas 1888 entrevistas em 125 municípios" |
| Já conheceu alguém pela internet (total; homens; mulheres) | 19%; 22%; 16% | p. 134 do PDF, P.26, colunas Total e Sexo | "CONHECEU ALGUÉM PELA INTERNET 19 22 16" |
| Conheceu alguém pela internet e foi se encontrar com a pessoa (total; homens; mulheres) | 8%; 10%; 6% | p. 134 do PDF, P.26, colunas Total e Sexo | "Sim, foi se encontrar com a pessoa 8 10 6" |
| Nunca conheceu ninguém pela internet | 78% | p. 134 do PDF, P.26, coluna Total | "NUNCA CONHECEU NINGUÉM PELA INTERNET 78" |
| Conheceu alguém pela internet, pela idade (18–24; 25–34; 35–44; 45–60 anos) | 32%; 22%; 12%; 8% | p. 134 do PDF, P.26, colunas de Idade | "CONHECEU ALGUÉM PELA INTERNET 19 22 16 32 22 12 8" |
| Foi se encontrar, pela idade (18–24; 25–34; 35–44; 45–60 anos) | 15%; 10%; 3%; 2% | p. 134 do PDF, P.26, colunas de Idade | "Sim, foi se encontrar com a pessoa 8 10 6 15 10 3 2" |
| Conheceu alguém pela internet: casados; solteiros | 12%; 30% | p. 136 do PDF, P.26, colunas de Estado conjugal | "CONHECEU ALGUÉM PELA INTERNET 19 18 31 12 30" |
| Foi se encontrar: casados; solteiros | 4%; 15% | p. 136 do PDF, P.26, colunas de Estado conjugal | "Sim, foi se encontrar com a pessoa 8 8 10 4 15" |

Nas linhas de idade e de estado conjugal, o Trecho começa pelas colunas anteriores da mesma linha da tabela (Total e Sexo na p. 134; Total e Já teve relação na p. 136); os números da medida são os que vêm depois. Os casados são 964 na base ponderada, e os solteiros, 693.

Fonte local: `sources/private/datafolha-2009-sexualidade-brasileiros.txt`, com a saída de `pdftotext -layout` das páginas 1, 134, 135 e 136, e o PDF inteiro ao lado (`datafolha-2009-sexualidade-brasileiros-original.pdf`).

## Limitações

- Não mede onde o casal atual se conheceu. "Conhecer alguém pela internet" inclui amizades e contatos que nunca viraram relação, e "foi se encontrar" não diz se houve namoro.
- Dados de 2009, antes dos aplicativos de encontro. A internet de então era sobretudo bate-papo, Orkut e sites de relacionamento.
- Amostra por cotas em pontos de fluxo, não um sorteio de domicílios: quem não circula na rua fica de fora. O relatório informa margem de erro como se fosse amostra aleatória.
- A faixa etária para em 60 anos.
- O relatório não diz se a P.26 estava no questionário do entrevistador ou no de autopreenchimento.

## Como usamos

- [Relatório 2026-10-18: onde casais se conhecem](../reports/2026-10-18-onde-casais-se-conhecem.md): única amostra nacional brasileira achada com algum número sobre conhecer pessoas pela internet, usada para mostrar que o Brasil não tem a pergunta "onde vocês se conheceram".
