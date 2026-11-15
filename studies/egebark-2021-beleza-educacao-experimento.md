---
reference: "Egebark J, Ekström M, Plug E, van Praag M. *Brains or beauty? Causal evidence on the returns to education and attractiveness in the online dating market*. Journal of Public Economics 196:104372, 2021. Lido na versão aceita pelos autores (accepted author manuscript), no repositório da Copenhagen Business School."
link: https://doi.org/10.1016/j.jpubeco.2021.104372
status: verified
verified_on: 2026-11-15
strength: moderate
strength_reason: "Experimento de campo com 2.667 usuários reais de um grande site de namoro holandês, sorteados para receber o convite de um de 12 perfis inventados; mas é um site só, num país só, com um par de fotos por nível de atratividade e sexo, notas de atratividade dadas por americanos e um resultado que é só a resposta a um primeiro convite."
countries: [Holanda]
period: "Maio a junho e outubro a novembro de 2016."
sample:
  n: 2667
  description: "2.667 usuários ativos de um dos maiores sites de namoro da Holanda (1.550 homens e 1.117 mulheres), heterossexuais, de 25 a 35 anos, das províncias de Zuid-Holland, Noord-Holland e Utrecht, com perfil completo e foto. Cada um recebeu um convite de um de 12 perfis inventados, de pessoas nascidas em 1985 que moravam em Amsterdã e buscavam uma relação longa com filhos. Os autores dizem que os membros do site se parecem com a população holandesa nessas idades e níveis de estudo, mas a amostra é de quem usa o site."
  representative: false
design: experiment
conflict: "A versão lida não informa financiamento nem conflito de interesses. Os autores dizem que a pesquisa foi feita sem cooperação do site de namoro e aprovada pelo comitê de ética da Amsterdam School of Economics. Os autores são do Research Institute of Industrial Economics (IFN), da NHH Norwegian School of Economics, da Amsterdam School of Economics e da VU University Amsterdam/Copenhagen Business School."
covers:
  genders: [man, woman]
  seeks: [men, women]
  ages: { min: 25, max: 35 }
  couple: different-sex
---

# Egebark et al. (2021): beleza e diploma no perfil, num experimento num site de namoro holandês

## O que mediu

