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

- **Guia** [guide]**:** o texto público de um Tema: uma narrativa corrida, dividida em Capítulos, que responde às Perguntas do Tema e explica o porquê, o que fazer, onde os Estudos discordam e o que vale no Brasil. Cada afirmação aponta para Fichas. Cada Tema tem um Guia.
- **Capítulo** [chapter]**:** um passo do raciocínio de um Guia, como "o online virou o caminho mais comum". Um Capítulo pode responder a nenhuma, uma ou várias Perguntas.
- **Pergunta** [question]**:** uma dúvida do usuário, por exemplo "onde conhecer alguém da minha idade?". O Guia a responde no ponto da narrativa em que ela cabe, com a resposta curta e a Confiança dela em destaque; o resumo no topo do Guia junta todas.
- **Tema** [topic]**:** um assunto com página própria, como "Onde conhecer pessoas" ou "Escolher parceiro". Reúne Perguntas, e o Guia dele as responde.
- **Confiança** [confidence]**:** o rótulo da resposta curta de uma Pergunta (forte, moderada ou fraca). O curador escolhe, mas nunca acima da Ficha mais forte que sustenta a resposta, e no máximo moderada se a resposta só se apoia em Fichas 🟡. Não confundir com Força da evidência, que é de uma Ficha.
- **Dica** [tip]**:** uma recomendação prática ligada às Fichas que a sustentam e à Força da evidência delas. A mesma Dica pode aparecer em mais de um Guia.
- **Inferência** [inference]**:** uma Dica deduzida de Fichas sem estudo que a teste diretamente. Aparece marcada como "inferência nossa", com Força no máximo moderada.
- **Mito** [myth]**:** uma afirmação popular sem fonte primária, ou que a fonte citada não traz, como "10 anos de diferença de idade = 39% mais divórcio". Um Guia pode desmontá-la logo depois do achado que a contradiz.
- **Perfil** [profile]**:** quem o usuário é e quem procura: o gênero dele, o gênero de quem ele procura e a idade. A orientação decorre das duas primeiras e não é perguntada. O Perfil é opcional: destaca o que vale para o usuário e marca com aviso o que vem de outras amostras, sem esconder nada.
- **Requisito** [requirement]**:** uma característica que o usuário exige de um parceiro, como faixa de idade, escolaridade ou cidade.
- **Grupo possível** [possible group, `possible-group`]**:** a estimativa de quantas pessoas no Brasil atendem ao Perfil procurado e a todos os Requisitos.
- **Custo** [cost]**:** quanto o Grupo possível cresceria se o usuário soltasse um Requisito e mantivesse os outros.
- **Prioridade** [priority]**:** quanto o usuário valoriza uma característica de um parceiro. É comparada com o que a evidência diz que prevê um bom relacionamento.
- **Desfecho** [outcome]**:** o que um Estudo mede para dizer se uma característica pesa num relacionamento: atração, satisfação ou duração.
- **Calculadora** [calculator]**:** a ferramenta que um Guia hospeda: o Grupo possível ou as Prioridades.
- **Visualização** [visual]**:** um gráfico de barras, uma linha no tempo, uma tabela de Estudos ou um diagrama de relações dentro de um Guia. Cada número vem de uma Ficha ✅ ou 🟡 ou de uma Conta nossa sobre elas. No diagrama, cada seta é um achado com Fichas, e o traço diz se um Estudo testou a causa, se só achou associação ou se é Inferência.
- **Conta nossa** [own calculation]**:** um número que o Tem estudo? calculou a partir dos números de Fichas, como um recorte ou uma média. Aparece marcada como "conta nossa".
- **Verbete** [term]**:** a explicação de uma palavra que trava o leitor: um jargão de pesquisa (metanálise, amostra representativa), uma instituição que pesquisa (Pew, IBGE) ou uma medida que cada Estudo define do seu jeito (satisfação). Tem uma definição geral, escrita pelo Tem estudo?, que não traz número nem achado. Quando a palavra é medida de jeitos diferentes, cada Ficha que a usa diz como o seu Estudo a definiu, com Trecho, e o texto que cita a Ficha mostra essa definição ao lado da geral. Os Verbetes se reúnem no Glossário do site.
- **Site vizinho** [neighbor site]**:** um site externo sobre relacionamentos de onde o Tem estudo? indica Leituras. Se vende algo (curso, terapia, livro) ou defende uma causa declarada, suas Leituras levam esse aviso. Não é Fonte nem sustenta afirmação: um Guia cita Fichas, nunca um Site vizinho.
- **Leitura** [reading]**:** uma página de um Site vizinho que o Tem estudo? indica ao leitor, ligada a um ou mais Temas. Só entra se ela mesma linka ou referencia os estudos de que fala, e se o que diz deles foi conferido nos estudos. Pode levar um aviso próprio, além do aviso do site, quando quem a escreveu vende algo ou ela saiu antes num site que defende uma causa.
- **Ressalva** [caveat]**:** o aviso de uma Leitura que exagera ou distorce, num ponto lateral, um estudo que cita: uma frase com o que o estudo achou. Quando o erro está no centro do texto, a Leitura sai em vez de levar Ressalva.

- **Grifo** [highlight]**:** um trecho de um Guia, de uma Ficha ou de uma Dica que o usuário marcou para rever. Fica só no aparelho dele. Se o texto muda e o trecho some, o Grifo continua guardado, marcado como trecho que mudou.
- **Nota** [note]**:** o texto que o usuário escreve num Grifo. É opcional e, como o Grifo, só ele vê.
- **Comentário** [comment]**:** o recado de um leitor ao curador sobre um trecho: um erro, um estudo que falta, algo que não entendeu. É anônimo, só o curador lê e nunca aparece no site para os outros leitores. Quem enviou continua vendo o seu, guardado no próprio aparelho, em Seus trechos.
- **Seus trechos** [kept passages]**:** a página `/trechos`, com os Grifos e os Comentários enviados deste aparelho. Ela lê só o que o navegador guardou. "Tirar da lista" apaga um Comentário do aparelho, e a issue continua com o curador.

_Evitar_: "pool" para Grupo possível, no texto e no código; "artigo" para Guia, porque artigo é um tipo de Estudo; "recomendação" para Site vizinho, porque recomendação prática é Dica; "aviso" para Comentário, porque aviso é o alerta de um Site vizinho ou de uma Leitura; "anotação" para Nota; "glossário" para Verbete, porque o Glossário do site é a página que reúne os Verbetes, e o `GLOSSARY.md` é este vocabulário interno.
