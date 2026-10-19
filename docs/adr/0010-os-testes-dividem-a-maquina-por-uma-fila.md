# Os testes de vários worktrees dividem a máquina por uma fila

Cada rodada do Vitest e do Playwright escolhe os workers pelos núcleos, como se estivesse sozinha na máquina. Com vários agentes testando ao mesmo tempo, as rodadas brigam pelos mesmos núcleos e todas ficam lentas; no Festival dos Macacos, três suítes juntas levaram o quádruplo do tempo, e testes com prazo estouraram. Copiado do [ADR-0054 do Festival](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0054-test-runs-share-the-machine-through-one-queue-and-a-worker-budget.md).

## Decisão

- **A rodada sem filtro é pesada, e as pesadas rodam uma de cada vez**, na ordem de chegada, com os workers que usariam sozinhas. Sem filtro quer dizer sem arquivo, pasta, `-t`, `-g`, `--project` ou `--shard`: a fronteira sai dos argumentos, e nenhuma lista de comandos precisa ficar em dia.
- **A filtrada é leve e nunca espera.** Leva a sua parte do orçamento (um worker por núcleo), dividido pelas rodadas que rodam, e nunca menos de um worker.
- **A entrada está na config de cada ferramenta**, e não no `package.json`: os `vite.config.ts` da raiz, do `frontend/` e dos pacotes, o `frontend/vitest.stories.config.ts` e o `frontend/playwright.config.ts` chamam `scripts/fila-da-maquina.ts` ao carregar. Assim `pnpm test`, `vp test` e `pnpm exec playwright` passam todos por ela.
- **O estado é um arquivo por rodada em `<tmp>/fila-dos-testes-tem-estudo`**, escrito sob uma trava de pasta. A pasta não é a do Festival: uma suíte dele dura até 20 min, e a nossa inteira, segundos; dividir a fila deixaria a nossa esperando a dele.
- **Uma rodada morta solta a vez sozinha.** O arquivo leva o PID do dono, que o renova a cada 30 s. Sem PID vivo, ou 5 min sem sinal, o próximo leitor apaga o arquivo. A fila só pergunta se o PID existe e nunca para processo (ADR 0008).
- **Fora da fila:** o CI (`CI` definido), o modo watch, o `--list`, a UI do Playwright, e o que roda dentro de uma rodada que já entrou (os workers do Playwright herdam `FILA_DA_MAQUINA`). `FILA_DA_MAQUINA=fora` pula a fila de propósito.

## Consequências

- O `pnpm check` roda a suíte de cada pacote como pesada, uma depois da outra. São segundos cada.
- Quem espera a vez vê `[fila] esperando a vez` uma vez por minuto, com o comando, o worktree e o PID de quem está na frente. A espera conta no limite de tempo do comando: rode a suíte inteira em segundo plano.
- O orçamento é da máquina, mas só entre os worktrees deste repositório: os testes do Festival não entram na conta.
