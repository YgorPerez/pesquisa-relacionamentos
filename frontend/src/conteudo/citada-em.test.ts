// Onde uma Ficha é citada, sobre o conteúdo de fixture do e2e: a Silva 2020
// aparece nos dois Guias (no segundo, pela Dica) e na Dica publicada; a Lima
// 2015 só numa Dica ⬜, que não vai ao ar.
import { resolve } from 'node:path'
import { carregarAcervo } from '@tem-estudo/conteudo'
import { describe, expect, it } from 'vite-plus/test'
import { citadaEm } from './vista-guia'

const resultado = carregarAcervo(
  resolve(import.meta.dirname, '../../e2e/acervo'),
)
if (!resultado.ok) throw new Error('fixture do e2e inválida')
const { acervo } = resultado

describe('citadaEm', () => {
  it('lista os Guias que citam a Ficha, também pelas Dicas, na ordem do site', () => {
    const { guias } = citadaEm('silva-2020-apps-brasil', acervo)
    expect(guias.map((g) => g.slug)).toEqual([
      'onde-os-casais-se-conhecem',
      'app-ou-presencial',
    ])
    expect(guias[0]?.pergunta).toBe('Onde os casais se conhecem hoje?')
  })

  it('lista só as Dicas publicadas', () => {
    expect(
      citadaEm('costa-2018-satisfacao', acervo).dicas.map((d) => d.slug),
    ).toEqual(['apps-como-complemento'])
    expect(citadaEm('lima-2015-encontros', acervo)).toEqual({
      guias: [],
      dicas: [],
    })
  })
})
