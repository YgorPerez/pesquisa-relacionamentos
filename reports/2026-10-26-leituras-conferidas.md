---
ticket: 179
---

# Leituras dos Sites vizinhos, conferidas afirmação por afirmação

*Conferência feita em 26/10/2026 nas 12 Leituras que estavam em `data/neighbor-sites.yaml`. Para cada uma, li a página, conferi nos estudos o que ela diz deles e procurei fonte para o que ela afirma sem citar. O texto final de cada Leitura (descrição, avisos, Ressalva) é o que está no YAML aprovado. A numeração segue a ordem do YAML antigo. O acesso diz o que eu li do estudo: ✅ texto completo, 🟡 só o resumo, ⬜ não consegui ler. Na coluna "retratação", "nenhuma" quer dizer que Crossref (com os dados do Retraction Watch) e OpenAlex não acusaram retratação, correção nem manifestação de preocupação.*

**O que decidimos sobre o método:**

- Conferimos o nosso texto sobre cada Leitura (descrição e avisos), cada afirmação que a Leitura faz sobre os estudos que cita (no próprio estudo) e as afirmações de fato que ela faz sem fonte. Opinião e conselho ficaram de fora. Todo estudo citado passou pela busca de retratação, correção e integridade.
- Erro no centro do texto tira a Leitura. Erro lateral vira uma Ressalva de uma frase (`caveat`). Eu proponho, o usuário aprova.
- Estudo pago: o resumo vale, a linha fica marcada 🟡 e cada estudo ganha uma issue `ready-for-human`. Não pomos aviso ao leitor por uma afirmação que só o texto pago resolveria. Por isso a Ressalva da Leitura 12 fala de Wolfinger & Perry, e não de Terman 1938, que espera a [#231](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/231).
- Aviso comercial só quando a página divulga o que o autor vende. Por isso não há aviso do PREP para Stanley nem dos livros acadêmicos de Wolfinger e Smith.
- Uma Leitura volta a ser conferida só quando entra ou muda.

---

## Resposta curta

Das 12 Leituras, 11 ficaram. A Leitura 9 (o modelo matemático de Rey e Herrera) saiu: a premissa central, de que a maioria das relações decai até o fim, é desmentida pelos dados de casais reais, e o resto é simulação de computador. Oito ficaram com uma Ressalva e três sem nenhuma. Nenhum estudo citado foi retratado. Huang 2017 recebeu em 2025 uma correção que mantém as conclusões. Os números das páginas quase sempre batem com as fontes. Os erros que achamos são de interpretação: associação contada como causa, um estudo lido como três, um achado deixado de fora.

| Leitura | Decisão | Ressalva ou motivo |
|---|---|---|
| 1. Pew, online dating | fica | Todos os números batem com o relatório do Pew. |
| 2. The Conversation, apps e economia do desejo | fica com Ressalva | O estudo de 2026 também achou mais agressões sexuais e ISTs, o que o texto omite. |
| 3. Greater Good, Thouin | fica com Ressalva | Conhecer pela internet é o caminho mais comum nos EUA, mas não o da maioria (39%). |
| 4. Psychology Today, Stanley sobre Joel 2020 | fica | O resumo do estudo confere. Ganhou o aviso de causa do IFS. |
| 5. Greater Good, Gordon | fica com Ressalva | A semelhança ainda pesa depois de uma conversa curta. |
| 6. HBS, perguntas | fica com Ressalva | Segundo encontro só associado, e "perguntas demais" não foi testado. |
| 7. The Conversation, phubbing | fica com Ressalva | Os três estudos são um grupo só, e o tédio foi o motivo mais apontado. |
| 8. Psychology Today, morar junto | fica com Ressalva | Associação, não causa. |
| 9. The Conversation, modelo de Rey e Herrera | **sai** | Premissa central contrariada por dados de casais reais. O resto é simulação. |
| 10. Our World in Data | fica | Os números batem com os gráficos, e os deslizes são pequenos. |
| 11. IFS, Wolfinger 2016 | fica com Ressalva | Nos anos 1980, um parceiro antes não mudou a chance de divórcio. |
| 12. IFS, Smith & Wolfinger | fica com Ressalva | Wolfinger & Perry acharam associação de curto prazo, não causa. |

---

## 1. Pew Research Center: Key findings about online dating in the U.S.

**Nosso texto.** Descrição: "Pesquisa com 6.034 adultos dos EUA, em 2022, sobre quem usa app de namoro, o que acha dele e quantos acham que já cruzaram com um golpista." Sem aviso.

A descrição antiga dizia "quantos já toparam com golpe". O Pew mede quem *acha* que cruzou com um golpista, então trocamos.

O estudo é o próprio relatório do Pew, que já tem Ficha: [Pew 2023 e 2020](../studies/pew-2023-2020-online-dating.md) (sem DOI; retratação não se aplica).

| Afirmação | Veredito | Acesso |
|---|---|---|
| 6.034 adultos, 5 a 17/7/2022, com reforço de 1.038 LGB | confere | ✅ |
| 30% já usaram app ou site, igual a 2019; 9% no último ano | confere (p. 5) | ✅ |
| Uso por idade 53/37/20/13%; LGB 51% x hetero 28%; homens 34% x mulheres 27% | confere (homens e mulheres só no gráfico) | ✅ |
| Nunca casados 52%, casados 16%, morando junto 46%, divorciados, separados ou viúvos 36% | confere | ✅ |
| Tinder 46%, Match 31%, Bumble 28%; Tinder por idade 79/44/17/1% | confere | ✅ |
| Acima de 50 anos, Match cinco vezes mais que Tinder (50% x 11%) | não conferível (só na imagem do gráfico; o texto diz apenas que o Match é "more popular" de 50 a 64 anos) | ✅ |
| 10% dos adultos com parceiro o conheceram online; 20% abaixo de 30; 24% dos LGB | confere | ✅ |
| Experiência positiva 53% x negativa 46%; homens 57% x mulheres 48%; LGB 61% x hetero 53% | confere | ✅ |
| Pagaram 35%, com os recortes por renda, idade e sexo | confere (pp. 26-28) | ✅ |
| Mulheres sobrecarregadas 54% x homens 25%; homens inseguros 64% x mulheres 40% | confere (p. 12) | ✅ |
| Motivos: parceiro de longo prazo 44%, encontros casuais 40%, sexo casual 24%, amizade 22% | confere | ✅ |
| Busca mais fácil 42%, mais difícil 22%; opções na medida 43%, demais 37%; algoritmo prevê amor 21% | confere (pp. 39, 41) | ✅ |
| Seguro 53% (2019) x 48%; checagem de antecedentes 60% a favor | confere (pp. 15-16) | ✅ |
| Mulheres abaixo de 50: 56% receberam conteúdo explícito sem pedir, 43% seguiram sendo procuradas, 37% xingadas, 11% ameaçadas | confere (pp. 9-10) | ✅ |
| 52% acham que cruzaram com golpista; homens abaixo de 50, 63% | confere | ✅ |

Afirmações sem fonte: nenhuma. Os links da introdução (Parade, BusinessWire, HuffPost) são contexto.

Estudos pagos: nenhum. Fichas a fazer: nenhuma.

---

## 2. The Conversation Brasil: Como os apps de namoro afetam os relacionamentos e a economia do desejo

**Nosso texto.** Descrição: "Um professor da PUC-Rio junta estudos sobre o que os apps mudaram no namoro: mais sexo casual, atenção mais desigual, nenhum ganho claro em relações estáveis e efeitos mistos na saúde mental." Aviso comercial: "O autor tem uma empresa que vende cursos online, a Garagem Psi." Ressalva: "O estudo de 2026 com universitários dos EUA também achou mais agressões sexuais e mais ISTs depois da chegada do Tinder, o que o texto não conta."

A descrição antiga punha na manchete "ter mais opções não deixou as pessoas claramente mais satisfeitas", uma inferência do autor que nenhum estudo citado mede. O aviso comercial vem da biografia na própria página: "possui a empresa Garagem Psi, voltada para divulgação científica e oferta de cursos online".

| Afirmação | Estudo | Veredito | Acesso | Retratação |
|---|---|---|---|---|
| Nos EUA, conhecer online virou o caminho principal dos casais hetero | [Rosenfeld, Thomas & Hausen 2019](../studies/rosenfeld-2019-disintermediating-friends.md) | confere (o mais comum, com 39% em 2017, não a maioria) | ✅ | nenhuma |
| Uma corrente viu o Tinder como libertação eficiente dos solteiros | [Hitsch, Hortaçsu & Ariely 2010](https://doi.org/10.1257/aer.100.1.130) | confere, de leve: o artigo acha os pares online "approximately efficient"; o resto é leitura do autor | ✅ | nenhuma |
| Escala belga de motivos do Tinder, mais de 3 mil jovens, 13 motivos | [Timmermans & De Caluwé 2017](https://doi.org/10.1016/j.chb.2017.01.028) | confere (3.262 participantes, "13 reliable Tinder motives"; os nomes dos motivos não estão no resumo) | 🟡 | nenhuma |
| Estudantes noruegueses: usuários do Tinder formam mais relações, em parte por quem eles são | [Erevik et al. 2020](https://doi.org/10.3389/fpsyg.2020.01757) | confere; o estudo vai além de "em parte": a diferença some com os controles de personalidade e uso de substâncias | ✅ | nenhuma |
| Usuários relatam mais parceiros e mais encontros casuais | [Ciocca et al. 2020](https://doi.org/10.1016/j.sxmr.2019.12.004) | não conferível (o resumo não compara usuários com não usuários) | 🟡 | nenhuma |
| Em alguns estudos, mais comportamento sexual de risco | [Shapiro et al. 2017](https://doi.org/10.1089/cyber.2017.0279) | confere (sexo não consentido OR 3,22; cinco ou mais parceiros OR 2,81; uso de camisinha sem diferença) | 🟡 | nenhuma |
| "Revisões sobre Tinder e saúde sexual" | [Blanc 2023](https://doi.org/10.1007/s13178-023-00883-3) | exagera: não é revisão nem é sobre Tinder; é uma pesquisa com 2.288 espanhóis em que os usuários usam *mais* camisinha | ✅ | nenhuma |
| Os resultados se repetem no Brasil | [Martinez et al. 2025](https://doi.org/10.47626/2237-6089-2023-0746) | exagera: um estudo, 487 estudantes de um campus da USP | ✅ | nenhuma |
| Estudo de 2026, 1,1 milhão de respostas: mais atividade sexual sem mais relações estáveis | [Büyükeren, Makarin & Xiong 2026](https://doi.org/10.1257/app.20240455) | confere | ✅ (working paper) | nenhuma |
| Mesmo estudo: a saúde mental não piorou e melhorou um pouco entre as mulheres | idem | confere, mas omite que o mesmo resumo acha "sexual assault and STDs" em alta (é a Ressalva) | ✅ | nenhuma |
| Deslizar mais não garante mais matches; mulheres recebem mais curtidas | [Timmermans & Courtois 2018](https://doi.org/10.1080/01972243.2017.1414093) | confere, com uma palavra trocada: o estudo fala de matches, não de curtidas | 🟡 | nenhuma |
| Parte da literatura liga o uso de app a pior saúde mental, quase tudo correlacional | [Sharabi, Ou, Von Feldt & Parsons 2026](https://doi.org/10.1016/j.chb.2025.108879) | confere até onde deu (por um resumo secundário: 23 estudos, mais de 26 mil pessoas, direção incerta) | ⬜ | nenhuma |
| Revisões: efeito negativo consistente na imagem corporal, misto na saúde mental | [Bonilla-Zorita, Griffiths & Kuss 2020](https://doi.org/10.1007/s11469-020-00318-9) | afirmação certa, citação errada: o achado é de [Bowman et al. 2025](https://doi.org/10.1016/j.chb.2024.108515) (85% x 48,6% dos estudos), que a página não linka | ✅ | nenhuma |

Afirmações sem fonte:

| Afirmação | O que achei | Veredito |
|---|---|---|
| Mais opções nem sempre trazem mais satisfação | [D'Angelo & Toma 2017](https://doi.org/10.1080/15213269.2015.1121827): quem escolheu entre 24 perfis ficou menos satisfeito que quem escolheu entre 6 | confere no laboratório; a página usa "nem sempre" |
| Subtítulo: "dificuldade em encontrar relacionamentos estáveis" | Büyükeren 2026 não acha efeito na formação de relações, e Erevik 2020 acha mais relações antes dos controles | exagera |

Estudos pagos: [#208](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/208) (Timmermans & De Caluwé), [#209](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/209) (Ciocca), [#210](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/210) (Shapiro), [#211](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/211) (Timmermans & Courtois), [#212](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/212) (Sharabi 2026). Fichas a fazer: [#233](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/233) a [#239](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/239) (lista no fim).

---

## 3. Greater Good: How to Actually Enjoy the Dating Process

**Nosso texto.** Descrição: "Uma coach propõe encarar os encontros como aprendizado, apoiada em estudos sobre namoro online e sobre tratar pretendentes como produto." Aviso comercial: "A autora vende uma masterclass de namoro." Ressalva: "Nos EUA, conhecer o parceiro pela internet virou o caminho mais comum, mas não o da maioria: 39% dos casais em 2017."

A página divulga a masterclass da autora (US$ 35 na loja dela) e um workshop pago.

| Afirmação | Estudo | Veredito | Acesso | Retratação |
|---|---|---|---|---|
| Clareza de autoconceito "directly impacts" a escolha de um parceiro compatível; dois estudos da McGill | [Kredl, Kubin & Lydon 2024](https://doi.org/10.1111/pere.12570) | achados conferem; "directly impacts" exagera (dois estudos retrospectivos, correlacionais, N = 340) | 🟡 | nenhuma |
| Pesquisadores cunharam "relationshopping" | [Heino, Ellison & Gibbs 2010](https://doi.org/10.1177/0265407510361614) | confere (qualitativo, 34 entrevistas) | 🟡 | nenhuma |
| "the prevalence of dating app burnout" | [Sharabi, Von Feldt & Ha 2024](https://doi.org/10.1177/14614448241286788) | exagera: mede a mudança em 12 semanas, não a prevalência | 🟡 | nenhuma |
| Casamentos que começaram online terminam um pouco menos e são um pouco mais satisfeitos; amostra de 19.131 | [Cacioppo et al. 2013](../studies/cacioppo-2013-satisfacao-por-local.md) | confere nos números; o estudo conta qualquer lugar online (só 45% em site de namoro), a amostra é de painel e o estudo foi pago pela eHarmony | ✅ | nenhuma |
| Diferenciação do self é "vital" para relações saudáveis | [Calatrava et al. 2022](https://doi.org/10.1016/j.cpr.2021.102101) | confere como associação; a revisão aponta falta de estudos longitudinais | 🟡 | nenhuma |
| (só link) roteiro social | [Hesni 2023](https://doi.org/10.1017/apa.2023.10) | artigo de filosofia, sem afirmação empírica | 🟡 | nenhuma |

Afirmações sem fonte:

| Afirmação | O que achei | Veredito |
|---|---|---|
| "most couples do meet online nowadays" | Rosenfeld 2019: 39% em 2017; Cacioppo 2013: "more than one-third" | errado (é a Ressalva) |
| "the late" John T. Cacioppo | morreu em 2018 | confere |
| A maioria usa mensagem de texto para falar com quem conheceu | nada achado | não conferível |

Estudos pagos: [#213](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/213) (Heino). O burnout de Sharabi já está na [#149](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/149), com comentário. Fichas a fazer: o burnout entra pela [#149](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/149).

---

## 4. Psychology Today: Massive New Study on Predictors of Relationship Satisfaction

**Nosso texto.** Descrição: "Scott Stanley, um dos coautores, resume o estudo de Joel e colegas com 11.196 casais: o jeito da relação previu a satisfação melhor que os traços de cada um, e os traços quase nada acrescentaram." Aviso de causa: "Saiu antes no blog do Institute for Family Studies, que defende o casamento."

A descrição antiga dizia "muito melhor". Isso vale no início, não no seguimento. O aviso de causa faltava: a página termina com "A version of this article first appeared on the blog for the Institute of Family Studies".

| Afirmação | Estudo | Veredito | Acesso | Retratação |
|---|---|---|---|---|
| 43 bases, 11.196 casais, 86 pesquisadores | [Joel et al. 2020](../studies/joel-2020-machine-learning-43-datasets.md) | confere | ✅ | nenhuma |
| Random Forests em cada base, depois meta-análise | idem | confere | ✅ | nenhuma |
| As avaliações do parceiro e os traços pouco acrescentam | idem | confere (0,0 a 1,9% a mais no início; 0,9 a 3,5% no seguimento) | ✅ | nenhuma |
| Variáveis da relação "two to three times as predictive" que as individuais | idem | confere no início (45% x 19-21%); no seguimento é cerca de 1,5 vez (18% x 12%) | ✅ | nenhuma |
| Traços que se destacam: satisfação com a vida, depressão, apego | idem | confere (omite o afeto negativo) | ✅ | nenhuma |
| Top cinco da relação: compromisso percebido do parceiro, gratidão, satisfação sexual, satisfação percebida do parceiro, conflito | idem | confere | ✅ | nenhuma |
| "people project their own relationship perceptions..." | idem | não conferível: não está no texto publicado (pode estar na versão antecipada ou no suplemento) | ✅ | nenhuma |
| Semelhança pesa menos que ter um parceiro cuja personalidade você gosta | [Zentner 2005](https://doi.org/10.1037/0022-3514.89.2.242) | confere | 🟡 | nenhuma |
| Achar, mesmo uma vez, que o parceiro está menos comprometido prevê casamento infeliz | [Rhoades & Stanley 2014](../studies/rhoades-2014-before-i-do.md) | confere (relatório sem revisão por pares, n = 418) | ✅ | sem DOI |

Afirmações sem fonte: nenhuma além das acima.

Estudos pagos: [#214](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/214) (Zentner). Fichas a fazer: [#242](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/242) (Zentner).

---

## 5. Greater Good: Can Artificial Intelligence Predict the Right Partner for You?

**Nosso texto.** Descrição: "Uma pesquisadora de relacionamentos explica por que ainda não dá para prever quem vai combinar com quem, nem com IA: a ciência ainda não sabe o que torna duas pessoas compatíveis." Ressalva: "A meta-análise citada achou que a semelhança ainda pesa depois de uma conversa curta e só deixa de pesar em casais já formados."

A descrição antiga fazia da semelhança o assunto da página, que é um parágrafo só, e repetia o trecho exagerado ("pesa pouco depois de uma conversa").

| Afirmação | Estudo | Veredito | Acesso | Retratação |
|---|---|---|---|---|
| 313 estudos; a semelhança pode prever atração antes do encontro | [Montoya, Horton & Kirchner 2008](../studies/montoya-2008-similaridade-real-percebida.md) | confere | 🟡 | nenhuma |
| Depois de uma interação breve, a semelhança tem "much less, if anything" a ver com atração | [Humberg et al. 2023](https://doi.org/10.5964/ps.7551) | exagera: Humberg testou só os Cinco Grandes em encontros rápidos; Montoya acha a semelhança real ainda importante em interações curtas e nula só em casais formados (é a Ressalva) | ✅ | nenhuma |
| A revisão do laboratório dela acha "little evidence" de que casais mais parecidos são mais felizes | [From et al. 2025](https://doi.org/10.1177/02654075251349720) | exagera um pouco: o resumo fala em "generally mixed results" | 🟡 | nenhuma |
| IA melhora previsões em medicina | [Al-Nafjan et al. 2025](https://doi.org/10.3390/jcm14196752) | confere | ✅ | nenhuma |
| As preferências ditas antes dos encontros rápidos "go out the window" | [Joel, Eastwick & Finkel 2017](https://doi.org/10.1177/0956797617714580) | confere, de leve: traços e preferências não previram quem deseja quem; o achado das preferências ignoradas é de [Eastwick & Finkel 2008](../studies/eastwick-2008-preferencias-speed-dating.md) | 🟡 | nenhuma |

Afirmações sem fonte:

| Afirmação | O que achei | Veredito |
|---|---|---|
| Namoro é uma indústria de bilhões | só a Match Group faturou cerca de US$ 3,5 bilhões em 2025 | confere |
| O Overtone foi criado pelo ex-CEO do Hinge | anúncio da Match Group, 9/12/2025 | confere |
| O SciMatch infere compatibilidade por uma selfie | página do app | confere (como descrição do que o app diz) |
| A complementaridade tem "even less empirical support" | sem fonte | não conferível |
| Trabalho não publicado dela | não publicado | não conferível |

Estudos pagos: Montoya na [#126](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/126) (a #215 foi fechada como duplicata), [#216](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/216) (From), [#217](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/217) (Joel 2017). Fichas a fazer: [#240](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/240) (Humberg), [#241](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/241) (From), [#243](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/243) (Joel 2017).

---

## 6. HBS Working Knowledge: Asking Questions Can Get You a Better Job or a Second Date

**Nosso texto.** Descrição: "Pesquisadores de Harvard sortearam quem faria mais perguntas em chats entre desconhecidos: quem perguntou mais, sobretudo em cima do que o outro disse, agradou mais, e em dados de encontros rápidos isso veio junto com mais segundos encontros." Ressalva: "O estudo achou só uma associação entre fazer perguntas e ganhar um segundo encontro, e não testou se perguntas demais atrapalham."

A descrição antiga dizia "três estudos de Harvard". O artigo tem quatro, os dados dos encontros rápidos são de Stanford, e o segundo encontro aparece só como associação.

Estudo principal: [Huang et al. 2017](../studies/huang-2017-perguntas-de-continuidade.md), lido no PDF dos autores. Retratação: nenhuma, mas há uma correção de 2025 (ver "Integridade").

| Afirmação | Veredito | Acesso |
|---|---|---|
| Quem pergunta mais, sobretudo perguntas de continuidade, agrada mais | confere (d = 0,27 a 0,35, efeito pequeno, em chats entre desconhecidos) | ✅ |
| Os dois primeiros estudos tiveram "more than 600" participantes | confere (398 + 338 = 736) | ✅ |
| Estudo 1: uma pessoa instruída a fazer 9 ou mais ou 4 ou menos perguntas; estudo 2: as duas; chats de 15 minutos | confere | ✅ |
| "Nine research assistants" leram 368 transcrições | errado (o artigo diz "six research assistants") | ✅ |
| 44% das perguntas eram de continuidade | confere (apêndice B; o texto principal dá 40,51%) | ✅ |
| Encontros rápidos: 110 pessoas, "over 2,000 conversations" | exagera: 987 transcrições; os 1.961 são decisões de sim ou não | ✅ |
| Dados de um estudo de Stanford de 2013 ([Ranganath, Jurafsky & McFarland 2013](https://doi.org/10.1016/j.csl.2012.01.005)) | confere (retratação: nenhuma) | ✅ |
| "The top third of question askers got the most second dates" | não conferível: o artigo não divide em terços | ✅ |
| Uma pergunta a mais em cada um dos 20 encontros daria um "sim" a mais | exagera: o artigo fala de 8% a mais na taxa de perguntas de continuidade e avisa "one cannot interpret this relationship causally" | ✅ |
| Perguntas demais têm efeito contrário, "the research shows" | exagera: o artigo só sugere testar isso no futuro (é a Ressalva) | ✅ |
| Quem pergunta é mais inteligente emocionalmente e consegue empregos melhores | não conferível: o estudo não mediu nada disso | ✅ |

Afirmações sem fonte: nenhuma além das acima.

Estudos pagos: nenhum. Fichas a fazer: a correção da Ficha de Huang, [#253](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/253).

---

## 7. The Conversation Brasil: 'Phubbing': por que ignorar seu parceiro ou parceira usando o celular enfurece algumas pessoas e leva a retaliações

**Nosso texto.** Descrição: "Duas psicólogas contam o que acharam ao acompanhar por alguns dias 196 pessoas que moram com o parceiro: nos dias em que o outro ficou mais no celular, menos satisfação e, às vezes, revide." Ressalva: "Os três estudos vêm do mesmo grupo de 196 pessoas, e nele o tédio foi o motivo mais apontado para pegar o celular."

A descrição antiga falava em "três estudos", o que sugere três réplicas. O estudo A diz nas notas que C é um subgrupo da mesma amostra (N = 75) e que o narcisismo sairia em outro artigo (B, mesmo N = 196). É um diário de 10 dias, correlacional, com 144 mulheres entre os 196.

Estudos: A = [Carnelley et al. 2025](https://doi.org/10.1111/jopy.70012), B = [Hart et al. 2025](https://doi.org/10.3390/bs15070853), C = [Thomas, Carnelley & Hart 2022](https://doi.org/10.1016/j.chb.2022.107398). Todos lidos no texto completo, nenhum com retratação.

| Afirmação | Estudo | Veredito | Acesso |
|---|---|---|---|
| Diário de 196 pessoas por alguns dias | A | confere | ✅ |
| Nos dias de mais phubbing, menos satisfação, pior humor, mais raiva | A | confere | ✅ |
| Quem tem mais ansiedade de apego reagiu mais: tristeza, autoestima, ressentimento, revide | A | confere (e a satisfação dessas pessoas não caiu, o que o texto não diz) | ✅ |
| Os evitativos "não relataram uma queda tão acentuada na satisfação" | A | errado: a evitação não mudou a queda diária; os evitativos só eram menos satisfeitos em média | ✅ |
| Os evitativos revidaram para buscar aprovação | A | confere | ✅ |
| Rivalidade narcisista: menos autoestima, mais raiva e conflito "fossem elas ignoradas ou não" | B | confere, com um deslize: o conflito só foi medido como resposta ao phubbing | ✅ |
| Admiração narcisista: mais satisfação; mais conflito que revide | B | confere | ✅ |
| Respostas mais comuns: ignorar, ressentir, questionar, confrontar; revide entre as mais frequentes | C | confere (ignorar 5,36; revide 3,42) | ✅ |
| Três motivos surgiram (vingança, apoio, aprovação); o tédio foi "muito menos comum" | C | errado: o tédio foi o motivo mais apontado (5,27 numa escala de 1 a 8, contra 1,50 a 1,77 dos outros; em A, 5,43), e os motivos vieram de uma escala fixa, não de respostas abertas (é a Ressalva) | ✅ |

Afirmações sem fonte: nenhuma. A teoria da equidade aparece como teoria.

Estudos pagos: nenhum. Fichas a fazer: nenhuma issue aberta. O estudo A serviria a uma Pergunta nova sobre celular no casal, que ainda não existe.

---

## 8. Psychology Today: The Risks for Couples Moving in Together

**Nosso texto.** Descrição: "Stanley e Rhoades leem um relatório do governo dos EUA sobre quem mora junto sem casar (renda, estudo, opiniões) e defendem que ir morar junto antes de decidir casar vem com casamento pior e mais divórcio." Aviso de causa: "Saiu antes no blog do Institute for Family Studies, que defende o casamento." Ressalva: "Os estudos citados mostram associação, não causa: quem foi morar junto antes de noivar teve, em média, um casamento um pouco pior e mais divórcio."

A descrição antiga dizia só que eles "reúnem pesquisas sobre ir morar junto antes de decidir casar". Três quartos da página leem o relatório do NCHS de 2018.

| Afirmação | Estudo | Veredito | Acesso | Retratação |
|---|---|---|---|---|
| Em 2011-2015 (18 a 44 anos), 17,1% das mulheres e 15,9% dos homens moravam junto; 44,9%/43,5% casados | [Nugent & Daugherty 2018, NHSR 111](https://www.cdc.gov/nchs/data/nhsr/nhsr111.pdf) | confere (exato) | ✅ | sem DOI |
| 67% dos casados moraram junto antes; 51,4% e 42,9% no grupo "nenhum dos dois" | idem | confere | ✅ | sem DOI |
| 44% de quem mora junto já morou com dois ou mais parceiros | idem | confere | ✅ | sem DOI |
| Renda abaixo de 150% da linha de pobreza e acima de 300%, por grupo | idem | confere (exato) | ✅ | sem DOI |
| Diploma universitário: casados no topo, quem mora junto embaixo | idem | confere; não diz que é de 22 a 44 anos, e entre as mulheres quem mora junto (25,3%) não difere do grupo "nenhum dos dois" (27,6%) | ✅ | sem DOI |
| Primeira relação sexual antes dos 18: 74% x 56%; filho não planejado 43,5% x 23,9% | idem | confere (74/56 mistura os sexos) | ✅ | sem DOI |
| A maioria em todos os grupos acha que morar junto antes pode evitar divórcio | idem | confere | ✅ | sem DOI |
| Morar junto antes de casar passa de 70%, recorde | Hemez & Manning 2017, NCFMR FP-17-05 | exagera pouco: a fonte diz "seven in ten" | ✅ | sem DOI |
| Mulheres de 19 a 44 que já moraram junto subiram 82% em 23 anos; 73% aos 30-34 | Manning 2013, NCFMR FP-13-12 | confere (literal) | ✅ | sem DOI |
| Morar junto cresce entre os mais velhos | [Brown, Bulanda & Lee 2012](https://doi.org/10.1111/j.1741-3737.2012.00994.x) | confere | ✅ | nenhuma |
| Coabitação em série em alta | [Cohen & Manning 2010](https://doi.org/10.1016/j.ssresearch.2010.04.011) | confere | ✅ | nenhuma |
| idem, crescendo rápido em todos os grupos | [Lichter, Turner & Sassler 2010](https://doi.org/10.1016/j.ssresearch.2009.11.002) | não conferível (sem resumo acessível); a tendência aparece em Cohen & Manning e no NHSR | ⬜ | nenhuma |
| Coabitação em série ligada a pobreza, menos casamento e mais divórcio | [Lichter & Qian 2008](https://doi.org/10.1111/j.1741-3737.2008.00532.x) | confere | 🟡 | nenhuma |
| Só uma em três crianças de pais que moram junto fica numa família estável até os 12 | [Manning 2015](https://doi.org/10.1353/foc.2015.0012) | confere (literal) | ✅ | nenhuma |
| idem | [McLanahan & Beck 2010](https://doi.org/10.1353/foc.2010.0007) | confere (fala de pais não casados em geral) | ✅ | nenhuma |
| Divisão de classe em casar ou morar junto | [Smock & Greenland 2010](https://doi.org/10.1111/j.1741-3737.2010.00719.x) | confere, de leve | 🟡 | nenhuma |
| Três quintos dos formandos do ensino médio, nos anos 1990, achavam boa ideia morar junto antes | [Thornton & Young-DeMarco 2001](https://doi.org/10.1111/j.1741-3737.2001.01009.x) | confere por dado secundário (o mesmo item foi de 40% em 1976 a quase 70% em 2008) | 🟡 | nenhuma |
| A experiência de morar junto muda as crenças sobre casamento | [Axinn & Barber 1997](https://doi.org/10.2307/353948) | confere (o resumo não diz a direção) | 🟡 | nenhuma |
| Qualidade da relação: casados direto no topo, quem mora junto sem planos embaixo | [Brown, Manning & Payne 2017](https://doi.org/10.1177/0192513X15622236) | confere | ✅ | nenhuma |
| Morar junto antes de decidir casar vem com casamento pior e mais divórcio, com risco "modest" | [Kline et al. 2004](https://doi.org/10.1037/0893-3200.18.2.311) | confere só para qualidade (136 casais, sem dado de divórcio) | 🟡 | nenhuma |
| idem | [Rhoades, Stanley & Markman 2009](https://doi.org/10.1037/a0014358) | confere ("generally small"; "potencial de divórcio" é autodeclarado) | ✅ | nenhuma |
| idem | [Stanley et al. 2010](https://doi.org/10.1111/j.1741-3737.2010.00738.x) | confere para primeiros casamentos | ✅ | nenhuma |
| Inércia: morar junto torna mais difícil terminar, "net of everything else" | [Stanley, Rhoades & Markman 2006](https://doi.org/10.1111/j.1741-3729.2006.00418.x) | exagera: é artigo de teoria ("we suggest"); [Kuperberg 2014](https://doi.org/10.1111/jomf.12092) atribui boa parte da ligação à idade ao morar junto (é a Ressalva) | 🟡 | nenhuma |
| A maioria dos casais "desliza" para morar junto em vez de decidir | [Lindsay 2000](https://doi.org/10.5172/jfs.6.1.120), [Manning & Smock 2005](https://doi.org/10.1111/j.1741-3737.2005.00189.x), [Stanley, Rhoades & Fincham 2011](https://doi.org/10.1017/CBO9780511761935.013) | exagera pouco: estudos qualitativos que dizem "often", não "most" | 🟡 | nenhuma |
| Classe social pesa em quando se vai morar junto | [Sassler, Michelmore & Qian 2018](https://doi.org/10.1007/s13524-018-0649-8) | confere | ✅ | nenhuma |

Afirmações sem fonte:

| Afirmação | O que achei | Veredito |
|---|---|---|
| Quase toda a alta de filhos fora do casamento desde 1980 veio de casais que moram junto | Manning, Brown & Stykes 2015, NCFMR FP-15-03 | confere |
| "virtually no evidence" de que morar junto antes evita divórcio | [Rosenfeld & Roesler 2019](https://doi.org/10.1111/jomf.12530) (menos término só no primeiro ano, mais depois); [Manning & Cohen 2012](https://doi.org/10.1111/j.1741-3737.2012.00960.x) (sem associação em casamentos recentes) | confere |
| Sete relatos em seis amostras sustentam o efeito do momento | lista do blog de Stanley, hoje oito estudos em sete amostras, quase todos da mesma equipe; Manning & Cohen 2012 acharam o efeito só nas mulheres | confere como contagem |
| Taxas "similarly high in all industrialized nations" | no sul e em partes do leste da Europa morar junto antes de casar segue raro (Itália, cerca de 15% dos primeiros casamentos numa amostra) | exagera |

Estudos pagos: [#218](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/218) (Kline), [#219](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/219) (Stanley 2006), [#220](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/220) (Lichter, Turner & Sassler), [#221](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/221) (Lichter & Qian), [#222](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/222) (Thornton), [#223](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/223) (Axinn & Barber), [#224](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/224) (Smock & Greenland), [#225](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/225) (Lindsay), [#226](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/226) (Manning & Smock), [#227](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/227) (Stanley 2011). Fichas a fazer: [#244](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/244) a [#249](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/249).

---

## 9. The Conversation Brasil: Como um casal se separa? Anatomia matemática de uma queda (removida)

**Decisão: sai.** O texto de José-Manuel Rey e Jorge Herrera de la Cruz tem uma premissa no centro: a satisfação cai na maioria das relações até que "o rompimento é uma questão de tempo". Os dados de casais reais desmentem isso. Na [Ficha de Lavner 2012](../studies/lavner-2012-mudanca-ou-diferencas.md), a maioria dos recém-casados seguiu satisfeita e estável nos quatro primeiros anos (58% dos maridos, 69% das esposas). Nos EUA, 52% dos primeiros casamentos das mulheres duram 20 anos (Copen et al. 2012, CDC NHSR 49). O resto do texto relata com fidelidade resultados de simulação de computador, sem dado de casal.

| Afirmação | Estudo | Veredito | Acesso | Retratação |
|---|---|---|---|---|
| Os dados do OWID mostram fracasso alto no casamento "em todo o mundo", em alta desde o último terço do século 20 | OWID, Leitura 10 | exagera: o OWID diz que as taxas subiram dos anos 1970 aos 1990 e depois variaram; na Inglaterra, o divórcio em cinco anos caiu à metade desde o pico | ✅ | não se aplica |
| Em alguns grupos ocidentais, metade dos casamentos acaba em 25 anos | JSTOR 30033716 | não conferível: o link passa pelo proxy da biblioteca da Complutense | ⬜ | não identificado |
| A maioria das relações cai até o rompimento | [Eastwick, Finkel & Simpson 2019](https://doi.org/10.1080/1047840X.2019.1577072) | exagera: é artigo de teoria; o artigo dos próprios autores diz que o declínio de longo prazo "is a matter of debate" | 🟡 | nenhuma |
| Manter a relação exige esforço, a "segunda lei da termodinâmica" atribuída a Gottman | [Rey 2010](https://doi.org/10.1371/journal.pone.0009881) | confere como atribuição; no modelo é premissa, não resultado | ✅ | nenhuma |
| A análise do modelo "confirma a teoria do tudo ou nada" | texto de divulgação de Rey (link fora do ar) | exagera: um modelo matemático não confirma uma teoria empírica | ⬜ | não se aplica |
| Quem rende mais precisa se esforçar mais, e num choque a diferença cresce | [Herrera de la Cruz & Rey 2021](https://doi.org/10.1371/journal.pone.0260529) e [2023](https://doi.org/10.1002/mma.9292) | confere como resultado de simulação | ✅ / 🟡 | nenhuma |

Afirmações sem fonte: metade dos casamentos acabando em 25 anos em alguns grupos confere com Copen 2012 (37% das mulheres negras chegam a 20 anos). "Casais homogâmicos são mais estáveis" é plausível e não foi conferido a fundo. O Oscar de roteiro original de *Anatomia de uma queda* confere.

Não abrimos issue de estudo pago para esta Leitura, porque ela saiu. Copen et al. 2012 virou candidato a Ficha ([#250](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/250)).

---

## 10. Our World in Data: Marriages and Divorces

**Nosso texto.** Descrição: "Gráficos de casamento, divórcio, idade ao casar e filhos fora do casamento em vários países desde meados do século 20, com a fonte de cada número." Sem aviso.

A descrição antiga falava em gráficos de "morar junto" em vários países. O OWID diz que não há esse dado comparável ("Long-run cross-national data on the share of couples cohabiting is not available") e usa os filhos fora do casamento no lugar.

Conferi os números contra os CSVs dos gráficos e as fontes oficiais (sem DOI; retratação não se aplica).

| Afirmação | Veredito | Acesso |
|---|---|---|
| EUA: 12 casamentos por mil em 1920, pico de 16,4 em 1946 | confere | ✅ |
| Taxa de casamento dos EUA no "lowest point in recorded history" | exagera pouco: o mínimo foi 2020 (5,1); o último dado, 2022, é 6,2 | ✅ |
| Inglaterra e País de Gales, casados até os 30: nascidos em 1940, mais de 90% das mulheres e 83% dos homens; em 1990, cerca de 29% e 20% | confere | ✅ |
| Mulheres casadas ou em união no mundo: 69% (1970) para 63% (2024) | confere | ✅ |
| EUA, 18 a 24 anos morando com parceiro sem casar: 0,1% (1968) para 9,4% (2018) | confere | ✅ |
| Filhos fora do casamento: menos de 10% na maioria da OCDE em 1970, mais de 30% em 2020; "the exception is Japan" | confere, mas o Japão não é a única exceção (Coreia do Sul 2,5%, Turquia 2,8%, Israel 7,8%) | ✅ |
| Divórcio mais que triplicou no Reino Unido, Noruega e Coreia do Sul dos anos 1970 aos 1990 | confere quase todo (a Noruega multiplicou por 2,8) | ✅ |
| Inglaterra e País de Gales: divórcio antes de 5, 10 e 20 anos, 1,5/7,8/19% (1963) e 11/24/38% (meados dos anos 1990) | confere | ✅ |
| Divórcio em 10 anos mais que dobrou entre os casamentos de 1965 e 1995 | confere (9,9% x 24,7%) | ✅ |
| ONU: divorciados ou separados de 35 a 39 anos, de 2% para 4% | não conferível (link quebrado) | ⬜ |
| Mudanças no divórcio refletem expectativas novas com a entrada das mulheres no trabalho ([Stevenson & Wolfers 2007](https://doi.org/10.1257/jep.21.2.27)) | confere no resumo (retratação: nenhuma) | 🟡 |
| Atitudes sobre homossexualidade abriram caminho às leis ([Adamczyk & Liao 2019](https://doi.org/10.1146/annurev-soc-073018-022332)); recasamento era comum no passado (Van Poppel 1998) | não conferido (lateral, fora do nosso assunto; retratação: nenhuma) | ⬜ |

Afirmações sem fonte: Dinamarca com uniões registradas em 1989 e a lei holandesa do casamento gay de dezembro de 2000 conferem. Um erro de digitação ("In the 1930s marriages became again more common", onde seria 1940s) não muda nada.

Estudos pagos: nenhum central. Fichas a fazer: nenhuma issue aberta.

---

## 11. IFS: Counterintuitive Trends in the Link Between Premarital Sex and Marital Stability

**Nosso texto.** Descrição: "Com dados do governo dos EUA, Wolfinger compara a chance de divórcio em cinco anos pelo número de parceiros que a mulher teve antes de casar." Aviso do site: "O Institute for Family Studies defende o casamento." Ressalva: "Nos casamentos dos anos 1980, ter tido um parceiro antes não mudou de forma significativa a chance de divórcio."

O post é a Ficha [Wolfinger 2016](../studies/wolfinger-2016-parceiros-pre-maritais-coortes.md). A biografia cita o livro *Soul Mates* (Oxford), um livro acadêmico numa linha padrão de biografia, então não há aviso comercial.

| Afirmação | Estudo | Veredito | Acesso | Retratação |
|---|---|---|---|---|
| Vários parceiros antes do casamento "could lead to less happy marriages" | [Rhoades & Stanley 2014](../studies/rhoades-2014-before-i-do.md) | confere, mas só para mulheres e sem prova de causa | ✅ | sem DOI |
| Pesquisas anteriores acharam que sexo antes do casamento "often" aumentava o divórcio | [Teachman 2003](https://doi.org/10.1111/j.1741-3737.2003.00444.x) | confere; Teachman acha que sexo só com o futuro marido não aumenta o risco, o que contrasta com o resultado do post para um parceiro | 🟡 | nenhuma |
| A transmissão do divórcio de pais para filhos enfraqueceu conforme o divórcio ficou comum | [Wolfinger 2005](https://doi.org/10.1017/cbo9780511499616) | confere | 🟡 | nenhuma |
| Homens lembram a própria história conjugal pior que mulheres | [Mitchell 2010](https://doi.org/10.1111/j.1741-3737.2010.00737.x) | confere | ✅ | nenhuma |
| Os americanos passaram a aceitar mais o sexo fora do casamento; a maioria acha OK | [Twenge, Sherman & Wells 2015](https://doi.org/10.1007/s10508-015-0540-2) | confere (58% "not wrong at all" em 2012) | 🟡 | nenhuma |
| Quem vai à igreja com frequência se divorcia menos | [Wilcox & Wolfinger 2016](https://doi.org/10.1093/acprof:oso/9780195394221.001.0001) | não conferível (livro sem resumo) | ⬜ | nenhuma |
| Casar já com filho tem "profound negative effect" na felicidade do casamento | Rhoades & Stanley 2014 | exagera: só entre mulheres, correlacional (25% x 43% no topo de qualidade) | ✅ | sem DOI |
| Casamentos depois de um filho fora do casamento se divorciam mais | provavelmente Wu & Wolfe (orgs.) 2001, *Out of Wedlock* | não conferível (livro, sem página) | ⬜ | sem DOI |
| Abuso sexual na infância vem com histórico sexual mais extenso | [Browning & Laumann 1997](https://doi.org/10.2307/2657425) | confere | 🟡 | nenhuma |
| Abuso na infância aumenta a chance de casamento problemático | [Nguyen, Karney & Bradbury 2017](https://doi.org/10.1037/fam0000208) | confere | ✅ | nenhuma |

Afirmações dos dados do próprio post (NSFG, conferidas nas tabelas):

| Afirmação | Veredito |
|---|---|
| A maioria tem três ou mais parceiros antes de casar | confere só para mulheres (55% nos anos 2000, 61% nos 2010) |
| Um parceiro só: de 43% para 21%; até um parceiro, dois terços (1970) e pouco mais da metade (1980); 5% virgens (2010); 10 ou mais parceiros 2% → 14% → 18% | confere |
| As duas tendências mudaram pouco depois dos anos 2000 | exagera para as virgens (12% → 5%, N = 273); o grupo de um parceiro ficou estável |
| Nas três décadas, quem teve um parceiro tem a segunda menor taxa de divórcio | errado para os anos 1980 (um parceiro 20%, dez ou mais 18%) |
| Um parceiro antes "substantially increases" o divórcio | exagera para os anos 1980 (razão de risco 1,19, não significativa); confere para 1990 (1,75) e 2000 (2,54) (é a Ressalva) |
| Divórcio das virgens 11% → 8% → 6%; os controles explicam no máximo um quarto | confere |
| Divorciadas vão quase 25% menos à igreja | não conferível (conta própria, sem tabela) |

Estudos pagos: [#228](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/228) (Wu & Wolfe), [#229](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/229) (Wilcox & Wolfinger), [#230](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/230) (Teachman). Fichas a fazer: [#251](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/251) (Teachman).

---

## 12. IFS: Testing Common Theories on the Relationship Between Premarital Sex and Marital Stability

**Nosso texto.** Descrição: "Smith e Wolfinger testam as explicações comuns para a ligação entre sexo antes do casamento e divórcio, e nenhuma das que eles mediram dá conta dela." Aviso do site: "O Institute for Family Studies defende o casamento." Ressalva: "O estudo de Wolfinger e Perry achou só associação entre o número de parceiros e casar, e só no curto prazo, não efeito causal."

A descrição antiga dizia "nenhuma dá conta dela". Os autores só descartam o que mediram. O post resume a Ficha [Smith & Wolfinger 2024](../studies/smith-2024-sexo-pre-marital-divorcio.md).

| Afirmação | Estudo | Veredito | Acesso | Retratação |
|---|---|---|---|---|
| Terman mostrou primeiro que sexo antes do casamento se liga fortemente à instabilidade, e mais parceiros a mais divórcio | Terman 1938, *Psychological Factors in Marital Happiness* | provavelmente exagera: o livro mediu felicidade e ajuste de casados, não divórcio; espera a [#231](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/231) | ⬜ | sem DOI |
| Kahn & London usaram o NSFG e mostraram que a seleção podia explicar a ligação; só virgens x não virgens, só mulheres brancas | [Kahn & London 1991](https://doi.org/10.2307/352992) | confere | 🟡 | nenhuma |
| Sem controles, 161% mais chance de divórcio; com todos, 151%; "twofold to threefold" | [Smith & Wolfinger 2024](https://doi.org/10.1177/0192513X231155673) | confere (2,61 → 2,52) | ✅ | nenhuma |
| Nenhum dos mecanismos testados explica a ligação; a seleção não foi descartada | idem | confere | ✅ | nenhuma |
| De 1 a 8 parceiros, "only by 50 percent", e os resultados "unaffected" pelos controles | idem | subestima pouco: 1,50 sem controles, 1,64 no modelo completo; com 9 ou mais, o efeito cresce com os controles (2,65 → 3,20) | ✅ | nenhuma |
| 9 ou mais parceiros dão mais divórcio; é mais comum que casar virgem, mas minoria | idem | confere (19% x 16%) | ✅ | nenhuma |
| Sem diferença entre homens e mulheres | idem | confere | ✅ | nenhuma |
| Quem casou depois da onda III casou depois dos 25 | idem | exagera pouco (a onda III foi de 18 a 26 anos) | ✅ | nenhuma |
| Wolfinger & Perry mostraram que os parceiros "have a causal impact on marriage rates", só os recentes | [Wolfinger & Perry 2023](../studies/wolfinger-2023-parceiros-sexuais-casamento.md) | exagera: o instrumento (idade da menarca) é fraco, só mulheres, e o artigo conclui "associated with lower odds of marriage, but only in the short term" (é a Ressalva) | ✅ | nenhuma |

Afirmações sem fonte:

| Afirmação | O que achei | Veredito |
|---|---|---|
| O homem mediano teve cinco parceiras na vida, a mulher mediana três | posts de Wolfinger com o GSS; no NSFG 2015-2019 ([NCHS 2021](../studies/nchs-2021-nsfg-parceiros-na-vida.md)) a mediana é 6,3 para homens e 4,3 para mulheres | confere para o GSS |
| Poucos americanos casam virgens | Wolfinger 2016: 5% nos anos 2010 | confere |

A biografia cita um livro acadêmico que vai sair, sem link, então não há aviso comercial.

Estudos pagos: [#231](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/231) (Terman), [#232](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/232) (Kahn & London). Fichas a fazer: [#252](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/252) (Kahn & London).

---

## Estudos pagos

Uma issue `ready-for-human` por estudo, com o que conferir no texto completo.

| Leitura | Estudo | Issue |
|---|---|---|
| 2 | Timmermans & De Caluwé 2017 | [#208](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/208) |
| 2 | Ciocca et al. 2020 | [#209](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/209) |
| 2 | Shapiro et al. 2017 | [#210](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/210) |
| 2 | Timmermans & Courtois 2018 | [#211](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/211) |
| 2 | Sharabi, Ou, Von Feldt & Parsons 2026 | [#212](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/212) |
| 3 | Heino, Ellison & Gibbs 2010 | [#213](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/213) |
| 3 | Sharabi, Von Feldt & Ha 2024 (burnout) | [#149](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/149) |
| 4 | Zentner 2005 | [#214](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/214) |
| 5 | Montoya, Horton & Kirchner 2008 | [#126](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/126) |
| 5 | From et al. 2025 | [#216](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/216) |
| 5 | Joel, Eastwick & Finkel 2017 | [#217](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/217) |
| 8 | Kline et al. 2004 | [#218](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/218) |
| 8 | Stanley, Rhoades & Markman 2006 | [#219](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/219) |
| 8 | Lichter, Turner & Sassler 2010 | [#220](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/220) |
| 8 | Lichter & Qian 2008 | [#221](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/221) |
| 8 | Thornton & Young-DeMarco 2001 | [#222](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/222) |
| 8 | Axinn & Barber 1997 | [#223](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/223) |
| 8 | Smock & Greenland 2010 | [#224](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/224) |
| 8 | Lindsay 2000 | [#225](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/225) |
| 8 | Manning & Smock 2005 | [#226](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/226) |
| 8 | Stanley, Rhoades & Fincham 2011 | [#227](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/227) |
| 11 | Wu & Wolfe (orgs.) 2001 | [#228](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/228) |
| 11 | Wilcox & Wolfinger 2016 | [#229](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/229) |
| 11 | Teachman 2003 | [#230](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/230) |
| 12 | Terman 1938 | [#231](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/231) |
| 12 | Kahn & London 1991 | [#232](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/232) |

A [#215](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/215) (Montoya) foi fechada como duplicata da #126. A conferência futura dos links das Leituras está na [#207](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/207).

## Fichas a fazer

Estudos que um Guia usaria, cada um numa issue `acervo`.

| Estudo | Pergunta | Issue |
|---|---|---|
| Büyükeren, Makarin & Xiong 2026 | `apps-fazem-mal` | [#233](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/233) |
| Bowman et al. 2025 | `apps-fazem-mal` | [#234](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/234) |
| Sharabi, Ou, Von Feldt & Parsons 2026 | `apps-fazem-mal` | [#235](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/235) |
| Sharabi, Von Feldt & Ha 2024 (burnout) | `apps-fazem-mal` | [#149](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/149) |
| Erevik et al. 2020 | `vale-a-pena-usar-app` | [#236](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/236) |
| Timmermans & Courtois 2018 | `vale-a-pena-usar-app` | [#237](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/237) |
| Martinez et al. 2025 | `vale-a-pena-usar-app` | [#238](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/238) |
| D'Angelo & Toma 2017 | `ver-perfis-demais` | [#239](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/239) |
| Humberg et al. 2023 | `precisamos-ser-parecidos` | [#240](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/240) |
| From et al. 2025 | `precisamos-ser-parecidos` | [#241](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/241) |
| Zentner 2005 | `precisamos-ser-parecidos` | [#242](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/242) |
| Joel, Eastwick & Finkel 2017 | `o-que-digo-querer-me-atrai` | [#243](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/243) |
| Stanley et al. 2010 | `o-que-preve-o-divorcio` | [#244](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/244) |
| Rhoades, Stanley & Markman 2009 | `o-que-preve-o-divorcio` | [#245](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/245) |
| Manning & Cohen 2012 | `o-que-preve-o-divorcio` | [#246](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/246) |
| Kuperberg 2014 | `o-que-preve-o-divorcio` | [#247](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/247) |
| Rosenfeld & Roesler 2019 | `o-que-preve-o-divorcio` | [#248](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/248) |
| Lichter & Qian 2008 | `o-que-preve-o-divorcio` | [#249](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/249) |
| Copen, Daniels, Vespa & Mosher 2012 | `o-que-preve-o-divorcio` | [#250](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/250) |
| Teachman 2003 | `mais-parceiros-faz-mal` | [#251](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/251) |
| Kahn & London 1991 | `mais-parceiros-faz-mal` | [#252](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/252) |

## Integridade

- Nenhum estudo citado pelas 12 Leituras foi retratado, nem tem manifestação de preocupação.
- [Huang et al. 2017](../studies/huang-2017-perguntas-de-continuidade.md) recebeu uma correção em março de 2025 ([10.1037/pspi0000491](https://doi.org/10.1037/pspi0000491)) depois de uma auditoria independente. Ela corrige "several minor errors in how some results were reported" e diz que "all the conclusions in the paper are valid". A Ficha ainda diz que não há correção. Fica para a [#253](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/253).
- Francesca Gino é coautora de Huang 2017. O artigo não está entre os dela que foram retratados, e o relatório de integridade de 2024 rastreou os dados brutos. A lacuna que ele aponta são os registros do MTurk usados para excluir 5% e 12% das amostras dos estudos 2A e 2B.
- Scott Stanley é um dos 86 coautores de Joel 2020, e a Leitura 4 é ele resumindo o próprio estudo. A descrição diz isso.
- Dan Ariely, coautor de Hitsch, Hortaçsu & Ariely 2010, tem achados de fabricação de dados em outros artigos (o de honestidade na PNAS de 2012, retratado em 2021). Para este artigo não achei retratação, manifestação de preocupação nem discussão no PubPeer, e os dados de replicação estão no openICPSR (112322).
