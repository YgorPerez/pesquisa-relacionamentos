import { describe, expect, it } from 'vite-plus/test'
import censo from '../fixtures/grupo-possivel/censo-2022.csv?raw'
import idades from '../fixtures/grupo-possivel/sidra-9514-idade.csv?raw'
import municipios from '../fixtures/grupo-possivel/sidra-10185-municipios.csv?raw'
import pns from '../fixtures/grupo-possivel/pns-2019.csv?raw'
import { abrirPacote, lerBaseDoGrupo, pacoteDoLugar } from './grupo-possivel-dados.ts'
import { estimarGrupo, type DadosDaConta } from './grupo-possivel.ts'
import type { Perfil } from './perfil.ts'
import { REQUISITOS_PADRAO, soltar, type RequisitoDoVisitante, type Requisitos } from './requisitos.ts'

// O caminho de verdade: CSV → pacote em JSON (o que o navegador baixa) → conta.
const base = lerBaseDoGrupo({ censo, idades, municipios, pns })
const pacote = (lugar: 'BR' | 'AC' | 'AP') => abrirPacote(JSON.parse(JSON.stringify(pacoteDoLugar(base, lugar))))
const dados = (uf?: 'AC' | 'AP'): DadosDaConta => ({ brasil: pacote('BR'), ...(uf && { uf: pacote(uf) }) })

const conta = (perfil: Perfil | null, mudar: Partial<Requisitos>) => {
  const requisitos = { ...REQUISITOS_PADRAO, ...mudar }
  return estimarGrupo({ perfil, requisitos }, dados(requisitos.lugar?.uf as 'AC' | undefined))
}

describe('estimarGrupo: Requisitos do Censo', () => {
  it('soma o peso das células que atendem e abre a faixa pelo erro de amostra', () => {
    // Mulheres de 25 a 29 no Acre que não moram com companheiro(a): 1.000 + 3.000,
    // em 400 registros. Erro = 1,96/√400 = 9,8%.
    const r = conta({ procura: 'mulheres' }, { idade: { min: 25, max: 29 }, lugar: { uf: 'AC' } })
    expect(r.resultado.central).toBeCloseTo(4000)
    expect(r.resultado.registros).toBeCloseTo(400)
    expect(r.resultado.min).toBeCloseTo(4000 * (1 - 0.098))
    expect(r.resultado.max).toBeCloseTo(4000 * (1 + 0.098))
    expect(r.resultado.instavel).toBe(false)
  })

  it('tira a idade exata do grupo de 5 anos pelas idades simples do lugar', () => {
    // No Acre, 25 a 28 anos são 400 das 1.000 mulheres de 25 a 29 (a de 29 pesa 600).
    const r = conta({ procura: 'mulheres' }, { idade: { min: 25, max: 28 }, lugar: { uf: 'AC' } })
    expect(r.resultado.central).toBeCloseTo(1600)
    expect(r.resultado.registros).toBeCloseTo(160)
  })

  it('a base são os adultos do gênero procurado no Brasil, a partir de 18', () => {
    // 4.000 + 2.000 + 400 + 700 e, do grupo de 15 a 19, só 18 e 19 anos (2 de 5): 200.
    const r = conta({ procura: 'mulheres' }, { companheiro: false })
    expect(r.ligados).toEqual([])
    expect(r.base.central).toBeCloseTo(7300)
    expect(r.resultado.central).toBeCloseTo(7300)
  })

  it('escolaridade e renda são mínimas; cor e religião, qualquer uma das marcadas', () => {
    const ac = { idade: { min: 25, max: 34 }, lugar: { uf: 'AC' } } as const
    const mulheres = { procura: 'mulheres' } as const
    expect(conta(mulheres, { ...ac, escolaridade: 'superior' }).resultado.central).toBeCloseTo(1400)
    expect(conta(mulheres, { ...ac, escolaridade: 'medio', renda: '2-5' }).resultado.central).toBeCloseTo(1400)
    expect(conta(mulheres, { ...ac, renda: '5+' }).resultado.central).toBeCloseTo(400)
    expect(conta(mulheres, { ...ac, cores: ['parda', 'preta'] }).resultado.central).toBeCloseTo(3400)
    // Quem não declarou religião (o grupo de 15 a 19) não entra quando há religião marcada.
    expect(conta(mulheres, { lugar: { uf: 'AC' }, religioes: ['catolica', 'evangelica'] }).resultado.central).toBeCloseTo(4000)
  })

  it('o resultado abaixo de 50 registros é instável e diz isso numa ressalva forte', () => {
    const r = conta({ procura: 'homens' }, { idade: { min: 25, max: 29 }, lugar: { uf: 'AP' } })
    expect(r.resultado.registros).toBeCloseTo(3)
    expect(r.resultado.instavel).toBe(true)
    expect(r.ressalvas.find((x) => x.id === 'instavel')).toMatchObject({ forte: true })
  })
})

