// O arquivo de Prioridades (story 99): por característica × desfecho, o
// degrau, a medida, o texto simples e a Ficha, e o viés por gênero.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  formatarProblemas,
  lerArquivos,
  montarAcervo,
  type Arquivo,
  type Resultado,
} from './index.ts'

const fixture = (nome: string) =>
  fileURLToPath(new URL(`../fixtures/${nome}`, import.meta.url))
const ficha = (slug: string): Arquivo => ({
  caminho: `estudos/${slug}.md`,
  texto: readFileSync(`${fixture('valido')}/estudos/${slug}.md`, 'utf8'),
})
// silva-2020 é ✅, costa-2018 é 🟡, lima-2015 é ⬜.
const FICHAS = [
  ficha('silva-2020-apps-brasil'),
  ficha('costa-2018-satisfacao'),
  ficha('lima-2015-encontros'),
]

const ARQUIVO = 'dados/prioridades/prioridades.yaml'
const META: Arquivo = {
  caminho: 'dados/prioridades/prioridades.meta.yaml',
  texto: `ficha: silva-2020-apps-brasil
variaveis: [degrau, medida, texto_simples, ficha, vies]
baixado_em: 2026-10-19
script: compilado à mão a partir das Fichas de cada célula
versao: "1"
`,
}

const PRIORIDADES = `satisfacao_explicada:
  ficha: silva-2020-apps-brasil
  relacao: 45
  parceiro: 5
  sem_explicacao: 50
caracteristicas:
  - id: aparencia
    nome: Aparência
    atracao: { degrau: 3, medida: "r ≈ 0,40", texto_simples: Quem é mais bonito atrai mais., ficha: silva-2020-apps-brasil }
    satisfacao: { degrau: 2, texto_simples: "Só um pouco, e só no começo.", ficha: costa-2018-satisfacao }
    duracao: { degrau: 0, texto_simples: Nenhum estudo lido mede isso. }
    vies: { todos: As pessoas dão menos peso à aparência quando dizem o que querem. }
  - id: renda
    nome: Renda
    atracao: { degrau: 2, texto_simples: Pesa pouco na atração., ficha: silva-2020-apps-brasil }
    satisfacao: { degrau: 0, texto_simples: Nenhum estudo lido mede isso. }
    duracao: { degrau: 1, texto_simples: Quase nada., ficha: costa-2018-satisfacao }
    vies: { homem: Homens dão menos peso., mulher: Mulheres dão mais peso. }
`

const com = (texto: string, ...outros: Arquivo[]): Arquivo[] => [
  ...FICHAS,
  META,
  { caminho: ARQUIVO, texto },
  ...outros,
]

function erros(resultado: Resultado): string[] {
  if (resultado.ok) throw new Error('o acervo devia ter falhado')
  return resultado.erros.map((e) => e.mensagem)
}

function prioridadesDe(resultado: Resultado) {
  if (!resultado.ok) throw new Error(formatarProblemas(resultado.erros))
  return resultado.acervo.prioridades
}

