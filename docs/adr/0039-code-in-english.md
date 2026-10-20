# O código é em inglês; o que sai do código fica em PT-BR

O repositório nasceu todo em português, do nome dos arquivos às chaves do frontmatter. Em 20/10/2026 o usuário decidiu que o código passa para o inglês (#65).

## Decisão

Vão para o inglês os nomes de arquivo e de pasta, os identificadores, os comentários, as mensagens de CLI, de build e de log, os nomes dos pacotes e dos comandos do `package.json`, as pastas de conteúdo (`studies/`, `tips/`, `data/`, `sources/`, `reports/`, `prototypes/`), as chaves do frontmatter e os valores das listas fechadas. Cada termo do domínio tem um nome em inglês, escrito no `GLOSSARY.md`, e todo identificador usa esse nome.

Ficam em PT-BR:

- as URLs públicas: os caminhos fixos (`/estudos`, `/dicas`, `/prioridades`, `/grupo-possivel`, `/privacidade`) e os slugs de Tema, Guia, Ficha e Dica, que são os nomes dos arquivos de conteúdo. Por isso os arquivos de `frontend/src/routes/` mantêm os segmentos em português;
- os parâmetros e os valores da query do link (ADR 0001);
- as chaves do `localStorage` e o formato do que já está salvo;
- os nomes dos eventos do analytics;
- o texto da interface e a prosa do conteúdo;
- a prosa dos docs, das issues, dos PRs e dos commits.

## Por quê

O que fica em português é o que alguém de fora já guardou ou viu: um link compartilhado, um Perfil salvo no navegador, a série de um evento, a URL que um buscador indexou. Traduzir isso quebra o que está no ar sem ganho para quem lê o código. Todo o resto é lido só por quem mantém o repositório.

## Consequências

- Código novo nasce em inglês. Um nome do domínio que não está no glossário entra lá antes de virar identificador.
- Quem lê a URL ou o link e procura o código passa pelo glossário: `/grupo-possivel` é a rota de `possible-group`.