describe('estimarGrupo: "sem filhos"', () => {
  const ac = { idade: { min: 25, max: 29 }, lugar: { uf: 'AC' }, semFilhos: true } as const

  it('procurando mulheres, tira as que têm filhos', () => {
    const r = conta({ procura: 'mulheres' }, ac)
    expect(r.filhos).toBe('vale')
    expect(r.resultado.central).toBeCloseTo(1000)
  })

  it('procurando homens, não se aplica: o Censo não pergunta filhos a eles', () => {
    const r = conta({ procura: 'homens' }, ac)
    expect(r.filhos).toBe('sem-dado')
    expect(r.ligados).not.toContain('filhos')
    expect(r.resultado.central).toBeCloseTo(1500)
  })

  it('procurando ambos, vale só para as mulheres, com aviso forte', () => {
    const r = conta({ procura: 'ambos' }, ac)
    expect(r.filhos).toBe('so-mulheres')
    expect(r.resultado.central).toBeCloseTo(1000 + 1500)
    expect(r.ressalvas.find((x) => x.id === 'filhos-so-mulheres')).toMatchObject({ forte: true })
  })
})

describe('estimarGrupo: Requisitos da PNS', () => {
  const ac = { idade: { min: 25, max: 29 }, lugar: { uf: 'AC' } } as const
  const erro = 1.96 / Math.sqrt(400)

  it('a orientação vem do Perfil: hétero + bi do sexo procurado, sem contar quem não respondeu', () => {
    // 90% + 2%, sobre os 96% que responderam; o intervalo soma os das duas categorias.
    const r = conta({ genero: 'homem', procura: 'mulheres' }, ac)
    expect(r.ligados).toContain('orientacao')
    expect(r.resultado.central).toBeCloseTo((4000 * 0.92) / 0.96)
    expect(r.resultado.min).toBeCloseTo(((4000 * 0.89) / 0.96) * (1 - erro))
    expect(r.resultado.max).toBeCloseTo(((4000 * 0.95) / 0.96) * (1 + erro))
    expect(r.ressalvas.find((x) => x.id === 'orientacao')?.texto).toContain('4% não souberam')
  })

  it('procurando o mesmo gênero, conta homo + bi', () => {
    const r = conta({ genero: 'mulher', procura: 'mulheres' }, ac)
    expect(r.resultado.central).toBeCloseTo((4000 * 0.05) / 0.96)
  })

  it('gênero "outro" não desconta orientação e leva o aviso forte de teto', () => {
    const r = conta({ genero: 'outro', procura: 'mulheres' }, ac)
    expect(r.ligados).not.toContain('orientacao')
    expect(r.resultado.central).toBeCloseTo(4000)
    const aviso = r.ressalvas.find((x) => x.id === 'genero-outro')
    expect(aviso?.forte).toBe(true)
    expect(aviso?.texto).toContain('identidade de gênero')
    expect(aviso?.texto).toContain('teto')
  })

  it('sem gênero no Perfil, também não desconta e avisa', () => {
    const r = conta({ procura: 'mulheres' }, ac)
    expect(r.ressalvas.find((x) => x.id === 'sem-genero')).toMatchObject({ forte: true })
  })

  it('"não fuma" multiplica pela probabilidade e abre a faixa pelo intervalo dela', () => {
    const r = conta({ procura: 'mulheres' }, { ...ac, naoFuma: true })
    expect(r.resultado.central).toBeCloseTo(3200)
    expect(r.resultado.min).toBeCloseTo(4000 * 0.78 * (1 - erro))
    expect(r.resultado.max).toBeCloseTo(4000 * 0.82 * (1 + erro))
  })

  it('a altura em faixa é F(máx) − F(mín − 1) da acumulada', () => {
    // Na fixture, F(cm) = (cm − 140)/60: F(170) − F(159) = 11/60.
    const r = conta({ procura: 'mulheres' }, { ...ac, altura: { min: 160, max: 170 } })
    expect(r.resultado.central).toBeCloseTo((4000 * 11) / 60, 0)
  })
})

