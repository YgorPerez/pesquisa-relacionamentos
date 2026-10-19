// Temas, Guias e Dicas no acervo (#27): esquemas, herança das Fichas e as
// regras de publicação do #7 e do #10. Os casos que falham partem da
// fixture válida e trocam um arquivo só.
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  caminhoDaDica,
  caminhoDoGuia,
  caminhoDoTema,
  carregarAcervo,
  dicaPorSlug,
  dicaPublicada,
  formatarProblemas,
  guiaPorSlug,
  guiasComADica,
  guiasDoTema,
  temaPorSlug,
  lerArquivos,
  montarAcervo,
  type Acervo,
  type Arquivo,
  type Resultado,
} from './index.ts'

const VALIDO = fileURLToPath(new URL('../fixtures/valido', import.meta.url))

function acervoDe(resultado: Resultado): Acervo {
  if (!resultado.ok) throw new Error(formatarProblemas(resultado.erros))
  return resultado.acervo
}

function errosDe(resultado: Resultado): string[] {
  if (resultado.ok) throw new Error('o acervo devia ter falhado')
  return resultado.erros.map((e) => e.mensagem)
}

const arquivosValidos = (): Arquivo[] => [...lerArquivos(VALIDO)]

/** A fixture válida com um arquivo trocado (ou criado). */
function comArquivo(
  caminho: string,
  texto: string | ((original: string) => string),
): Resultado {
  const arquivos = arquivosValidos()
  const i = arquivos.findIndex((a) => a.caminho === caminho)
  const original = i === -1 ? '' : (arquivos[i]?.texto ?? '')
  const novo = {
    caminho,
    texto: typeof texto === 'string' ? texto : texto(original),
  }
  if (i === -1) arquivos.push(novo)
  else arquivos[i] = novo
  return montarAcervo(arquivos)
}

/** A fixture válida com vários arquivos trocados de uma vez. */
function com(trocas: Record<string, (original: string) => string>): Resultado {
  return montarAcervo(
    arquivosValidos().map((a) => {
      const troca = trocas[a.caminho]
      return troca ? { ...a, texto: troca(a.texto) } : a
    }),
  )
}

const sem = (caminho: string): Resultado =>
  montarAcervo(arquivosValidos().filter((a) => a.caminho !== caminho))

const GUIA = 'guias/onde-conhecer/onde-os-casais-se-conhecem.md'
const OUTRO_GUIA = 'guias/onde-conhecer/app-ou-presencial.md'
const TEMA = 'guias/onde-conhecer/_tema.md'
const DICA = 'dicas/apps-como-complemento.md'

describe('Temas e Guias', () => {
  it('lê o Tema da pasta, com título, contexto e os Guias na ordem dele', () => {
    const acervo = acervoDe(carregarAcervo(VALIDO))
    expect(acervo.temas).toEqual([
      {
        slug: 'onde-conhecer',
        arquivo: TEMA,
        titulo: 'Onde conhecer pessoas',
        ordem: ['onde-os-casais-se-conhecem', 'app-ou-presencial'],
        contexto: 'Onde os casais se conhecem e se o lugar muda alguma coisa.',
      },
    ])
    expect(acervo.guias.map((g) => [g.tema, g.slug])).toEqual([
      ['onde-conhecer', 'onde-os-casais-se-conhecem'],
      ['onde-conhecer', 'app-ou-presencial'],
    ])
  })

  it('corta o corpo do Guia em resposta curta, Varia conforme o Perfil? e Limitações', () => {
    const guia = acervoDe(carregarAcervo(VALIDO)).guias[0]
    expect(guia).toMatchObject({
      pergunta: 'Onde os casais se ==conhecem== hoje?',
      confianca: 'moderada',
      respostaCurta:
        'No Brasil, ==18% dos adultos jovens== conheceram o parceiro por app [@silva-2020-apps-brasil]. Nos EUA, a satisfação é parecida [@costa-2018-satisfacao].',
      variaConformePerfil:
        'Entre 18 e 24 anos a fatia sobe [@silva-2020-apps-brasil].',
      limitacoes: '- Só capitais.',
      dicas: ['apps-como-complemento'],
      relacionadas: ['app-ou-presencial'],
    })
  })

  it('o achado herda país, período e cobre da Ficha, e vale_para troca o cobre por um recorte', () => {
    const [herda, recorte] =
      acervoDe(carregarAcervo(VALIDO)).guias[0]?.achados ?? []
    expect(herda).toEqual({
      texto: '18% dos adultos jovens conheceram o parceiro por app.',
      fichas: ['silva-2020-apps-brasil'],
      paises: ['Brasil'],
      periodo: '2019',
      cobre: [
        {
          generos: ['homem', 'mulher'],
          procura: ['homens', 'mulheres'],
          idades: { min: 18, max: 35 },
        },
      ],
      recorte: false,
    })
    expect(recorte).toMatchObject({
      paises: ['EUA'],
      periodo: '2017–2018',
      cobre: [{ casal: 'hetero', idades: { min: 25, max: 60 } }],
      recorte: true,
    })
  })

  it('numera as Fichas citadas na ordem em que aparecem na página', () => {
    const acervo = acervoDe(carregarAcervo(VALIDO))
    expect(acervo.guias[0]?.fichasCitadas).toEqual([
      'silva-2020-apps-brasil',
      'costa-2018-satisfacao',
    ])
    expect(acervo.guias[1]?.fichasCitadas).toEqual(['costa-2018-satisfacao'])
  })
})

