// Sobe um filho num grupo de processos só dele e, para pará-lo, para a árvore
// inteira pelo PID que o `spawn` deu, nunca por nome ou padrão (ADR 0008,
// `AGENTS.md`, "Quatro jeitos de se machucar", item 3). Outras sessões rodam
// os seus `node`, `vite` e `playwright` na mesma máquina.
//
// Quem usa: `scripts/dev.ts`.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import {
  type ChildProcess,
  spawn,
  type SpawnOptions,
  spawnSync,
} from 'node:child_process'

/** `spawn` num shell (o Windows só acha o `pnpm.cmd` por ele) e, fora do
 * Windows, num grupo próprio (`detached`), para o `matar` levar o grupo. */
export function subirComGrupo(comando: string, opcoes: SpawnOptions = {}) {
  return spawn(comando, {
    ...opcoes,
    shell: true,
    detached: process.platform !== 'win32',
  })
}

/** Mata a árvore do filho, e não só ele: com `shell: true` o PID é o do
 * shell, e o trabalho de verdade está embaixo. No Windows é o `taskkill /T`
 * desse PID; no resto, o grupo que o `subirComGrupo` criou. Um filho que já
 * saiu fica: o PID dele pode ser de outro processo agora. */
export function matar(filho: ChildProcess) {
  const { pid } = filho
  if (pid === undefined || filho.exitCode !== null || filho.signalCode !== null)
    return
  if (process.platform === 'win32')
    spawnSync('taskkill', ['/T', '/F', '/PID', String(pid)], {
      stdio: 'ignore',
    })
  else
    try {
      process.kill(-pid, 'SIGTERM')
    } catch {
      // O grupo já tinha acabado.
    }
}

/** Mata a árvore do filho se ele passar de `ms` sem acabar, e chama
 * `aoEstourar` antes, para quem o rodou dizer por quê. O filho que acaba a
 * tempo desarma o limite. */
export function comLimite(
  filho: ChildProcess,
  ms: number,
  aoEstourar: () => void,
) {
  const limite = setTimeout(() => {
    aoEstourar()
    matar(filho)
  }, ms)
  limite.unref()
  filho.on('close', () => clearTimeout(limite))
}
