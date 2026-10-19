# Mostrar a tela no pull request

Nenhum check compara telas, então quem revisa só vê uma tela que mudou se o PR a mostrar ([ADR 0018](../adr/0018-o-pr-que-muda-tela-mostra-o-antes-e-o-depois.md)). Um PR que muda tela traz, na seção `## Tela` da descrição, um print e um vídeo de cada tela que mudou, antes e depois. O print mostra o layout; o vídeo mostra o que um print não mostra: uma entrada, uma transição, um toque e o que ele abre.

## O que o check conta

`.github/scripts/evidencia-de-tela.ts` roda no `evidencia-de-tela.yml` em todo PR, rascunho inclusive, e de novo quando a descrição muda: pôr os anexos deixa o check verde sem push. Na mão:

```bash
GH_TOKEN=$(gh auth token --user YgorPerez) node .github/scripts/evidencia-de-tela.ts <pr>
```

Arquivo de tela é todo arquivo em `frontend/src/` ou `frontend/public/`, menos testes, stories, `.d.ts`, `.md`, `platform/`, `analytics/`, `server.ts`, `*.server.ts` e o `routeTree.gen.ts`. O acervo (`estudos/`, `dicas/`) não conta: a Ficha tem a revisão dela.

Quando um deles muda, a seção `## Tela` precisa de pelo menos duas imagens diferentes e dois vídeos diferentes. O script lê a descrição como o GitHub a mostra (`body_html`), porque o markdown não diz o que é um anexo: o mesmo `https://github.com/user-attachments/assets/<uuid>` vira um player se é vídeo e um link se é imagem. Uma imagem conta quando vira `<img>`, um vídeo quando vira `<video>`, e o mesmo arquivo duas vezes conta uma.

Marcar `- [x] Nenhuma mudança de tela` na seção passa o check, para a mudança num arquivo de tela que deixa toda tela igual: um refactor, um tipo, uma leitura. Diga na descrição por que nada muda.

## Tirar

A skill `testar-app` sobe o antes e o depois e tira as capturas. O comando é `frontend/scripts/capturar.ts`, que tira o print e, com `--video`, grava do carregamento ao último `--tocar`, no celular (390×844) e no desktop (1280×800). Por padrão ele abre o `pnpm start` do checkout:

```bash
cd frontend
node scripts/capturar.ts /prioridades --video --tocar 'text=Renda' --nome prioridades-depois
```

Com o `ffmpeg` no PATH (a máquina tem) o vídeo sai em `.mp4`; sem ele, no `.webm` do Playwright. O GitHub toca os dois.

O antes é a mesma captura num segundo worktree no ramo de destino, com o `pnpm start` dele (`--porta <start dele>`). Dê nomes que se ordenam juntos, como `prioridades-antes-celular.png` e `prioridades-depois-celular.png`.

Para ver a animação de uma story quadro a quadro, `--story <id> --em 0,500,1000` fotografa a story do Storybook que está de pé em cada instante, com o relógio da página parado e andando junto com as animações do CSS.

## Anexar

O `gh` sobe anexos com `--attach` no `gh pr create`, `gh pr edit` e `gh pr comment`. Escreva a tabela com os caminhos locais e rode da pasta de onde eles são relativos:

```markdown
|                      | Antes                                     | Depois                                      |
| -------------------- | ----------------------------------------- | ------------------------------------------- |
| Prioridades, celular | ![antes](./prioridades-antes-celular.png) | ![depois](./prioridades-depois-celular.png) |
| Vídeo, celular       | [antes](./prioridades-antes-celular.mp4)  | [depois](./prioridades-depois-celular.mp4)  |
```

```bash
GH_TOKEN=$(gh auth token --user YgorPerez) gh pr edit <n> --body-file corpo.md \
  --attach ./prioridades-antes-celular.png --attach ./prioridades-depois-celular.png \
  --attach ./prioridades-antes-celular.mp4 --attach ./prioridades-depois-celular.mp4
```

O `gh` troca cada `./caminho` que a descrição cita pela URL do anexo, e põe no fim o arquivo que ela não cita. Escreva o vídeo como link, `[antes](./x.mp4)`: um `./x.mp4` solto numa célula fica como texto, e o arquivo vai para o fim da descrição, fora da seção. Nunca commite as capturas.
