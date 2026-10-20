---
ticket: 4
---

# Onde casais se conhecem, especialmente no Brasil: o que mais se sabe

*Pesquisa de 18/10/2026 para o ticket #4. Complementa o [relatório de 2026-10-18](../reports/2026-10-18-casamentos-apps-e-onde-procurar.md) e as Fichas já existentes (HCMST, Cacioppo, Kowal, Potarca 2020, Pew, IBGE, Mobile Time). Cada número aponta para a Ficha ou a fonte primária; o que não foi conferido no original está marcado.*

---

## Resumo

1. **Brasil: continua não havendo pesquisa representativa sobre onde os casais se conhecem.** Não achei nada do IBGE (o Registro Civil e a PNAD não perguntam isso), do Datafolha nem do Ipsos com metodologia publicada. O que existe:
   - **Kowal et al. 2025 inclui o Brasil.** São 119 brasileiros com parceiro, 19% deles conheceram o parceiro online. No Brasil, as médias de satisfação de quem se conheceu online e offline são praticamente iguais (4,48 vs. 4,50), mas o grupo online tem só 23 pessoas ([Ficha](../studies/kowal-2025-50-paises.md); cálculo próprio com os dados abertos).
   - **Opinion Box 2017:** 23% dos internautas com parceiro o conheceram online (17% em sites e redes sociais, 6% em apps). É um painel online, então o número tende a ser alto ([Ficha](../studies/opinionbox-2017-relacionamentos-brasil.md)).
   - **Acadêmico:** os estudos brasileiros sobre o tema são pequenos e qualitativos, ou comparam outra coisa, como relações mantidas pela internet ([Haack & Falcke 2017](../studies/haack-2017-relacionamentos-mediados-internet.md)).
2. **Pendências do acervo resolvidas:**
   - **O Brasil está entre os 50 países de Kowal 2025?** Sim. A lista completa está no arquivo do OSF.
   - **Os 53%–66% da HCMST para 2020–2022 foram publicados em artigo revisado?** Não. Vêm de um gráfico atualizado no site de Rosenfeld, com só 117 casais em 2020 e 74 em 2022, e a curva chega a cerca de 53% em 2021. Os dois artigos revisados com essas ondas não trazem esse número. Não achei fonte para 66%.
3. **Fora dos EUA, com amostras aleatórias, o online é bem menor que os 39% americanos:**
   - **França 2005–2013:** menos de 9% ([Bergström 2016](../studies/bergstrom-2016-epic-franca.md)).
   - **Grã-Bretanha 2008–2012:** 10,9% ([Lampard 2020](../studies/lampard-2020-natsal-reino-unido.md)).
   - **França 2020–2024:** um dado mais recente do Ined fala em 24% dos casais que passaram a morar juntos, mas não pôde ser conferido (⬜).
4. **Qualidade e duração continuam sem consenso.** Os estudos pós-2020 apontam em direções diferentes:
   - **50 países:** satisfação um pouco menor para quem se conheceu online ([Kowal 2025](../studies/kowal-2025-50-paises.md)).
   - **EUA:** casamentos online um pouco menos satisfeitos e estáveis ([Sharabi & Dorrance-Hall 2024](../studies/sharabi-2024-online-dating-effect.md), ⬜).
   - **Alemanha:** casais online casam tanto ou mais ([Potarca 2021](../studies/potarca-2021-alemanha-pairfam.md), 🟡).
   - **Suíça:** casais de app não diferem em satisfação ([Potarca 2020](../studies/potarca-2020-suica-apps.md)).
   - **EUA, HCMST:** como o casal se conheceu não prevê término ([Rosenfeld 2017](../studies/rosenfeld-2017-marriage-choice-couplehood.md)).
   - **Meta-análise:** não encontrei nenhuma sobre online vs. offline e qualidade da relação.

---

## 1. Brasil

### 1.1 Kowal et al. 2025: o Brasil está na amostra

