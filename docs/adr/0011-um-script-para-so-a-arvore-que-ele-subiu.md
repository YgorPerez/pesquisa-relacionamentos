# Um script para só a árvore de processos que ele subiu

Outras sessões rodam os seus `node`, `vite` e Chrome na mesma máquina. Um `pkill -f vite` ou um `kill` pelo nome derruba o dev ou o e2e de outro worktree no meio da rodada. No Festival dos Macacos isso já aconteceu, e virou o item 3 dos "Four ways to hurt yourself" do AGENTS.md dele.

## Decisão

- **Quem sobe um filho guarda o PID e para por ele.** `scripts/matar-arvore.ts` sobe o filho num shell e num grupo de processos só dele (`subirComGrupo`) e o para com `matar`, que manda o sinal ao grupo inteiro (no Windows, `taskkill /T` no PID). Assim o `vite` embaixo do `pnpm exec` morre junto, e nada fora do grupo recebe o sinal. `comLimite` faz o mesmo quando o filho passa do tempo.
- **O `scripts/dev.ts` usa os dois.** Ctrl-C, `SIGTERM` ou a saída do script levam o filho e a árvore dele.
- **Um agente para só o que ele subiu**: o PID que guardou, ou o dono da porta do próprio worktree (`ss -ltnp 'sport = :<porta>'`). Os comandos estão em `docs/agents/ambiente.md`.
- **A fila dos testes (ADR 0013) nunca mata processo.** Só pergunta se um PID existe.

## Consequências

- Um filho que já saiu não recebe sinal: o PID dele pode ter ido para outro processo.
- Quem subir um processo longo num script novo usa `subirComGrupo` e `matar`, e não `spawn` direto.