describe('Dicas', () => {
  it('a Dica herda país, período e cobre das Fichas e diz se é inferência', () => {
    const dica = acervoDe(carregarAcervo(VALIDO)).dicas.find(
      (d) => d.slug === 'apps-como-complemento',
    )
    expect(dica).toMatchObject({
      arquivo: DICA,
      texto: 'Use o app como complemento, não como o único caminho.',
      forca: 'moderada',
      inferencia: true,
      paises: ['Brasil', 'EUA'],
      periodo: '2019; 2017',
      cobre: [
        {
          generos: ['homem', 'mulher'],
          procura: ['homens', 'mulheres'],
          idades: { min: 18, max: 35 },
        },
        { casal: 'hetero' },
      ],
      recorte: false,
      publicada: true,
    })
  })

  it('a Dica que se apoia numa Ficha ⬜ fica fora do site, sem derrubar o build', () => {
    const dica = acervoDe(carregarAcervo(VALIDO)).dicas.find(
      (d) => d.slug === 'encontros-presenciais',
    )
    expect(dica).toMatchObject({ inferencia: false, publicada: false })
  })
})

describe('caminhos e consultas', () => {
  it('Tema em /<tema>, Guia em /<tema>/<slug> e Dica em /dicas/<slug>', () => {
    const acervo = acervoDe(carregarAcervo(VALIDO))
    expect(caminhoDoTema({ slug: 'onde-conhecer' })).toBe('/onde-conhecer')
    expect(acervo.guias.map(caminhoDoGuia)).toEqual([
      '/onde-conhecer/onde-os-casais-se-conhecem',
      '/onde-conhecer/app-ou-presencial',
    ])
    expect(caminhoDaDica({ slug: 'apps-como-complemento' })).toBe(
      '/dicas/apps-como-complemento',
    )
  })

  it('acha Guia, Tema e Dica pelo slug, e os Guias em que a Dica aparece', () => {
    const acervo = acervoDe(carregarAcervo(VALIDO))
    expect(guiaPorSlug(acervo, 'app-ou-presencial')?.pergunta).toBe(
      'App ou presencial?',
    )
    expect(temaPorSlug(acervo, 'onde-conhecer')?.titulo).toBe(
      'Onde conhecer pessoas',
    )
    expect(dicaPorSlug(acervo, 'apps-como-complemento')?.forca).toBe('moderada')
    expect(guiasDoTema(acervo, 'onde-conhecer').map((g) => g.slug)).toEqual([
      'onde-os-casais-se-conhecem',
      'app-ou-presencial',
    ])
    expect(
      guiasComADica(acervo, 'apps-como-complemento').map((g) => g.slug),
    ).toEqual(['onde-os-casais-se-conhecem'])
    expect(acervo.dicas.filter(dicaPublicada).map((d) => d.slug)).toEqual([
      'apps-como-complemento',
    ])
  })
})

