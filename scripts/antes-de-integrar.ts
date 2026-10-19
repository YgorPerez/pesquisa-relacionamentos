// O que o `pnpm check` barra no fim e se confere em segundos, como o
// `antes-de-integrar.ts` do Festival dos Macacos: rode antes de integrar, e o
// `integrar-main.ts` roda antes da suíte.
//
//   node scripts/antes-de-integrar.ts [--base <ref>]   (padrão: origin/main)
//
// Só quando o diff desde a base mexe em `frontend/`:
//
// 1. `fallow dead-code`: export sem uso;
// 2. `pnpm run doctor`: o React Doctor, que barra o que o React Compiler não
//    aceita e a prop copiada para um `useState`;
// 3. a saúde da fallow contra a da base. O `pnpm check` exige `fallow health`
//    ≥ 90 com a cobertura do front, e o front fica perto disso: 0,1 a menos
//    já o deixa vermelho. Sem a cobertura, a nota absoluta é outra, mas
//    as penalidades são as mesmas, e nenhuma pode subir. As duas que sobem
//    com um diff comum são as que a nota da fallow conta assim
//    (https://fallow.tools/docs/explanations/health/):
//    - acoplamento: a parte dos arquivos com fan-in acima de
//      max(p95 do fan-in, 10), vezes 0,5. Um arquivo sem função nenhuma (só
//      tipos e constantes) não conta; dar uma função a um que muitos importam
//      o faz contar;
//    - tamanho: as funções de mais de 60 linhas por mil funções, vezes 0,5.
//
// Sai 1 com o que piorou e como consertar; 0 sem nada. Roda no `node` puro.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RAIZ } from './portas.ts'

/** O que a saúde da fallow diz de uma árvore, no que um diff mexe. */
export type Saude = {
  penalidades: Record<string, number>
  funcoesAcimaDe60PorMil: number
  /** Os arquivos com fan-in acima do limite do acoplamento. */
  acoplados: string[]
}

type JsonDaSaude = {
  health_score: { penalties: Record<string, number> }
  vital_signs: { functions_over_60_loc_per_k: number; p95_fan_in: number }
  file_scores: { path: string; fan_in: number }[]
}

/** A saúde, do JSON de `fallow health --format json`. Os caminhos ficam
 * relativos a `frontend/`, para a base, lida noutra pasta, comparar. */
export function lerSaude(json: JsonDaSaude): Saude {
  const limite = Math.max(json.vital_signs.p95_fan_in, 10)
  return {
    penalidades: json.health_score.penalties,
    funcoesAcimaDe60PorMil: json.vital_signs.functions_over_60_loc_per_k,
    acoplados: json.file_scores
      .filter(({ fan_in }) => fan_in > limite)
      .map(({ path }) => path.split(/[\\/]frontend[\\/]/).at(-1) ?? path)
      .sort(),
  }
}

/** As penalidades que as frases de cima já dizem, e a dos hotspots, que sai
 * do histórico do git: a base, tirada dele, não tem histórico, e a suíte nem a
 * conta (N/A). */
const JA_DITAS = ['coupling', 'unit_size', 'hotspots']

/** O que piorou de `antes` para `depois`, uma frase por coisa, com o
 * conserto. Vazia quando nada piorou. */
export function pioras(antes: Saude, depois: Saude): string[] {
  const frases: string[] = []
  const novos = depois.acoplados.filter((a) => !antes.acoplados.includes(a))
  if (novos.length > 0 && depois.acoplados.length > antes.acoplados.length)
    frases.push(
      `acoplamento: ${novos.join(', ')} passou a ter fan-in acima do limite (max(p95, 10)). ` +
        'Ponha o que é novo num módulo pequeno, que só quem usa importa, e não num que muitos importam.',
    )
  if (depois.funcoesAcimaDe60PorMil > antes.funcoesAcimaDe60PorMil)
    frases.push(
      `tamanho: as funções de mais de 60 linhas foram de ${antes.funcoesAcimaDe60PorMil} para ${depois.funcoesAcimaDe60PorMil} por mil. ` +
        'Divida a função que passou de 60 linhas em componentes ou funções menores.',
    )
  for (const [nome, valor] of Object.entries(depois.penalidades)) {
    const antes_ = antes.penalidades[nome] ?? 0
    if (valor > antes_ && !JA_DITAS.includes(nome))
      frases.push(
        `a penalidade ${nome} da fallow foi de ${antes_} para ${valor}.`,
      )
  }
  return frases
}