O artigo só mostra os países num mapa (Fig. 1) e remete à Tabela S1 do material suplementar. O texto também informa que os dados estão públicos no OSF ([osf.io/uzf37](https://osf.io/uzf37)). O arquivo `Dataset_Relationship_Formation.csv` tem 6.646 linhas e 50 países, **entre eles "Brazil"**.

O recorte brasileiro abaixo é cálculo próprio, sem ponderação e sem teste estatístico:

| Brasil (Kowal 2025, dados do OSF) | Online | Offline |
|---|---|---|
| Pessoas com parceiro | 23 (19,3%) | 96 |
| Satisfação (1–5) | 4,48 | 4,50 |
| Compromisso (1–5) | 4,56 | 4,61 |

- Nas relações iniciadas depois de 2010, 21 de 69 (30%) começaram online.
- O Brasil é o 15º de 50 países na fatia online (média geral de 16%).
- O desenho do estudo tem limites que valem também para o recorte brasileiro: painel online com cotas (Syno International) e pergunta binária ("Online" vs. "de forma tradicional"), que não separa app de rede social.

### 1.2 Pesquisas comerciais

| Fonte | O que diz | Status |
|---|---|---|
| [Opinion Box 2017](../studies/opinionbox-2017-relacionamentos-brasil.md) | 23% dos internautas com parceiro o conheceram online (17% sites e redes sociais; 6% apps). n = 1.735, painel online | ✅ · fraca |
| [Mobile Time/Opinion Box 2025](../studies/mobiletime-2025-apps-relacionamento-brasil.md) | 23% dos brasileiros com smartphone já tiveram encontro por app (29% entre 16–29 anos). Mede encontros, não casais | ✅ · moderada |
| Casamentos.com.br 2021 (via [Agência Brasil](https://agenciabrasil.ebc.com.br/geral/noticia/2021-06/internet-foi-cupido-de-casais-que-se-formaram-durante-pandemia)) | "Quase 20%" de 3,4 mil casais de 26–40 anos com planos de casar se conheceram pela internet e redes sociais; 36% das histórias online começaram em app | ⬜ só cobertura jornalística; relatório original não encontrado. Amostra de usuários de um portal de casamentos |

Não encontrei pesquisa Datafolha ou Ipsos sobre como os brasileiros conheceram o parceiro.

### 1.3 Pesquisa acadêmica brasileira

As buscas no OpenAlex, em repositórios e por busca geral (o SciELO bloqueou a busca automática) só acharam estudos de outro tipo:

- **Comparativo:** [Haack & Falcke 2017](../studies/haack-2017-relacionamentos-mediados-internet.md) compara 43 relações mantidas pela internet com 43 presenciais. As presenciais tiveram mais compromisso, paixão, intimidade e satisfação. **Não** compara casais que se conheceram online com os que se conheceram offline: muitas das relações online ainda não tinham tido encontro presencial.
- **Qualitativos ou de perfis:**
  - etnografia do Tinder (*Mana*, SciELO);
  - 30 jovens de Manaus no Tinder ([RSD 2021](https://doi.org/10.33448/rsd-v10i13.21321));
  - dissertação da UnB sobre perfis do Tinder (2025);
  - dissertação da UFMG sobre o mal-estar amoroso no Tinder;
  - comparação qualitativa de solteiros na Polônia e no Brasil durante a pandemia ([Władza Sądzenia 2024](https://doi.org/10.18778/2300-1690.27.02)).

  Nenhum deles mede a distribuição de onde os casais se conhecem nem a qualidade por contexto de encontro. Não fiz Fichas desses estudos.
- **IBGE:** as estatísticas do Registro Civil e a PNAD Contínua não têm pergunta sobre o local de encontro (ver a [Ficha do IBGE](../studies/ibge-2024-registro-civil.md)).

## 2. HCMST 2020–2022: os números de 53%–66%

- **Origem:** o [site de Michael Rosenfeld](https://web.stanford.edu/~mrosenfe/) traz o gráfico "How heterosexual couples in the US have met, through 2021", atualizado com as ondas de 2020 e 2022. A legenda diz: "Number of different-sex couples who reported how they met in each wave: 2,464 in 2009; 2,957 in 2017; **117 in 2020; 74 in 2022**". No gráfico, a curva de "Met Online" termina perto de 53% em 2021.
- **Artigos revisados com as ondas de 2020/2022:**
  - Rosenfeld & Hausen 2023, *Sociological Science* 10:472–500 (resiliência dos casais na pandemia);
  - Rosenfeld 2025, *Journal of Family Issues*, [doi:10.1177/0192513X251322128](https://doi.org/10.1177/0192513X251322128) (alta da solteirice de 18,9% em 2017 para 24,3% em 2022).

  Li os dois manuscritos no site do autor e nenhum traz a fatia de casais que se conheceram online em 2020–2022.
- **Conclusão:** o número existe só como gráfico no site do pesquisador, com amostras de 117 e 74 casais. Não foi publicado em artigo revisado por pares. Não achei fonte primária para 66%. Ficha atualizada: [Rosenfeld 2019](../studies/rosenfeld-2019-disintermediating-friends.md).

## 3. Outros países: onde casais se conhecem

| País | Fonte | Período | Online | Principal canal | Status |
|---|---|---|---|---|---|
| EUA | [Rosenfeld 2019](../studies/rosenfeld-2019-disintermediating-friends.md) | 2017 | 39% (casais hétero) | Online | ✅ |
| França | [Bergström 2016](../studies/bergstrom-2016-epic-franca.md), Épic, amostra aleatória | encontros de 2005–2013 | < 9% (só sites); 5% das primeiras uniões, 10% das seguintes | Trabalho, festas entre amigos, lugares públicos | ✅ |
| Grã-Bretanha | [Lampard 2020](../studies/lampard-2020-natsal-reino-unido.md), NATSAL-3 | co-residência 2008–2012 | 10,9% (7,3% sites/apps + 3,6% outro online) | Amigos/família (25,8%) | ✅ |
| França | Ined, fiche ERFI-2 nº 22 (2026) | casais que passaram a morar juntos em 2020–2024 | 24% (segundo resultado de busca; Países Baixos 27%, Dinamarca 29%, Croácia 14%) | Encontros em festas e por amigos em queda | ⬜ site do Ined fora do ar (DNS) em 2026-10-18 |
| 50 países | [Kowal 2025](../studies/kowal-2025-50-paises.md) | estoque em 2024 | 16% (21% após 2010) | — | ✅ |
| Suíça | [Potarca 2020](../studies/potarca-2020-suica-apps.md) | relações dos últimos 10 anos, 2018 | 4,1% por app | — | ✅ |

**Lições de método** (de [Bergström 2016](../studies/bergstrom-2016-epic-franca.md)):

- **Tipo de amostra:** painéis online com cotas tendem a dar o dobro do uso de sites que uma amostra aleatória (34% contra 16%–18% na França).
- **Definição de "online":** com a definição ampla do HCMST, um casal que se conheceu na faculdade e depois retomou contato pela internet também conta como online. Só com sites de encontro, a fatia americana do fim dos anos 2000 cairia de 22% para cerca de 9%.

Por isso, números de painéis (Opinion Box, Kowal) não são comparáveis um a um com amostras probabilísticas (Épic, NATSAL, HCMST).

## 4. O local de encontro afeta qualidade e duração?

| Estudo | País | Desenho | Resultado | Status |
|---|---|---|---|---|
| [Rosenfeld 2017](../studies/rosenfeld-2017-marriage-choice-couplehood.md) | EUA | longitudinal, representativo | Como se conheceram não prevê término | ✅ forte |
| [Potarca 2021](../studies/potarca-2021-alemanha-pairfam.md) | Alemanha | longitudinal (pairfam, n = 3.561) | Homens de casais online casam mais; mulheres com ensino superior casam mais se o casal for online | 🟡 moderada |
| [Potarca 2020](../studies/potarca-2020-suica-apps.md) | Suíça | transversal, pesquisa oficial | Casais de app sem diferença de satisfação | ✅ moderada |
| [Kowal 2025](../studies/kowal-2025-50-paises.md) | 50 países | transversal, painel | Online: satisfação e amor um pouco menores (d de 0,35 a 0,51). No Brasil, sem diferença bruta (n pequeno) | ✅ moderada |
| [Sharabi & Dorrance-Hall 2024](../studies/sharabi-2024-online-dating-effect.md) | EUA | transversal, n = 923 casados | Online: satisfação e estabilidade um pouco menores, explicadas em parte por estigma e menor aprovação da rede | ⬜ |
| Hu, Zhu & Zhang 2024, *Cyberpsychology, Behavior, and Social Networking* 27(9) | EUA | dados do Pew 2019 (n = 4.860) | Segundo cobertura, casais online só têm menor "sucesso" se não falam da relação nas redes sociais | ⬜ não conferido; sem Ficha |
| [Cacioppo 2013](../studies/cacioppo-2013-satisfacao-por-local.md) | EUA | transversal, eHarmony | Online: um pouco mais satisfeitos e menos separações | ✅ moderada (conflito de interesse) |

**Leitura:**

- **Direção dos resultados:** os estudos transversais recentes tendem a achar uma pequena desvantagem online. Os longitudinais (HCMST, pairfam) não acham mais término nem menos casamento entre casais online.
- **Por que os transversais pesam menos:** dependem de quem sobreviveu e de autorrelato, e quem se conheceu online tem relações mais curtas e nível socioeconômico mais baixo ([Kowal 2025](../studies/kowal-2025-50-paises.md)).
- **Meta-análise:** não encontrei nenhuma sobre online vs. offline e qualidade ou duração da relação.

## 5. O que fica em aberto

- Conferir no site do Ined (fora do ar em 2026-10-18) a fiche ERFI-2 nº 22 com os 24% de 2020–2024 e criar Ficha.
- Ler o texto completo de Sharabi & Dorrance-Hall 2024 e de Potarca 2021.
- Procurar o relatório original da Casamentos.com.br (2021).
- Buscar diretamente no SciELO e no Catálogo de Teses da CAPES (o SciELO bloqueou a busca automática).

## Fontes consultadas nesta pesquisa

- Kowal et al. 2025, PDF da versão publicada no repositório de Stirling (http://hdl.handle.net/1893/37426) e dados no OSF (https://osf.io/uzf37).
- Rosenfeld, página pessoal (https://web.stanford.edu/~mrosenfe/) e gráfico `Rosenfeld_how_hetero_couples_met_through2021v4.JPG`; manuscritos de Rosenfeld & Hausen 2023 e de Rosenfeld 2025.
- Bergström 2016, Population & Sociétés 530 (PDF).
- Lampard 2020, manuscrito aceito no WRAP (https://wrap.warwick.ac.uk/131685/).
- Potarca 2021, resumo no PubMed (34410350).
- Haack & Falcke 2017, PDF na Revista Colombiana de Psicología.
- Opinion Box 2017, post original.
- Agência Brasil, 12/06/2021 (Casamentos.com.br).
- PsyPost (cobertura de Sharabi & Dorrance-Hall 2024).
