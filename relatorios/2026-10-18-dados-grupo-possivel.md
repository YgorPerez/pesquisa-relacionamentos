---
ticket: 2
---

# Que dados oficiais brasileiros permitem estimar o Grupo possível por Requisito?

**Data:** 2026-10-18 · **Ticket:** [#2](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/2)
**Status de verificação:** ✅ para Censo 2022, PNS 2019 e PNAD Contínua: conferido nos dicionários de variáveis, notas metodológicas e listagens do FTP do IBGE, e nas tabelas do SIDRA pela API de agregados. 🟡 para licença (não há arquivo de licença no FTP; vale o decreto de dados abertos) e para o tamanho da subamostra de antropometria.

## Resposta curta

- **A base principal é o Censo 2022 (questionário da amostra).** Os microdados saíram em 31/08/2026 e foram atualizados em 14/09/2026. Eles cobrem na mesma base, por pessoa, quase todos os Requisitos: sexo, idade, UF, cor ou raça, escolaridade, rendimento, religião, se vive em união e de que tipo, e filhos (só para mulheres). Isso permite **cruzar Requisitos de verdade** (distribuição conjunta) em vez de multiplicar marginais. O preço: no arquivo de acesso público, **o menor recorte é a UF** e a **idade vem em grupos de 5 anos**.
- **Para município**, as tabelas do SIDRA do Censo 2022 descem até o município (nível N6) com cruzamentos de 3 ou 4 variáveis já prontos, por exemplo estado conjugal × sexo × idade × cor ou raça. Não dá para montar qualquer combinação nelas.
- **Orientação sexual** só existe na **PNS 2019** (18 anos ou mais, estatística experimental). **Altura** (aferida em subamostra e autodeclarada) e **tabagismo** também vêm da PNS 2019. A PNS não tem município nem religião.
- **Não há dado oficial confiável** para: namoro sem morar junto ("solteiro de fato"), identidade de gênero, filhos de homens (fora os que moram com eles), altura por município e orientação sexual abaixo da UF.
- **Multiplicar marginais erra muito** quando os Requisitos dependem da idade, que é o caso de quase todos. Exemplos com números oficiais estão em [Erro da independência](#erro-de-multiplicar-marginais-assumindo-independência): de −62% a +53%.

## As fontes

### 1. Censo Demográfico 2022: questionário da amostra (microdados)

- **Onde baixar:** [ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/). Em `Microdados_de_acesso_Publico/` há duas pastas, `csv/` e `txt/` (posicional), com um zip por UF (por exemplo `35_SP.zip`, 182 MB) e `Todas_as_UFs.zip` (1,0 GB) ([listagem csv](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Microdados_de_acesso_Publico/csv/)). São quatro arquivos: domicílios, pessoas, famílias e mortalidade ([Notas metodológicas 05/2026, p. 9](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Notas%20metodol%C3%B3gicas/Notas%20metodol%C3%B3gicas%2005-2026%20-%20Microdados%20da%20amostra%20do%20CD2022.pdf)).
- **Documentação:** [Dicionário de Variáveis](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Layout%20e%20dicion%C3%A1rio/Dicion%C3%A1rio%20de%20Vari%C3%A1veis%20-%20Microdados%20CD2022.pdf) e layouts em xlsx/ods na mesma pasta. A atualização de 14/09/2026 incluiu a variável P0115 (número de ordem da família) ([1_Atualizacoes_20260914.pdf](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/1_Atualizacoes_20260914.pdf)).
- **Três níveis de acesso** ([Notas metodológicas 03/2026](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Notas%20metodol%C3%B3gicas/Notas%20metodol%C3%B3gicas%2003-2026%20-%20Controle%20estat%C3%ADstico%20de%20confidencialidade%20dos%20microdados%20do%20CD2022.pdf)):
  - **Público:** download livre. O menor recorte geográfico é a UF. Nos setores com fração amostral de 100% foi tirada uma subamostra de 50% dos domicílios (cerca de 116 mil domicílios, ~1,5%, suprimidos e reponderados). A idade foi recodificada em grupos quinquenais, com "80 ou mais" no topo. Houve supressão local de sexo e idade em registros de risco, e com elas das variáveis de fecundidade. Variáveis com muitas categorias (ocupação, município de nascimento etc.) foram retiradas. Os pesos são recalibrados, e a calibração só garante bater com o **total de população da UF**. Os demais números podem divergir do SIDRA.
  - **Controlado:** desce até a **Área de Ponderação** (grupo de setores; nas cidades grandes, pedaços do município). Exige cadastro Gov.br e termo de compromisso. O termo **proíbe uso comercial, publicitário ou de marketing**, proíbe redistribuir os arquivos e só permite finalidade "estatística, técnica ou científica". A calibração bate o total e o sexo por área de ponderação.
  - **Restrito:** só na Sala de Acesso a Dados Restritos do IBGE, com projeto aprovado por comitê.
- **Amostra:** frações de 10%, 20%, 33%, 50% e até 100% por setor, conforme o tamanho do município ([NM 05/2026, "Processo de expansão da amostra"](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Notas%20metodol%C3%B3gicas/Notas%20metodol%C3%B3gicas%2005-2026%20-%20Microdados%20da%20amostra%20do%20CD2022.pdf)). É de longe a maior amostra disponível.
- **Variáveis relevantes no arquivo de pessoas** (todas do [dicionário](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Layout%20e%20dicion%C3%A1rio/Dicion%C3%A1rio%20de%20Vari%C3%A1veis%20-%20Microdados%20CD2022.pdf)):
  - P0150/P0160: sexo, definido como "sexo biológico do morador (atribuído ao nascer)". Não há identidade de gênero.
  - P0180 (grupos quinquenais, versão pública) e P0181 (idade em anos).
  - P0210: cor ou raça.
  - P0170: condição no domicílio, com "cônjuge de sexo diferente" e "cônjuge do mesmo sexo".
  - P0280: convivência com cônjuge ou companheiro (sim / não, já viveu / nunca viveu).
  - P0290: natureza da união (civil e religioso / só civil / só religioso / **união consensual**).
  - P0320–P0400: filhos nascidos vivos e vivos. Só investigados para **mulheres de 12 anos ou mais**; ficam em branco para todos os homens.
  - P0410 (9 grupos) e P0411 (33 categorias): religião ou culto. A P0410 tem a observação de que foi "elaborada com restrições" de confidencialidade.
  - P0760/P0790: nível de instrução e anos de estudo.
  - P1080/P1110: rendimento do trabalho e de todas as fontes.
  - P0110: peso amostral público.
- **Não há variável de estado civil legal** (solteiro/casado/divorciado/viúvo) no dicionário de 2022. O tema "Nupcialidade" mede **estado conjugal de fato**: "vivia em união", "não vivia, mas já viveu" e "nunca viveu" ([NM 05/2026, p. 41](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Notas%20metodol%C3%B3gicas/Notas%20metodol%C3%B3gicas%2005-2026%20-%20Microdados%20da%20amostra%20do%20CD2022.pdf)).
- **Força da evidência:** forte, pela amostra enorme e pela coleta oficial. Cuidado com células pequenas em UFs pequenas e com a supressão de confidencialidade.

### 2. Censo Demográfico 2022: tabelas do SIDRA (agregados)

Os metadados abaixo foram consultados pela [API de agregados do IBGE](https://servicodados.ibge.gov.br/api/v3/agregados). "N6" é município.

| Tabela | Conteúdo | Níveis |
|---|---|---|
| [9514](https://sidra.ibge.gov.br/tabela/9514) | População por sexo e **idade em anos simples** (universo) | Brasil, Região, UF, Município |
| [10185](https://sidra.ibge.gov.br/tabela/10185) | Estado conjugal (vivia / não vivia em união) × sexo × grupos de idade × cor ou raça | Brasil, Região, UF, Município |
| [10183](https://sidra.ibge.gov.br/tabela/10183) | Estado conjugal × sexo × idade × religião | Brasil, Região, UF, Município |
| [10187](https://sidra.ibge.gov.br/tabela/10187) | Natureza da união (inclui união consensual) × sexo × idade × religião | Brasil, Região, UF, Município |
| [10186](https://sidra.ibge.gov.br/tabela/10186) | Estado conjugal × idade × condição no domicílio (inclui cônjuge do mesmo sexo) | Brasil, Região, UF (sem município) |
| [10061](https://sidra.ibge.gov.br/tabela/10061) | Nível de instrução (18+) × idade × sexo × cor ou raça | Brasil, Região, UF, Município |
| [10199](https://sidra.ibge.gov.br/tabela/10199) | Nível de instrução (25+) × sexo × religião | Brasil, Região, UF, Município |
| [10292](https://sidra.ibge.gov.br/tabela/10292) | Ocupados por sexo e classes de rendimento do trabalho (salários mínimos) | Brasil, Região, UF, Município |
| [10075](https://sidra.ibge.gov.br/tabela/10075) | Mulheres 12+ por número de filhos nascidos vivos × instrução × idade | Brasil, Região, UF, Município |

- Na tabela 10185, o estado conjugal só tem as categorias "Viviam em união" e "Não viviam em união".
- O SIDRA serve para **marginais municipais** e para cruzamentos pré-definidos. Não permite somar mais um Requisito por conta própria.
- **Formato:** CSV/XLSX/ODS pela interface ou JSON pela API (`/api/v3/agregados/{tabela}/periodos/2022/variaveis/...`).

### 3. PNS 2019: Pesquisa Nacional de Saúde

- **Onde baixar:**
  - Microdados: [PNS_2019_20220525.zip](https://ftp.ibge.gov.br/PNS/2019/Microdados/Dados/PNS_2019_20220525.zip) (28 MB, texto posicional).
  - Dicionário e input SAS: [Dicionario_e_input_20220530.zip](https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip).
  - Tabelas de orientação sexual: [Orientacao_Sexual_Autoidentificada_da_Populacao_Adulta/](https://ftp.ibge.gov.br/PNS/2019/Orientacao_Sexual_Autoidentificada_da_Populacao_Adulta/).
- **Geografia:**
  - UF (V0001) e tipo de área (V0031: capital / resto da região metropolitana / RIDE / resto da UF). Não tem município ([dicionário](https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip)).
  - As tabelas de orientação sexual saem por UF e por município das capitais ([índice de tabelas](https://ftp.ibge.gov.br/PNS/2019/Orientacao_Sexual_Autoidentificada_da_Populacao_Adulta/indice_de_tabelas.pdf)).
- **Variáveis relevantes** ([dicionário](https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip)):
  - C006: sexo.
  - C008: idade em anos simples.
  - C009: cor ou raça.
  - **C011: estado civil legal** (casado / divorciado ou separado / viúvo / solteiro).
  - **C01001: cônjuge mora no domicílio.**
  - **C013: cônjuge mora em outro domicílio.**
  - C014: natureza da união.
  - **Y008: "Qual é a sua orientação sexual?"** (heterossexual / bissexual / homossexual / outra / não sabe / recusou).
  - **P00404: altura final, em grande parte autodeclarada** (P00402: "sabe sua altura?").
  - **W00201 e seguintes: altura aferida** no módulo de antropometria.
  - **P050: "Atualmente fuma algum produto do tabaco?"** e **P06701: cigarro eletrônico**.
  - M01901: frequência a atividades religiosas. **Não há pergunta de filiação religiosa.**
- **Orientação sexual** ([Tabelas 1.1.1, 1.1.2 e 1.2.1](https://ftp.ibge.gov.br/PNS/2019/Orientacao_Sexual_Autoidentificada_da_Populacao_Adulta/PNS_2019_Orientacao_Sexual_Autoidentificada_xls.zip)):
  - Entre pessoas de 18 anos ou mais: 94,8% heterossexuais, 1,2% homossexuais, 0,7% bissexuais, 1,1% "não sabe" e 2,3% recusaram responder.
  - Homens: 1,4% homossexuais (1,05 milhão; IC 95% 0,89–1,20 mi) e 0,5% bissexuais (373 mil).
  - **18 a 29 anos: 4,8% homossexuais ou bissexuais** (IC 4,2–5,5), contra 1,8% no total de adultos.
  - O IBGE publicou o tema como **estatística experimental** ([página da PNS](https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html)). A [notícia de divulgação](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/33785-em-pesquisa-inedita-do-ibge-2-9-milhoes-de-adultos-se-declararam-homossexuais-ou-bissexuais-em-2019) registra 2,9 milhões de adultos LGB. A página estava atrás de Cloudflare e não pôde ser relida; o número bate com a soma da Tabela 1.1.2.
- **Altura:** "Em 2019 \[...\] a aferição dessas medidas ocorreu em uma subamostra dos moradores selecionados de 15 anos ou mais" ([Nota técnica 01/2021](https://biblioteca.ibge.gov.br/visualizacao/livros/liv101839.pdf)). Em 2013 a medição foi feita em todos os selecionados de 18+. A subamostra de 2019 tem cerca de 6,6 mil adultos medidos contra ~88 mil com altura referida ([Rev. Saúde Pública 2024](https://scielosp.org/pdf/rsp/2024.v58/28/pt); fonte secundária, 🟡).
- **PNS 2013:** tem microdados em [ftp.ibge.gov.br/PNS/2013/](https://ftp.ibge.gov.br/PNS/2013/) e antropometria em todos os 18+, mas não perguntou orientação sexual (o tema foi "inédito" em 2019, segundo a notícia acima).
- **Força da evidência:** moderada a forte para tabagismo, estado civil e altura referida. Moderada a fraca para orientação sexual: é experimental, tem 3,4% de "não sabe" ou recusa e provável subdeclaração por estigma (ressalvas do próprio IBGE na divulgação). A amostra é pequena por UF.

### 4. PNAD Contínua (trimestral e anual)

- **Onde baixar:**
  - Microdados trimestrais em [Trimestral/Microdados/](https://ftp.ibge.gov.br/Trabalho_e_Rendimento/Pesquisa_Nacional_por_Amostra_de_Domicilios_continua/Trimestral/Microdados/), um zip de ~220 MB por trimestre, texto posicional. O último é o `PNADC_022026.zip`, de 14/08/2026.
  - Dicionário e input SAS em [Documentacao/](https://ftp.ibge.gov.br/Trabalho_e_Rendimento/Pesquisa_Nacional_por_Amostra_de_Domicilios_continua/Trimestral/Microdados/Documentacao/).
  - Suplementos anuais (rendimento de todas as fontes etc.) em `Anual/Microdados/Visita` e `Trimestre` ([LEIA-ME](https://ftp.ibge.gov.br/Trabalho_e_Rendimento/Pesquisa_Nacional_por_Amostra_de_Domicilios_continua/Trimestral/Microdados/LEIA-ME.pdf)).
- **Geografia:** UF, município da capital (`Capital`), região metropolitana / RIDE (`RM_RIDE`) e tipo de área (`V1023`) ([dicionário](https://ftp.ibge.gov.br/Trabalho_e_Rendimento/Pesquisa_Nacional_por_Amostra_de_Domicilios_continua/Trimestral/Microdados/Documentacao/Dicionario_e_input_20221031.zip)).
- **Variáveis:** V2007 (sexo), V2009 (idade simples), V2010 (cor ou raça), VD3004 (instrução), VD4020 (rendimento do trabalho), V2005 (condição no domicílio, com cônjuge de sexo diferente ou do mesmo sexo).
- **Não tem:** estado civil, natureza da união, religião, orientação sexual, altura, tabagismo nem fecundidade. A união só aparece se a pessoa for responsável pelo domicílio ou cônjuge do responsável (V2005).
- **Uso aqui:** atualizar renda e escolaridade para 2025/2026, já que o Censo é de jul/2022. A PNAD Contínua é a fonte oficial de rendimento corrente.

### Licença de uso

- O FTP do IBGE **não traz arquivo de licença**.
- O [Decreto 8.777/2016](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/d8777.htm) (Política de Dados Abertos do Executivo federal) diz no art. 4º que "os dados disponibilizados pelo Poder Executivo federal \[...\] são de livre utilização pelo Governo federal e pela sociedade". O mesmo decreto define dados abertos como dados sob licença que permita "livre utilização, consumo ou cruzamento, limitando-se a creditar a autoria ou a fonte".
- Conclusão prática: **microdados públicos e tabelas do SIDRA podem ser usados num site, inclusive comercial, citando "Fonte: IBGE"** (🟡: inferido do decreto, sem termo específico do IBGE localizado).
- **Exceção importante:** os microdados de **acesso controlado** do Censo 2022 **proíbem uso comercial ou de marketing e redistribuição** ([NM 03/2026](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Notas%20metodol%C3%B3gicas/Notas%20metodol%C3%B3gicas%2003-2026%20-%20Controle%20estat%C3%ADstico%20de%20confidencialidade%20dos%20microdados%20do%20CD2022.pdf)). Um site com monetização não deveria usá-los. Se não houver monetização, ainda é preciso declarar a finalidade como estudo.

## Tabela-resumo: Requisito × fonte

Legenda de "Cruzável": **Sim** quando está na mesma base, por pessoa, junto com sexo, idade, UF, escolaridade, renda, cor e união (microdados do Censo). **Parcial** quando só cruza com sexo, idade, UF, cor e escolaridade de outra base (PNS). **Não** quando não há dado.

| Requisito | Melhor fonte | Granularidade geográfica | Ano | Microdados públicos | Cruzável |
|---|---|---|---|---|---|
| Sexo | Censo 2022 (P0150) / SIDRA 9514 | Município (SIDRA); UF (microdado) | 2022 | Sim, CSV/TXT | Sim |
| Idade | Censo 2022: SIDRA 9514 (anos simples); microdado público só em grupos de 5 anos | Município | 2022 | Sim (em grupos) | Sim, em faixas de 5 anos |
| UF / município | Censo 2022 | Município só no SIDRA; Área de Ponderação no acesso controlado | 2022 | Só até UF | Sim até UF |
| Escolaridade | Censo 2022 (P0760) / SIDRA 10061; PNAD C (VD3004) para dado recente | Município (SIDRA) | 2022; PNAD C 2026 | Sim | Sim |
| Renda | Censo 2022 (P1080/P1110) / SIDRA 10292; PNAD C para valores atuais | Município (SIDRA) | 2022; PNAD C 2026 | Sim | Sim |
| Vive em união (de fato) | Censo 2022 (P0280/P0290) / SIDRA 10185, 10187 | Município (SIDRA) | 2022 | Sim | Sim |
| Estado civil legal | PNS 2019 (C011) | UF / capital | 2019 | Sim (TXT) | Parcial |
| Namora sem morar junto | Nenhuma fonte oficial | — | — | — | **Sem dado** |
| Filhos (mulheres) | Censo 2022 (P0340, P0370) / SIDRA 10075 | Município (SIDRA) | 2022 | Sim (com supressões) | Sim |
| Filhos (homens) | Só filhos que moram junto: Censo P0170 + arquivo de famílias; PNAD C V2005 | UF (microdado) | 2022 | Sim | Sim, mas subestima |
| Religião | Censo 2022 (P0410) / SIDRA 10183, 10187, 10199 | Município (SIDRA) | 2022 | Sim (9 grupos) | Sim |
| Cor ou raça | Censo 2022 (P0210) / SIDRA 10185, 10061 | Município (SIDRA) | 2022 | Sim | Sim |
| Orientação sexual | PNS 2019 (Y008), experimental, 18+ | UF / capital (IC largos) | 2019 | Sim | Parcial |
| Casal do mesmo sexo morando junto | Censo 2022 (P0170 = 3) / SIDRA 10186 | UF (SIDRA 10186) | 2022 | Sim | Sim, mas é só limite inferior |
| Altura | PNS 2019: P00404 (referida, amostra toda) e W002xx (aferida, subamostra); PNS 2013 aferida em todos os 18+ | UF / capital | 2019 / 2013 | Sim | Parcial |
| Tabagismo | PNS 2019 (P050, P06701) | UF / capital | 2019 | Sim | Parcial |
| Identidade de gênero | Nenhuma: o Censo e a PNS registram só sexo ao nascer | — | — | — | **Sem dado** |

## "Solteiro" de fato vs estado civil legal

- O Censo 2022 **não pergunta estado civil legal**. Ele mede se a pessoa **vive com cônjuge ou companheiro no domicílio** e, nesse caso, a natureza da união ([dicionário, P0280/P0290](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Layout%20e%20dicion%C3%A1rio/Dicion%C3%A1rio%20de%20Vari%C3%A1veis%20-%20Microdados%20CD2022.pdf)). Isso é melhor que o estado civil legal para o Grupo possível, porque capta as uniões consensuais.
- A diferença é grande entre jovens ([SIDRA 10187](https://sidra.ibge.gov.br/tabela/10187), Brasil, 2022). Esses 75,6% são legalmente "solteiros" mas não estão disponíveis:

  | Grupo (pessoas que viviam em união) | Em união consensual |
  |---|---|
  | 20–24 anos | **75,6%** (3,66 mi de 4,84 mi) |
  | 25–29 anos | 62,2% |
  | Todas as idades | 38,9% |

- O "não vivia em união" do Censo, por sua vez, **superestima os disponíveis**. Ele inclui quem namora sem morar junto e quem tem cônjuge morando em outro domicílio, que o Censo classifica como "não vive, já viveu" ([dicionário, P0280](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Layout%20e%20dicion%C3%A1rio/Dicion%C3%A1rio%20de%20Vari%C3%A1veis%20-%20Microdados%20CD2022.pdf)).
- A PNS 2019 separa melhor esses casos: estado civil legal (C011), cônjuge no domicílio (C01001) e **cônjuge em outro domicílio (C013)**. Mesmo assim, **nenhuma pesquisa oficial pergunta sobre namoro**. "Solteiro de fato" no sentido de "sem relacionamento" não tem dado oficial.

## Erro de multiplicar marginais assumindo independência

Multiplicar porcentagens nacionais (por exemplo "% LGB" × "% não vive em união" × população da faixa etária) supõe que os Requisitos são independentes entre si. Quase todos dependem fortemente da idade, e os dados oficiais mostram o tamanho do erro:

**Exemplo 1: orientação sexual × idade** ([PNS 2019, Tabela 1.2.1](https://ftp.ibge.gov.br/PNS/2019/Orientacao_Sexual_Autoidentificada_da_Populacao_Adulta/PNS_2019_Orientacao_Sexual_Autoidentificada_xls.zip)):

- Usar a taxa geral de adultos homossexuais ou bissexuais (1,8%) para a faixa de 18–29 anos, onde a taxa é 4,8%, **subestima o grupo em ~62%**.

**Exemplo 2: união × idade** ([SIDRA 10185](https://sidra.ibge.gov.br/tabela/10185), Brasil, 2022). Entre as mulheres de 10 anos ou mais, 50,5% não viviam em união. Aplicar essa taxa geral a cada faixa:

| Mulheres | Taxa real de "não vivia em união" | Erro ao usar 50,5% |
|---|---|---|
| 20–24 anos | 61,9% | Subestima em ~18% |
| 30–34 anos | 32,9% | **Superestima em ~53%** |

Para homens, a taxa vai de 75,2% (20–24) a 36,6% (30–34), contra 46,8% no geral.

**Regra prática:**

- Sempre condicione **pelo menos em sexo × faixa etária (× UF)** antes de multiplicar. Para isso, use cruzamentos prontos (SIDRA) ou microdados.
- A independência que sobra deve ser **condicional**. Por exemplo, supor que orientação sexual independe da escolaridade *dentro* de sexo × idade. Esse erro é menor, mas não é zero: a Tabela 1.2.1 da PNS mostra a orientação variando também com o nível de instrução.

## Requisitos sem dado confiável

- **Namoro / "solteiro de fato"**: nenhuma pesquisa oficial pergunta.
- **Identidade de gênero**: o Censo 2022 registra "sexo biológico atribuído ao nascer" ([P0150](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Documentacao/Layout%20e%20dicion%C3%A1rio/Dicion%C3%A1rio%20de%20Vari%C3%A1veis%20-%20Microdados%20CD2022.pdf)), e a PNS 2019 não coletou o tema.
- **Orientação sexual abaixo da UF** ou cruzada com religião, renda ou união na mesma base do Censo: só PNS, com amostra pequena e status experimental. Para municípios que não são capitais, não há nada.
- **Filhos de homens** que não moram com eles: o Censo só pergunta fecundidade às mulheres.
- **Altura por município ou cruzada com renda e religião do Censo**: só PNS, que é nacional / UF. A altura aferida tem subamostra pequena e a referida tem viés de autodeclaração.
- **Exatidão "hoje"**: o Censo é de 31/07/2022. Renda e escolaridade mudam; use a PNAD Contínua para atualizar.

## Recomendação

1. **Motor principal: microdados de acesso público do Censo 2022** (CSV por UF).
   - Filtre por sexo, grupo de idade, UF, escolaridade, renda, cor ou raça, religião, união (P0280) e, para mulheres, filhos (P0340). Some o peso P0110.
   - Isso dá a **distribuição conjunta real**, sem independência, até o nível de UF.
   - Exiba o número de registros sem peso. Quando houver menos de ~30 a 50 registros, marque a estimativa como instável.
2. **Município e idade exata: ajuste proporcional pelo SIDRA.**
   - Tome a proporção conjunta da UF (passo 1) dentro de sexo × faixa etária.
   - Multiplique pela população municipal de sexo × idade simples da tabela 9514.
   - Onde existir, troque pela tabela municipal que já cruza o Requisito: 10185 (união × cor), 10183 e 10187 (união × religião), 10061 (instrução × cor).
   - A suposição restante é "dentro da UF, a composição condicional é a mesma em todos os municípios". Documente isso no site.
3. **Orientação sexual, tabagismo e altura: probabilidades condicionais da PNS 2019.**
   - Use os microdados da PNS para estimar P(Requisito | sexo, faixa etária [, UF ou capital, escolaridade]), com IC.
   - Aplique essas probabilidades ao resultado do Censo. Mostre a faixa (IC) em vez de um número único.
   - Para orientação, mostre também o "não sabe ou recusou" (3,4%) como incerteza.
4. **"Solteiro":**
   - Rotule como "**não mora com companheiro(a)**" (Censo P0280 ≠ 1), não como "solteiro".
   - Explique que inclui quem namora. Opcionalmente, aplique um desconto de quem tem cônjuge em outro domicílio estimado pela PNS (C013), por sexo × idade.
5. **Não usar** microdados de acesso controlado se o site tiver qualquer monetização, pela cláusula de proibição de uso comercial. **Citar "Fonte: IBGE"** em todo número exibido.
6. **Próximos passos** (podem virar tickets):
   - Protótipo que leia o `35_SP.zip` e reproduza um número do SIDRA 10185 para validar pesos e códigos.
   - Ficha em `estudos/` para o Censo 2022 (microdados) e outra para a PNS 2019 (orientação sexual).
