import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'vite-plus/test'
import {
  entrar,
  pedidoDoPlaywright,
  pedidoDoVitest,
  type Rodada,
  vez,
} from './fila-da-maquina.ts'

const argv = (...args: string[]) => ['node', 'vitest.mjs', ...args]
const argvPw = (...args: string[]) => ['node', 'cli.js', ...args]

describe('pedidoDoVitest', () => {
  it('a suíte sem filtro é pesada', () => {
    assert.equal(pedidoDoVitest(argv('run'), 12)?.pesada, true)
    assert.equal(
      pedidoDoVitest(argv('run', '--coverage', '--maxWorkers', '3'), 12)
        ?.pesada,
      true,
    )
  })

  it('um arquivo, uma pasta ou um nome de teste é leve', () => {
    assert.equal(
      pedidoDoVitest(argv('run', 'src/a.test.ts'), 12)?.pesada,
      false,
    )
    assert.equal(pedidoDoVitest(argv('run', 'src/features'), 12)?.pesada, false)
    assert.equal(pedidoDoVitest(argv('run', '-t', 'placar'), 12)?.pesada, false)
    assert.equal(
      pedidoDoVitest(argv('run', '--project=telas'), 12)?.pesada,
      false,
    )
  })

  it('o valor de um flag não conta como filtro', () => {
    assert.equal(
      pedidoDoVitest(argv('run', '--reporter', 'dot', '--testTimeout', '9'), 12)
        ?.pesada,
      true,
    )
  })

  it('arquivos soltos pedem um worker cada, e o resto os núcleos menos um', () => {
    assert.equal(
      pedidoDoVitest(argv('run', 'a.test.ts', 'b.test.tsx'), 12)?.maximo,
      2,
    )
    assert.equal(pedidoDoVitest(argv('run', 'src/features'), 12)?.maximo, 11)
  })

  it('o modo watch não entra na fila', () => {
    assert.equal(pedidoDoVitest(argv('watch'), 12), undefined)
    assert.equal(pedidoDoVitest(argv('run', '--watch'), 12), undefined)
  })
})

describe('pedidoDoPlaywright', () => {
  it('a rodada inteira é pesada, e a filtrada é leve', () => {
    assert.equal(pedidoDoPlaywright(argvPw('test'), 4)?.pesada, true)
    assert.equal(
      pedidoDoPlaywright(argvPw('test', 'e2e/recap.e2e.ts'), 4)?.pesada,
      false,
    )
    assert.equal(
      pedidoDoPlaywright(argvPw('test', '-g', 'recap'), 4)?.pesada,
      false,
    )
  })

  it('o --workers vale mais que a config, e a fila não o diminui', () => {
    for (const args of [['--workers=2'], ['--workers', '2'], ['-j', '2']])
      assert.deepEqual(
        pedidoDoPlaywright(argvPw('test', 'x.e2e.ts', ...args), 4),
        {
          nome: `playwright test x.e2e.ts ${args.join(' ')}`,
          pesada: false,
          maximo: 2,
          fixo: true,
        },
      )
    const eu = rodada({ estado: 'esperando', maximo: 2, fixo: true })
    assert.deepEqual(vez(eu, [rodada({ pesada: true, workers: 12 })], 12), {
      entra: true,
      workers: 2,
    })
  })

  it('conta os workers do e2e, cada um com o seu Chrome', () => {
    assert.equal(pedidoDoPlaywright(argvPw('test', 'x.e2e.ts'), 4)?.maximo, 4)
  })

  it('listar, abrir o relatório ou a UI não entra na fila', () => {
    assert.equal(pedidoDoPlaywright(argvPw('test', '--list'), 4), undefined)
    assert.equal(pedidoDoPlaywright(argvPw('test', '--ui'), 4), undefined)
    assert.equal(pedidoDoPlaywright(argvPw('show-report'), 4), undefined)
    assert.equal(
      pedidoDoPlaywright(argvPw('test', '--ui-port=8080'), 4),
      undefined,
    )
  })
})

function rodada(parcial: Partial<Rodada>): Rodada {
  return {
    pid: 1,
    raiz: 'C:/r',
    nome: 'x',
    pesada: false,
    maximo: 1,
    workers: 1,
    estado: 'rodando',
    inicio: 0,
    ...parcial,
  }
}

