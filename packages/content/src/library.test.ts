import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  caminhoDaFicha,
  carregarAcervo,
  fichaIndexavel,
  fichaPorSlug,
  formatarProblemas,
  montarAcervo,
  type Acervo,
  type Resultado,
} from './index.ts'

const fixture = (nome: string) =>
  fileURLToPath(new URL(`../fixtures/${nome}`, import.meta.url))

function acervoDe(resultado: Resultado): Acervo {
  if (!resultado.ok) throw new Error(formatarProblemas(resultado.erros))
  return resultado.acervo
}

const textoDaFixture = (pasta: string, slug: string) =>
  readFileSync(`${fixture(pasta)}/estudos/${slug}.md`, 'utf8')

function errosDe(resultado: Resultado): string[] {
  if (resultado.ok) throw new Error('o acervo devia ter falhado')
  return resultado.erros.map((e) => e.mensagem)
}

describe('carregar o acervo', () => {
  it('lê as Fichas de estudos/ pelo nome do arquivo, ignorando o _modelo', () => {
    const acervo = acervoDe(carregarAcervo(fixture('valid')))
    expect(acervo.fichas.map((f) => f.slug)).toEqual([
      'costa-2018-satisfacao',
      'lima-2015-encontros',
      'silva-2020-apps-brasil',
    ])
  })

  it('devolve a Ficha com o frontmatter, o título e o DOI tirado do link', () => {
    const ficha = fichaPorSlug(
      acervoDe(carregarAcervo(fixture('valid'))),
      'silva-2020-apps-brasil',
    )
    expect(ficha).toMatchObject({
      arquivo: 'estudos/silva-2020-apps-brasil.md',
      titulo: 'Silva e Souza (2020): apps de namoro no Brasil',
      status: 'ok',
      verificado_em: '2026-10-19',
      forca: 'forte',
      forca_porque: 'Amostra probabilística nacional, grande.',
      paises: ['Brasil'],
      periodo: '2019',
      amostra: { n: 2400, representativa: true },
      desenho: 'transversal',
      licenca: 'CC BY 4.0',
      doi: '10.1234/exemplo.2020.1',
      cobre: {
        generos: ['homem', 'mulher'],
        procura: ['homens', 'mulheres'],
        idades: { min: 18, max: 35 },
      },
    })
  })

  it('corta o corpo em O que mediu, Achados com trecho, Limitações e Como usamos', () => {
    const ficha = fichaPorSlug(
      acervoDe(carregarAcervo(fixture('valid'))),
      'silva-2020-apps-brasil',
    )
    expect(ficha?.oQueMediu).toBe(
      'Quantos adultos jovens conheceram o parceiro atual por app.',
    )
    expect(ficha?.achados).toEqual([
      {
        medida: 'Conheceram o parceiro por app',
        valor: '18%',
        onde: 'Tabela 2, p. 50',
        trecho:
          '"18% dos participantes conheceram o parceiro atual por aplicativo"',
        calculo: null,
      },
      {
        medida: 'Entre 18 e 24 anos',
        valor: '24%',
        onde: 'Tabela 2, p. 50',
        trecho: '"entre os de 18 a 24 anos, 24%"',
        calculo: null,
      },
    ])
    expect(ficha?.limitacoes).toBe('- Autorrelato.\n- Só capitais.')
    expect(ficha?.comoUsamos).toBe('- Exemplo de fixture.')
  })

  it('aceita Ficha não verificada sem trecho, sem data e com seção a mais', () => {
    const ficha = fichaPorSlug(
      acervoDe(carregarAcervo(fixture('valid'))),
      'lima-2015-encontros',
    )
    expect(ficha?.status).toBe('nao-verificado')
    expect(ficha?.verificado_em).toBeUndefined()
    expect(ficha?.achados[0]?.trecho).toBeNull()
    expect(ficha?.outrasSecoes).toEqual([
      {
        titulo: 'Brasil na amostra',
        markdown: 'Nenhum participante brasileiro.',
      },
    ])
    expect(ficha?.comoUsamos).toBeNull()
    expect(ficha?.doi).toBe('10.5555/lima.2015')
  })

  it('uma pasta sem estudos/ dá um acervo vazio', () => {
    expect(acervoDe(montarAcervo([])).fichas).toEqual([])
  })
})