describe('estimarGrupo: município', () => {
  it('escala as células da UF pela população do município no SIDRA 10185', () => {
    // Rio Branco tem 2.000 das 4.000 mulheres de 25 a 29 sem união do Acre:
    // o número bate com o que o SIDRA publica para a cidade.
    const r = conta(
      { procura: 'mulheres' },
      { idade: { min: 25, max: 29 }, lugar: { uf: 'AC', municipio: '1200401' } },
    )
    expect(r.resultado.central).toBeCloseTo(2000)
    expect(r.resultado.registros).toBeCloseTo(200)
    expect(r.ressalvas.map((x) => x.id)).toContain('municipio')
  })

  it('com quem vive em união, cada lado tem a sua escala', () => {
    // 2.000 sem união (×0,5) + 500 dos 2.000 em união (×0,25).
    const r = conta(
      { procura: 'mulheres' },
      { idade: { min: 25, max: 29 }, lugar: { uf: 'AC', municipio: '1200401' }, companheiro: false },
    )
    expect(r.resultado.central).toBeCloseTo(2500)
  })
})

describe('estimarGrupo: o que mais pesa, funil e conta ingênua', () => {
  const pedido = {
    idade: { min: 25, max: 29 },
    lugar: { uf: 'AC' },
    escolaridade: 'superior',
  } as const
  const r = conta({ procura: 'mulheres' }, pedido)

  it('o custo de soltar cada um mantém os outros, do que mais pesa ao que menos', () => {
    // Atual: 1.000. Sem escolaridade, 4.000; sem "não mora com companheiro(a)",
    // 1.000 + 2.000; sem o Acre, 1.000 + 700 do Amapá; sem a idade, 1.000 + 400.
    expect(r.resultado.central).toBeCloseTo(1000)
    expect(r.custos.map((c) => [c.requisito, Math.round(c.sem), Number(c.vezes.toFixed(2))])).toEqual([
      ['escolaridade', 4000, 4],
      ['companheiro', 3000, 3],
      ['lugar', 1700, 1.7],
      ['idade', 1400, 1.4],
    ])
    expect(r.custos[0]?.ganho).toBeCloseTo(3000)
  })

  it('soltar pelo botão dá o mesmo número que o custo anunciou, seja qual for a ordem', () => {
    for (const custo of r.custos) {
      const solto = soltar({ ...REQUISITOS_PADRAO, ...pedido }, custo.requisito as RequisitoDoVisitante)
      expect(conta({ procura: 'mulheres' }, solto).resultado.central).toBeCloseTo(custo.sem)
    }
  })

  it('o funil corta na ordem fixa e termina no resultado', () => {
    expect(r.funil.map((e) => [e.requisito, Math.round(e.central)])).toEqual([
      ['idade', 6700],
      ['lugar', 6000],
      ['companheiro', 4000],
      ['escolaridade', 1000],
    ])
  })

  it('a conta ingênua multiplica a fração que cada Requisito deixa sozinho no Brasil', () => {
    // Base 7.300. Sozinhos: 25 a 29 anos 6.700; Acre 6.600; sem união 5.300; superior 4.100.
    expect(r.ingenua).toBeCloseTo((6700 * 6600 * 5300 * 4100) / 7300 ** 3)
  })
})