function rodar(cwd: string, comando: string, args: string[]) {
  return spawnSync(comando, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
}

function saudeEm(pasta: string, fallow: string): Saude {
  const { stdout, status, stderr } = rodar(pasta, fallow, [
    'health',
    '--format',
    'json',
  ])
  if (!stdout.trim())
    throw new Error(`fallow health não respondeu (${status}): ${stderr}`)
  return lerSaude(JSON.parse(stdout) as JsonDaSaude)
}

/** A saúde da base: o `frontend/` dela, tirado do git numa pasta à parte. */
function saudeDaBase(base: string, fallow: string): Saude {
  const pasta = mkdtempSync(join(tmpdir(), 'antes-de-integrar-'))
  try {
    const arquivo = spawnSync(
      'git',
      ['archive', '--format=tar', base, 'frontend'],
      { cwd: RAIZ, maxBuffer: 1024 * 1024 * 1024 },
    )
    const extrair = spawnSync('tar', ['-x', '-C', pasta], {
      input: arquivo.stdout,
    })
    if (arquivo.status !== 0 || extrair.status !== 0)
      throw new Error(`não deu para tirar o frontend de ${base} do git.`)
    return saudeEm(join(pasta, 'frontend'), fallow)
  } finally {
    rmSync(pasta, { recursive: true, force: true })
  }
}

function principal() {
  const i = process.argv.indexOf('--base')
  const base = i === -1 ? 'origin/main' : process.argv[i + 1]
  if (!base) {
    console.error('uso: node scripts/antes-de-integrar.ts [--base <ref>]')
    return 1
  }
  const diff = rodar(RAIZ, 'git', ['diff', '--name-only', `${base}...HEAD`])
  if (diff.status !== 0) {
    console.error(`[antes] git diff ${base}...HEAD: ${diff.stderr.trim()}`)
    return 1
  }
  if (!diff.stdout.split('\n').some((a) => a.startsWith('frontend/'))) {
    console.error('[antes] o diff não mexe no frontend: nada a conferir.')
    return 0
  }
  const front = join(RAIZ, 'frontend')
  const fallow = join(front, 'node_modules/.bin/fallow')
  if (!existsSync(fallow)) {
    console.error(
      '[antes] sem frontend/node_modules: rode `node scripts/preparar-worktree.ts`. A suíte confere o resto.',
    )
    return 0
  }
  // A base da comparação é o merge-base: a branch atrás da main não leva a
  // culpa do que a main trouxe depois.
  const comum = rodar(RAIZ, 'git', ['merge-base', base, 'HEAD']).stdout.trim()
  const falhas: string[] = []

  const mortos = rodar(front, fallow, ['dead-code'])
  if (mortos.status !== 0)
    falhas.push(`fallow dead-code:\n${mortos.stdout}${mortos.stderr}`)
  const doctor = rodar(front, 'pnpm', ['run', 'doctor'])
  if (doctor.status !== 0)
    falhas.push(`pnpm run doctor:\n${doctor.stdout}${doctor.stderr}`)
  const piorou = pioras(saudeDaBase(comum, fallow), saudeEm(front, fallow))
  if (piorou.length > 0)
    falhas.push(
      `fallow health piorou desde ${base}, e o \`pnpm check\` exige ≥ 90 com a cobertura do front:\n- ${piorou.join('\n- ')}`,
    )

  for (const falha of falhas) console.error(`[antes] ${falha}`)
  if (falhas.length > 0) return 1
  console.error(
    '[antes] fallow dead-code, doctor e a saúde da fallow estão como na base.',
  )
  return 0
}

if (import.meta.main) process.exit(principal())
