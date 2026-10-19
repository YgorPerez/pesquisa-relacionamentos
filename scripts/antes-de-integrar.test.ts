import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { lerSaude, pioras, type Saude } from './antes-de-integrar.ts'

const PENALIDADES = { unit_size: 3.6, coupling: 2.4, dead_exports: 0 }

function saude(mudar: Partial<Saude> = {}): Saude {
  return {
    penalidades: PENALIDADES,
    funcoesAcimaDe60PorMil: 7.2,
    acoplados: ['src/ui/shadcn/button.tsx'],
    ...mudar,
  }
}

describe('lerSaude', () => {
  it('conta acoplado o arquivo com fan-in acima de max(p95, 10), relativo ao frontend', () => {
    const lida = lerSaude({
      health_score: { penalties: PENALIDADES },
      vital_signs: { functions_over_60_loc_per_k: 7.2, p95_fan_in: 12 },
      file_scores: [
        { path: '/tmp/x/frontend/src/a.ts', fan_in: 13 },
        { path: '/repo/frontend/src/b.ts', fan_in: 12 },
      ],
    })
    assert.deepEqual(lida.acoplados, ['src/a.ts'])
  })

  it('com p95 baixo, o limite é 10', () => {
    const lida = lerSaude({
      health_score: { penalties: PENALIDADES },
      vital_signs: { functions_over_60_loc_per_k: 0, p95_fan_in: 3 },
      file_scores: [{ path: 'frontend/src/a.ts', fan_in: 10 }],
    })
    assert.deepEqual(lida.acoplados, [])
  })
})

describe('pioras', () => {
  it('nada piorou: vazia', () => {
    assert.deepEqual(pioras(saude(), saude()), [])
  })

  it('diz qual arquivo passou a contar no acoplamento', () => {
    const [frase] = pioras(
      saude(),
      saude({
        acoplados: [
          'src/features/atletas/graduacao.ts',
          'src/ui/shadcn/button.tsx',
        ],
      }),
    )
    assert.match(
      frase ?? '',
      /^acoplamento: src\/features\/atletas\/graduacao\.ts/,
    )
  })

  it('trocar um acoplado por outro não é piora', () => {
    assert.deepEqual(
      pioras(saude(), saude({ acoplados: ['src/outro.ts'] })),
      [],
    )
  })

  it('mais funções de mais de 60 linhas é piora', () => {
    const [frase] = pioras(saude(), saude({ funcoesAcimaDe60PorMil: 7.3 }))
    assert.match(frase ?? '', /^tamanho: .* de 7\.2 para 7\.3/)
  })

  it('outra penalidade que sobe também', () => {
    assert.deepEqual(
      pioras(
        saude(),
        saude({ penalidades: { ...PENALIDADES, dead_exports: 0.5 } }),
      ),
      ['a penalidade dead_exports da fallow foi de 0 para 0.5.'],
    )
  })
})
