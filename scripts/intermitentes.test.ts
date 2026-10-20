// Que arquivo o log de um passo diz que falhou, a repetição de cada um, e o
// aviso na issue "Testes intermitentes". Os logs são os que o Festival dos
// Macacos gravou, de onde estes testes vieram.

import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'vite-plus/test'
import {
  avisarNaIssue,
  comentarioDosIntermitentes,
  type Falha,
  falhasDoLog,
  MAXIMO_DE_REPETICOES,
  repetirFalhas,
} from './intermitentes.ts'
import type { Gh } from './issue-por-titulo.ts'

const FRONT = '/repo/frontend'

/** O log de um passo que falhou, num arquivo temporário. */
function logDoPasso(linhas: string[]) {
  const arquivo = join(mkdtempSync(join(tmpdir(), 'intermitentes-')), 'p.log')
  writeFileSync(arquivo, linhas.join('\n'))
  return arquivo
}

/** O log de um Vitest em que `arquivos` falharam. */
const vitestVermelho = (arquivos: string[]) =>
  logDoPasso([
    ` RUN  v5.0.4 ${FRONT}`,
    ...arquivos.map((arquivo) => ` FAIL  ${arquivo} > um teste`),
    ` Test Files  ${arquivos.length} failed | 10 passed (${arquivos.length + 10})`,
  ])

/** Uma repetição falsa: anota cada arquivo e passa, a não ser os de
 * `vermelhos`. */
function repeticoes(vermelhos: string[] = []) {
  const rodadas: { falha: Falha; vez: number }[] = []
  const rodarDeNovo = async (falha: Falha, vez: number) => {
    rodadas.push({ falha, vez })
    return {
      log: `/logs/repeticao-${vez}.log`,
      passou: !vermelhos.includes(falha.arquivo),
    }
  }
  return { rodadas, rodarDeNovo }
}

describe('repetirFalhas', () => {
  it('roda cada arquivo que falhou uma vez, sozinho, e com todos verdes o passo passa com os intermitentes', async () => {
    const log = vitestVermelho(['src/a.test.ts', 'src/b.test.ts'])
    const { rodadas, rodarDeNovo } = repeticoes()

    const final = await repetirFalhas({
      passo: 'front:testes',
      resultado: { nome: 'front:testes', log, passou: false },
      ferramenta: 'vitest',
      carga: [41, 40, 39],
      rodarDeNovo,
    })

    assert.deepEqual(
      rodadas.map(({ falha, vez }) => [falha.arquivo, falha.pasta, vez]),
      [
        ['src/a.test.ts', FRONT, 1],
        ['src/b.test.ts', FRONT, 2],
      ],
    )
    assert.equal(final.passou, true)
    assert.equal(final.log, log)
    assert.deepEqual(final.intermitentes, [
      {
        passo: 'front:testes',
        arquivo: 'src/a.test.ts',
        carga: [41, 40, 39],
        log: '/logs/repeticao-1.log',
      },
      {
        passo: 'front:testes',
        arquivo: 'src/b.test.ts',
        carga: [41, 40, 39],
        log: '/logs/repeticao-2.log',
      },
    ])
  })

  it('o arquivo que falha de novo deixa o passo vermelho e para a repetição', async () => {
    const { rodadas, rodarDeNovo } = repeticoes(['src/a.test.ts'])

    const final = await repetirFalhas({
      passo: 'back:testes',
      resultado: {
        log: vitestVermelho(['src/a.test.ts', 'src/b.test.ts']),
        passou: false,
      },
      ferramenta: 'vitest',
      carga: [1, 1, 1],
      rodarDeNovo,
    })

    assert.equal(final.passou, false)
    assert.equal(final.intermitentes, undefined)
    assert.deepEqual(
      rodadas.map(({ falha }) => falha.arquivo),
      ['src/a.test.ts'],
    )
  })

  it('não repete o que o log não pina num arquivo, e diz por quê', async () => {
    const { rodadas, rodarDeNovo } = repeticoes()
    const ditos: string[] = []

    const final = await repetirFalhas({
      passo: 'e2e',
      resultado: {
        log: logDoPasso([
          'Error: Timed out waiting 180000ms from config.webServer.',
        ]),
        passou: false,
      },
      ferramenta: 'playwright',
      carga: [1, 1, 1],
      rodarDeNovo,
      dizer: (texto) => ditos.push(texto),
    })

    assert.equal(final.passou, false)
    assert.deepEqual(rodadas, [])
    assert.match(
      ditos.join('\n'),
      /e2e sem repetição: o log não diz qual arquivo/,
    )
  })

  it('o passo verde volta como veio, sem ler o log', async () => {
    const { rodadas, rodarDeNovo } = repeticoes()
    const verde = { log: '/não/existe.log', passou: true }

    const final = await repetirFalhas({
      passo: 'front:testes',
      resultado: verde,
      ferramenta: 'vitest',
      carga: [1, 1, 1],
      rodarDeNovo,
    })

    assert.equal(final, verde)
    assert.deepEqual(rodadas, [])
  })
})

