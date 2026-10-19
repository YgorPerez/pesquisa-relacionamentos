# Base legal LGPD para registrar o estado do link em log e analytics

**Data:** 2026-10-18 · **Ticket:** [#18](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/18) · **Contexto:** [#14](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/14), [ADR 0001](../docs/adr/0001-estado-completo-na-query.md)
**Status de verificação:** ✅ para a LGPD, o Marco Civil e as resoluções CD/ANPD 2/2022, 15/2024 e 19/2024: texto conferido no Planalto e no DOU. ✅ para os guias da ANPD citados (cookies, legítimo interesse, segurança para pequeno porte, agentes de tratamento) e o estudo técnico de anonimização: conferido no PDF do gov.br. 🟡 para a Resolução 32/2026 (adequação da UE): conferida só na versão oficial em inglês. Não procurei de forma exaustiva decisões sancionadoras da ANPD; não achei nenhuma sobre dado sensível inferido ou sobre logs.

Este texto não é parecer jurídico. Separo o que está escrito (citação literal com localizador, em bloco de citação) do que eu concluo a partir disso (marcado como **Minha leitura**).

## Resposta curta

- O desenho atual não se sustenta. O art. 11 não tem hipótese que cubra guardar Perfil na URL do log e mandar a query ao analytics. Legítimo interesse não existe para dado sensível. Aviso com opt-out não é consentimento, e muito menos "específico e destacado".
- Mesmo um consentimento opt-in bem feito não resolve o log do proxy: a primeira requisição de quem abre um link recebido chega ao servidor antes de qualquer escolha. Só tirar a query do log resolve essa parte.
- A menor mudança que deixa o tratamento regular: (1) o log do servidor e do app grava só o caminho, sem query; (2) o analytics nunca recebe o par gênero próprio + gênero procurado nem a query crua, só contadores agregados ou campos não sensíveis; (3) se o analytics for de terceiro fora do Brasil e da UE, a transferência precisa de mecanismo do art. 33 (na prática, as cláusulas-padrão da Resolução 19/2024). Com isso o analytics de audiência pode se apoiar em legítimo interesse (art. 7º, IX), como o guia de cookies admite.
- Um registro sem IP e sem cookie ainda pode ser dado pessoal. A query de um link é a mesma string que circula num post público com o nome de quem compartilhou, e isso permite ligar o registro à pessoa. Só agregados sem linha por evento ficam com cara de dado anonimizado (art. 12).

## 1. Hipótese do art. 11 e o opt-out

### O que a lei diz

> "Art. 11. O tratamento de dados pessoais sensíveis somente poderá ocorrer nas seguintes hipóteses: I - quando o titular ou seu responsável legal consentir, de forma específica e destacada, para finalidades específicas; II - sem fornecimento de consentimento do titular, nas hipóteses em que for indispensável para: a) cumprimento de obrigação legal ou regulatória pelo controlador; [...] d) exercício regular de direitos [...]; e) proteção da vida ou da incolumidade física [...]; f) tutela da saúde [...]; g) garantia da prevenção à fraude e à segurança do titular, nos processos de identificação e autenticação de cadastro em sistemas eletrônicos [...]."
> ([Lei 13.709/2018, art. 11, I e II](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

> "XII - consentimento: manifestação livre, informada e inequívoca pela qual o titular concorda com o tratamento de seus dados pessoais para uma finalidade determinada"
> ([art. 5º, XII](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

> "§ 2º Cabe ao controlador o ônus da prova de que o consentimento foi obtido em conformidade com o disposto nesta Lei." "§ 4º O consentimento deverá referir-se a finalidades determinadas, e as autorizações genéricas para o tratamento de dados pessoais serão nulas."
> ([art. 8º, §§ 2º e 4º](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

O legítimo interesse está só no art. 7º:

> "IX - quando necessário para atender aos interesses legítimos do controlador ou de terceiro, exceto no caso de prevalecerem direitos e liberdades fundamentais do titular que exijam a proteção dos dados pessoais"
> ([art. 7º, IX](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

A obrigação legal de guardar registros, no Marco Civil, cobre só data, hora e IP:

> "VIII - registros de acesso a aplicações de internet: o conjunto de informações referentes à data e hora de uso de uma determinada aplicação de internet a partir de um determinado endereço IP."
> ([Lei 12.965/2014, art. 5º, VIII](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm))

> "Art. 15. O provedor de aplicações de internet constituído na forma de pessoa jurídica e que exerça essa atividade de forma organizada, profissionalmente e com fins econômicos deverá manter os respectivos registros de acesso a aplicações de internet, sob sigilo, em ambiente controlado e de segurança, pelo prazo de 6 (seis) meses, nos termos do regulamento."
> ([Lei 12.965/2014, art. 15](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm))

### O que a ANPD diz

> "Essa avaliação preliminar é necessária porque se trata de uma hipótese legal não aplicável ao tratamento de dados pessoais sensíveis, haja vista a sua previsão apenas no art. 7º da lgpd, não tendo sido reproduzida no art. 11."
> ([Guia orientativo: Legítimo interesse, fev. 2024, p. 8](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/copy_of_guia_legitimo_interesse.pdf/@@display-file/file))

> "o consentimento deve ser inequívoco, o que demanda a obtenção de uma manifestação de vontade clara e positiva do titular dos dados, não se admitindo a sua inferência ou a obtenção de forma tácita ou a partir de uma omissão do titular. Por isso, dada a incompatibilidade com as disposições da lgpd, não é recomendável a utilização de banners de cookies com opções de autorização pré-selecionadas ou a adoção de mecanismos de consentimento tácito, como a pressuposição de que, ao continuar a navegação em uma página, o titular forneceria consentimento para o tratamento de seus dados pessoais."
> ([Guia orientativo: Cookies e proteção de dados pessoais, out. 2022, p. 18-19](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file))

> "No caso de coleta de dados sensíveis com base no consentimento do titular, é necessário que, adicionalmente, o consentimento seja obtido por forma específica e destacada, conforme preconiza o art. 11, i, da lgpd. Em relação à forma destacada, recomenda-se que a autorização para tratamento de dados sensíveis conste separadamente do texto principal ou, ainda, que se usem recursos para evidenciá-lo, de modo a indicar quais dados sensíveis serão coletados e para qual finalidade específica serão utilizados pelo agente de tratamento."
> ([Guia de cookies, p. 19](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file))

### Minha leitura

- Nenhuma alínea do inciso II serve. A "a" (obrigação legal) só alcança o que o Marco Civil manda guardar: data, hora e IP, e só para pessoa jurídica com fins econômicos. A query não faz parte do "registro de acesso", então guardá-la não é "indispensável" para cumprir obrigação nenhuma. A "g" exige processo de identificação e autenticação de cadastro, e o site não tem login. As demais não têm relação com medir uso.
- Sobra o consentimento do inciso I. Aviso com opt-out é exatamente o "consentimento tácito" ou "a partir de uma omissão" que o guia de cookies rejeita. Se não vale nem para cookie comum, não vale para dado sensível, que ainda pede forma "específica e destacada".
- O ticket #14 registra que "quem abre o link de outra pessoa pela primeira vez entra no registro antes de poder escolher". Para essa pessoa não houve escolha nenhuma, nem por omissão.
- Há um detalhe pior. Quando alguém abre um link recebido, a linha do log junta o IP de quem abriu com o Perfil de quem compartilhou. O titular do dado sensível (quem compartilhou) nem está na requisição, então não tem como consentir ali.
- Um consentimento opt-in pode cobrir o analytics, desde que o envio só aconteça depois do clique. Não cobre o log do proxy, que grava a requisição antes de a página carregar.

## 2. Orientação inferida de gênero + gênero procurado é dado sensível?

### O que a lei diz

> "II - dado pessoal sensível: dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural"
> ([art. 5º, II](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

> "§ 1º Aplica-se o disposto neste artigo a qualquer tratamento de dados pessoais que revele dados pessoais sensíveis e que possa causar dano ao titular, ressalvado o disposto em legislação específica."
> ([art. 11, § 1º](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

### O que a ANPD diz

Não achei guia, nota técnica ou decisão da ANPD que trate de orientação sexual ou de dado sensível inferido. O mais perto:

> "Os dados pessoais sensíveis são aqueles aos quais a LGPD conferiu uma proteção ainda maior, por estarem diretamente relacionados aos aspectos mais íntimos da personalidade de um indivíduo."
> ([ANPD, Perguntas frequentes, 2.2](https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes))

> "As informações coletadas e armazenadas pelos cookies podem se referir diretamente a pessoas naturais ou, ainda, permitir indiretamente a sua identificação, mediante, por exemplo, a realização de inferências e o cruzamento com outras informações e, por vezes, por meio da formação de perfis comportamentais."
> ([Guia de cookies, p. 9](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file))

> "Já o risco de inferência diz respeito à possibilidade de inferir, com uma significativa probabilidade, o valor de um atributo a partir dos valores de um conjunto de outros atributos."
> ([Estudo técnico sobre a anonimização de dados na LGPD: análise jurídica, nov. 2023, p. 19](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/estudo_tecnico_sobre_anonimizacao_de_dados_na_lgpd___analise_juridica.pdf/@@display-file/file))

### Minha leitura

- A lei não usa a expressão "orientação sexual"; fala em "vida sexual". Ler orientação como parte de "vida sexual" é a leitura corrente (o RGPD europeu, art. 9º, nomeia as duas), mas é interpretação. Nem a ANPD nem a lei dizem isso com essas palavras. A ADR 0001 dá isso como certo; vale saber que é inferência, ainda que segura.
- O art. 11, § 1º resolve a dúvida sobre inferência sem precisar da ANPD. Ele estende o regime do art. 11 a "qualquer tratamento [...] que revele dados pessoais sensíveis". Gênero próprio + gênero procurado revelam orientação de modo quase direto: é uma preferência declarada, não um palpite estatístico. A condição "que possa causar dano" se cumpre com folga para orientação sexual, que é o caso clássico de exposição e discriminação.
- Isso vale também para quem é heterossexual. A lei não protege só a orientação minoritária. O risco de dano é menor, mas o regime é o mesmo.
- A idade exata não é sensível. Ela pesa na outra pergunta (se o registro identifica alguém), não nesta.

## 3. O que a ANPD diz sobre logs e analytics, inclusive de terceiro no exterior

Não há material da ANPD sobre dado sensível em log de servidor. O que existe e se aplica:

### Analytics

> "A utilização de cookies para fins de medição de audiência (cookies analíticos ou de medição) pode ser amparada na hipótese legal do legítimo interesse em determinados contextos [...]. Em particular, é razoável supor que a medição de audiência constituirá um interesse legítimo do controlador, bem como que os riscos à privacidade de titulares serão de menor monta quando o tratamento se limitar à finalidade específica de identificação de padrões e tendências, com base em dados agregados e sem a combinação com outros mecanismos de rastreamento ou sem a formação de perfis de usuários."
> ([Guia de cookies, p. 24](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file))

O exemplo 4 do mesmo guia (p. 26) aprova legítimo interesse para medir audiência porque "os dados coletados são, ainda, agregados, visando à produção de estatísticas anônimas" e "não são compartilhados com terceiros e nem cruzados com outros bancos de dados".

### Coleta e guarda em geral

> "tratar (coletar e guardar, por exemplo) dados pessoais sem uma utilidade imediata e concreta, apenas porque um dia poderão ser úteis (sem se saber exatamente para quê), não é uma prática adequada, considerando os princípios da finalidade e da necessidade previstos na referida Lei."
> ([Guia de segurança da informação para agentes de pequeno porte, out. 2021, § 45](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_seguranca_da_informacao_para_atpps___defeso_eleitoral.pdf/@@display-file/file))

> "III - necessidade: limitação do tratamento ao mínimo necessário para a realização de suas finalidades, com abrangência dos dados pertinentes, proporcionais e não excessivos em relação às finalidades do tratamento de dados"
> ([LGPD, art. 6º, III](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

### Transferência internacional

> "Art. 9º A transferência internacional de dados somente poderá ser realizada [...] desde que amparada em: I - uma das hipóteses legais previstas no art. 7º ou no art. 11 da Lei nº 13.709 [...]; e II - um dos seguintes mecanismos válidos de realização da transferência internacional: a) [...] decisão de adequação emitida pela ANPD; b) cláusulas-padrão contratuais, normas corporativas globais ou cláusulas contratuais específicas [...]; ou c) nas hipóteses previstas nos incisos II, "d", e III a IX do art. 33 [...]. Parágrafo único. A transferência internacional de dados deverá se limitar ao mínimo necessário para o alcance de suas finalidades [...]."
> ([Resolução CD/ANPD nº 19/2024, Anexo I, art. 9º](https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-19-de-23-de-agosto-de-2024-580095396))

> "11.1. Caso a Transferência Internacional de Dados envolva Dados Pessoais sensíveis, as Partes aplicarão salvaguardas adicionais, incluindo medidas de segurança específicas e proporcionais aos riscos da atividade de tratamento [...]."
> ([Resolução CD/ANPD nº 19/2024, Anexo II, cláusula 11](https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-19-de-23-de-agosto-de-2024-580095396))

> "VIII - quando o titular tiver fornecido o seu consentimento específico e em destaque para a transferência, com informação prévia sobre o caráter internacional da operação, distinguindo claramente esta de outras finalidades"
> ([LGPD, art. 33, VIII](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

> "Article 1. The European Union is hereby recognized as an international organization that provides an adequate level of personal data protection [...]."
> ([Resolução ANPD nº 32/2026, versão oficial em inglês](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/outros-documentos-e-publicacoes-institucionais/resolucao-no-32-decisao-de-adequacao-uniao-europeia-em-lingua-inglesa.pdf/@@display-file/file))

### Risco e incidente

> "será considerado de alto risco o tratamento de dados pessoais que atender cumulativamente a pelo menos um critério geral e um critério específico [...]: I - critérios gerais: a) tratamento de dados pessoais em larga escala; ou b) tratamento de dados pessoais que possa afetar significativamente interesses e direitos fundamentais dos titulares; II - critérios específicos: [...] d) utilização de dados pessoais sensíveis [...]."
> ([Resolução CD/ANPD nº 2/2022, art. 4º](https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-2-de-27-de-janeiro-de-2022-376562019))

> "Art. 5º O incidente de segurança pode acarretar risco ou dano relevante aos titulares quando puder afetar significativamente interesses e direitos fundamentais dos titulares e, cumulativamente, envolver, pelo menos, um dos seguintes critérios: I - dados pessoais sensíveis; [...]."
> ([Resolução CD/ANPD nº 15/2024, art. 5º](https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024))

### Minha leitura

- O caminho que a ANPD aceita para analytics (legítimo interesse, dados agregados, sem perfil) fecha para dado sensível, porque legítimo interesse não está no art. 11. Então o analytics só cabe em legítimo interesse se não receber o que revela orientação.
- Para analytics de terceiro, a Resolução 19/2024 pede duas coisas ao mesmo tempo: base legal (art. 7º ou 11) e mecanismo (adequação, cláusulas-padrão etc.). Para destino na UE, a Resolução 32/2026 dá o mecanismo. Para os EUA não há decisão de adequação; sobra cláusula-padrão ou o consentimento específico do art. 33, VIII. Com dado sensível, a cláusula 11 ainda exige salvaguardas extras. Se o fornecedor usar os dados para fins próprios, ele deixa de ser só operador ("em nome do controlador", art. 5º, VII) e passa a ser controlador também. O guia de agentes de tratamento da ANPD (abr. 2022, § 62) trata a responsabilidade do operador como exceção, ligada a descumprir a lei ou as instruções do controlador.
- Guardar orientação de muitos visitantes coloca o site em "alto risco" pela Resolução 2/2022 (dado sensível + afetar direitos, ou larga escala). Se o operador do site for agente de pequeno porte, perde as flexibilizações do regulamento. Um vazamento do log entra no art. 5º da Resolução 15/2024 e obriga a comunicar ANPD e titulares, que o site nem sabe quem são.
- O log, pelo princípio da necessidade, só precisa do que serve a operação e segurança. A query inteira não serve a isso.

## 4. A menor mudança e o que é dado pessoal sem IP nem cookie

### O que a lei diz

> "I - dado pessoal: informação relacionada a pessoa natural identificada ou identificável" e "III - dado anonimizado: dado relativo a titular que não possa ser identificado, considerando a utilização de meios técnicos razoáveis e disponíveis na ocasião de seu tratamento"
> ([art. 5º, I e III](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

> "Art. 12. Os dados anonimizados não serão considerados dados pessoais para os fins desta Lei, salvo quando o processo de anonimização ao qual foram submetidos for revertido, utilizando exclusivamente meios próprios, ou quando, com esforços razoáveis, puder ser revertido. § 1º A determinação do que seja razoável deve levar em consideração fatores objetivos, tais como custo e tempo necessários para reverter o processo de anonimização, de acordo com as tecnologias disponíveis, e a utilização exclusiva de meios próprios."
> ([art. 12, caput e § 1º](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

> "a pseudonimização é o tratamento por meio do qual um dado perde a possibilidade de associação, direta ou indireta, a um indivíduo, senão pelo uso de informação adicional mantida separadamente pelo controlador em ambiente controlado e seguro."
> ([art. 13, § 4º](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm))

### O que a ANPD diz

> "Já identificador indireto é considerado o dado que por si só não tem a capacidade de identificar alguém, mas pode ser agregado e vinculado a dados auxiliares para identificar uma pessoa natural, a exemplo da nacionalidade, a idade, a raça, o CEP da residência, as características fenotípicas, ou o endereço de IP que podem ser necessários para distinguir (single out) alguém."
> ([Estudo técnico de anonimização, p. 7](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/estudo_tecnico_sobre_anonimizacao_de_dados_na_lgpd___analise_juridica.pdf/@@display-file/file))

> "o direito brasileiro adotou com a LGPD a perspectiva expansionista, a qual, por sua vez, inspirou a positivação do conceito amplo no art. 5º, I, da referida lei. Isso significa que o conceito jurídico de dado pessoal estende seu alcance para além da pessoa natural identificada [...]. É igualmente considerada informação pessoal aquela relativa a pessoa natural identificável."
> ([Estudo técnico de anonimização, p. 12](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/estudo_tecnico_sobre_anonimizacao_de_dados_na_lgpd___analise_juridica.pdf/@@display-file/file))

> "sugere-se que os agentes de tratamento de pequeno porte que armazenam dados dessa natureza implementem soluções que dificultem a identificação do titular, como as técnicas de pseudonimização."
> ([Guia de segurança para pequeno porte, § 46](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_seguranca_da_informacao_para_atpps___defeso_eleitoral.pdf/@@display-file/file))

### Minha leitura: dado sem IP nem cookie

- Tirar IP e cookie não basta. Idade exata, gênero, UF, escolaridade e faixa procurada são identificadores indiretos no sentido do estudo da ANPD, e a combinação tende a ser única num site com pouco tráfego.
- O ponto mais forte é outro: a query é a mesma string que aparece no link postado no WhatsApp ou numa rede social, ao lado do nome de quem postou. Quem tem acesso ao log ou ao analytics consegue ligar a linha à pessoa só comparando strings. Isso é "possibilidade de ligação" (linkability) do estudo técnico, p. 19, com esforço quase zero. Uma linha por evento com a query crua continua sendo dado pessoal sensível, com ou sem IP.
- Trocar a query por um hash não muda nada: o mesmo link produz o mesmo hash, e o hash é pseudonimização (art. 13, § 4º), que a lei trata como dado pessoal.
- O que sai do regime é o agregado sem linha por evento: contadores do tipo "links abertos hoje: 412" ou distribuições por faixa com um mínimo de ocorrências por célula. Esses não remetem a ninguém com "esforços razoáveis" (art. 12).

### Minha leitura: as opções, da menor para a maior

| Mudança | Resolve o log? | Resolve o analytics? | Custo |
|---|---|---|---|
| Log do proxy e do app sem query (só o caminho) | Sim | Não | Uma linha de config por servidor |
| Analytics recebe só evento "link aberto" e campos não sensíveis (ex.: qual ferramenta, faixa etária larga), nunca gênero próprio + procurado juntos nem a query crua | Não se aplica | Sim, em legítimo interesse | Filtrar antes de enviar |
| Agregar no servidor (contadores, sem linha por evento) | Sim, se o log também sair | Sim, vira dado anonimizado | Montar o contador |
| Opt-in específico e destacado antes de enviar ao analytics | Não (o proxy grava antes da escolha) | Sim, se o envio esperar o clique; com terceiro nos EUA, somar cláusula-padrão ou art. 33, VIII | Banner, registro da prova (art. 8º, § 2º), e perde quem não clica |

A menor combinação regular são as duas primeiras linhas: log sem query e analytics sem o par de gêneros. O opt-in sozinho não serve, porque não alcança o log. Ele só faz sentido se o projeto quiser medir orientação por pessoa, e não vejo para que o site precisaria disso.

Duas consequências para a ADR 0001:

- O aviso ao lado do botão ("Este link mostra: homem, 30, procura mulheres...") continua útil como transparência para quem compartilha. Ele informa sobre o que vai no link, não serve de base legal para o site guardar nada.
- A frase "avisando que o uso fica registrado no site" deixa de ser verdade para o Perfil. O que fica registrado é o uso, não o estado.

## Fontes

- [Lei 13.709/2018 (LGPD), texto compilado](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- [Lei 12.965/2014 (Marco Civil da Internet)](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm)
- [ANPD, Guia orientativo: Cookies e proteção de dados pessoais, out. 2022](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file)
- [ANPD, Guia orientativo: Hipóteses legais, legítimo interesse, fev. 2024](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/copy_of_guia_legitimo_interesse.pdf/@@display-file/file)
- [ANPD, Guia orientativo de segurança da informação para agentes de pequeno porte, out. 2021](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_seguranca_da_informacao_para_atpps___defeso_eleitoral.pdf/@@display-file/file)
- [ANPD, Guia orientativo para definições dos agentes de tratamento e do encarregado, v2.0, abr. 2022](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_agentes_de_tratamento_e_encarregado___defeso_eleitoral.pdf/@@display-file/file)
- [ANPD, Estudo técnico sobre a anonimização de dados na LGPD: análise jurídica, nov. 2023](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/estudo_tecnico_sobre_anonimizacao_de_dados_na_lgpd___analise_juridica.pdf/@@display-file/file)
- [ANPD, Perguntas frequentes](https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes)
- [Resolução CD/ANPD nº 2/2022 (agentes de pequeno porte)](https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-2-de-27-de-janeiro-de-2022-376562019)
- [Resolução CD/ANPD nº 15/2024 (comunicação de incidente)](https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024)
- [Resolução CD/ANPD nº 19/2024 (transferência internacional e cláusulas-padrão)](https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-19-de-23-de-agosto-de-2024-580095396)
- [Resolução ANPD nº 32/2026 (adequação da UE), versão em inglês](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/outros-documentos-e-publicacoes-institucionais/resolucao-no-32-decisao-de-adequacao-uniao-europeia-em-lingua-inglesa.pdf/@@display-file/file)

## O que ficou em aberto

- O guia definitivo de anonimização e pseudonimização da ANPD: só achei o estudo técnico de 2023 e a consulta pública de 2024.
- Decisões sancionadoras da ANPD sobre dado sensível inferido ou logs: não achei nenhuma, mas não fiz busca exaustiva.
- O ticket de analytics ainda decide onde ele roda. Se for próprio e no Brasil, a parte de transferência internacional cai.
