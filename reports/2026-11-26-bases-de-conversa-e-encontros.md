---
ticket: 938
---

# Bases de conversa e de encontros além do CANDOR

**Data:** 2026-11-26 · **Ticket:** [#938](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/938)
**Status de verificação:** é um catálogo, não uma síntese de resultados. Cada base foi conferida na página oficial, na API do OSF ou do figshare, ou no PDF do artigo. Quando uma informação só apareceu em resultado de busca, a linha diz "não confirmado". Nenhuma base daqui tem Ficha ainda. Uma que vire Ficha passa a ser descrita pela Ficha, e não por este relatório.

A pergunta: que outras bases existem parecidas com o [CANDOR](https://huggingface.co/datasets/betterup/candor-tabular) (1.656 conversas em vídeo entre desconhecidos, transcritas, com quanto cada um gostou do outro)? Quatro buscas em paralelo cobriram conversa entre desconhecidos, speed dating e primeiro encontro, chat de app e de mensageiro, e fala espontânea com prosódia. Só entraram bases em inglês ou português, de qualquer forma de acesso: aberta, com aceite, só para pesquisa, por pedido aos autores ou paga.

## Resposta curta

- **Bases de primeiro encontro romântico com a conversa e o desfecho são poucas e pequenas.** As abertas são três: os encontros por telefone do podcast *Blink Date* (31, com "quer um segundo encontro?"), os do programa *Kings and Kweens* (161, com quem foi escolhido) e o *First Dates* (12, com "deu certo"). As duas primeiras saíram do mesmo projeto no OSF (O'Nell, Sanchez e Finn 2026).
- **Para avaliar um juiz mensagem a mensagem, a melhor base aberta é o Topical-Chat.** São 10,8 mil conversas por texto em que o parceiro deu nota a cada mensagem. O assunto é conversa sobre temas, não paquera.
- **Conversa real de app de namoro com desfecho só existe dentro de empresas e laboratórios.** O caso mais próximo é Huang e Hancock 2021 (mensagens de namoro online e se o encontro aconteceu), que só sai por pedido ao laboratório de Stanford. A base de Zhang e Yasseri 2016 (2 milhões de conversas, desfecho "trocaram telefone") não traz o texto e está presa a contrato de sigilo.
- **O maior primeiro encontro real com desfecho não tem a conversa.** São os 4.542 encontros às cegas da agência Tawkify (Eastwick et al. 2025), só com questionário: houve segundo encontro, atração e nota do encontro.
- **Em português, a novidade é o *Certas Palavras*.** São 70 h de diálogo espontâneo de rádio brasileiro, com transcrição revista por humanos, abertas no Hugging Face. Não existe base aberta em português de conversa a dois por mensagem, nem de primeiro encontro com conversa.
- **Para volume em inglês, sem rótulo de agrado, há o Seamless Interaction** (Meta 2025). São mais de 4.000 h de conversa a dois em vídeo, metade dos pares entre desconhecidos, com estado interno anotado.

## Primeiro encontro e speed dating

| Base | O que tem | Desfecho | Acesso e licença | Nota |
|---|---|---|---|---|
| [Blink Date](https://osf.io/7ju2s/) (O'Nell, Sanchez e Finn 2026), pasta `data/speed-dating/blink-date` | 31 encontros só por telefone, de 11 a 13 min (675 a 804 s), com transcrição profissional do podcast. A pasta tem 24 transcrições para as 31 linhas do CSV. O áudio está no RSS do podcast. | `matched`: os dois disseram sim ou talvez ao segundo encontro (19 sim, 12 não) | Aberto. O OSF não declara licença, e o conteúdo é de terceiros. | 5 |
| [Kings and Kweens](https://osf.io/7ju2s/), mesmo projeto, pasta `kings-and-kweens` | 161 encontros de um programa do YouTube, 3 ou 4 por episódio, com transcrição (srt e txt) e 48 mp3 | `winner`: quem foi escolhido para o segundo encontro | Aberto, sem licença declarada. Programa de TV, com gente atuando para a câmera. | 4 |
| [First Dates Dataset](https://figshare.com/articles/dataset/First_Dates_Dataset/20219411) (Kinch 2022) | 12 encontros do programa do Channel 4, em 1.928 falas transcritas, cada uma com a emoção de quem fala e de quem ouve, entonação (por exemplo, "Flirting") e alvo | `label`: deu certo ou não (4 e 8) | Aberto, CC BY 4.0 no figshare. Os direitos do programa são do Channel 4. | 3 |
| [Encontros às cegas da Tawkify](https://osf.io/rkm2d/?view_only=a0fe91dae0464077af7772e6890a8151) (Eastwick et al. 2025, [PNAS](https://doi.org/10.1073/pnas.2416984122)) | 4.542 primeiros encontros reais, presenciais ou por Zoom, marcados por uma agência; 6.262 pessoas. Só questionário. | Segundo encontro (58% sim), atração, nota do encontro | Aberto pelo link view-only do artigo (`DataAndCode.zip`). Licença dos dados não declarada. | 3 |
| [Speed dating da University of Queensland](https://github.com/amyzhao11/statedvsrevealedpref) (Zhao et al. 2024) | 1.145 pessoas, 171 sessões de 3 min, 3.899 avaliações. O áudio de 350 pessoas foi gravado, mas não foi publicado. | Notas dadas ao parceiro. O CSV não traz sim ou não. | Aberto no GitHub, sem licença declarada | 2 |
| [MatchNMingle](https://matchmakers.ewi.tudelft.nl/matchnmingle/pmwiki/) (TU Delft) | 92 pessoas em speed dating e numa festa, com vídeo de cima, acelerômetro e áudio ambiente. Sem transcrição. | Interesse e match do speed dating | EULA só para pesquisa, enviado a h.hung@tudelft.nl. O site deu timeout. | 2 |
| [Replicação de Eastwick e Finkel 2008](https://osf.io/ng6cc) (Maryland, Reproducibility Project) | 307 universitários, speed dating e 30 dias de diário. O curador chama os dados de "bagunçados". | Quer sair de novo, desejo, interesse | Aberto, sem licença declarada | 2 |
| [Encontro às cegas com fisiologia](https://doi.org/10.34894/RFUGGD) (Prochazkova et al. 2022) | Rastreamento ocular, frequência cardíaca e condutância da pele durante o encontro | Quer ver de novo | Dados restritos, por pedido no DataverseNL. O idioma (holandês?) não foi confirmado. | 2 |
| ["I'ts a date"](https://repositorio.ufrn.br/jspui/handle/123456789/29463) (UFRN, dissertação de 2020) | Speed dating com universitários brasileiros, 175 voluntários entre questionário e encontros | Cartão de escolha | Só o texto é aberto. Os dados só por pedido à autora ou à orientadora. | 1,5 |
| Speed dating comercial do Reino Unido (Belot e Francesconi 2013) | Milhares de eventos, só as escolhas | Escolhas | Acordo com a agência; só por pedido aos autores | 1 |

O *I'ts a date* é a única base brasileira de speed dating encontrada. Uma revisão de 2023 (Cassepp-Borges, [doi 10.36482/arbp.v75i1.20693](https://doi.org/10.36482/arbp.v75i1.20693)) diz que não havia speed dating publicado em português.

## Conversa entre desconhecidos

| Base | O que tem | Desfecho | Acesso e licença | Nota |
|---|---|---|---|---|
| [Topical-Chat](https://github.com/alexa/Topical-Chat) (Amazon, Gopalakrishnan et al. 2019) | 10.784 conversas por texto entre pares de trabalhadores do Mechanical Turk. Que fossem desconhecidos é inferido do pareamento; o README não diz. | Nota do parceiro a cada mensagem e nota final de cada um à conversa | Aberto, CDLA-Sharing 1.0, que permite uso comercial. Montar os textos de leitura pede uma credencial da API do Reddit. | 4 |
| [Seamless Interaction](https://huggingface.co/datasets/facebook/seamless-interaction) (Meta 2025, [arXiv 2506.22554](https://arxiv.org/abs/2506.22554)) | Mais de 4.000 h e cerca de 65 mil conversas a dois em vídeo, com transcrição alinhada. Na parte naturalista, 1.820 participantes desconhecidos e 2.231 conhecidos (`relationships.csv`). Cerca de 27 TB. | Estado interno relatado (751 anotações) e anotação de terceiros; Big Five de metade. Sem "gostou do outro". | Aberto, CC BY-NC 4.0 | 3 |
| [PERSONA-CHAT e ConvAI2](https://github.com/facebookresearch/ParlAI/tree/main/parlai/tasks/convai2) (Zhang et al. 2018) | Cerca de 10,9 mil diálogos por texto em que dois desconhecidos se conhecem a partir de personas inventadas. O Multi-Session Chat (Xu et al. 2022) continua cerca de 5 mil deles por mais sessões. | Nenhum entre pessoas. Só as conversas com bot do ConvAI2 têm nota de agrado. | Aberto pelo ParlAI. Licença do PERSONA-CHAT não confirmada. | 3 |
| [REALTALK](https://github.com/danny911kr/REALTALK) (Lee et al. 2025) | 10 conversas reais por app de mensagem ao longo de 21 dias, com 50 mensagens ou mais por dia. Não confirmado se eram desconhecidos. | Nenhum (só empatia anotada por modelo) | Aberto, Apache-2.0 | 3 |
| [MULTISIMO](https://www.scss.tcd.ie/clg/MULTISIMO/) (Trinity College Dublin) | 23 sessões de 10 min de um quiz em trio (dois jogadores e um facilitador), quase sempre entre desconhecidos, com vídeo e transcrição | Questionário de experiência e personalidade | Liberação para pesquisa prometida no artigo; os termos atuais não foram confirmados | 2 |
| [NoXi](https://multimediate-challenge.org/datasets/Dataset_NoXi/) (Cafaro et al. 2017) | Díades de especialista e novato por tela, mais de 25 h, de desconhecidos a cônjuges | Engajamento e interesse contínuos, dados por anotadores | EULA só não comercial, por pedido | 2 |
| [HCRC Map Task](https://groups.inf.ed.ac.uk/maptask/) | 128 diálogos de tarefa, cada pessoa uma vez com conhecido e uma vez com desconhecido | Só conhecido ou desconhecido | Anotações em CC BY 4.0. Licença do áudio não confirmada. | 2 |
| [friend-bench](https://huggingface.co/datasets/fluid-concepts/friend-bench) | 96 trechos de quebra-gelo em vídeo, 42 entre desconhecidos | Só conhecido ou desconhecido | Aberto, CC BY-NC 4.0 | 2 |
| [UDIVA v0.5](https://chalearnlap.cvc.uab.cat/dataset/41/description/) | 145 sessões a dois, 43% entre conhecidos, só 8,5% em inglês | Personalidade | Licença para quem tem cargo em universidade ou instituto | 1 |
| [Mixer 6](https://catalog.ldc.upenn.edu/LDC2013S03) (LDC) | 4.410 ligações de até 10 min, no formato do Fisher | Nenhum | Só para membros do LDC | 1 |

O projeto do *Blink Date* no OSF traz ainda 100 diálogos escritos pelo Claude, "bons" e "ruins", com a nota de agrado dada por leitores no Prolific. Não é conversa real, mas é um teste pronto para um juiz.

## Chat de app de namoro e de mensageiro

| Base | O que tem | Desfecho | Acesso e licença | Nota |
|---|---|---|---|---|
| Huang e Hancock 2021, *Will You Go on a Date with Me?* ([doi](https://doi.org/10.1177/0261927X211066612)) | Mensagens reais de namoro online, em dois estudos. Tamanho e app não confirmados. | O primeiro encontro aconteceu. Os achados se agrupam em investimento, interdependência, dinâmica emocional, decisão e coordenação. | Não diz se o dado é compartilhado. Só por pedido ao Stanford Social Media Lab. | 4 |
| Zhang e Yasseri 2016 ([arXiv 1607.03320](https://arxiv.org/abs/1607.03320)) | Cerca de 2 milhões de conversas e 19 milhões de mensagens de um app não nomeado, **sem o texto**: tamanho, "?" e "!", tempo desde o match | Trocaram telefone (19% das conversas, em média na 27ª mensagem) | Contrato de sigilo com a empresa; sem caminho público | 3 |
| [NUS ABC Codemixed Corpus](https://arxiv.org/abs/2506.00332) (Jaidka et al. 2026) | 477 conversas doadas de WhatsApp e Telegram, com 356 mil mensagens, incluindo conversas com parceiros românticos | Tipo de relação e intimidade autodeclarada | Licença contraditória no artigo (só pesquisa e CC BY 4.0). O DOI citado leva a outra base; pedir o link certo a Kokil Jaidka (NUS). | 3 |
| Bruch e Newman 2018 ([doi](https://doi.org/10.1126/sciadv.aap9815)) | Primeiras mensagens e respostas num site de namoro de quatro cidades dos EUA, durante um mês | Recebeu resposta | Dado da empresa, sem declaração de disponibilidade | 2 |
| [CoSEM](https://github.com/wdwgonzales/CoSEM) (Gonzales et al. 2023) | 6,9 milhões de tokens de WhatsApp doado por alunos de Singapura | Nenhum | Aberto, CC BY-NC-SA 4.0 (o espelho no Hugging Face diz CC0; vale o GitHub) | 2,5 |
| [NUS SMS Corpus](https://github.com/kite1988/nus-sms-corpus) (Chen e Kan 2013) | 55.835 SMS em inglês, doados | Nenhum | Aberto; licença não confirmada | 2 |
| [NPS Chat](https://www.nltk.org/nltk_data/) (Forsyth e Martell 2007) | 10.567 posts de 2006 em salas de bate-papo, com muita cantada | Ato de fala de cada post (aceitar, rejeitar, cumprimentar, perguntar) | Aberto no NLTK, só para pesquisa não comercial | 2 |
| [SAMSum](https://huggingface.co/datasets/knkarthick/samsum) (Gliwa et al. 2019) | 16.369 conversas de mensageiro **escritas por linguistas** | Só um resumo | Aberto, CC BY-NC-ND 4.0 | 1,5 |
| [COVID19.BR](https://zenodo.org/records/5193932) (Martins et al. 2021) | Mensagens de grupos públicos de WhatsApp brasileiros sobre COVID | Desinformação | Aberto, CC BY 4.0. Tem uma coluna de telefone. | 1 |
| [Dona](https://zenodo.org/records/12570525) | Metadados de 85 doações de WhatsApp e Facebook, sem texto | Questionário | EULA, com vínculo acadêmico | 1 |

A base `quip-dataset` do Hugging Face tem 682 exemplos de contexto, resposta e "por que funciona", no mesmo formato de um juiz de mensagens. Ficou fora da tabela porque a origem não é declarada e pode ter sido gerada por modelo.

## Fala espontânea com prosódia

| Base | O que tem | Rótulo | Acesso e licença | Nota |
|---|---|---|---|---|
| [Certas Palavras](https://huggingface.co/datasets/nilc-nlp/certas_palavras) (NILC, Araújo et al. 2026, [PROPOR](https://aclanthology.org/2026.propor-1.81)) | 70 h de diálogo de um programa de rádio dos anos 1980 e 1990, 190 falantes, transcrição revista por humanos e com tempo. As regras de transcrição marcam hesitação, sons expressivos e sobreposição. Não confirmado como o riso aparece nos dados. | Nenhum | Aberto. O artigo diz CC BY-NC 4.0; a página não mostra licença. | 4 |
| [MSP-Podcast](https://arxiv.org/abs/2509.09791) (Busso et al. 2025) | Mais de 400 h de trechos de podcast, mais de 3.600 falantes, emoção dada por 5 anotadores ou mais | Emoção, valência, ativação | Licença acadêmica assinada pela instituição; comercial de US$ 10.000 no primeiro ano | 3 |
| [Columbia Games Corpus](https://catalog.ldc.upenn.edu/LDC2021S02) (LDC2021S02) | 12 sessões de jogo a dois, cerca de 10 h, com entonação (ToBI), riso e a função de "okay", "yeah" e "right" (concordar, backchannel, segurar o turno) | Nenhum no pacote | Pago no LDC; preço só com login | 3 |
| [NURC-RJ](https://nurcrj.letras.ufrj.br/) | Inquéritos cariocas dos anos 1970 e 1990, entre eles o D2 (dois informantes conversando). Algumas amostras têm MP3 e transcrição no site. | Nenhum | As amostras são abertas; o acervo inteiro, só por pedido. Licença não confirmada. | 3 |
| [IEMOCAP](https://sail.usc.edu/iemocap/) (Busso et al. 2008) | 12 h de atores em pares, com improviso e roteiro | Emoção | Formulário só com e-mail institucional | 2 |
| [SEMAINE](https://semaine-db.eu) | Cerca de 240 conversas com um operador que faz papel de agente | Emoção contínua, riso, engajamento | EULA só para pesquisa, enviado por e-mail | 2 |
| [Expresso](https://speechbot.github.io/expresso/) (Meta 2023) | 40 h de 4 atores, com diálogos improvisados em 26 estilos (riso, sussurro) | Estilo | Aberto, CC BY-NC 4.0 | 2 |
| [Santa Barbara Corpus](https://www.linguistics.ucsb.edu/research/santa-barbara-corpus-spoken-american-english) (SBCSAE) | 60 gravações de conversa cotidiana (casais, amigos, família), 249 mil palavras, com transcrição por unidade de entonação | Nenhum | Aberto, CC BY-ND 3.0 US | 2 |
| [NXT Switchboard](https://catalog.ldc.upenn.edu/LDC2009T26) (LDC2009T26) | Prosódia, acento e dialog acts sobre parte do Switchboard. O áudio é vendido à parte. | Nenhum | Pago no LDC | 2 |
| [ICSI Meeting Corpus](https://groups.inf.ed.ac.uk/ami/icsi/) | 75 reuniões, cerca de 72 h, e uns 13 mil episódios de riso transcritos | Nenhum | Aberto em Edimburgo, CC BY 4.0 | 2 |
| [CALLHOME American English](https://catalog.ldc.upenn.edu/LDC97S42) | 120 telefonemas entre parentes e amigos, 56 h; a transcrição é vendida à parte | Nenhum | Pago no LDC | 2 |
| [MSP-IMPROV](https://ecs.utdallas.edu/research/researchlabs/msp-lab/MSP-Improv.html) | Improviso a dois, com emoção | Emoção | Licença acadêmica; comercial de US$ 8.000 | 1 |

Duas que existem mas não entraram: o [Spotify Podcast Dataset](https://podcastsdataset.byspotify.com/), que tinha parte em português e não aceita pedidos desde dezembro de 2023, e a [conversa em PT-BR da SpeechDataAI](https://huggingface.co/datasets/SpeechDataAI/brazilian-portuguese-conversational-speech) (2.000 h de diálogo a dois), que é comercial, a US$ 65 por hora, com amostra grátis por pedido.

## Já no acervo

Estas bases apareceram de novo e já têm Ficha:

| Base | Ficha |
|---|---|
| Fisher English | [cieri-2004-fisher-telefonemas](../studies/cieri-2004-fisher-telefonemas.md) |
| SpeedDate de Stanford | [ranganath-2013-flerte-fala](../studies/ranganath-2013-flerte-fala.md) |
| Northwestern Speed-Dating | [eastwick-2008-preferencias-speed-dating](../studies/eastwick-2008-preferencias-speed-dating.md) |
| Date me for Science (Münster) | [humberg-2023-similaridade-atracao](../studies/humberg-2023-similaridade-atracao.md) |
| Speed dating de Oldenburg | [michalsky-2017-convergencia-tom-de-voz](../studies/michalsky-2017-convergencia-tom-de-voz.md) |
| HurryDate | [kurzban-2005-hurrydate](../studies/kurzban-2005-hurrydate.md) |
| Chats de perguntas e simpatia (Huang et al. 2017) | [huang-2017-perguntas-de-continuidade](../studies/huang-2017-perguntas-de-continuidade.md) |
| NOMCO | [paggio-2016-nomco-primeiros-encontros](../studies/paggio-2016-nomco-primeiros-encontros.md) |
| First Encounter finlandês e estoniano | [jokinen-2016-first-encounter](../studies/jokinen-2016-first-encounter.md) |
| Conversa cotidiana do NIKL | [kwak-2022-conversa-cotidiana-coreana](../studies/kwak-2022-conversa-cotidiana-coreana.md) |
| CORAA | [candido-2022-coraa-fala-espontanea](../studies/candido-2022-coraa-fala-espontanea.md) |
| C-ORAL-BRASIL I | [raso-2012-c-oral-brasil](../studies/raso-2012-c-oral-brasil.md) |
| SP2010 | [mendes-2012-sp2010-fala-paulistana](../studies/mendes-2012-sp2010-fala-paulistana.md) |
| NURC-SP | [lima-2024-nurc-sp-fala-espontanea](../studies/lima-2024-nurc-sp-fala-espontanea.md) |

O CANDOR ainda não tem Ficha. O acesso é por pedido aprovado à mão pela BetterUp no Hugging Face.

## Como pedir acesso

Para as bases abertas, basta baixar no link da tabela. Para as que pedem aprovação, o texto abaixo serve de base, trocando o nome da base e o uso. Quem pede sem vínculo acadêmico deve contar com recusa no IEMOCAP, no MSP-Podcast, no MSP-IMPROV, na UDIVA e no Dona, que exigem instituição.

> Hello, I am an independent researcher studying how first conversations between strangers lead to liking and to a second meeting. I would like access to [base] for non-commercial research only. I will not redistribute the data, will not try to identify participants, and will only publish aggregate counts with a citation to [artigo]. Could you tell me how to request it?

Os contatos são estes:

- **Huang e Hancock 2021:** Stanford Social Media Lab (Jeff Hancock). Pedir o dado anonimizado ou as variáveis do Estudo 2.
- **NUS ABC Codemixed Corpus:** Kokil Jaidka (NUS). Pedir o link certo, já que o DOI do artigo leva a outra base.
- **MatchNMingle:** EULA assinado para h.hung@tudelft.nl.
- **SEMAINE:** o EULA de semaine-db.eu vai em PDF para eula@semaine-db.eu, e depois é preciso se cadastrar no site.
- **NoXi:** EULA da página do MultiMediate.
- **Encontro às cegas com fisiologia:** botão de acesso no DataverseNL, ou Mariska Kret (Leiden).
- **I'ts a date (UFRN):** a autora ou a orientadora (Fívia de Araújo Lopes), pelo programa de Psicobiologia.
- **LDC** (Columbia Games, NXT Switchboard, CALLHOME, Mixer 6): conta no catálogo. O preço para não membro só aparece com login.

## Limites

- A busca foi feita por quatro agentes num só dia. Base que não aparece em busca na web, no OSF, no Hugging Face, no figshare ou no LDC ficou de fora.
- Tamanho e licença foram conferidos na página de cada base, mas nenhuma foi baixada inteira. Os números de Blink Date, Kings and Kweens e First Dates foram contados nos CSVs. Os das outras são os que a página declara.
- Várias bases abertas não declaram licença (Blink Date, Kings and Kweens, Tawkify, Queensland). Sem licença, o uso para além de ler e contar fica em aberto.
- As bases de programa de TV (Kings and Kweens, First Dates) são editadas e com gente atuando para a câmera. Servem de exemplo, não de taxa.
