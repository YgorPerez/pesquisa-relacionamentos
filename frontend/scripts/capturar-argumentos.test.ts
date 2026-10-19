import { describe, expect, it } from 'vite-plus/test'
import {
  idsDoIndice,
  idsParecidos,
  lerArgumentos,
  nomeDaRota,
} from './capturar-argumentos.ts'

const PADROES = {
  saida: '/tmp/capturas',
  app: 'http://localhost:44941',
  storybook: 'http://localhost:44943',
}

/** O erro que a linha de comando dá, ou `null` se ela vale. */
const erroDe = (argv: string[]) => {
  const resultado = lerArgumentos(argv, PADROES)
  return 'erro' in resultado ? resultado.erro : null
}

describe('lerArgumentos', () => {
  it('só com a rota, captura celular e desktop do start deste checkout', () => {
    expect(lerArgumentos(['/prioridades'], PADROES)).toEqual({
      rota: '/prioridades',
      base: 'http://localhost:44941',
      saida: '/tmp/capturas',
      nome: 'prioridades',
      toques: [],
      inteira: false,
      video: false,
      telas: ['celular', 'desktop'],
    })
  })

  it('lê cada opção, e o --tocar se repete na ordem dada', () => {
    const opcoes = lerArgumentos(
      [
        '/estudos/costa-2018?de=busca',
        '--tocar',
        'text=Como ler',
        '--tocar',
        '[data-ficha] >> nth=0',
        '--inteira',
        '--video',
        '--so',
        'celular',
        '--nome',
        'ficha',
        '--saida',
        '/tmp/x',
        '--base',
        'http://localhost:3100/',
      ],
      PADROES,
    )
    expect(opcoes).toMatchObject({
      rota: '/estudos/costa-2018?de=busca',
      base: 'http://localhost:3100',
      saida: '/tmp/x',
      nome: 'ficha',
      toques: ['text=Como ler', '[data-ficha] >> nth=0'],
      inteira: true,
      video: true,
      telas: ['celular'],
    })
  })

  it('a rota sem barra ganha uma, e --porta vale para ela', () => {
    expect(lerArgumentos(['dicas', '--porta', '20090'], PADROES)).toMatchObject(
      { rota: '/dicas', base: 'http://localhost:20090' },
    )
  })

  it.each([
    [[], 'Falta a rota'],
    [['/a', '/b'], 'Uma rota só'],
    [['/a', '--voar'], 'Opção desconhecida: --voar'],
    [['/a', '--tocar'], '--tocar pede um valor'],
    [['/a', '--so', 'tablet'], '--so aceita celular ou desktop'],
    [['/a', '--em', '0'], '--em é só com --story'],
  ])('recusa %j', (argv, erro) => {
    expect(erroDe(argv)).toContain(erro)
  })
})

describe('lerArgumentos com --story', () => {
  it('fotografa a story no celular, do Storybook deste checkout, nos instantes em ordem', () => {
    expect(
      lerArgumentos(
        ['--story', 'ui-perfil--vazio', '--em', '1000,0,500,0'],
        PADROES,
      ),
    ).toEqual({
      story: 'ui-perfil--vazio',
      instantes: [0, 500, 1000],
      base: 'http://localhost:44943',
      saida: '/tmp/capturas',
      nome: 'ui-perfil--vazio',
      tela: 'celular',
    })
  })

  it('sem --em, fotografa o carregamento; --porta e --so escolhem o Storybook e a tela', () => {
    expect(
      lerArgumentos(
        ['--story', 'a--b', '--porta', '20098', '--so', 'desktop'],
        PADROES,
      ),
    ).toMatchObject({
      instantes: [0],
      base: 'http://localhost:20098',
      tela: 'desktop',
    })
  })

  it.each([
    [['/a', '--story', 'a--b'], '--story não leva rota'],
    [['--story', 'a--b', '--video'], '--video não funciona com --story'],
    [['--story', 'a--b', '--tocar', 'text=x'], '--tocar não funciona'],
    [['--story', 'a--b', '--em', '0,meio'], '--em pede milissegundos'],
    [['--story', 'a--b', '--porta', 'seis'], '--porta pede um número'],
    [['--story', 'a--b', '--porta', '1', '--base', 'x'], '--base ou --porta'],
  ])('recusa %j', (argv, erro) => {
    expect(erroDe(argv)).toContain(erro)
  })
})

describe('idsDoIndice', () => {
  it('lista as stories e deixa as páginas de docs de fora', () => {
    expect(
      idsDoIndice({
        v: 5,
        entries: {
          'ui-perfil--vazio': { type: 'story' },
          'ui-perfil--docs': { type: 'docs' },
        },
      }),
    ).toEqual(['ui-perfil--vazio'])
  })
})

describe('idsParecidos', () => {
  const IDS = [
    'ui-selos--forca',
    'ui-selos--com-status',
    'ui-prioridades-tabela--cheia',
    'ui-prioridades-tabela--vazia',
    'ui-guia-resposta--padrao',
    'ui-botao--primario',
  ]

  it('põe primeiro o que tem mais pedaços do id pedido', () => {
    expect(idsParecidos('ui-selos--com-statu', IDS).slice(0, 2)).toEqual([
      'ui-selos--com-status',
      'ui-selos--forca',
    ])
  })

  it('acha o id pelo pedaço do meio, com barras no lugar dos hífens', () => {
    expect(idsParecidos('prioridades/tabela', IDS).slice(0, 2)).toEqual([
      'ui-prioridades-tabela--cheia',
      'ui-prioridades-tabela--vazia',
    ])
  })

  it('acha um erro de digitação sem pedaço inteiro em comum', () => {
    expect(idsParecidos('ui_guia_resposta__padrao', IDS)).toEqual([
      'ui-guia-resposta--padrao',
    ])
  })

  it('não inventa parecido, e não passa de quantos se pediu', () => {
    expect(idsParecidos('mapa-medir--cheio', IDS)).toEqual([])
    expect(idsParecidos('ui', IDS, 3)).toHaveLength(3)
  })
})

describe('nomeDaRota', () => {
  it('vira um nome de arquivo, sem a busca', () => {
    expect(nomeDaRota('/onde-conhecer-pessoas/app-ou-bar?g=mulher')).toBe(
      'onde-conhecer-pessoas-app-ou-bar',
    )
  })

  it('a raiz vira "inicio"', () => {
    expect(nomeDaRota('/')).toBe('inicio')
  })
})