/** Um `gh` falso: anota cada chamada e responde pela `issue list`. */
function ghFalso(abertas: { number: number; title: string }[]) {
  const chamadas: { args: string[]; entrada?: string }[] = []
  const gh: Gh = (args, entrada) => {
    chamadas.push({ args, entrada })
    if (args[1] === 'list') return JSON.stringify(abertas)
    if (args[1] === 'create') return 'https://github.com/dono/repo/issues/77'
    return ''
  }
  return { gh, chamadas }
}

const UM = [
  {
    passo: 'front:testes',
    arquivo: 'src/a.test.ts',
    carga: [1, 2, 3],
    log: '/logs/repeticao-1.log',
  },
]

describe('avisarNaIssue', () => {
  it('comenta na issue aberta com o título exato, sem abrir outra', () => {
    const { gh, chamadas } = ghFalso([
      { number: 5, title: 'Testes intermitentes no e2e' },
      { number: 9, title: 'Testes intermitentes' },
    ])

    assert.deepEqual(avisarNaIssue(gh, 'abc1234def', UM), { issue: 9 })
    assert.deepEqual(
      chamadas.map(({ args }) => args.slice(0, 3).join(' ')),
      ['issue list --state', 'issue comment 9'],
    )
    assert.match(chamadas[1]?.entrada ?? '', /src\/a\.test\.ts/)
  })

  it('sem a issue aberta, abre e comenta nela', () => {
    const { gh, chamadas } = ghFalso([])

    assert.deepEqual(avisarNaIssue(gh, 'abc1234def', UM), { issue: 77 })
    assert.deepEqual(
      chamadas.map(({ args }) => args.slice(0, 2).join(' ')),
      ['issue list', 'issue create', 'issue comment'],
    )
  })

  it('o gh que falha vira o erro, sem lançar', () => {
    const gh: Gh = () => {
      throw new Error('gh issue list: sem rede')
    }

    assert.deepEqual(avisarNaIssue(gh, 'abc1234def', UM), {
      erro: 'gh issue list: sem rede',
    })
  })
})

describe('falhasDoLog, no Vitest', () => {
  it('acha o arquivo que falhou, o projeto e a pasta do RUN, uma vez por arquivo', () => {
    const log = [
      ` RUN  v5.0.4 ${FRONT}`,
      '',
      ' FAIL  |telas| src/routes/c/$slug/telao.test.tsx > na concluída, a pílula diz que é o placar final',
      ' FAIL  |telas| src/routes/c/$slug/telao.test.tsx > com a TV ligada, o Publicar leva o telão à cerimônia',
      '',
      ' Test Files  1 failed | 383 passed (384)',
      '      Tests  2 failed | 2000 passed (2002)',
    ].join('\n')

    assert.deepEqual(falhasDoLog(log, 'vitest'), {
      falhas: [
        {
          pasta: FRONT,
          arquivo: 'src/routes/c/$slug/telao.test.tsx',
          projeto: 'telas',
        },
      ],
    })
  })

  it('no backend, cada arquivo leva a pasta do pacote em que rodou', () => {
    const log = [
      ' RUN  v5.0.4 /repo/packages/rules',
      ' Test Files  19 passed (19)',
      ' RUN  v5.0.4 /repo/backend',
      ' FAIL  src/temporadas/eu.test.ts > a Temporada Eu responde a tempo',
      ' FAIL  src/boulders/rotas.test.ts [ src/boulders/rotas.test.ts ]',
      ' Test Files  2 failed | 120 passed (122)',
    ].join('\n')

    assert.deepEqual(falhasDoLog(log, 'vitest'), {
      falhas: [
        { pasta: '/repo/backend', arquivo: 'src/temporadas/eu.test.ts' },
        { pasta: '/repo/backend', arquivo: 'src/boulders/rotas.test.ts' },
      ],
    })
  })

  it('não repete o que não é só um arquivo que falhou', () => {
    const casos: [string, string[], RegExp][] = [
      [
        'erro fora de um teste',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ' FAIL  src/a.test.ts > um',
          '⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯',
          ' Test Files  1 failed | 3 passed (4)',
          '     Errors  1 error',
        ],
        /fora de um teste/,
      ],
      [
        'cobertura',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ' FAIL  src/a.test.ts > um',
          ' Test Files  1 failed | 3 passed (4)',
          'ERROR: Coverage for lines (80%) does not meet global threshold (90%)',
        ],
        /cobertura/,
      ],
      [
        'o resumo conta mais arquivos',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ' FAIL  src/a.test.ts > um',
          ' Test Files  2 failed | 3 passed (5)',
        ],
        /resumo/,
      ],
      [
        'nenhum arquivo',
        [` RUN  v5.0.4 ${FRONT}`, ' Test Files  3 passed (3)', 'ELIFECYCLE'],
        /não diz qual arquivo/,
      ],
      [
        'um Vitest que acabou sem o resumo',
        [
          ' RUN  v5.0.4 /repo/packages/rules',
          ' FAIL  src/a.test.ts > um',
          ' Test Files  1 failed | 3 passed (4)',
          ' RUN  v5.0.4 /repo/backend',
          'Error: falhou ao carregar a configuração',
        ],
        /sem o resumo/,
      ],
      [
        'o limite de tempo',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ' FAIL  src/a.test.ts > um',
          '[suite] front:testes passou de 30 min sem acabar: parei a árvore dele.',
        ],
        /limite/,
      ],
      [
        'muitos arquivos',
        [
          ` RUN  v5.0.4 ${FRONT}`,
          ...Array.from(
            { length: MAXIMO_DE_REPETICOES + 1 },
            (_, i) => ` FAIL  src/t${i}.test.ts > um`,
          ),
          ` Test Files  ${MAXIMO_DE_REPETICOES + 1} failed | 3 passed (9)`,
        ],
        /mais que/,
      ],
    ]
    for (const [nome, linhas, motivo] of casos) {
      const achado = falhasDoLog(linhas.join('\n'), 'vitest')
      assert.ok('motivo' in achado, nome)
      assert.match(achado.motivo, motivo, nome)
    }
  })

  it('lê o log com as cores do terminal', () => {
    const log = `\u001b[1m RUN \u001b[22m v5.0.4 ${FRONT}\n\u001b[31m FAIL \u001b[39m src/a.test.ts > um\n Test Files  \u001b[31m1 failed\u001b[39m | 3 passed (4)`

    assert.deepEqual(falhasDoLog(log, 'vitest'), {
      falhas: [{ pasta: FRONT, arquivo: 'src/a.test.ts' }],
    })
  })
})