describe('erros do build', () => {
  it('campo inválido diz o arquivo, o campo e o valor que veio', () => {
    const erros = errosDe(carregarAcervo(fixture('invalid-field')))
    const arquivo = 'estudos/rocha-2021-invalida.md'
    expect(erros).toEqual(
      expect.arrayContaining([
        `${arquivo}: status: valor fora da lista fechada (ok | parcial | nao-verificado) (veio "talvez")`,
        `${arquivo}: link: precisa ser uma URL começando com http (veio "doi 10.1/abc")`,
        `${arquivo}: amostra.n: precisa ser um número (veio "muitos")`,
        `${arquivo}: amostra.representativa: precisa ser true ou false (veio "sim")`,
        `${arquivo}: autor: campo desconhecido`,
      ]),
    )
  })

  it('valor fora das listas fechadas de desenho, força e cobre falha', () => {
    const erros = errosDe(carregarAcervo(fixture('closed-list')))
    const arquivo = 'estudos/alves-2022-fora-da-lista.md'
    expect(erros).toEqual(
      expect.arrayContaining([
        `${arquivo}: forca: valor fora da lista fechada (forte | moderada | fraca) (veio "muito-forte")`,
        `${arquivo}: desenho: valor fora da lista fechada (longitudinal | transversal | experimento | plataforma | administrativo | meta-analise) (veio "survey")`,
        `${arquivo}: cobre.generos.1: valor fora da lista fechada (homem | mulher) (veio "outro")`,
        `${arquivo}: cobre.procura.0: valor fora da lista fechada (homens | mulheres) (veio "ambos")`,
        `${arquivo}: cobre.casal: valor fora da lista fechada (hetero | mesmo-sexo) (veio "misto")`,
      ]),
    )
  })

  it('cobre.idades com min acima de max falha', () => {
    const texto = `---
referencia: "X."
link: https://exemplo.org/x
status: nao-verificado
forca: fraca
forca_porque: "X."
paises: []
periodo: "2020"
amostra: { descricao: "X.", representativa: false }
desenho: transversal
cobre: { idades: { min: 40, max: 30 } }
---

# X (2020): x

## O que mediu

X.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| A | 1 | — | |

## Limitações

X.
`
    expect(
      errosDe(montarAcervo([{ caminho: 'estudos/x-2020.md', texto }])),
    ).toEqual(['estudos/x-2020.md: cobre.idades: min (40) passa de max (30)'])
  })

  it('dois Estudos com o mesmo DOI falham, mesmo escrito de outro jeito', () => {
    expect(errosDe(carregarAcervo(fixture('duplicate-doi')))).toEqual([
      'estudos/mendes-2019-original.md: link: o DOI 10.9999/repetido.2019 já está em estudos/mendes-2019-copia.md; um Estudo tem uma Ficha só',
    ])
  })

  it('corpo sem as seções ou com a tabela antiga falha', () => {
    const arquivo = 'estudos/nunes-2020-corpo.md'
    expect(errosDe(carregarAcervo(fixture('incomplete-body')))).toEqual([
      `${arquivo}: O que mediu: falta a seção "## O que mediu"`,
      `${arquivo}: Achados: falta a seção "## Achados"`,
    ])
  })

  it('a tabela de Achados precisa das colunas Medida, Valor, Onde e Trecho', () => {
    const texto = textoDaFixture('valid', 'lima-2015-encontros').replace(
      '| Medida | Valor | Onde | Trecho |',
      '| Medida | Valor | Onde no texto |',
    )
    expect(
      errosDe(
        montarAcervo([{ caminho: 'estudos/lima-2015-encontros.md', texto }]),
      ),
    ).toEqual([
      'estudos/lima-2015-encontros.md: Achados: a tabela precisa das colunas | Medida | Valor | Onde | Trecho | (e | Cálculo | opcional), veio | Medida | Valor | Onde no texto |',
    ])
  })

  it('Ficha ok precisa de data e de trecho em cada achado', () => {
    const arquivo = 'estudos/pires-2023-sem-trecho.md'
    expect(errosDe(carregarAcervo(fixture('ok-without-excerpt')))).toEqual([
      `${arquivo}: verificado_em: uma Ficha ok ou parcial precisa da data da conferência`,
      `${arquivo}: Achados: a linha 2 ("Sem trecho") está sem Trecho; uma Ficha ok cita o original em cada achado`,
    ])
  })

  it('frontmatter ausente ou quebrado falha', () => {
    expect(
      errosDe(
        montarAcervo([
          { caminho: 'estudos/sem-2020.md', texto: '# Sem (2020): nada\n' },
          {
            caminho: 'estudos/quebrado-2020.md',
            texto: '---\nstatus: [ok\n---\n# Q\n',
          },
        ]),
      ),
    ).toEqual(
      expect.arrayContaining([
        'estudos/sem-2020.md: falta o frontmatter (o bloco --- do topo)',
        expect.stringMatching(
          /^estudos\/quebrado-2020\.md: o frontmatter não é YAML válido/,
        ),
      ]),
    )
  })

  it('formata os erros uma linha por problema', () => {
    const resultado = carregarAcervo(fixture('duplicate-doi'))
    expect(resultado.ok ? '' : formatarProblemas(resultado.erros)).toBe(
      '- estudos/mendes-2019-original.md: link: o DOI 10.9999/repetido.2019 já está em estudos/mendes-2019-copia.md; um Estudo tem uma Ficha só',
    )
  })
})

