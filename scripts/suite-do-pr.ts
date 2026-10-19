// A suíte do `pr.yml` na máquina, em quatro filas ao mesmo tempo, como o
// `suite-do-pr.ts` do Festival dos Macacos (ADR 0019). É para conferir um ramo
// antes do PR, ou um PR cujo CI não rodou. No dia a dia vale a menor prova
// (`prova-minima.ts`, ADR 0016).
//
//   node scripts/suite-do-pr.ts                       só o que o diff contra o origin/main afeta
//   node scripts/suite-do-pr.ts --base origin/spec/23-mvp
//   node scripts/suite-do-pr.ts --completa            a suíte inteira
//   node scripts/suite-do-pr.ts --plano               só diz o que rodaria
//
// Por padrão roda o que o diff afeta (`afetados.ts`): o Vitest com `--changed`
// nas pastas afetadas, as stories se o app mudou, e as specs do e2e dos termos
// que mudaram. O log diz o que pulou e por quê. A inteira roda no CI de cada PR
// e toda noite (`suite-noturna.yml`).
//
// Um passo do Vitest ou do Playwright que falha roda de novo cada arquivo que
// falhou, sozinho, uma vez (`intermitentes.ts`). Cada rodada guarda os logs e
// o manifesto numa pasta só dela (`registro-da-suite.ts`). Antes de rodar,
// lista os PRs abertos que mexem nos mesmos arquivos (`prs-sobrepostas.ts`).
//
// Cada passo que sobe Vitest ou Playwright espera a sua vez na fila da máquina
// (`fila-da-maquina.ts`). A saída de cada um vai para um log, e o terminal
// mostra só quem terminou e como; no fim, o resumo de cada um que falhou.
// Ctrl-C para só a árvore que este script subiu (`matar-arvore.ts`).
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { createHash } from 'node:crypto'
import { createWriteStream, readFileSync } from 'node:fs'
import { loadavg, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { diffContra, type Plano, planoDoDiff } from './afetados.ts'
import { type Falha, repetirFalhas } from './intermitentes.ts'
import { comLimite, matar, subirComGrupo } from './matar-arvore.ts'
import { RAIZ } from './portas.ts'
import { aviso, prsAbertos, sobrepostas } from './prs-sobrepostas.ts'
import {
  concluirRodada,
  iniciarRodada,
  type ResultadoPasso,
  type Rodada,
  resumoDoLog,
} from './registro-da-suite.ts'

export type Passo = {
  nome: string
  /** De onde roda, a partir da raiz do repo. */
  pasta: string
  comando: string
  /** Por que o passo não roda nesta rodada. */
  pula?: string
  /** Como o passo, se falha, roda de novo um arquivo que falhou. */
  repetir?: {
    ferramenta: 'vitest' | 'playwright'
    comando: (falha: Falha) => string
  }
}

/** Um argumento do shell, entre aspas: o arquivo de uma rota tem `$`. */
const citar = (texto: string) => `'${texto.replaceAll("'", `'\\''`)}'`

const vitestDeNovo = {
  ferramenta: 'vitest' as const,
  comando: ({ arquivo }: Falha) => `pnpm exec vp test run ${citar(arquivo)}`,
}
const playwrightDeNovo = {
  ferramenta: 'playwright' as const,
  comando: ({ arquivo }: Falha) =>
    `pnpm exec playwright test ${citar(arquivo)} --retries=0`,
}

/** As filas de uma rodada: as mesmas etapas dos jobs do `pr.yml`, e quem muda
 * um lá muda aqui. `plano` é o do diff, ou `null` para a suíte inteira. Cada
 * fila roda os seus passos um depois do outro, e as filas, juntas. O build e
 * o e2e ficam na mesma fila porque os dois escrevem o `frontend/.output`. */
export function filasDaSuite({
  plano,
  base,
}: {
  plano: Plano | null
  base: string
}): Passo[][] {
  const inteira = plano === null
  const app = inteira || plano.pacotes.includes('frontend')
  const semApp = app ? undefined : 'nada no front mudou'
  const testes: Passo[] = inteira
    ? [
        {
          nome: 'testes',
          pasta: '.',
          comando: 'pnpm exec vp run -r test:coverage',
          repetir: vitestDeNovo,
        },
      ]
    : plano.pacotes.map((pasta) => ({
        nome: `testes:${pasta}`,
        pasta,
        comando: `pnpm exec vp test run --changed ${base} --passWithNoTests`,
        repetir: vitestDeNovo,
      }))
  const specs = plano?.specs ?? []
  return [
    [
      { nome: 'check', pasta: '.', comando: 'pnpm exec vp check' },
      {
        nome: 'pastas',
        pasta: '.',
        comando: 'node frontend/lint/pastas.ts',
        pula: semApp,
      },
      ...testes,
      // A `fallow health` lê a cobertura da suíte inteira: com a de alguns
      // testes, a nota cairia sem nada ter piorado.
      {
        nome: 'fallow',
        pasta: 'frontend',
        comando: inteira
          ? 'pnpm run fallow'
          : 'pnpm exec fallow dead-code && pnpm exec fallow dupes',
        pula: semApp,
      },
      {
        nome: 'doctor',
        pasta: 'frontend',
        comando: 'pnpm run doctor',
        pula: semApp,
      },
    ],
    [
      { nome: 'tipos', pasta: '.', comando: 'pnpm typecheck' },
      {
        nome: 'supressoes',
        pasta: '.',
        comando: `node .github/scripts/supressoes.ts --base ${base}`,
      },
    ],
    [
      {
        nome: 'stories',
        pasta: 'frontend',
        comando: 'pnpm test:stories',
        pula: inteira || plano.stories ? undefined : 'nada no app mudou',
        repetir: vitestDeNovo,
      },
    ],
    [
      {
        nome: 'build',
        pasta: '.',
        comando: 'pnpm build',
        pula: inteira || plano.build ? undefined : 'nada que o build lê mudou',
      },
      {
        nome: 'storybook',
        pasta: '.',
        comando: 'pnpm build-storybook',
        pula: inteira || plano.stories ? undefined : 'nada no app mudou',
      },
      {
        nome: 'e2e',
        pasta: 'frontend',
        comando: inteira ? 'pnpm e2e' : `pnpm e2e ${specs.join(' ')}`,
        pula:
          inteira || specs.length > 0
            ? undefined
            : 'nenhuma spec percorre o que mudou',
        repetir: playwrightDeNovo,
      },
    ],
  ]
}

/** Roda um passo, com o log dele, e diz como acabou. */
function rodar(
  { nome, pasta, comando }: Passo,
  logs: string,
  filhos: Set<ReturnType<typeof subirComGrupo>>,
  nomeDoLog = nome,
) {
  const log = join(logs, `${nomeDoLog.replaceAll(/[:/.]/g, '-')}.log`)
  const saida = createWriteStream(log)
  const inicio = Date.now()
  const filho = subirComGrupo(comando, {
    cwd: resolve(RAIZ, pasta),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  filhos.add(filho)
  filho.stdout?.pipe(saida)
  filho.stderr?.pipe(saida)
  // Pendurado, ele seguraria a fila dele e a suíte inteira.
  comLimite(filho, 30 * 60_000, () =>
    saida.write(
      `\n[suite] ${nome} passou de 30 min sem acabar: parei a árvore dele.\n`,
    ),
  )
  return new Promise<ResultadoPasso>((pronto) =>
    filho.on('close', (codigo) => {
      filhos.delete(filho)
      const passou = codigo === 0
      console.log(
        `[suite] ${passou ? 'ok    ' : 'FALHOU'} ${nomeDoLog} (${Math.round((Date.now() - inicio) / 1000)} s)`,
      )
      saida.end(() => pronto({ nome, log, passou }))
    }),
  )
}

async function principal() {
  const argv = process.argv.slice(2)
  const completa = argv.includes('--completa')
  const i = argv.indexOf('--base')
  const contra = i === -1 ? 'origin/main' : argv[i + 1]
  if (!contra || contra.startsWith('--')) {
    console.error('[suite] --base pede um ref: --base <ramo>.')
    return 1
  }
  const { base, arquivos } = diffContra(RAIZ, contra)
  const plano = completa ? null : planoDoDiff(arquivos)
  const inteira = plano === null || plano.completo !== null
  const filas = filasDaSuite({ plano: inteira ? null : plano, base })

  if (plano === null)
    console.log('[suite] a suíte inteira: pedida com --completa')
  else if (plano.completo)
    console.log(`[suite] a suíte inteira: ${plano.completo}`)
  else {
    console.log(
      `[suite] só o afetado desde ${base.slice(0, 7)} (merge-base com ${contra}), ${arquivos.length} arquivos`,
    )
    for (const motivo of plano.motivos) console.log(`[suite] ${motivo}`)
  }
  for (const passo of filas.flat())
    if (passo.pula) console.log(`[suite] pula   ${passo.nome}: ${passo.pula}`)

  const abertos = arquivos.length > 0 ? prsAbertos(RAIZ) : []
  if ('motivo' in abertos)
    console.log(`[suite] sem a lista de PRs abertos: ${abertos.motivo}`)
  else {
    const linhas = aviso(
      sobrepostas(arquivos, abertos, [contra.replace(/^origin\//, '')]),
    )
    if (linhas.length > 0)
      console.log(
        '[suite] PRs abertos que mexem nos mesmos arquivos; confira se não é o mesmo trabalho:',
      )
    for (const linha of linhas) console.log(`[suite]   ${linha}`)
  }
  if (argv.includes('--plano')) return 0

  // Uma pasta por checkout, pelo hash do caminho, como as portas.
  const diretorioLogs = join(
    tmpdir(),
    'suite-do-pr-tem-estudo',
    createHash('sha256').update(RAIZ).digest('hex').slice(0, 8),
  )
  const aRodar = filas.map((fila) => fila.filter((p) => !p.pula))
  const rodada: Rodada = iniciarRodada({
    raiz: RAIZ,
    base,
    completa: inteira,
    passos: aRodar.flat().map((p) => p.nome),
    pulados: Object.fromEntries(
      filas.flat().flatMap((p) => (p.pula ? [[p.nome, p.pula]] : [])),
    ),
    diretorioLogs,
  })
  console.log(`[suite] rodada ${rodada.id}, logs em ${rodada.pasta}`)
  const filhos = new Set<ReturnType<typeof subirComGrupo>>()
  const feitos: ResultadoPasso[] = []
  for (const sinal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const)
    process.on(sinal, () => {
      for (const filho of filhos) matar(filho)
      concluirRodada(rodada, feitos, { interrompida: true })
      process.exit(130)
    })

  const rodarPasso = async (passo: Passo) => {
    const resultado = await rodar(passo, rodada.pasta, filhos)
    const final = passo.repetir
      ? await repetirFalhas({
          passo: passo.nome,
          resultado,
          ferramenta: passo.repetir.ferramenta,
          carga: loadavg(),
          rodarDeNovo: (falha, vez) =>
            rodar(
              {
                ...passo,
                pasta: falha.pasta ?? passo.pasta,
                comando: passo.repetir?.comando(falha) ?? '',
              },
              rodada.pasta,
              filhos,
              `${passo.nome}-repeticao-${vez}`,
            ),
          dizer: (texto) => console.log(`[suite] ${texto}`),
        })
      : resultado
    feitos.push(final)
    return final
  }
  await Promise.all(
    aRodar.map(async (fila) => {
      // Um passo que falha não para os seguintes: o fim mostra todas as
      // falhas de uma vez.
      for (const passo of fila) await rodarPasso(passo)
    }),
  )

  const falhas = feitos.filter((r) => !r.passou)
  for (const { nome, log } of falhas) {
    console.log(`\n[suite] ${nome}, fim de ${log}:`)
    console.log(resumoDoLog(readFileSync(log, 'utf8')))
  }
  for (const { passo, arquivo, log } of feitos.flatMap(
    (r) => r.intermitentes ?? [],
  ))
    console.log(
      `[suite] intermitente: ${arquivo}, no ${passo}, passou sozinho (${log})`,
    )
  const { manifesto } = concluirRodada(rodada, feitos)
  console.log(`[suite] manifesto em ${manifesto}`)
  console.log(
    falhas.length === 0
      ? '\n[suite] Tudo passou.'
      : `\n[suite] ${falhas.length} de ${feitos.length} falharam.`,
  )
  return falhas.length === 0 ? 0 : 1
}

if (import.meta.main) process.exit(await principal())
