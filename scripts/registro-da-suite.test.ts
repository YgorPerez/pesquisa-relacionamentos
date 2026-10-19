// Cada teste num repositório git temporário: nenhum escreve no `.git` daqui.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import {
  concluirRodada,
  iniciarRodada,
  type Rodada,
  resumoDoLog,
  semGitDoHook,
} from './registro-da-suite.ts'

const temporarios: string[] = []
afterEach(() => {
  for (const pasta of temporarios.splice(0))
    rmSync(pasta, { recursive: true, force: true })
})

function pastaTemporaria(prefixo: string) {
  const pasta = mkdtempSync(join(tmpdir(), prefixo))
  temporarios.push(pasta)
  return pasta
}

function git(raiz: string, ...args: string[]) {
  const resultado = spawnSync('git', args, {
    cwd: raiz,
    encoding: 'utf8',
    env: semGitDoHook(),
  })
  if (resultado.status !== 0)
    throw new Error(`git ${args.join(' ')}: ${resultado.stderr}`)
  return resultado.stdout.trim()
}

function repositorio() {
  const raiz = pastaTemporaria('registro-suite-')
  git(raiz, 'init', '-q')
  git(raiz, 'config', 'user.email', 'teste@local')
  git(raiz, 'config', 'user.name', 'Teste')
  writeFileSync(join(raiz, 'app.txt'), 'primeira versão')
  git(raiz, 'add', 'app.txt')
  git(raiz, 'commit', '-qm', 'primeira')
  return { raiz, diretorioLogs: pastaTemporaria('logs-suite-') }
}

const PASSOS = ['tipos', 'testes']

/** Os passos como se fossem da suíte: cada um grava o seu log na pasta da
 * rodada. */
function passos(rodada: Rodada, falha?: string) {
  return PASSOS.map((nome) => {
    const log = join(rodada.pasta, `${nome}.log`)
    writeFileSync(log, `saída de ${nome} na rodada ${rodada.id}`)
    return { nome, log, passou: nome !== falha }
  })
}

const abrir = (raiz: string, diretorioLogs: string) =>
  iniciarRodada({
    raiz,
    base: 'origin/main',
    completa: true,
    passos: PASSOS,
    diretorioLogs,
  })

const manifesto = (arquivo: string) => JSON.parse(readFileSync(arquivo, 'utf8'))

describe('a rodada da suíte', () => {
  it('duas rodadas do mesmo commit guardam cada uma os seus logs', () => {
    const { raiz, diretorioLogs } = repositorio()
    const primeira = abrir(raiz, diretorioLogs)
    const segunda = abrir(raiz, diretorioLogs)
    concluirRodada(primeira, passos(primeira))
    concluirRodada(segunda, passos(segunda))
    expect(primeira.pasta).not.toBe(segunda.pasta)
    expect(readFileSync(join(primeira.pasta, 'tipos.log'), 'utf8')).toContain(
      primeira.id,
    )
  })

  it('verde, com cada passo rodado, passou; o manifesto diz que a árvore não mudou', () => {
    const { raiz, diretorioLogs } = repositorio()
    const rodada = abrir(raiz, diretorioLogs)
    const fim = concluirRodada(rodada, passos(rodada))
    expect(fim.passou).toBe(true)
    expect(manifesto(fim.manifesto)).toMatchObject({
      passou: true,
      mesmaArvore: true,
      estadoFim: { limpa: true },
    })
  })

  it('não passou a com um passo vermelho, a que não rodou um passo, nem a interrompida', () => {
    const { raiz, diretorioLogs } = repositorio()
    const vermelha = abrir(raiz, diretorioLogs)
    expect(concluirRodada(vermelha, passos(vermelha, 'testes')).passou).toBe(
      false,
    )
    const curta = abrir(raiz, diretorioLogs)
    expect(concluirRodada(curta, passos(curta).slice(0, 1)).passou).toBe(false)
    const parada = abrir(raiz, diretorioLogs)
    expect(
      concluirRodada(parada, passos(parada), { interrompida: true }).passou,
    ).toBe(false)
  })

  it('o manifesto diz quando a árvore mudou no meio, e junta os intermitentes', () => {
    const { raiz, diretorioLogs } = repositorio()
    const rodada = abrir(raiz, diretorioLogs)
    writeFileSync(join(raiz, 'app.txt'), 'mudou no meio')
    const intermitente = {
      passo: 'testes',
      arquivo: 'src/a.test.ts',
      carga: [1, 1, 1],
      log: '/x.log',
    }
    const feitos = passos(rodada).map((p) => ({
      ...p,
      intermitentes: p.nome === 'testes' ? [intermitente] : [],
    }))
    const fim = manifesto(concluirRodada(rodada, feitos).manifesto)
    expect(fim.mesmaArvore).toBe(false)
    expect(fim.intermitentes).toEqual([intermitente])
  })
})

