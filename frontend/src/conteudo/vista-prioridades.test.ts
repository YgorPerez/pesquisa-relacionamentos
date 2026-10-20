// A vista de Prioridades sobre o conteúdo de fixture do e2e: dez
// características citando a Silva 2020 (✅) e a Costa 2018 (🟡), e o Guia B1
// que hospeda a calculadora.
import { resolve } from 'node:path'
import { carregarAcervo } from '@tem-estudo/content'
import { describe, expect, it } from 'vite-plus/test'
import { vistaDasPrioridades } from './vista-prioridades'

const resultado = carregarAcervo(
  resolve(import.meta.dirname, '../../e2e/acervo'),
)
if (!resultado.ok) throw new Error('fixture do e2e inválida')
const { acervo } = resultado

describe('vistaDasPrioridades', () => {
  it('traz cada célula com a Ficha resumida: nome curto, Status, Força e amostra', () => {
    const vista = vistaDasPrioridades(acervo)
    const aparencia = vista?.caracteristicas.find((c) => c.id === 'aparencia')
    expect(aparencia?.satisfacao).toEqual({
      degrau: 2,
      medida: 'r = 0,10, só maridos',
      texto: 'Só os maridos ficam um pouco mais satisfeitos, e só no começo.',
      ficha: {
        slug: 'costa-2018-satisfacao',
        nome: 'Costa (2018)',
        status: 'parcial',
        forca: 'moderada',
        amostra: 'Casais casados recrutados online.',
      },
    })
    expect(aparencia?.duracao).toEqual({
      degrau: 0,
      medida: null,
      texto: 'Nenhum estudo lido mede isso.',
      ficha: null,
    })
  })

  it('traz a barra da satisfação e o Guia que hospeda a calculadora', () => {
    const vista = vistaDasPrioridades(acervo)
    expect(vista?.barra).toMatchObject({
      relacao: 45,
      parceiro: 5,
      semExplicacao: 50,
      ficha: { slug: 'silva-2020-apps-brasil' },
    })
    expect(vista?.doGuia).toEqual({
      tema: 'escolher-parceiro',
      slug: 'que-caracteristicas-preveem',
      pergunta: 'Que características do parceiro preveem uma boa relação?',
      confianca: 'moderada',
      resposta:
        'Como vocês se tratam pesa mais que a lista de qualidades do parceiro.',
    })
  })

  it('sem o arquivo de Prioridades, não há vista', () => {
    expect(vistaDasPrioridades({ ...acervo, prioridades: null })).toBeNull()
  })
})
