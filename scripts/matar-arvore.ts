// Sobe um filho num grupo de processos só dele e, para pará-lo, para a árvore
// inteira pelo PID que o `spawn` deu, nunca por nome ou padrão (ADR 0011,
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

/** Os PIDs abaixo de `pid`, pelo PID pai de cada processo (`ps`). Pega quem
 * abriu um grupo próprio, como o Vite que o `vp dev` sobe. */
function descendentes(pid: number) {
  const { stdout } = spawnSync('ps', ['-A', '-o', 'pid=,ppid='], {
    encoding: 'utf8',
  })
  const filhos = new Map<number, number[]>()
  for (const linha of (stdout ?? '').split('\n')) {
    const [p, pai] = linha.trim().split(/\s+/).map(Number)
    if (!p || !pai) continue
    filhos.set(pai, [...(filhos.get(pai) ?? []), p])
  }
  const achados: number[] = []
  const fila = [pid]
  while (fila.length > 0)
    for (const p of filhos.get(fila.shift()!) ?? []) {
      achados.push(p)
      fila.push(p)
    }
  return achados
}

/** Mata a árvore do filho, e não só ele: com `shell: true` o PID é o do
 * shell, e o trabalho de verdade está embaixo. No Windows é o `taskkill /T`
 * desse PID; no resto, o grupo que o `subirComGrupo` criou e cada
 * descendente achado pelo PID pai, que pode ter saído do grupo. Um filho que
 * já saiu fica: o PID dele pode ser de outro processo agora. */
export function matar(filho: ChildProcess) {
  const { pid } = filho
  if (pid === undefined || filho.exitCode !== null || filho.signalCode !== null)
    return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/T', '/F', '/PID', String(pid)], {
      stdio: 'ignore',
    })
    return
  }
  // A lista sai antes do sinal: um processo morto some da árvore, e o neto
  // dele vai para o init.
  const abaixo = descendentes(pid)
  for (const alvo of [-pid, ...abaixo])
    try {
      process.kill(alvo, 'SIGTERM')
    } catch {
      // Já tinha acabado.
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
