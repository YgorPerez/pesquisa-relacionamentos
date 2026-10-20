// Os dados de verdade (`dados/grupo-possivel/`) pelos pacotes que o navegador
// baixa, contra o caso conferido à mão no #36.
import { resolve } from 'node:path'
import { openPack, type PackPlace } from '@tem-estudo/rules/possible-group-data'
import { estimateGroup } from '@tem-estudo/rules/possible-group'
import { formatAmount } from '@tem-estudo/rules/numbers'
import {
  DEFAULT_REQUIREMENTS,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import { describe, expect, it } from 'vite-plus/test'
import { montarPacotes } from './grupo-possivel.ts'

const montados = montarPacotes(
  resolve(import.meta.dirname, '../../dados/grupo-possivel'),
)
const abrir = (lugar: PackPlace) =>
  openPack(JSON.parse(montados.pacotes.get(lugar)!))
const brasil = abrir('BR')
const sp = abrir('SP')

const mulheresDe25a29 = (lugar: Requirements['lugar']) =>
  estimateGroup(
    {
      profile: { procura: 'mulheres' },
      requirements: {
        ...DEFAULT_REQUIREMENTS,
        idade: { min: 25, max: 29 },
        lugar,
      },
    },
    { brazil: brasil, uf: sp },
  )

describe('os pacotes do Grupo possível', () => {
  it('um do Brasil e um por UF, cada um bem menor que o CSV', () => {
    expect(montados.pacotes.size).toBe(28)
    const maior = Math.max(
      ...[...montados.pacotes.values()].map((t) => t.length),
    )
    expect(maior).toBeLessThan(4_000_000)
  })

  it('SP, mulheres de 25 a 29 que não viviam em união: o CSV dá 746.284 (SIDRA 747.507)', () => {
    const r = mulheresDe25a29({ uf: 'SP' })
    expect(Math.abs(r.result.central - 746_284)).toBeLessThan(50)
    expect(r.result.records).toBe(57_931)
    expect(formatAmount(r.result.central)).toBe('750 mil')
  })

  it('na capital, o mesmo grupo bate com o SIDRA 10185 municipal (229.861)', () => {
    const r = mulheresDe25a29({ uf: 'SP', municipio: '3550308' })
    expect(Math.abs(r.result.central - 229_861)).toBeLessThan(1)
  })

  it('a estimativa de quem não disse nada é o Brasil adulto que não mora com companheiro(a)', () => {
    expect(montados.exemplo.active).toEqual(['companheiro'])
    expect(montados.exemplo.target).toBe('pessoas')
    expect(montados.exemplo.result.central).toBeGreaterThan(60e6)
    expect(montados.exemplo.result.central).toBeLessThan(90e6)
  })
})