describe('regras de publicação', () => {
  it('a fixture válida passa no build', () => {
    expect(montarAcervo(arquivosValidos()).ok).toBe(true)
  })

  it('referência a Ficha, Dica ou Guia que não existe falha', () => {
    const erros = errosDe(
      comArquivo(GUIA, (t) =>
        t
          .replace(
            'fichas: [costa-2018-satisfacao]\n    pais',
            'fichas: [costa-2099-sumiu]\n    pais',
          )
          .replace('dicas: [apps-como-complemento]', 'dicas: [dica-que-sumiu]')
          .replace(
            'relacionadas: [app-ou-presencial]',
            'relacionadas: [guia-que-sumiu]',
          )
          .replace(
            'a fatia sobe [@silva-2020-apps-brasil]',
            'a fatia sobe [@silva-2099-sumiu]',
          ),
      ),
    )
    expect(erros).toEqual([
      `${GUIA}: achados.1.fichas: a Ficha "costa-2099-sumiu" não existe em estudos/`,
      `${GUIA}: Varia conforme o Perfil?: a Ficha "silva-2099-sumiu" não existe em estudos/`,
      `${GUIA}: dicas: a Dica "dica-que-sumiu" não existe em dicas/`,
      `${GUIA}: relacionadas: o Guia "guia-que-sumiu" não existe em guias/`,
    ])
  })

  it('Dica que cita Ficha inexistente falha', () => {
    expect(
      errosDe(
        comArquivo(DICA, (t) =>
          t.replace('costa-2018-satisfacao', 'costa-2099-sumiu'),
        ),
      ),
    ).toEqual([
      `${DICA}: fichas: a Ficha "costa-2099-sumiu" não existe em estudos/`,
    ])
  })

  it('Guia que cita Ficha ⬜, no texto ou num Mito, falha', () => {
    const erros = errosDe(
      comArquivo(OUTRO_GUIA, (t) =>
        t
          .replace(
            'Depende de quem você procura [@costa-2018-satisfacao]',
            'Depende [@lima-2015-encontros]',
          )
          .replace(
            'mitos: []',
            'mitos: [{ afirmacao: "X.", por_que_nao: "Y.", fichas: [lima-2015-encontros] }]',
          ),
      ),
    )
    const motivo =
      'cita a Ficha "lima-2015-encontros", que não foi verificada (⬜); um Guia só cita Ficha ✅ ou 🟡'
    expect(erros).toEqual([
      `${OUTRO_GUIA}: resposta curta: ${motivo}`,
      `${OUTRO_GUIA}: mitos.0.fichas: ${motivo}`,
    ])
  })

  it('Guia que traz uma Dica apoiada em Ficha ⬜ falha', () => {
    expect(
      errosDe(
        comArquivo(OUTRO_GUIA, (t) =>
          t.replace('dicas: []', 'dicas: [encontros-presenciais]'),
        ),
      ),
    ).toEqual([
      `${OUTRO_GUIA}: dicas: a Dica "encontros-presenciais" cita a Ficha "lima-2015-encontros", que não foi verificada (⬜); um Guia só cita Ficha ✅ ou 🟡`,
    ])
  })

  const SILVA = 'estudos/silva-2020-apps-brasil.md'
  const COSTA = 'estudos/costa-2018-satisfacao.md'
  const soSilva = (t: string) =>
    t
      .replaceAll('costa-2018-satisfacao', 'silva-2020-apps-brasil')
      .replace('confianca: moderada', 'confianca: forte')

  it('Confiança forte com Ficha ✅ forte passa', () => {
    expect(comArquivo(OUTRO_GUIA, soSilva).ok).toBe(true)
  })

  it('Confiança acima da Ficha mais forte falha', () => {
    const erros = errosDe(
      com({
        [OUTRO_GUIA]: soSilva,
        [SILVA]: (t) => t.replace('forca: forte', 'forca: moderada'),
      }),
    )
    expect(erros).toEqual([
      `${OUTRO_GUIA}: confianca: a Confiança (forte) passa da Ficha mais forte que o Guia cita (moderada)`,
    ])
  })

  it('Confiança acima de moderada com só Fichas 🟡 falha', () => {
    const erros = errosDe(
      com({
        [OUTRO_GUIA]: (t) =>
          t.replace('confianca: moderada', 'confianca: forte'),
        [COSTA]: (t) => t.replace('forca: moderada', 'forca: forte'),
      }),
    )
    expect(erros).toEqual([
      `${OUTRO_GUIA}: confianca: a Confiança (forte) passa de moderada, e o Guia só cita Fichas parciais (🟡)`,
    ])
  })

  it('Inferência com Força acima de moderada falha', () => {
    expect(
      errosDe(
        comArquivo(DICA, (t) => t.replace('forca: moderada', 'forca: forte')),
      ),
    ).toEqual([
      `${DICA}: forca: uma Inferência tem Força moderada no máximo (veio forte)`,
    ])
  })

  it('a ordem do Tema precisa listar os Guias da pasta, cada um uma vez', () => {
    const faltando = errosDe(
      comArquivo(TEMA, (t) => t.replace(', app-ou-presencial]', ']')),
    )
    expect(faltando).toEqual([
      `${TEMA}: ordem: o Guia "app-ou-presencial" está na pasta e falta na ordem`,
    ])
    const sobrando = errosDe(
      comArquivo(TEMA, (t) =>
        t.replace(
          ', app-ou-presencial]',
          ', app-ou-presencial, onde-os-casais-se-conhecem, sem-arquivo]',
        ),
      ),
    )
    expect(sobrando).toEqual([
      `${TEMA}: ordem: o Guia "onde-os-casais-se-conhecem" aparece mais de uma vez`,
      `${TEMA}: ordem: o Guia "sem-arquivo" não existe em guias/onde-conhecer/`,
    ])
  })

  it('pasta de Guias sem _tema.md falha', () => {
    expect(errosDe(sem(TEMA))).toEqual([
      'guias/onde-conhecer: falta o _tema.md com o título e a ordem dos Guias',
    ])
  })

  it('slug de Tema igual a uma rota do app falha', () => {
    const arquivos = arquivosValidos().map((a) => ({
      ...a,
      caminho: a.caminho.replace('guias/onde-conhecer/', 'guias/dicas/'),
    }))
    expect(errosDe(montarAcervo(arquivos))).toEqual([
      'guias/dicas/_tema.md: o Tema não pode se chamar "dicas", que é uma rota do site (estudos, dicas, grupo-possivel, prioridades, privacidade, sitemap.xml, robots.txt)',
    ])
  })

  it('dois Guias com o mesmo slug, em Temas diferentes, falham', () => {
    const arquivos = [
      ...arquivosValidos(),
      {
        caminho: 'guias/outro-tema/_tema.md',
        texto: '---\ntitulo: Outro\nordem: [app-ou-presencial]\n---\n\nX.\n',
      },
      {
        caminho: 'guias/outro-tema/app-ou-presencial.md',
        texto:
          arquivosValidos().find((a) => a.caminho === OUTRO_GUIA)?.texto ?? '',
      },
    ]
    expect(errosDe(montarAcervo(arquivos))).toEqual([
      `guias/outro-tema/app-ou-presencial.md: o slug "app-ou-presencial" já é do Guia ${OUTRO_GUIA}; o Guia é citado só pelo slug`,
    ])
  })

  it('vale_para fora das listas fechadas falha', () => {
    expect(
      errosDe(
        comArquivo(GUIA, (t) =>
          t.replace('vale_para: { casal: hetero', 'vale_para: { casal: misto'),
        ),
      ),
    ).toEqual([
      `${GUIA}: achados.1.vale_para.casal: valor fora da lista fechada (hetero | mesmo-sexo) (veio "misto")`,
    ])
  })

  it('a Pergunta leva no máximo uma palavra em amarelo', () => {
    expect(
      errosDe(
        comArquivo(GUIA, (t) =>
          t.replace('Onde os casais', '==Onde== os casais'),
        ),
      ),
    ).toEqual([
      `${GUIA}: pergunta: a Pergunta leva no máximo uma palavra em amarelo (==palavra==)`,
    ])
  })

  it('o corpo do Guia precisa da resposta curta e das duas seções, e nada mais', () => {
    const erros = errosDe(
      comArquivo(OUTRO_GUIA, (t) =>
        t
          .replace(/\nDepende[^\n]*\n/, '\n')
          .replace('## Limitações', '## Outra coisa'),
      ),
    )
    expect(erros).toEqual([
      `${OUTRO_GUIA}: falta a resposta curta antes do primeiro "##"`,
      `${OUTRO_GUIA}: Limitações: falta a seção "## Limitações"`,
      `${OUTRO_GUIA}: Outra coisa: seção desconhecida "## Outra coisa"; o corpo do Guia tem só a resposta curta, "## Varia conforme o Perfil?" e "## Limitações"`,
    ])
  })
})