describe('arquivo de Prioridades', () => {
  it('lê as características com o degrau de cada desfecho e a barra da satisfação', () => {
    const prioridades = prioridadesDe(montarAcervo(com(PRIORIDADES)))
    expect(prioridades?.arquivo).toBe(ARQUIVO)
    expect(prioridades?.satisfacao_explicada).toEqual({
      ficha: 'silva-2020-apps-brasil',
      relacao: 45,
      parceiro: 5,
      sem_explicacao: 50,
    })
    expect(
      prioridades?.caracteristicas.map((c) => [
        c.id,
        c.atracao.degrau,
        c.satisfacao.degrau,
        c.duracao.degrau,
      ]),
    ).toEqual([
      ['aparencia', 3, 2, 0],
      ['renda', 2, 0, 1],
    ])
    expect(prioridades?.caracteristicas[0]?.atracao).toEqual({
      degrau: 3,
      medida: 'r ≈ 0,40',
      texto_simples: 'Quem é mais bonito atrai mais.',
      ficha: 'silva-2020-apps-brasil',
    })
    expect(prioridades?.caracteristicas[1]?.vies).toEqual({
      homem: 'Homens dão menos peso.',
      mulher: 'Mulheres dão mais peso.',
    })
  })

  it('o .meta.yaml dele entra nos dados como os outros', () => {
    const resultado = montarAcervo(com(PRIORIDADES))
    if (!resultado.ok) throw new Error(formatarProblemas(resultado.erros))
    expect(resultado.acervo.dados.map((d) => d.arquivo)).toEqual([
      'dados/prioridades/prioridades.meta.yaml',
    ])
  })

  it('sem o arquivo, não há Prioridades', () => {
    expect(prioridadesDe(montarAcervo(FICHAS))).toBeNull()
  })

  it('falha sem o .meta.yaml ao lado', () => {
    expect(
      erros(
        montarAcervo([...FICHAS, { caminho: ARQUIVO, texto: PRIORIDADES }]),
      ),
    ).toEqual([
      `${ARQUIVO}: falta o prioridades.meta.yaml ao lado, com a Ficha, as variáveis, a data, o script e a versão`,
    ])
  })

  it('falha quando uma célula cita Ficha ⬜ ou que não existe', () => {
    const texto = PRIORIDADES.replace(
      'ficha: costa-2018-satisfacao }\n    duracao: { degrau: 0',
      'ficha: lima-2015-encontros }\n    duracao: { degrau: 0',
    ).replace(
      'Pesa pouco na atração., ficha: silva-2020-apps-brasil',
      'Pesa pouco na atração., ficha: sumida-2000',
    )
    expect(erros(montarAcervo(com(texto)))).toEqual([
      `${ARQUIVO}: caracteristicas.0.satisfacao.ficha: lima-2015-encontros é ⬜ (não verificada); dados só citam Ficha ✅ ou 🟡`,
      `${ARQUIVO}: caracteristicas.1.atracao.ficha: não existe a Ficha estudos/sumida-2000.md`,
    ])
  })

  it('falha quando a barra da satisfação cita Ficha ⬜', () => {
    const texto = PRIORIDADES.replace(
      '  ficha: silva-2020-apps-brasil\n  relacao',
      '  ficha: lima-2015-encontros\n  relacao',
    )
    expect(erros(montarAcervo(com(texto)))).toEqual([
      `${ARQUIVO}: satisfacao_explicada.ficha: lima-2015-encontros é ⬜ (não verificada); dados só citam Ficha ✅ ou 🟡`,
    ])
  })

  it('falha quando um degrau acima de "não sabemos" não diz a Ficha', () => {
    const texto = PRIORIDADES.replace(
      'Pesa pouco na atração., ficha: silva-2020-apps-brasil',
      'Pesa pouco na atração.',
    )
    expect(erros(montarAcervo(com(texto)))).toEqual([
      `${ARQUIVO}: caracteristicas.1.atracao.ficha: o degrau 2 precisa da Ficha que o sustenta; sem Ficha, só o 0 ("não sabemos")`,
    ])
  })

  it('falha com degrau fora de 0 a 3, id repetida e barra que não soma 100', () => {
    const texto = PRIORIDADES.replace('degrau: 3, medida', 'degrau: 4, medida')
      .replace('id: renda', 'id: aparencia')
      .replace('parceiro: 5', 'parceiro: 6')
    expect(erros(montarAcervo(com(texto)))).toEqual([
      `${ARQUIVO}: caracteristicas.0.atracao.degrau: valor fora da lista fechada (0 | 1 | 2 | 3) (veio 4)`,
    ])
    const semDegrauRuim = PRIORIDADES.replace(
      'id: renda',
      'id: aparencia',
    ).replace('parceiro: 5', 'parceiro: 6')
    expect(erros(montarAcervo(com(semDegrauRuim)))).toEqual([
      `${ARQUIVO}: satisfacao_explicada: relação, parceiro e sem explicação somam 101%, e não 100%`,
      `${ARQUIVO}: caracteristicas.1.id: a característica "aparencia" aparece mais de uma vez`,
    ])
  })

  it('falha com campo desconhecido e viés sem gênero nenhum', () => {
    const texto = PRIORIDADES.replace('vies: { todos:', 'vies: { todas:')
    expect(erros(montarAcervo(com(texto)))).toEqual([
      `${ARQUIVO}: caracteristicas.0.vies.todas: campo desconhecido`,
    ])
  })
})

describe('o rascunho de Prioridades do repositório', () => {
  const raiz = fileURLToPath(new URL('../../..', import.meta.url))

  it('fica fora do build enquanto as Fichas que ele cita são ⬜ (#39)', () => {
    const lidos = lerArquivos(raiz).map((a) => a.caminho)
    expect(lidos.filter((c) => c.startsWith('dados/prioridades/'))).toEqual([])
  })

  it('só falha por citar Fichas ⬜: com as Fichas conferidas, ele publica', () => {
    const rascunho = (nome: string): Arquivo => ({
      caminho: `dados/prioridades/${nome}`,
      texto: readFileSync(`${raiz}/dados/prioridades/_${nome}`, 'utf8'),
    })
    const resultado = montarAcervo([
      ...lerArquivos(raiz),
      rascunho('prioridades.yaml'),
      rascunho('prioridades.meta.yaml'),
    ])
    const problemas = resultado.ok ? [] : resultado.erros.map((e) => e.mensagem)
    expect(problemas.length).toBeGreaterThan(0)
    expect(
      problemas.filter((m) => !m.includes('é ⬜ (não verificada)')),
    ).toEqual([])

    // Com as Fichas citadas marcadas como conferidas, o mesmo rascunho passa.
    const conferidas = lerArquivos(raiz).map((a) =>
      a.caminho.startsWith('estudos/')
        ? {
            ...a,
            texto: a.texto.replace(
              /^status: nao-verificado$/m,
              'status: parcial\nverificado_em: 2026-10-19',
            ),
          }
        : a,
    )
    const publicado = montarAcervo([
      ...conferidas,
      rascunho('prioridades.yaml'),
      rascunho('prioridades.meta.yaml'),
    ])
    if (!publicado.ok) throw new Error(formatarProblemas(publicado.erros))
    expect(
      publicado.acervo.prioridades?.caracteristicas.map((c) => c.id),
    ).toEqual([
      'aparencia',
      'sexo',
      'renda',
      'calma',
      'gentileza',
      'responsavel',
      'parecido',
      'escolaridade',
      'religiao',
      'idade',
    ])
  })
})