describe('falhasDoLog, no Playwright', () => {
  it('acha as specs do resumo do list e do resumo do e2e, uma vez cada', () => {
    const log = [
      '  ✘  12 e2e/fila.e2e.ts:72:1 › o flash marcado na parede (5.0s)',
      '  ✘  13 e2e/fila.e2e.ts:72:1 › o flash marcado na parede (retry #1) (5.0s)',
      '  2 failed',
      '    e2e/fila.e2e.ts:72:1 › o flash marcado na parede',
      '    [chromium] › e2e/sessao.e2e.ts:4:1 › a organizadora entra',
      '  1 flaky',
      '    e2e/rolagem.e2e.ts:50:3 › na parede › a pílula',
      '  40 passed (2.1m)',
      '[e2e] failed: 40 passaram, 2 falharam, 1 instáveis, 0 pulados, em 2.1 min',
      '[e2e] falhou: e2e/fila.e2e.ts:72 › o flash marcado na parede',
    ].join('\n')

    assert.deepEqual(falhasDoLog(log, 'playwright'), {
      falhas: [
        { pasta: null, arquivo: 'e2e/fila.e2e.ts' },
        { pasta: null, arquivo: 'e2e/sessao.e2e.ts' },
      ],
    })
  })

  it('não repete um erro fora de um teste, nem o servidor que não subiu', () => {
    const fora = falhasDoLog(
      [
        '  1 failed',
        '    e2e/fila.e2e.ts:72:1 › o flash',
        '  1 error was not a part of any test, see above for details',
      ].join('\n'),
      'playwright',
    )
    assert.ok('motivo' in fora)
    assert.match(fora.motivo, /fora de um teste/)

    const servidor = falhasDoLog(
      'Error: Timed out waiting 180000ms from config.webServer.',
      'playwright',
    )
    assert.ok('motivo' in servidor)
    assert.match(servidor.motivo, /não diz qual arquivo/)
  })
})

describe('comentarioDosIntermitentes', () => {
  it('diz o teste, o passo, o commit e o load average', () => {
    const texto = comentarioDosIntermitentes(
      '457900cdc1c5c64df0648b61781d81cd0fdcecc8',
      [
        {
          passo: 'front:testes',
          arquivo: 'src/routes/c/$slug/telao.test.tsx',
          carga: [42.5, 40.12, 38],
          log: '/tmp/x/front-testes-repeticao-1.log',
        },
      ],
    )

    assert.match(texto, /457900c/)
    assert.match(texto, /`src\/routes\/c\/\$slug\/telao\.test\.tsx`/)
    assert.match(texto, /front:testes/)
    assert.match(texto, /42\.50, 40\.12, 38\.00/)
  })
})