describe('origem dos dados (.meta.yaml)', () => {
  const ficha = (pasta: string, slug: string) => ({
    caminho: `estudos/${slug}.md`,
    texto: textoDaFixture(pasta, slug),
  })
  const meta = (corpo: string) => ({
    caminho: 'dados/grupo-possivel/censo.meta.yaml',
    texto: corpo,
  })
  const META_OK = `ficha: silva-2020-apps-brasil
tabela: ["Microdados, arquivo de pessoas"]
variaveis: [P0110, P0150]
baixado_em: 2026-10-19
script: scripts/grupo-possivel/pipeline.ts
versao: "arquivo de 2026-09-14"
`

  it('lê o .meta.yaml de cada arquivo de dados em dados/', () => {
    const acervo = acervoDe(carregarAcervo(fixture('valid')))
    expect(acervo.dados).toEqual([
      {
        arquivo: 'dados/grupo-possivel/exemplo.meta.yaml',
        ficha: 'silva-2020-apps-brasil',
        tabela: ['SIDRA 9514'],
        baixado_em: '2026-10-19',
        script: 'scripts/grupo-possivel/pipeline.ts',
        versao: 'Censo 2022, universo',
      },
    ])
  })

  it('aceita o .meta.yaml que cita uma Ficha ✅', () => {
    const resultado = montarAcervo([
      ficha('valid', 'silva-2020-apps-brasil'),
      meta(META_OK),
    ])
    expect(acervoDe(resultado).dados[0]?.variaveis).toEqual(['P0110', 'P0150'])
  })

  it('falha quando o .meta.yaml cita uma Ficha ⬜', () => {
    const texto = META_OK.replace(
      'silva-2020-apps-brasil',
      'lima-2015-encontros',
    )
    expect(
      errosDe(
        montarAcervo([ficha('valid', 'lima-2015-encontros'), meta(texto)]),
      ),
    ).toEqual([
      'dados/grupo-possivel/censo.meta.yaml: ficha: lima-2015-encontros é ⬜ (não verificada); dados só citam Ficha ✅ ou 🟡',
    ])
  })

  it('falha quando a Ficha citada não existe', () => {
    expect(errosDe(montarAcervo([meta(META_OK)]))).toEqual([
      'dados/grupo-possivel/censo.meta.yaml: ficha: não existe a Ficha estudos/silva-2020-apps-brasil.md',
    ])
  })

  it('falha com campo ausente, data errada ou sem tabela nem variáveis', () => {
    const texto =
      'ficha: silva-2020-apps-brasil\nbaixado_em: ontem\nscript: x.ts\n'
    expect(
      errosDe(
        montarAcervo([ficha('valid', 'silva-2020-apps-brasil'), meta(texto)]),
      ),
    ).toEqual(
      expect.arrayContaining([
        'dados/grupo-possivel/censo.meta.yaml: baixado_em: use a data como AAAA-MM-DD (veio "ontem")',
        'dados/grupo-possivel/censo.meta.yaml: versao: campo obrigatório ausente',
      ]),
    )
    const semTabela = META_OK.replace(/^tabela:.*\n/m, '').replace(
      /^variaveis:.*\n/m,
      '',
    )
    expect(
      errosDe(
        montarAcervo([
          ficha('valid', 'silva-2020-apps-brasil'),
          meta(semTabela),
        ]),
      ),
    ).toEqual([
      'dados/grupo-possivel/censo.meta.yaml: diga a tabela ou as variáveis de onde os dados saíram',
    ])
  })
})

