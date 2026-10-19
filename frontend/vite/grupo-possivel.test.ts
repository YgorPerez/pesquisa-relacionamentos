// Os dados de verdade (`dados/grupo-possivel/`) pelos pacotes que o navegador
// baixa, contra o caso conferido à mão no #36.
import { resolve } from 'node:path'
import { abrirPacote, type LugarDoPacote } from '@tem-estudo/regras/grupo-possivel-dados'
import { estimarGrupo } from '@tem-estudo/regras/grupo-possivel'
import { formatarQuantidade } from '@tem-estudo/regras/numeros'
import { REQUISITOS_PADRAO, type Requisitos } from '@tem-estudo/regras/requisitos'
import { describe, expect, it } from 'vitest'
import { montarPacotes } from './grupo-possivel.ts'

const montados = montarPacotes(resolve(import.meta.dirname, '../../dados/grupo-possivel'))
const abrir = (lugar: LugarDoPacote) => abrirPacote(JSON.parse(montados.pacotes.get(lugar)!))
const brasil = abrir('BR')
const sp = abrir('SP')

const mulheresDe25a29 = (lugar: Requisitos['lugar']) =>
  estimarGrupo(
    { perfil: { procura: 'mulheres' }, requisitos: { ...REQUISITOS_PADRAO, idade: { min: 25, max: 29 }, lugar } },
    { brasil, uf: sp },
  )

describe('os pacotes do Grupo possível', () => {
  it('um do Brasil e um por UF, cada um bem menor que o CSV', () => {
    expect(montados.pacotes.size).toBe(28)
    const maior = Math.max(...[...montados.pacotes.values()].map((t) => t.length))
    expect(maior).toBeLessThan(4_000_000)
  })

  it('SP, mulheres de 25 a 29 que não viviam em união: o CSV dá 746.284 (SIDRA 747.507)', () => {
    const r = mulheresDe25a29({ uf: 'SP' })
    expect(Math.abs(r.resultado.central - 746_284)).toBeLessThan(50)
    expect(r.resultado.registros).toBe(57_931)
    expect(formatarQuantidade(r.resultado.central)).toBe('750 mil')
  })

  it('na capital, o mesmo grupo bate com o SIDRA 10185 municipal (229.861)', () => {
    const r = mulheresDe25a29({ uf: 'SP', municipio: '3550308' })
    expect(Math.abs(r.resultado.central - 229_861)).toBeLessThan(1)
  })

  it('a estimativa de quem não disse nada é o Brasil adulto que não mora com companheiro(a)', () => {
    expect(montados.exemplo.ligados).toEqual(['companheiro'])
    expect(montados.exemplo.alvo).toBe('pessoas')
    expect(montados.exemplo.resultado.central).toBeGreaterThan(60e6)
    expect(montados.exemplo.resultado.central).toBeLessThan(90e6)
  })
})
