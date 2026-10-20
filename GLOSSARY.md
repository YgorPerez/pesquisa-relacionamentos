# Glossário

Cada termo traz, entre colchetes, o nome que ele tem no código, que é em inglês ([ADR 0039](docs/adr/0039-code-in-english.md)). URL, query do link e texto da interface continuam em português.

## Acervo [library]

- **Estudo** [study]**:** uma fonte primária (artigo revisado por pares, relatório de pesquisa ou dado oficial) que sustenta afirmações do site.
- **Ficha** [fact sheet, `FactSheet`]**:** o resumo de um Estudo no acervo: o que mediu, números principais, limitações, Status de verificação e Força da evidência. Cada Estudo tem exatamente uma Ficha.
- **Status de verificação** [verification status: `verified`, `partial`, `unverified`]**:** até que ponto a Ficha foi conferida na fonte original. Pode ser ✅ (lido no original), 🟡 (parcial) ou ⬜ (não verificado). Só Fichas ✅ e 🟡 sustentam um Guia, e só quando cada número delas foi conferido num trecho da fonte salva no acervo. Isso vale para quem escreveu a Ficha, pessoa ou agente.
- **Fonte local** [local source; pastas `sources/` e `sources/private/`]**:** a cópia de um Estudo guardada no acervo (PDF ou página salva) para que os números da Ficha possam ser conferidos mesmo se o original sair do ar.
- **Trecho** [excerpt] e **localizador** [locator]**:** a citação literal da Fonte local que sustenta um número da Ficha, e onde ela está (página, tabela, seção).
- **Força da evidência** [strength: `strong`, `moderate`, `weak`]**:** quanto se pode confiar no achado de um Estudo, independentemente de ele ter sido conferido. Pode ser forte, moderada ou fraca.
- **Relatório** [report]**:** uma síntese interna que cruza vários Estudos para responder a uma pergunta de pesquisa. Não é publicado como está.

## Site

- **Guia** [guide]**:** uma página pública que responde a uma Pergunta, em que cada afirmação aponta para Fichas.
- **Pergunta** [question]**:** uma dúvida do usuário que um Guia responde, por exemplo "onde conhecer alguém da minha idade?".
- **Tema** [topic]**:** um agrupamento de Perguntas com página própria, como "Onde conhecer pessoas" ou "Escolher parceiro".
- **Confiança** [confidence]**:** o rótulo da resposta curta de um Guia (forte, moderada ou fraca). O curador escolhe, mas nunca acima da Ficha mais forte que sustenta a resposta, e no máximo moderada se a resposta só se apoia em Fichas 🟡. Não confundir com Força da evidência, que é de uma Ficha.
- **Dica** [tip]**:** uma recomendação prática ligada às Fichas que a sustentam e à Força da evidência delas. A mesma Dica pode aparecer em mais de um Guia.
- **Inferência** [inference]**:** uma Dica deduzida de Fichas sem estudo que a teste diretamente. Aparece marcada como "inferência nossa", com Força no máximo moderada.
- **Mito** [myth]**:** uma afirmação popular sem fonte primária, ou que a fonte citada não traz, como "10 anos de diferença de idade = 39% mais divórcio". Um Guia pode desmontá-la no bloco "O que circula por aí e não se sustenta".
- **Perfil** [profile]**:** quem o usuário é e quem procura: o gênero dele, o gênero de quem ele procura e a idade. A orientação decorre das duas primeiras e não é perguntada. O Perfil é opcional: destaca o que vale para o usuário e marca com aviso o que vem de outras amostras, sem esconder nada.
- **Requisito** [requirement]**:** uma característica que o usuário exige de um parceiro, como faixa de idade, escolaridade ou cidade.
- **Grupo possível** [possible group, `possible-group`]**:** a estimativa de quantas pessoas no Brasil atendem ao Perfil procurado e a todos os Requisitos.
- **Prioridade** [priority]**:** quanto o usuário valoriza uma característica de um parceiro. É comparada com o que a evidência diz que prevê um bom relacionamento.
- **Calculadora** [calculator]**:** a ferramenta que um Guia hospeda: o Grupo possível ou as Prioridades.

_Evitar_: "pool" para Grupo possível, no texto e no código; "artigo" para Guia, porque artigo é um tipo de Estudo.