describe('o acervo do repositório', () => {
  it('carrega as Fichas: as 30 antigas não verificadas até serem refeitas (#6), as do IBGE conferidas (#36)', () => {
    const raiz = fileURLToPath(new URL('../../..', import.meta.url))
    const acervo = acervoDe(carregarAcervo(raiz))
    const conferidas = acervo.fichas
      .filter((f) => f.status !== 'nao-verificado')
      .map((f) => f.slug)
    expect(conferidas).toEqual(['ibge-2019-pns', 'ibge-2022-censo-amostra'])
    expect(acervo.fichas).toHaveLength(32)
  })

  it('os dados do Grupo possível citam as Fichas do Censo e da PNS', () => {
    const raiz = fileURLToPath(new URL('../../..', import.meta.url))
    const acervo = acervoDe(carregarAcervo(raiz))
    expect(acervo.dados.map((d) => [d.arquivo, d.ficha])).toEqual([
      ['dados/grupo-possivel/censo-2022.meta.yaml', 'ibge-2022-censo-amostra'],
      ['dados/grupo-possivel/pns-2019.meta.yaml', 'ibge-2019-pns'],
      [
        'dados/grupo-possivel/sidra-10185-municipios.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
      [
        'dados/grupo-possivel/sidra-9514-idade.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
      [
        'dados/grupo-possivel/sidra-9514-municipios.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
    ])
  })

  it('traz as Dicas da tabela antiga, uma por arquivo, sem as ⬜, e nenhuma publicada ainda', () => {
    const raiz = fileURLToPath(new URL('../../..', import.meta.url))
    const acervo = acervoDe(carregarAcervo(raiz))
    expect(acervo.dicas.map((d) => [d.slug, d.forca, d.inferencia])).toEqual([
      ['apps-como-complemento', 'forte', false],
      ['convivencia-repetida', 'moderada', true],
      ['escola-e-eventos-sociais', 'moderada', false],
      ['mensagem-um-pouco-acima', 'moderada', false],
      ['sem-pressa-para-casar', 'forte', false],
    ])
    // As Fichas que as sustentam ainda são ⬜: as Dicas esperam a conferência.
    expect(acervo.dicas.filter((d) => d.publicada)).toEqual([])
  })
})

describe('caminhos e índice', () => {
  it('a Ficha fica em /estudos/<slug>', () => {
    expect(caminhoDaFicha({ slug: 'joel-2020-machine-learning' })).toBe(
      '/estudos/joel-2020-machine-learning',
    )
  })

  it('só Ficha ✅ e 🟡 vai para a busca', () => {
    const acervo = acervoDe(carregarAcervo(fixture('valid')))
    expect(acervo.fichas.filter(fichaIndexavel).map((f) => f.slug)).toEqual([
      'costa-2018-satisfacao',
      'silva-2020-apps-brasil',
    ])
  })
})