describe('vez', () => {
  it('a pesada espera a pesada que roda, e diz qual é', () => {
    const dona = rodada({ pesada: true, workers: 12, nome: 'suite' })
    const eu = rodada({ pesada: true, estado: 'esperando', inicio: 5 })
    assert.deepEqual(vez(eu, [dona], 12), { entra: false, dona })
  })

  it('entre pesadas que esperam, entra a mais antiga', () => {
    const antes = rodada({ pesada: true, estado: 'esperando', inicio: 1 })
    const eu = rodada({ pesada: true, estado: 'esperando', inicio: 5 })
    assert.deepEqual(vez(eu, [antes], 12), { entra: false, dona: antes })
    assert.deepEqual(vez(antes, [eu], 12), { entra: true, workers: 1 })
  })

  it('a pesada leva o que pede, mesmo com leves rodando', () => {
    const leve = rodada({ workers: 6 })
    const eu = rodada({ pesada: true, estado: 'esperando', maximo: 12 })
    assert.deepEqual(vez(eu, [leve], 12), { entra: true, workers: 12 })
  })

  it('a leve nunca espera, e leva a sua parte do que sobra', () => {
    const eu = rodada({ estado: 'esperando', maximo: 11 })
    assert.deepEqual(vez(eu, [], 12), { entra: true, workers: 11 })
    assert.deepEqual(vez(eu, [rodada({ workers: 2 })], 12), {
      entra: true,
      workers: 6,
    })
    assert.deepEqual(vez(eu, [rodada({ workers: 9 })], 12), {
      entra: true,
      workers: 3,
    })
    assert.deepEqual(vez(eu, [rodada({ pesada: true, workers: 12 })], 12), {
      entra: true,
      workers: 1,
    })
  })

  it('a leve não pede mais que o seu máximo', () => {
    const eu = rodada({ estado: 'esperando', maximo: 1 })
    assert.deepEqual(vez(eu, [], 12), { entra: true, workers: 1 })
  })
})

describe('entrar', () => {
  const pasta = () => mkdtempSync(join(tmpdir(), 'fila-teste-'))
  const pesada = { nome: 'suite', pesada: true, maximo: 12 }
  const opcoes = (p: string) => ({ pasta: p, nucleos: 12, intervaloMs: 20 })

  it('a segunda pesada espera a primeira sair, e diz quem está rodando', async () => {
    const p = pasta()
    const avisos: string[] = []
    const primeira = await entrar(pesada, opcoes(p))
    let entrou = false
    const segunda = entrar(
      { ...pesada, nome: 'e2e' },
      { ...opcoes(p), avisar: (texto) => avisos.push(texto) },
    ).then((vaga) => {
      entrou = true
      return vaga
    })
    await new Promise((resolver) => setTimeout(resolver, 100))
    assert.equal(entrou, false)
    assert.match(avisos[0] ?? '', /esperando.*suite/)
    primeira.sair()
    const vaga = await segunda
    assert.equal(vaga.workers, 12)
    vaga.sair()
    assert.deepEqual(readdirSync(p), [])
  })

  it('a pesada toma a vez de uma rodada cujo processo morreu', async () => {
    const p = pasta()
    const morto = spawnSync(process.execPath, ['-e', '']).pid
    const dona = rodada({ pid: morto, pesada: true, workers: 12 })
    writeFileSync(join(p, `${morto}-a.json`), JSON.stringify(dona))
    const vaga = await entrar(pesada, opcoes(p))
    assert.equal(vaga.workers, 12)
    vaga.sair()
    assert.deepEqual(readdirSync(p), [])
  })

  it('e de uma que parou de dar sinal, se o PID foi para outro processo', async () => {
    const p = pasta()
    const dona = rodada({ pid: process.pid, pesada: true, workers: 12 })
    const arquivo = join(p, 'reusado.json')
    writeFileSync(arquivo, JSON.stringify(dona))
    const antes = new Date(Date.now() - 10 * 60_000)
    utimesSync(arquivo, antes, antes)
    const vaga = await entrar(pesada, opcoes(p))
    assert.equal(vaga.workers, 12)
    vaga.sair()
  })

  it('a leve divide com as outras que rodam', async () => {
    const p = pasta()
    const leve = { nome: 'um arquivo', pesada: false, maximo: 11 }
    const primeira = await entrar(leve, opcoes(p))
    const segunda = await entrar(leve, opcoes(p))
    assert.deepEqual([primeira.workers, segunda.workers], [11, 1])
    primeira.sair()
    segunda.sair()
  })
})
