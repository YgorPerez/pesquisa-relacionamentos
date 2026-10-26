# Glossário

Cada termo traz, entre colchetes, o nome que ele tem no código, que é em inglês ([ADR 0039](docs/adr/0039-code-in-english.md)). URL, query do link e texto da interface continuam em português.

## Acervo [library]

- **Estudo** [study]**:** uma fonte primária (artigo revisado por pares, relatório de pesquisa ou dado oficial) que sustenta afirmações do site.
- **Ficha** [fact sheet, `FactSheet`]**:** o resumo de um Estudo no acervo: o que mediu, números principais, limitações, Status de verificação e Força da evidência. Cada Estudo tem exatamente uma Ficha.
- **Status de verificação** [verification status: `verified`, `partial`, `unverified`]**:** até que ponto a Ficha foi conferida na fonte original. Pode ser ✅ (lido no original), 🟡 (parcial) ou ⬜ (não verificado). Só Fichas ✅ e 🟡 sustentam um Guia, e só quando cada número delas foi conferido num trecho da fonte salva no acervo. Isso vale para quem escreveu a Ficha, pessoa ou agente.
- **Fonte local** [local source; pastas `sources/` e `sources/private/`]**:** a cópia de um Estudo guardada no acervo (PDF ou página salva) para que os números da Ficha possam ser conferidos mesmo se o original sair do ar. A de licença aberta fica em `sources/`, no repo público; a outra, no repo privado `pesquisa-relacionamentos-fontes`, clonado em `sources/private/`.
- **Trecho** [excerpt] e **localizador** [locator]**:** a citação literal da Fonte local que sustenta um número da Ficha, e onde ela está (página, tabela, seção).
- **Força da evidência** [strength: `strong`, `moderate`, `weak`]**:** quanto se pode confiar no achado de um Estudo, independentemente de ele ter sido conferido. Pode ser forte, moderada ou fraca.
- **Relatório** [report]**:** uma síntese interna que cruza vários Estudos para responder a uma pergunta de pesquisa. Não é publicado como está.

## Site

- **Guia** [guide]**:** o texto público de um Tema. Responde às Perguntas dele em ordem, numa narrativa que liga uma resposta à outra e explica o porquê, o que fazer, onde os Estudos discordam e o que vale no Brasil. Cada afirmação aponta para Fichas. Cada Tema tem um Guia.
- **Pergunta** [question]**:** uma dúvida do usuário, por exemplo "onde conhecer alguém da minha idade?". É uma seção do Guia, que abre com a resposta curta e a Confiança dela.
- **Tema** [topic]**:** um assunto com página própria, como "Onde conhecer pessoas" ou "Escolher parceiro". Reúne Perguntas, e o Guia dele as responde.
- **Confiança** [confidence]**:** o rótulo da resposta curta de uma Pergunta (forte, moderada ou fraca). O curador escolhe, mas nunca acima da Ficha mais forte que sustenta a resposta, e no máximo moderada se a resposta só se apoia em Fichas 🟡. Não confundir com Força da evidência, que é de uma Ficha.
- **Dica** [tip]**:** uma recomendação prática ligada às Fichas que a sustentam e à Força da evidência delas. A mesma Dica pode aparecer em mais de um Guia.
- **Inferência** [inference]**:** uma Dica deduzida de Fichas sem estudo que a teste diretamente. Aparece marcada como "inferência nossa", com Força no máximo moderada.
- **Mito** [myth]**:** uma afirmação popular sem fonte primária, ou que a fonte citada não traz, como "10 anos de diferença de idade = 39% mais divórcio". Um Guia pode desmontá-la logo depois do achado que a contradiz.
- **Perfil** [profile]**:** quem o usuário é e quem procura: o gênero dele, o gênero de quem ele procura e a idade. A orientação decorre das duas primeiras e não é perguntada. O Perfil é opcional: destaca o que vale para o usuário e marca com aviso o que vem de outras amostras, sem esconder nada.
- **Requisito** [requirement]**:** uma característica que o usuário exige de um parceiro, como faixa de idade, escolaridade ou cidade.
- **Grupo possível** [possible group, `possible-group`]**:** a estimativa de quantas pessoas no Brasil atendem ao Perfil procurado e a todos os Requisitos.
- **Prioridade** [priority]**:** quanto o usuário valoriza uma característica de um parceiro. É comparada com o que a evidência diz que prevê um bom relacionamento.
- **Calculadora** [calculator]**:** a ferramenta que um Guia hospeda: o Grupo possível ou as Prioridades.
- **Visualização** [visual]**:** um gráfico de barras, uma linha no tempo, uma tabela de Estudos ou um diagrama de relações dentro de um Guia. Cada número vem de uma Ficha ✅ ou 🟡 ou de uma Conta nossa sobre elas. No diagrama, cada seta é um achado com Fichas, e o traço diz se um Estudo testou a causa, se só achou associação ou se é Inferência.
- **Conta nossa** [own calculation]**:** um número que o Tem estudo? calculou a partir dos números de Fichas, como um recorte ou uma média. Aparece marcada como "conta nossa".

_Evitar_: "pool" para Grupo possível, no texto e no código; "artigo" para Guia, porque artigo é um tipo de Estudo.