Os autores puseram num grande site de namoro holandês 12 perfis inventados, seis de homem e seis de mulher, iguais em tudo menos em duas coisas: a foto (pouco, médio ou muito atraente, pela nota que americanos recrutados online deram antes) e o estudo (diploma universitário ou ensino médio profissionalizante). Cada usuário da amostra foi sorteado para receber, de um desses perfis, a mesma mensagem: interesse, busca de uma relação longa e convite para se conhecerem. Os autores contaram quem respondeu de forma positiva (tudo que não fosse uma recusa clara) em até quatro semanas e compararam as respostas entre os perfis, levando em conta idade, região, aparência e estudo de quem recebeu, e o dia e a hora do envio.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quem recebeu o convite | 2.667 usuários do site, 1.550 homens e 1.117 mulheres | 3. Experiment, Sample (p. 12) | "we work with a sample of 2,667 (1,550 male and 1,117 female) online daters with complete records" | |
| Os perfis e o período | Os autores puseram no ar 12 perfis inventados e convidaram cerca de 2.700 usuários para um encontro, na primavera e no outono de 2016 | 1. Introduction (p. 3) | "In total, we posted 12 fictitious profiles and invited some 2,700 online daters for a date in the spring and fall of 2016." | |
| Quem podia ser convidado | Só usuários heterossexuais, de 25 a 35 anos, de três províncias perto de Amsterdã | 3. Experiment, Sample (p. 12) | "were heterosexual, were between 25 and 35 years old, and lived in the provinces Zuid-Holland, Noord-Holland or Utrecht" | |
| O convite | Todos os perfis mandaram a mesma mensagem, mostrando interesse e dizendo buscar uma relação longa | 3. Experiment, Sending Messages (p. 13) | "The profiles sent out identical messages, expressing their interest in the subject and clearly stating that they are looking for a long-term relationship." | |
| As fotos | Nas notas dadas por avaliadores americanos recrutados online, as fotos candidatas iam de cerca de 1,5, as menos atraentes, a mais de 4, as mais atraentes | 3. Experiment, Profile photos (p. 11) | "the least attractive photos have a rating of about 1.5, whereas the most attractive photos have a rating of more than 4" | |
| Quantos responderam bem | 11,7% das mulheres e 27,5% dos homens convidados deram resposta positiva | Tabela 5, linha Mean Response (p. 30) | "Mean Response 0.117 0.275" | `scripts/calculations/egebark-2021-beleza-educacao-experimento.ts` |
| Foto muito atraente, mulheres que receberam | Mulheres convidadas por um perfil de homem com foto muito atraente deram mais respostas positivas que as convidadas por um de foto pouco atraente (coeficiente = 0,181) | Tabela 5, coluna (1), linha HighAttr (p. 30) | "0.181" | |
| Foto muito atraente, homens que receberam | Homens convidados por um perfil de mulher com foto muito atraente deram mais respostas positivas que os convidados por um de foto pouco atraente (coeficiente = 0,196) | Tabela 5, coluna (2), linha HighAttr (p. 30) | "0.196" | |
| Foto muito atraente, nas palavras dos autores | Os autores resumem que, para quem recebeu de qualquer sexo, o perfil de foto muito atraente teve quase 20 pontos percentuais mais chance de resposta que o de foto pouco atraente | 4. Results, Main results (p. 15) | "profiles with high-attractive photos are almost 20 percentage points more likely to receive a response than profiles with low-attractive photos, regardless of gender" | |
| Homens contra mulheres | A diferença entre homens e mulheres que receberam pode ser acaso no peso da foto média (p = 0,186) e da muito atraente (p = 0,507); no peso do diploma, a diferença entre os sexos fica perto do limite usual e ainda pode ser acaso (p = 0,092) | Tabela 5, coluna (3) (p. 30) | "0.092 0.186 0.507" | |
| Diploma, mulheres que receberam | Não apareceu diferença nas respostas das mulheres a um perfil de homem com diploma universitário ou com ensino médio (coeficiente = 0,002) | Tabela 5, coluna (1), linha University (p. 30) | "0.002 (0.019) 0.076" | |
| Diploma, homens que receberam | Homens convidados por um perfil de mulher com diploma universitário deram menos respostas positivas que os convidados por um de ensino médio (coeficiente = −0,050) | Tabela 5, coluna (2), linha University (p. 30) | "-0.050" | |
| Foto e diploma juntos | Nas respostas dos homens e nas das mulheres, o peso do diploma não apareceu diferente conforme a foto fosse mais ou menos atraente; as diferenças podem ser acaso | 4. Results, Main results (p. 15) | "We find that none of the interactions is statistically significant, neither for male nor for female daters." | |
| Diploma, mulheres com diploma que receberam | Entre as mulheres com diploma universitário, um perfil de homem com diploma teve mais respostas positivas que um de ensino médio (coeficiente = 0,109) | Tabela 6, painel A, coluna (3), linha University (p. 31) | "0.109" | |
| Mulheres com e sem diploma | A diferença no peso do diploma entre mulheres com e sem diploma teve p = 0,095 | Tabela 6, painel A, coluna (4), linhas University, MedAttr e HighAttr (p. 31) | "0.095 0.986 0.558" | |
| Diploma, homens com diploma que receberam | Entre os homens com diploma universitário, um perfil de mulher com diploma teve menos respostas positivas que um de ensino médio (coeficiente = −0,080), mas a diferença pode ser acaso; os autores leem uma preferência forte por mulheres com menos estudo | Tabela 6, painel B, coluna (3), linhas University e MedAttr (p. 31) | "-0.080 (0.059) 0.112 (0.070)" | |
| Homens com e sem diploma | A diferença no peso do diploma entre homens com e sem diploma pode ser acaso (p = 0,595) | Tabela 6, painel B, coluna (4), linhas University, MedAttr e HighAttr (p. 31) | "0.595 0.841 0.860" | |
| A aparência de quem recebeu | Entre quem recebeu o convite, não apareceu diferença no peso da foto do perfil entre homens ou mulheres com e sem diploma, nem entre os de aparência abaixo e acima da média: as diferenças entre esses grupos foram pequenas e podem ser acaso | 4. Results, Heterogeneity (p. 16) | "all online daters respond equally to profile changes in attractiveness: all the estimated differences across groups (reported in columns 4 and 8) are small in size and statistically insignificant." | |
| Abrir a mensagem | Homens e mulheres abriram mais os convites de perfis mais atraentes; os homens, e não as mulheres, abriram menos os de perfis com mais estudo | 5. Robustness (p. 20) | "male and female online daters are more likely to open invitations from more attractive profiles, and male online daters (but not female online daters) are less likely to open invitations from more educated profiles." | |
| Só quem buscava relação séria | Com só os usuários que diziam buscar uma relação séria, os resultados não mudaram | 5. Robustness (p. 20) | "We find that results do not change (column 3)." | |
| A leitura dos autores sobre quem fica só | Num exercício que eles mesmos chamam de arriscado, os autores leem que, com essas preferências, os grupos com mais chance de ficar solteiros seriam homens pouco atraentes com pouco estudo e mulheres pouco atraentes com muito estudo; isso não foi medido no site | Resumo (p. 1) | "two groups are more likely to stay single: unattractive, low-educated men and unattractive, high-educated women." | |