describe('semGitDoHook', () => {
  it('tira as variáveis GIT_ que o hook herda', () => {
    expect(
      semGitDoHook({ GIT_DIR: '/x', GIT_INDEX_FILE: '/y', PATH: '/bin' }),
    ).toEqual({ PATH: '/bin' })
  })
})

describe('resumoDoLog', () => {
  const COBERTURA = [
    '% Coverage report from v8',
    '-----------------|---------|----------|---------|---------|-------------------',
    'File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s',
    '-----------------|---------|----------|---------|---------|-------------------',
    ...Array.from(
      { length: 80 },
      (_, i) =>
        ` src/arquivo-${i}.ts |   91.2 |    80.5 |     100 |    91.2 | 12-14`,
    ),
    '-----------------|---------|----------|---------|---------|-------------------',
  ]

  it('mostra o teste e o primeiro erro do Vitest, mesmo com a cobertura no fim', () => {
    const log = [
      ' RUN  v5.0.5 /repo/frontend',
      ' ✓ src/ui/laco.test.ts (4 tests) 12ms',
      ' × src/estado/perfil.test.ts > o perfil > guarda a idade 8ms',
      '',
      ' FAIL  src/estado/perfil.test.ts > o perfil > guarda a idade',
      'AssertionError: expected 2 to be 3 // Object.is equality',
      ' ❯ src/estado/perfil.test.ts:41:18',
      '',
      ' Test Files  1 failed | 1 passed (2)',
      '      Tests  1 failed | 4 passed (5)',
      ...COBERTURA,
    ].join('\n')

    const resumo = resumoDoLog(log)

    expect(resumo).toMatch(/perfil\.test\.ts > o perfil > guarda a idade/)
    expect(resumo).toMatch(/AssertionError: expected 2 to be 3/)
    expect(resumo).toMatch(/1 failed \| 4 passed/)
    expect(resumo).not.toMatch(/arquivo-40\.ts/)
  })

  it('tira também o resumo de texto da cobertura', () => {
    const log = [
      ' Test Files  12 passed (12)',
      '=============================== Coverage summary ===============================',
      'Statements   : 61.93% ( 641/1035 )',
      'Lines        : 62.27% ( 581/933 )',
      '================================================================================',
      'ERROR: Coverage for lines (59%) does not meet global threshold (60%)',
    ].join('\n')
    const fim = resumoDoLog(log).split('fim do log, sem a cobertura:')[1]
    expect(fim).toMatch(/does not meet/)
    expect(fim).not.toMatch(/Statements/)
  })

  it('guarda no fim a linha com muitas barras que não é da cobertura', () => {
    const erro =
      'src/a.ts(3,7): error TS2322: Type \'"a" | "b" | "c" | "d" | "e"\' is not assignable to type \'never\'.'
    const log = [
      ...COBERTURA,
      erro,
      ' ELIFECYCLE  Command failed with exit code 2.',
    ].join('\n')

    const fim = resumoDoLog(log).split('fim do log, sem a cobertura:')[1]

    expect(fim).toMatch(/error TS2322: Type '"a" \| "b"/)
    expect(fim).toMatch(/ELIFECYCLE/)
    expect(fim).not.toMatch(/arquivo-40\.ts|% Stmts|-----\|/)
  })

  it('sem teste nem erro reconhecido, as últimas linhas', () => {
    const log = Array.from({ length: 40 }, (_, i) => `linha ${i}`).join('\n')
    const resumo = resumoDoLog(log)
    expect(resumo).toMatch(/linha 39/)
    expect(resumo).not.toMatch(/linha 5\n/)
  })
})
