# Rodar coisas nesta máquina

Como subir, esperar e parar um processo aqui. As regras por trás estão no `AGENTS.md` ("Quatro jeitos de se machucar"); os comandos ficam aqui, num lugar só.

## Node

O CI e a imagem do Docker rodam o Node 24. A máquina Linux tem o v26 no PATH (do nvm), e tudo roda nele. Os scripts de `scripts/` rodam no `node` puro, que lê TypeScript sozinho: escreva neles só a sintaxe que ele apaga (sem `enum`, sem `namespace`, sem parâmetro de construtor com modificador).

## Um worktree

Cada worktree tem as suas dependências e as suas portas ([ADR 0010](../adr/0010-each-worktree-prepares-itself-and-has-its-own-ports.md)).

- O T3 Code prepara o worktree novo sozinho, pelo `t3.json`. Em qualquer outro lugar, rode `node scripts/prepare-worktree.ts` uma vez, na raiz do worktree. Ele faz o `pnpm install`, liga do principal os `frontend/.env*`, a pasta `sources/private/` e a skill do impeccable, sincroniza `.repos/` e diz quantos commits você está atrás do `origin/main`. O `.env` da raiz e o `.env.deploy` não vêm, de propósito.
- As portas do worktree: `node scripts/ports.ts`. No principal são 4310 (dev), 4311 (start), 4312 (e2e), 6310 (Storybook) e 6311 (Vitest das stories). Num worktree, um bloco entre 40100 e 48099.
- `pnpm dev`, `pnpm start` e `pnpm storybook` sobem na porta do worktree e escrevem `[dev] up: <url>` quando respondem. `pnpm e2e`, `pnpm test:stories` e `pnpm test:storybook` (que sobe o Storybook na porta dele) também usam a do worktree.
- Troque a porta só quando um script disser que ela está ocupada: `DEV_PORT`, `START_PORT`, `STORYBOOK_PORT`, `E2E_PORT` ou `STORIES_PORT`.
- O e2e builda com o acervo de fixture (`CONTENT_ROOT=e2e/library`). Depois dele, rode `pnpm build` de novo antes de `pnpm start` com o conteúdo de verdade.

## Esperar

- Um comando que leva minutos (o `pnpm e2e`, o `pnpm check`, o build) roda em segundo plano (`run_in_background` da ferramenta Bash), com a saída num log que termina em `echo exit=$?`. O harness avisa quando ele sai. Siga com o que não depende dele.
- Para esperar algo que o harness não vê (uma linha no log de um processo que você subiu em segundo plano), use a ferramenta Monitor. Um `until grep …; do sleep …` em primeiro plano trava a sessão e morre no limite de 10 min.
- Os testes revezam a máquina ([ADR 0013](../adr/0013-tests-share-the-machine-through-a-queue.md)). Uma rodada sem filtro (a suíte de um pacote, `pnpm e2e`, `pnpm test:stories`) espera a vez de qualquer outra rodada inteira, de qualquer worktree, e escreve `[queue] waiting for a turn` com quem está na frente. Uma filtrada (um arquivo, `-t`, `-g`) nunca espera, só leva menos workers. Uma rodada morta solta a vez em até 5 min.

## Parar

Pare só um PID que você guardou ao subir, ou o dono da porta do seu worktree. Outras sessões rodam os seus `node`, `vite` e Chrome na mesma máquina ([ADR 0011](../adr/0011-a-script-stops-only-the-tree-it-started.md)).

| O quê                     | Linux                         | Windows                                   |
| ------------------------- | ----------------------------- | ----------------------------------------- |
| O `dev.ts` que você subiu | `kill <pid do dev.ts>`        | `taskkill /T /F /PID <pid do dev.ts>`     |
| Quem ocupa a sua porta    | `ss -ltnp 'sport = :<porta>'` | `Get-NetTCPConnection -LocalPort <porta>` |

No `SIGTERM`, o `scripts/dev.ts` para a árvore inteira do filho (o grupo de processos e cada descendente, pelo `killTree` de `scripts/kill-tree.ts`), então no Linux um `kill` simples do PID dele basta.

Em segundo plano, suba com `node scripts/dev.ts` (ou `node scripts/dev.ts start`, `node scripts/dev.ts storybook`) e guarde o `$!` logo depois. Com `pnpm dev`, o `$!` é o do pnpm, que não repassa o `SIGTERM`: o `kill` dele deixa o dev de pé na porta.

## Hábitos de shell

- Um script de mais de umas linhas vai num arquivo em `/tmp`, escrito com a ferramenta Write e rodado com `node` ou `python3`. Um heredoc longo dentro do comando quebra nas aspas.
- Mude arquivo do repositório com a ferramenta Edit. Um patch por `sed -i` ou Python erra a âncora sem avisar quando o Oxfmt reformata a linha; o gancho `scripts/patch-warning.ts` avisa quando vê um.
- Commite antes de um passo longo. Um limite de sessão corta qualquer chamada, a de um subagente também. Antes de algo que pode passar do limite (o e2e, a suíte inteira, um subagente de pesquisa), faça um commit `wip` no worktree, que você reescreve antes do push.
- Num subagente isolado em worktree, rode o git como comando simples na raiz do worktree: sem `cd <pasta> && git …`, sem `git -C`, sem git num pipeline ou num laço. O harness não prova que esses ficam dentro do worktree e os recusa. O mesmo vale para `export VAR=$(…)` antes de outro comando: passe a variável na frente do comando (`GH_TOKEN=$(gh auth token --user YgorPerez) gh …`).
- Cada rodada de ferramenta custa uns segundos de modelo. Faça na mesma rodada as chamadas independentes, encadeie comandos relacionados numa chamada só e corte a saída para o que você vai ler (`| tail -20`).