Os coeficientes vêm de regressões de probabilidade linear: 0,181 quer dizer 18,1 pontos percentuais a mais de chance de resposta positiva, em comparação com o perfil de foto pouco atraente ou com o perfil de ensino médio, levando em conta idade, região, estudo e aparência de quem recebeu, e o dia e a hora do envio. Na Tabela 5, 0,181, 0,196 e −0,050 têm asteriscos (p < 0,01 para os dois primeiros, p < 0,05 para o terceiro); 0,002 não tem. Na Tabela 6, 0,109 tem um asterisco só, o nível de p < 0,10, e −0,080 nenhum. "p" é a chance de um resultado assim aparecer só por acaso; o costume é aceitar abaixo de 0,05. Nas colunas de p das Tabelas 5 e 6, um p baixo indica diferença entre os grupos comparados.

Os Trechos das linhas das Tabelas 5 e 6 são colunas: o texto extraído do PDF lê cada tabela coluna por coluna, e os asteriscos que marcam o p não entram no Trecho. Na Tabela 5, cada coluna traz, de cima para baixo, University, MediumAttr e HighAttr, com o erro-padrão entre parênteses. Na versão com o layout preservado, a linha HighAttr da Tabela 5 tem 0,181 nas mulheres e 0,196 nos homens, e a linha University, 0,002 e −0,050. Na Tabela 6, a coluna (3) é a dos usuários com diploma universitário: 159 mulheres e 225 homens.

As fotos também tinham nível médio de atratividade: as mulheres deram mais respostas a ele que ao pouco atraente (0,076) e os homens também (0,116). A Figura 1A, um gráfico de barras sem os valores escritos, mostra a taxa de resposta positiva dos homens perto de 0,18 com a foto pouco atraente e de 0,37 com a muito atraente, e a das mulheres perto de 0,03 e de 0,21; o texto arredonda a dos homens com a foto pouco atraente para 20% e a das mulheres para menos de 4%.

## Limitações

- É um site só, num país só, com usuários de 25 a 35 anos e heterossexuais. Os autores lembram que muita gente busca parceiro por outros caminhos, como a rede de conhecidos, e que os resultados podem não valer para eles.
- O resultado é a resposta a um primeiro convite, não um encontro nem um relacionamento. Os autores dizem que medem a preferência por um perfil, e que ler isso como preferência por um parceiro pede cautela.
- Cada nível de atratividade usou um par de fotos por sexo, trocado de diploma entre as duas rodadas; o efeito da "atratividade" é também o efeito daquelas fotos. Um dos pares foi recusado pelo site e substituído por outro que não passou pelo teste de comparação.
- As notas de atratividade vieram de avaliadores americanos recrutados online, porque havia poucos holandeses na plataforma. Os autores mostram que grupos étnicos dos EUA concordaram entre si, mas não testaram avaliadores holandeses.
- O grupo de homens com diploma tem 225 pessoas e o de mulheres com diploma, 159. O resultado dos homens com diploma (−0,080) pode ser acaso e o das mulheres com diploma (0,109) só passa no nível de p < 0,10; o resumo os apresenta como preferências de mesmo tamanho.
- Os números do texto nem sempre batem com as tabelas. O texto diz que as mulheres responderam 13% das vezes e os homens 29%; a Tabela 4 dá 15% e 29% para qualquer resposta e 12% e 28% para a resposta positiva, e a Tabela 5, 11,7% e 27,5%. O texto diz que os homens responderam 5,1 pontos percentuais menos a perfis com diploma; a Tabela 5 dá −0,050. O texto diz que 20 pontos percentuais a mais significam alta de 200% nas respostas dos homens, e a Figura 1A mostra a taxa deles indo de perto de 0,18 para perto de 0,37, cerca do dobro, ou seja, uma alta de cerca de 100%. Esta Ficha usa os números das tabelas.
- Os autores não veem os outros convites que cada usuário recebeu; testam se o efeito muda entre usuários mais e menos procurados e não acham diferença, mas dizem que esse teste não identifica com certeza esse efeito.
- Li a versão aceita pelos autores, do repositório da Copenhagen Business School, não a versão final da revista; os números da versão publicada podem ter mudado na edição.
