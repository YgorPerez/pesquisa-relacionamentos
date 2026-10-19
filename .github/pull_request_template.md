<!-- Título: o ticket e o que mudou, como nos commits ("Ticket #57: o fluxo por PR"). Um assunto por PR; se a descrição pede "também", divida. -->

## Por quê

<!-- O problema, como quem usa o site ou o repositório o vê. -->

## O que mudou

<!-- O que mudou e onde. O que ficou de fora, se alguém vai procurar. -->

## Tela

<!-- Um PR que muda tela traz, de cada tela que mudou, o print e o vídeo de antes e de depois:
`node frontend/scripts/capturar.ts <rota> --video` em cada lado (a skill `testar-app`). O check
"Evidência de tela" falha sem pelo menos dois prints e dois vídeos. Escreva a tabela com os caminhos
locais e anexe com `gh pr edit <n> --body-file corpo.md --attach ./antes.png --attach ./antes.mp4 ...`:
o gh troca cada caminho pelo anexo. Se a tela não muda, marque a caixa, diga por quê e apague a tabela.
Como: docs/agents/evidencia-de-tela.md -->

- [ ] Nenhuma mudança de tela

|                | Antes                         | Depois                          |
| -------------- | ----------------------------- | ------------------------------- |
| Print, celular | ![antes](./antes-celular.png) | ![depois](./depois-celular.png) |
| Vídeo, celular | [antes](./antes-celular.mp4)  | [depois](./depois-celular.mp4)  |

## Verificação

<!-- A menor prova que rodou (`node scripts/prova-minima.ts`, ADR 0016): quais testes, tipos e lint, e o resultado. Cada supressão nova, e por quê. -->

Closes #

<!-- O modelo e o ambiente que fizeram o trabalho, por exemplo: Claude Opus 5.5, no Claude Code. -->
