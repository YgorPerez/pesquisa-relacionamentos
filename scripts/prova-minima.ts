// A menor prova de uma mudança (ADR 0016, do ADR-0035 do Festival dos
// Macacos), de um comando só:
//
//   node scripts/prova-minima.ts                 contra o merge-base com o origin/main
//   node scripts/prova-minima.ts --base <ref>    contra o de outro ramo (origin/spec/23-mvp)
//
// Do diff contra o merge-base (`diffContra`), os commits e a árvore de
// trabalho, roda nesta ordem:
//
// 1. os tipos (`typecheck`, com os diagnósticos do Effect) de cada pacote que
//    o diff toca e do app, que importa os pacotes;
// 2. o Vitest com `--changed <base>` em cada pasta afetada (`afetados.ts`);
// 3. as pastas do app (`frontend/lint/pastas.ts`), se o app mudou;
// 4. o `vp check` nos arquivos mudados: formato, lint e tipos.
//
// Um passo que falha não para os outros. No fim, uma linha por passo, e sai
// com erro se algum falhou. Sem e2e, sem stories e sem suíte inteira: esses
// rodam no CI do PR e na `suite-do-pr.ts`. Toda rodada do Vitest aqui é
// filtrada e não espera a fila da máquina (`fila-da-maquina.ts`).
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { diffContra, planoDoDiff } from './afetados.ts'
import { RAIZ } from './portas.ts'

export type Passo = {
  readonly nome: string
  /** De onde roda, a partir da raiz do repo. */
  readonly pasta: string
  /** O programa e os argumentos dele, um por item: nenhum shell os lê, e um
   * caminho de rota como `src/routes/$tema/$slug.tsx` chega intacto. */
  readonly comando: readonly [string, ...string[]]
  /** Por que o passo não roda. */
  readonly pula?: string
}

/** O nome de cada pasta do workspace com `typecheck`. A raiz não tem o seu:
 * o `vp check` confere os tipos dos scripts. */
const PACOTES: Readonly<Record<string, string>> = {
  frontend: 'frontend',
  'packages/conteudo': '@tem-estudo/conteudo',
  'packages/regras': '@tem-estudo/regras',
}

/** Os passos da prova de um diff. `existe` diz se um arquivo do repo existe
 * (o apagado não vai para o check). */
export function planoDaProva({
  arquivos,
  base,
  existe,
}: {
  arquivos: readonly string[]
  base: string
  existe: (arquivo: string) => boolean
}): Passo[] {
  const plano = planoDoDiff(arquivos)
  const pastas = new Set(plano.pacotes)
  // O app importa os pacotes puros: o tipo que muda lá quebra aqui.
  if ([...pastas].some((p) => p.startsWith('packages/'))) pastas.add('frontend')
  const ordem = ['packages/conteudo', 'packages/regras', 'frontend', '.']
  const afetadas = ordem.filter((p) => pastas.has(p))
  const passos: Passo[] = []

  for (const pasta of afetadas) {
    const nome = PACOTES[pasta]
    if (nome)
      passos.push({
        nome: `tipos:${nome}`,
        pasta: '.',
        comando: ['pnpm', '--filter', nome, 'run', 'typecheck'],
      })
  }
  for (const pasta of afetadas)
    passos.push({
      nome: `vitest:${pasta}`,
      pasta,
      comando: [
        'pnpm',
        'exec',
        'vp',
        'test',
        'run',
        '--changed',
        base,
        '--passWithNoTests',
      ],
    })
  if (arquivos.some((a) => a.startsWith('frontend/src/')))
    passos.push({
      nome: 'pastas',
      pasta: '.',
      comando: ['node', 'frontend/lint/pastas.ts'],
    })
  const existentes = arquivos.filter(existe)
  if (existentes.length > 0)
    passos.push({
      nome: 'check',
      pasta: '.',
      comando: [
        'pnpm',
        'exec',
        'vp',
        'check',
        '--no-error-on-unmatched-pattern',
        ...existentes,
      ],
    })
  if (plano.stories)
    passos.push({
      nome: 'stories',
      pasta: 'frontend',
      comando: ['pnpm', 'test:stories'],
      pula: 'as stories rodam inteiras; rodam no CI do PR e na suite-do-pr.ts',
    })
  return passos
}

/** Roda um passo de `raiz`, com a saída na tela, e devolve o status. */
function rodarPasso(passo: Passo, raiz: string) {
  const [programa, ...args] = passo.comando
  return spawnSync(programa, args, {
    cwd: join(raiz, passo.pasta),
    // O Windows só acha o `pnpm.cmd` pelo shell; o cmd.exe não expande `$`.
    shell: process.platform === 'win32',
    stdio: 'inherit',
  }).status
}

function principal() {
  const i = process.argv.indexOf('--base')
  const contra = i === -1 ? 'origin/main' : process.argv[i + 1]
  if (contra === undefined || contra.startsWith('--')) {
    console.error('[prova] --base pede um ref: --base <ramo>.')
    return 1
  }
  const { base, arquivos } = diffContra(RAIZ, contra)
  const passos = planoDaProva({
    arquivos,
    base,
    existe: (arquivo) => existsSync(join(RAIZ, arquivo)),
  })
  console.log(
    `[prova] ${arquivos.length} arquivos mudados desde ${base.slice(0, 7)} (merge-base com ${contra})`,
  )
  const resumo: string[] = []
  let falhas = 0
  for (const passo of passos) {
    if (passo.pula !== undefined) {
      resumo.push(`[prova] pula   ${passo.nome}: ${passo.pula}`)
      continue
    }
    console.log(
      `\n[prova] ${passo.nome}: ${passo.comando.join(' ')} (em ${passo.pasta})`,
    )
    const inicio = Date.now()
    const status = rodarPasso(passo, RAIZ)
    if (status !== 0) falhas++
    resumo.push(
      `[prova] ${status === 0 ? 'ok    ' : 'FALHOU'} ${passo.nome} (${Math.round((Date.now() - inicio) / 1000)} s)`,
    )
  }
  console.log(`\n${resumo.join('\n')}`)
  console.log(
    falhas === 0
      ? '[prova] Tudo passou.'
      : `[prova] ${falhas} passo(s) falharam; a saída de cada um está acima.`,
  )
  return falhas === 0 ? 0 : 1
}

if (import.meta.main) process.exit(principal())
