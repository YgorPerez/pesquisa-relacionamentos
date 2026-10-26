---
ticket: 285
---

# O que as calculadoras de "quantos atendem aos meus padrões" têm que o Grupo possível não tem?

**Data:** 2026-10-26 · **Ticket:** [#285](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/285)
**Status de verificação:** ✅ para as calculadoras (lidas na própria página e no JavaScript delas; a da Keeper também pela API que a página chama) e para as variáveis do IBGE (conferidas no dicionário da PNS 2019, no layout público dos microdados do Censo 2022, no dicionário da PNAD Contínua e nos metadados do SIDRA pela API de agregados). As porcentagens da PNS neste relatório são conta nossa nos microdados, sem intervalo. Fora do IBGE, cada fonte leva a marca da conferência: [V] conferido no documento primário (dicionário, questionário ou relatório oficial), [S] fonte secundária, [M] de memória, sem conferir.

Uso interno. As calculadoras daqui não aparecem para o leitor: não são Site vizinho nem Leitura. Só o Grupo possível está em jogo; as Prioridades ficam fora.

## Resposta curta

- **Das calculadoras que achei, só uma cruza os dados como nós.** A [The Pool Report](https://datingpoolreport.com/methodology) conta idade, renda, escolaridade e estado civil juntos nos microdados do ACS e multiplica à parte altura, IMC e cigarro, e diz isso na página. A [Keeper](https://www.keeper.ai/calc) faz o mesmo nos filtros demográficos (CPS), mas multiplica sem avisar os cerca de 20 filtros de estilo de vida: na API dela, "tem arma" × "republicano" dá exatamente o produto das duas taxas. As outras multiplicam tudo.
- **Dos ~25 filtros da Keeper que nos faltam, 12 têm dado oficial brasileiro por pessoa, com sexo e idade, no país todo.** Três saem do mesmo microdado do Censo 2022 e cruzam de verdade com os Requisitos de hoje: mora com os pais, emprego (e "dono de negócio") e casa própria. Oito saem da PNS 2019 e entram como entram hoje altura e cigarro, multiplicados dentro de sexo × faixa etária: bebida, exercício, IMC, depressão, cigarro eletrônico, dentes, frequência a culto e bissexual. Ocupação "de escritório" sai da PNAD Contínua, também multiplicada. Região metropolitana tem dado, mas o Requisito Onde já cobre.
- **Ficam sem dado oficial** para o Grupo possível: tatuagem, astrologia, canhoto, cor do cabelo e dos olhos, quer ter filhos, horas de sono fora das capitais, partido ou voto, arma, vegetariano, maconha e número de parceiros sexuais. Horas de sono existem no Vigitel 2024, mas só nas capitais; intenção de ter filhos vai existir na PNDS 2023, que ainda não saiu.
- **Na apresentação, o que elas mostram e nós não:** a porcentagem e o "1 em N" ao lado do número absoluto; o aviso explícito de que é uma conta de população, não a chance pessoal nem quem está procurando; e uma imagem para compartilhar. O resto (o que mais pesa, o corte a corte, a comparação com a conta multiplicada, a faixa de incerteza) nós já temos, e só a Pool Report tem algo parecido.

## As calculadoras

Li nove. A da FlowingData ([Peak Non-Creepy Dating Pool](https://flowingdata.com/projects/2018/dating-pool/)) está atrás de um desafio do Cloudflare e não abriu. Não achei nenhuma brasileira nem nenhuma feita por um instituto de estatística ou um jornal; as únicas que cobrem o Brasil são as multipaíses (5 e 6 abaixo).

| # | Calculadora | País | Fontes que cita | Como junta os filtros |
|---|---|---|---|---|
| 1 | [Keeper Standards Calculator](https://www.keeper.ai/calc) | EUA | CPS ASEC (Census), NHANES e outros questionários do CDC; Pew, Gallup e NSFG nas dicas de cada filtro | Demografia conjunta; o resto multiplicado, sem dizer |
| 2 | [The Pool Report](https://datingpoolreport.com/) | EUA e estados | ACS PUMS 2024; NHANES 2021–23 (altura); CDC (IMC); NHIS 2024 (cigarro) | Conjunta no ACS; saúde multiplicada, e a página diz |
| 3 | [I Got Standards Bro](https://igotstandardsbro.com/) (a "Female Delusion Calculator" original) | EUA | CPS ASEC 2023; NHANES 2017–18 | Duas buscas separadas multiplicadas; avisa que ignora a correlação entre renda e altura |
| 4 | [Female/Male Partner Calculator](https://femalepartnercalculator.com/methodology) | EUA | ACS, NHANES, Pew, YouGov, GSS, NSFG, BLS | Multiplica ("statistically independent") |
| 5 | [How Delusional Are You?](https://howdelusionalareyou.com/en/calculator) | EUA, Canadá, Reino Unido, Europa, Austrália, Emirados | ACS/IPUMS, StatCan, ONS, ABS, Eurostat, OMS | Multiplica com alguns ajustes de correlação |
| 6 | [Female Delusion Calculator](https://femdelusioncalculator.com/methodology/) | 18 países, Brasil incluído | Banco Mundial, ONU, CPS/BLS, SIPP; padrão etário dos EUA aplicado aos outros países | Liga idade, união, filhos, casa e escolaridade-renda; o resto multiplica |
| 7 | [The Online Dating Calculator](https://onlinedatingcalculator.com/) | 60+ metrópoles dos EUA | Censo 2020, ACS 2022, NHANES, CDC, Pew | Não diz |
| 8 | [TotalCalcHub](https://totalcalchub.com/us/utilities/male-delusion-calculator), [Pro Calculator UK](https://procalculator.co.uk/delusion-calculator/), [Delusion Calculators](https://delusioncalculators.com/) | EUA, Reino Unido | Genéricas ("ONS", "projeções 2026") | Multiplicam |

**Keeper em detalhe.** É a calculadora com mais filtros, e a que o ticket cita. Os rótulos abaixo são os da página.

- Principais: I'm attracted to, Wants kids, Age, Height, Minimum Income, Ethnicity, Hair Color, Eye Color, Minimum Education, Religion, Smokes, Drinks, Exclude Married, Body type.
- Avançados: Works out, Not depressed, Vapes (past 5 days), Healthy teeth, Sleeps at least 8 hours, Employment (Employed / Full-time / Business owner), Lives with parents, Owns their home, Kids at home, Living with a partner, White-collar occupation, Lives in a metro area, Politics (Democrat / Republican), Practices their religion, Smokes weed, Owns a gun, Vegetarian, Has tattoos, Into astrology, Left-handed, Body count (só com idade entre 25 e 49), Must be into.
- As dicas de cada filtro dão a fonte de alguns: IMC aferido (CDC); exercício vigoroso semanal (CDC); PHQ-9 abaixo do corte moderado (CDC); dentes autoavaliados (CDC); partido com quem se inclina (Pew); culto pelo menos mensal (Gallup); astrologia ao menos anual (Pew); parceiros de sexo oposto, 25–49 anos (NSFG). Cabelo, olhos, maconha, arma, vegetariano, tatuagem, canhoto e "quer filhos" não têm fonte própria: caem no "estimated shares from published national surveys" da folha de método.
- O resultado: "X% of all men in the United States meet your standards" e "That's N of 129,275,328 adult American men". Sem faixa, sem "o que mais pesa". A pergunta frequente sobre ser a sua chance responde "Not exactly [...] Your personal probability of finding them is determined by many factors including how much effort you put into finding them"; a folha de método diz "It doesn't know who's nearby or interested".
- Sondando a API da página (homens, o resto em "qualquer"): renda ≥ US$ 100 mil (14,38%) com superior completo (26,49%) dá 9,51%, longe do produto (4,94%), logo conjunta. Vegetariano (1,54%) com republicano (37,90%) dá 0,758%, o produto exato; arma com republicano também, embora as duas andem juntas. Com tudo em "qualquer", a API devolve 77,07% e não 100%, e a página não explica.

**A Pool Report** é a mais próxima do que fazemos e a que mais vale olhar na apresentação (ver [abaixo](#como-o-resultado-aparece)). Ela dá "About 1 in 16", "About 1.6 million men" e "6.19% of age group" lado a lado; mede o efeito de cada filtro tirando um por vez ("Removes 89%") e avisa para não somar; mostra a conta multiplicada contra a conjunta (8,95% contra 6,19%); dá duas faixas e diz que nenhuma é intervalo de confiança; e escreve "Population estimate, not a count of active daters" ([método](https://datingpoolreport.com/methodology)).

## Filtro por filtro: há dado oficial brasileiro?

Como ler a coluna "Cruza":

- **Censo:** está no microdado público do Censo 2022, por pessoa, junto com sexo, idade, UF, união, escolaridade, renda, cor, religião e filhos. Cruza de verdade, como os Requisitos do Censo hoje.
- **PNS ×:** sai da PNS 2019 e entra como entram hoje orientação, altura e cigarro: a probabilidade dentro de sexo × faixa etária multiplica a célula do Censo, supondo independência do resto dentro dessa célula ([`possible-group.ts`](../packages/rules/src/possible-group.ts)). Entre si, os Requisitos da PNS poderiam cruzar de verdade no microdado da PNS (ver [o motor](#um-ponto-do-motor-antes-de-somar-requisitos-da-pns)).
- **PNAD ×:** sai da PNAD Contínua, com a mesma suposição.
- **Não:** nenhuma pesquisa oficial pergunta, ou só há agregado sem sexo e idade.

Variáveis da PNS conferidas no [dicionário](https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip); do Censo, no [layout de acesso público](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Layout%20e%20dicion%C3%A1rio/) e no [dicionário](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Layout%20e%20dicion%C3%A1rio/Dicion%C3%A1rio%20de%20Vari%C3%A1veis%20-%20Microdados%20CD2022.pdf); da PNAD Contínua, no [dicionário trimestral](https://ftp.ibge.gov.br/Trabalho_e_Rendimento/Pesquisa_Nacional_por_Amostra_de_Domicilios_continua/Trimestral/Microdados/Documentacao/Dicionario_e_input_20221031.zip).

A coluna "Homens / mulheres 25–34" é conta nossa nos microdados da PNS 2019: morador selecionado de 18 anos ou mais com entrevista (M001 = 1), peso V00291, sem intervalo. Serve para dar a ordem de grandeza e o tamanho da célula, não para publicar.

### Com dado no Censo 2022 (cruza de verdade)

| Filtro (Keeper) | Variável | Observação |
|---|---|---|
| Lives with parents | P0300 (mãe ou madrasta mora no domicílio) e P0310 (pai ou padrasto), sim/não, para todas as pessoas | Direto e por pessoa. P0170 (condição no domicílio = filho ou enteado) dá o mesmo por outro caminho. |
| Employment | P0950 (ocupada / desocupada, 14+), P0930 (na força de trabalho); P0990 07 "Empregador" e 08 "Conta própria" para "dono de negócio" | Jornada (tempo integral) não está no arquivo público do Censo; está na PNAD Contínua. A renda que já temos dá parte do mesmo recorte. |
| Owns their home | D0190 no arquivo de domicílios (1 próprio já pago, 2 próprio pagando, 3 alugado, 4–6 cedido, 7 outra), ligado à pessoa pelo controle | A casa é "de algum morador": quem mora com os pais aparece como dono. Para dizer "a pessoa tem casa", combine com P0170 = responsável ou cônjuge. SIDRA [10202](https://sidra.ibge.gov.br/tabela/10202) traz a condição de ocupação × cor × religião por município, sem idade. |
| Lives in a metro area | Não há região metropolitana no arquivo público; há P0140 (urbana / rural) e P0120 (situação do setor) | O Requisito Onde já faz isso melhor, com município. A PNAD (V1023, RM_RIDE) e a PNS (V0031) têm capital / resto da RM / resto da UF. Valor baixo. |
| Kids at home | Já coberto pelo "sem filhos" (P0340 para mulheres); para homens, só filhos que moram junto (P0170 + arquivo de famílias), como no [relatório #2](2026-10-18-dados-grupo-possivel.md) | Nada novo. |
| Living with a partner / Exclude Married | Já é o "não mora com companheiro(a)" (P0280) | Nada novo. A Keeper separa "casado" de "mora com parceiro"; nós já medimos a união de fato. |

### Com dado na PNS 2019 (multiplica dentro de sexo × idade)

| Filtro (Keeper) | Variável | Homens / mulheres 25–34 (conta nossa) | Observação |
|---|---|---|---|
| Drinks | P027 (nunca / menos de 1 vez por mês / 1 vez ou mais por mês), P02801 (dias por semana), P029 (doses), P03201 (5+ doses numa ocasião nos últimos 30 dias) | Nunca bebe: 38,8% / 58,4%. Bebe 1 vez por mês ou mais: 46,0% / 27,4% | Dá para fazer "não bebe", "raramente", "toda semana" e "bebe pesado". |
| Works out | P034 (exercício nos últimos 3 meses), P035 (dias por semana), P03701/P03702 (duração), P036 (tipo) | 150 min ou mais por semana: 34,4% / 28,5% | 150 min por semana é a recomendação da OMS para atividade moderada; a conta não separa a intensidade. |
| Body type (IMC) | P00104 (peso) e P00404 (altura), referidos, amostra toda; W00103 e W00203, aferidos, subamostra | IMC ≥ 30 pelo referido: 19,4% / 21,9% | O referido subestima o peso. A altura de hoje já usa o P00404, então peso e altura cruzam de verdade dentro da PNS. |
| Not depressed | N010–N018 (as 9 perguntas do PHQ-9) e Q092 (diagnóstico de depressão por médico ou profissional de saúde mental) | PHQ-9 ≥ 10: 5,1% / 13,9%. Diagnóstico: 4,0% / 10,0% | Ver os riscos [abaixo](#requisitos-sensíveis). |
| Vapes | P06701 (usa cigarro eletrônico, narguilé eletrônico ou cigarro aquecido: diariamente / menos que diariamente / já usou / nunca) | Usa hoje: 1,1% / 0,5% | Célula minúscula: 66 e 33 registros na faixa. Dado de 2019, antes da alta do vape. |
| Healthy teeth | U005 (autoavaliação da saúde bucal, de muito boa a muito ruim); U02302–U02403 (dentes perdidos); U02501 (prótese) | Boa ou muito boa: 72,1% / 74,7% | Autoavaliação, como na Keeper. |
| Practices their religion | M01901 (frequência a atividades coletivas da religião nos últimos 12 meses) | Uma vez por semana ou mais: 28,0% / 38,0% | A PNS não pergunta qual religião. Cruzar com a religião do Censo supõe que evangélico e católico vão ao culto na mesma proporção, o que é falso. Ver [abaixo](#um-ponto-do-motor-antes-de-somar-requisitos-da-pns). |
| Bisexual / Must be into | Y008 = 2 (bissexual), 18+ | 0,5% / 1,3% | Já usamos a Y008 pelo Perfil. Um filtro "só bissexuais" teria 55 e 106 registros na faixa. |
| Sleeps at least 8 hours | Não há horas de sono. Só N010 (frequência de problemas no sono nas últimas 2 semanas, item do PHQ-9) | — | Não serve para "dorme 8 horas". O Vigitel 2024 tem horas de sono, só nas capitais ([abaixo](#fora-do-ibge)). |

A PNS 2019 é a última: o FTP do IBGE só tem as pastas [2013 e 2019](https://ftp.ibge.gov.br/PNS/). A geografia vai até UF e capital (V0031), sem município.

### Com dado na PNAD Contínua (multiplica)

| Filtro (Keeper) | Variável | Observação |
|---|---|---|
| White-collar occupation | VD4011 (grupamentos ocupacionais: diretores e gerentes, profissionais das ciências e intelectuais, técnicos de nível médio, apoio administrativo, serviços e comércio etc.) e V4010 (código COD) | O arquivo público do Censo tirou a ocupação. A PNAD tem sexo, idade simples, escolaridade, renda e UF na mesma base, então dá para condicionar em sexo × idade × escolaridade e errar menos que só com sexo × idade. No Censo, o SIDRA [10264](https://sidra.ibge.gov.br/tabela/10264) tem grandes grupos de ocupação × sexo × cor por município, sem idade. A PNS também tem a ocupação (E01201, COD). "Colarinho branco" precisa de uma definição nossa (grupos 1 a 4?). |
| Employment (tempo integral) | Horas trabalhadas na PNAD | Só se quisermos o "full-time" da Keeper. |

### Fora do IBGE

| Filtro (Keeper) | Fonte | O que tem | Marca |
|---|---|---|---|
| Sleeps at least 8 hours | [Vigitel 2024](https://svs.aids.gov.br/daent/cgdnt/vigitel/) (Ministério da Saúde, telefone, 18+, ~1.000 entrevistas por capital; dicionário `dicionario-vigitel-2006-2024.xlsx`) | r701_hh e r701_mm (horas de sono, nova em 2024) e sono_curto; q7 sexo, q6 idade, cidade. Microdado público. | [V] |
| Drinks, Body type, Vapes, Not depressed, Works out | Vigitel 2024 | q35/q36 e alcabu (bebida e binge), q9/q11 com imc e excpeso (peso e altura referidos), r403/r403a (cigarro eletrônico, desde 2019, sem 2022), r205 (depressão diagnosticada), bloco de atividade física (nomes das variáveis não conferidos) | [V] |
| Sono, depressão, vape, bebida (AUDIT), exercício | Covitel 2023 (Vital Strategies e UFPel) | Brasil e 5 regiões; não é oficial; não achei microdado público | [S] |
| Smokes weed | III Levantamento Nacional sobre o Uso de Drogas (Fiocruz, 2015) | Só agregados, por sexo e por idade separados, sem o cruzamento; microdado não é público | [V] |
| Body count | PCAP 2008 e 2013 (Ministério da Saúde) | Só agregados por sexo; microdado sob pedido. A PNS 2019 (módulo Y) pergunta idade da primeira relação (Y001) e relação nos últimos 12 meses (Y002), não o número de parceiros | [V] para a PNS; [S] para a PCAP |
| Wants kids | PNDS 2023 (IBGE e Ministério da Saúde, padrão DHS-8, homens e mulheres, até UF) | Ainda não divulgada. Quando sair, é a fonte. | [S] |
| Politics | TSE, filiados a partidos | Agregados de filiação, não de preferência; filiado é uma fração pequena do eleitorado | [S] |
| Owns a gun | SINARM (Polícia Federal) e registro de CAC (Exército) | Agregados de registro; cerca de 96% homens; sem idade | [S] |
| Vegetarian | Nenhuma oficial | A POF não pergunta; só daria para inferir pelo consumo alimentar | [S] |
| Practices their religion | Só a PNS 2019 (M01901) | Nada além do que está acima | [V] |

O Vigitel cobre só as 26 capitais e o DF. Para o Grupo possível, ele serviria só quando o Lugar escolhido é uma capital, ou como substituto da PNS para atualizar 2019 para 2024 dentro de sexo × idade. Fora da capital, não há dado de sono.

### Sem dado oficial

- Tatuagem, astrologia, canhoto, cor natural do cabelo e cor dos olhos: nenhuma pesquisa oficial pergunta.
- Política, arma, maconha e número de parceiros: só agregados, sem o cruzamento de sexo × idade que a conta pede.
- Vegetariano: nenhuma pergunta oficial.
- Horas de sono fora das capitais: nenhuma.
- Quer ter filhos: a PNDS 2023 ainda não saiu.

## Um ponto do motor antes de somar Requisitos da PNS

Hoje orientação, altura e cigarro entram cada um como uma probabilidade separada, multiplicadas entre si dentro de sexo × faixa etária ([`possible-group.ts`](../packages/rules/src/possible-group.ts), [`scripts/possible-group/pns.ts`](../scripts/possible-group/pns.ts)). Com três, o erro é pequeno. Com oito, não: bebida, cigarro, exercício, IMC e depressão andam juntos, e multiplicar cada um repete o erro que o [relatório #2](2026-10-18-dados-grupo-possivel.md#erro-de-multiplicar-marginais-assumindo-independência) mostrou entre idade e união.

Os oito estão no mesmo arquivo da PNS, para a mesma pessoa. Dá para cruzá-los de verdade: calcular, para cada combinação de Requisitos da PNS ligados, a probabilidade conjunta por sexo × faixa etária, e só ela multiplica a célula do Censo. A suposição que sobra é a mesma de hoje, entre o bloco da PNS e o do Censo. O custo é o tamanho do pacote (combinações de filtros sim/não × faixas de altura) e a célula pequena quando muitos estão ligados; o "instável" teria de olhar também o número de registros da PNS.

Frequência a culto mostra o limite do outro lado: ela depende da religião, que está no Censo e não na PNS. Esse par fica sempre na independência, e o erro é grande. Se o filtro entrar, ele pede aviso próprio ou a regra de não combinar com religião.

## Requisitos sensíveis

O ticket manda listar, não decidir. Cada um abaixo tem dado; o risco vem ao lado.

| Filtro | Dado | Risco |
|---|---|---|
| Peso / IMC ("não obeso") | PNS P00104 + P00404 (referidos) ou W00103 + W00203 (aferidos, subamostra) | Estigma: o site passaria a perguntar ao leitor se aceita gente gorda e a contar quantas "sobram", que é o formato da "Female Delusion Calculator" que viralizou em 2022 com filtro de obesidade e nota de "delírio" ([MEL Magazine, 2022](https://melmagazine.com/en-us/story/female-delusion-calculator)). Qualidade: o peso referido subestima a obesidade, então o grupo "não obeso" sai inflado. |
| Depressão ("não deprimido") | PNS N010–N018 (PHQ-9) ou Q092 (diagnóstico) | Estigma de saúde mental, e o filtro sugere que ter depressão desqualifica alguém como parceiro. Qualidade: o PHQ-9 mede sintomas nas últimas 2 semanas, não um traço; o diagnóstico depende de acesso a médico (mulheres e mais ricos têm mais diagnóstico). LGPD: é dado de saúde, sensível pelo art. 5º, II; o filtro fica no `localStorage` e no link compartilhado, então o link diria que o leitor exclui pessoas com depressão. |
| Bebida | PNS P027, P02801, P029, P03201 | Menor dos sensíveis. Qualidade: autodeclarado, subdeclarado, e a pergunta é de frequência, não de quantidade, salvo P029. |
| Cigarro eletrônico | PNS P06701 | Células com 30 a 70 registros por sexo × faixa; o dado é de 2019 e o uso mudou depois. O Vigitel pergunta desde 2019 (não em 2022), só nas capitais. |
| Bissexual | PNS Y008 | Estatística experimental do IBGE, com 3,4% de "não sabe" ou recusa; células de 50 a 100 registros por faixa; LGPD (orientação sexual é dado sensível, art. 5º, II) num link compartilhável. |
| Frequência a culto | PNS M01901 | Religião é dado sensível na LGPD (art. 5º, II). Qualidade: cruza com a religião do Censo só por independência, e o erro é grande. |
| Política | Só filiação no TSE, agregada | Sem dado por pessoa; e opinião política é dado sensível. Fica fora. |
| Número de parceiros sexuais | Só PCAP 2008/2013, agregado por sexo | Sem dado por pessoa, e o filtro é o que mais estigmatiza ("body count"). Fica fora. |
| Maconha | Só o III LNUD 2015, agregado | Sem dado por pessoa; uso de droga ilícita, subdeclarado. Fica fora. |

O ponto comum é o link compartilhado: todo Requisito entra na query. O [relatório da LGPD](2026-10-18-lgpd-estado-link.md) já concluiu que dado sensível na URL e no analytics só se sustenta com consentimento específico e destacado (art. 11, I). Saúde, vida sexual, religião e opinião política são sensíveis pelo art. 5º, II. Para cada sensível aprovado, vale decidir junto se ele viaja no link.

## Como o resultado aparece

O que mostramos hoje ([`possible-group.tsx`](../frontend/src/ui/possible-group.tsx), [`grupo-possivel.tsx`](../frontend/src/routes/grupo-possivel.tsx), [`possible-group.ts`](../packages/rules/src/possible-group.ts)):

- o número absoluto como faixa ("entre 160 mil e 200 mil"), com "instável" abaixo de 50 registros;
- "o que mais pesa: idade (×3,4)" e, em cada Requisito, "soltar só este: ×3,4 (+670)";
- "Corte a corte", do Brasil adulto até o grupo final;
- "De onde vem a incerteza": quanto daria multiplicando, a origem da faixa e as ressalvas;
- o link para compartilhar, com a frase do que ele mostra.

| O que elas têm | Onde | Nós |
|---|---|---|
| Porcentagem ao lado do número ("6,19% dos homens da faixa") | Keeper, Pool Report, How Delusional | Não. O Corte a corte dá a base, mas a porcentagem não aparece. |
| "1 em N" | Pool Report, How Delusional, femdelusioncalculator | Não. |
| Aviso de que é conta de população: não é a chance pessoal, não sabe quem está perto, interessado ou procurando | Keeper (FAQ e método), Pool Report ("not a count of active daters") | Em parte: dizemos que "não mora com companheiro(a)" inclui quem namora. Não dizemos que o número não é a chance de ninguém nem que conta quem não está procurando. |
| O que mais pesa, tirando um filtro por vez, com aviso de que os efeitos não se somam | Pool Report | Temos o "soltar só este"; falta o aviso de não somar. |
| Conta multiplicada contra conta conjunta | Pool Report | Temos. |
| Faixa de incerteza | Pool Report (duas faixas, com o aviso de que não são intervalo de confiança) | Temos uma faixa (erro de amostra do Censo + intervalo da PNS). Falta, como na Pool Report, uma faixa para a suposição de independência da PNS. |
| "1 em N ou mais raro" quando a amostra é pequena | Pool Report | Temos o "instável", não o limite. |
| Imagem para compartilhar | Keeper (JPEG 1440 × 1440), Pool Report, How Delusional (1:1 e 9:16) | Só o link. |
| Nota de "delírio" ou de exigência | igotstandardsbro (0–5), How Delusional (1–10), femdelusioncalculator (0–100) | Não, e não deveríamos: é o tom que transforma o número em zombaria. |
| Contagem por cidade | Pool Report (estados), How Delusional, femdelusioncalculator, Online Dating Calculator | Temos, até município. |

## Candidatos

Cada linha é um candidato; o usuário aprova um a um, e cada aprovado vira uma sub-issue do #285.

### (a) Requisitos com dado

Sem marca, não é sensível; ⚠️ é sensível e pede a aprovação explícita.

1. Mora com os pais: Censo 2022, P0300 e P0310. Cruza de verdade.
2. Trabalha (e "tem negócio próprio"): Censo 2022, P0950 e P0990 (07 empregador, 08 conta própria). Cruza de verdade.
3. Tem casa própria: Censo 2022, D0190 com P0170 (responsável ou cônjuge). Cruza de verdade.
4. Bebida (não bebe / raramente / toda semana): PNS 2019, P027, P02801 e P029. Multiplica. ⚠️ leve: autodeclarado.
5. Faz exercício (150 min por semana): PNS 2019, P034, P035, P03701 e P03702. Multiplica.
6. Saúde bucal boa: PNS 2019, U005. Multiplica.
7. Ocupação de escritório: PNAD Contínua, VD4011. Multiplica, condicionado em sexo × idade × escolaridade. Pede uma definição nossa de quais grupos contam.
8. ⚠️ Não obeso (IMC < 30): PNS 2019, P00104 e P00404. Multiplica. Estigma e peso subdeclarado.
9. ⚠️ Sem sintomas de depressão: PNS 2019, N010–N018 (PHQ-9) ou Q092. Multiplica. Estigma, dado de saúde (LGPD) e medida de 2 semanas.
10. ⚠️ Não usa cigarro eletrônico: PNS 2019, P06701. Multiplica. Célula de 30 a 70 registros e dado de 2019.
11. ⚠️ Bissexual: PNS 2019, Y008. Multiplica. Experimental, células de 50 a 100 registros, orientação sexual (LGPD).
12. ⚠️ Frequenta culto: PNS 2019, M01901. Multiplica, e não cruza com a religião do Censo. Religião (LGPD) e erro grande.
13. Dorme 8 horas: Vigitel 2024, r701_hh e r701_mm. Só capitais; multiplica.
14. Mora em região metropolitana: PNAD Contínua V1023 ou PNS V0031. Multiplica. Valor baixo: o Requisito Onde já cobre.

### (b) Apresentação

1. Porcentagem e "1 em N" ao lado da faixa absoluta ("1 em 16 homens de 25 a 35 anos em SP"). Fonte: Keeper, [Pool Report](https://datingpoolreport.com/methodology).
2. Aviso curto, perto do número, de que é uma conta de população: não é a chance de ninguém e conta quem não está procurando. Fonte: [Keeper, FAQ](https://www.keeper.ai/calc), [Pool Report](https://datingpoolreport.com/methodology).
3. No "o que mais pesa" e no "soltar só este", dizer que os efeitos não se somam. Fonte: [Pool Report](https://datingpoolreport.com/methodology).
4. Uma segunda faixa, a da suposição de independência entre o Censo e a PNS (limites de Fréchet–Hoeffding ou o mínimo e o máximo possíveis), separada da faixa do erro de amostra. Fonte: [Pool Report](https://datingpoolreport.com/methodology).
5. Cruzar entre si os Requisitos da PNS no pacote de dados, em vez de multiplicá-los, antes de somar novos. Fonte: [este relatório](#um-ponto-do-motor-antes-de-somar-requisitos-da-pns).
6. Imagem para compartilhar, além do link. Fonte: [Keeper](https://www.keeper.ai/calc), [Pool Report](https://datingpoolreport.com/).
7. Não adotar nota de "delírio" nem rótulo de exigência. Fonte: [igotstandardsbro](https://igotstandardsbro.com/), [How Delusional Are You?](https://howdelusionalareyou.com/en/calculator).

## O que o usuário aprovou

Em 26/10/2026, cada candidato passou pelo usuário, um a um.

- **Aprovados como Requisito:** mora com os pais ([#288](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/288)), trabalha ([#289](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/289)), casa própria ([#290](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/290)), bebida ([#291](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/291)), exercício ([#292](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/292)), saúde bucal ([#293](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/293)), ocupação de escritório ([#294](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/294)) e os cinco sensíveis: não obeso ([#295](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/295)), sem sintomas de depressão ([#296](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/296)), não usa cigarro eletrônico ([#297](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/297)), bissexual ([#298](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/298)) e frequenta culto ([#299](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/299)). Os da PNS esperam o cruzamento ([#287](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/287)).
- **Aprovados na apresentação e no motor:** cruzar os Requisitos da PNS entre si ([#287](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/287)), dizer que os efeitos não se somam ([#300](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/300)), a segunda faixa da independência ([#301](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/301), depois do #287) e a imagem para compartilhar ([#302](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/302)).
- **Recusados:** dorme 8 horas, região metropolitana, e a porcentagem com "1 em N" e o aviso de conta de população.
