// Topics, guides and tips in the library (#27): schemas, inheritance from the
// fact sheets and the publication rules of #7 and #10. The failing cases start
// from the valid fixture and swap a single file.
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  tipPath,
  guidePath,
  topicPath,
  loadLibrary,
  tipBySlug,
  isTipPublished,
  formatProblems,
  guideBySlug,
  guidesWithTip,
  topicGuides,
  topicBySlug,
  readFiles,
  buildLibrary,
  type Library,
  type ContentFile,
  type LoadResult,
} from './index.ts'

const VALID = fileURLToPath(new URL('../fixtures/valid', import.meta.url))

function libraryOf(result: LoadResult): Library {
  if (!result.ok) throw new Error(formatProblems(result.errors))
  return result.library
}

function errorsOf(result: LoadResult): string[] {
  if (result.ok) throw new Error('the library should have failed')
  return result.errors.map((e) => e.message)
}

const validFiles = (): ContentFile[] => [...readFiles(VALID)]

/** The valid fixture with one file swapped (or created). */
function withFile(
  path: string,
  text: string | ((original: string) => string),
): LoadResult {
  const files = validFiles()
  const i = files.findIndex((a) => a.path === path)
  const original = i === -1 ? '' : (files[i]?.text ?? '')
  const current = {
    path,
    text: typeof text === 'string' ? text : text(original),
  }
  if (i === -1) files.push(current)
  else files[i] = current
  return buildLibrary(files)
}

/** The valid fixture with several files swapped at once. */
function withFiles(
  swaps: Record<string, (original: string) => string>,
): LoadResult {
  return buildLibrary(
    validFiles().map((a) => {
      const swap = swaps[a.path]
      return swap ? { ...a, text: swap(a.text) } : a
    }),
  )
}

const without = (path: string): LoadResult =>
  buildLibrary(validFiles().filter((a) => a.path !== path))

const GUIDE = 'guias/onde-conhecer/onde-os-casais-se-conhecem.md'
const OTHER_GUIDE = 'guias/onde-conhecer/app-ou-presencial.md'
const TOPIC = 'guias/onde-conhecer/_tema.md'
const TIP = 'dicas/apps-como-complemento.md'

describe('topics and guides', () => {
  it("reads the folder's topic, with title, context and its guides in order", () => {
    const library = libraryOf(loadLibrary(VALID))
    expect(library.topics).toEqual([
      {
        slug: 'onde-conhecer',
        file: TOPIC,
        titulo: 'Onde conhecer pessoas',
        ordem: ['onde-os-casais-se-conhecem', 'app-ou-presencial'],
        context: 'Onde os casais se conhecem e se o lugar muda alguma coisa.',
      },
    ])
    expect(library.guides.map((g) => [g.topic, g.slug])).toEqual([
      ['onde-conhecer', 'onde-os-casais-se-conhecem'],
      ['onde-conhecer', 'app-ou-presencial'],
    ])
  })

  it('cuts the guide body into short answer, Varia conforme o Perfil? and Limitações', () => {
    const guide = libraryOf(loadLibrary(VALID)).guides[0]
    expect(guide).toMatchObject({
      pergunta: 'Onde os casais se ==conhecem== hoje?',
      confianca: 'moderada',
      shortAnswer:
        'No Brasil, ==18% dos adultos jovens== conheceram o parceiro por app [@silva-2020-apps-brasil]. Nos EUA, a satisfação é parecida [@costa-2018-satisfacao].',
      variesByProfile:
        'Entre 18 e 24 anos a fatia sobe [@silva-2020-apps-brasil].',
      limitations: '- Só capitais.',
      dicas: ['apps-como-complemento'],
      relacionadas: ['app-ou-presencial'],
    })
  })

  it("a finding inherits the fact sheet's country, period and coverage, and vale_para swaps the coverage for a scope", () => {
    const [inherits, scoped] =
      libraryOf(loadLibrary(VALID)).guides[0]?.achados ?? []
    expect(inherits).toEqual({
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
      scoped: false,
    })
    expect(scoped).toMatchObject({
      paises: ['EUA'],
      periodo: '2017–2018',
      cobre: [{ casal: 'hetero', idades: { min: 25, max: 60 } }],
      scoped: true,
    })
  })

  it('numbers the cited fact sheets in the order they appear on the page', () => {
    const library = libraryOf(loadLibrary(VALID))
    expect(library.guides[0]?.citedFactSheets).toEqual([
      'silva-2020-apps-brasil',
      'costa-2018-satisfacao',
    ])
    expect(library.guides[1]?.citedFactSheets).toEqual([
      'costa-2018-satisfacao',
    ])
  })
})

describe('tips', () => {
  it("a tip inherits the fact sheets' country, period and coverage and says whether it is an inference", () => {
    const tip = libraryOf(loadLibrary(VALID)).tips.find(
      (d) => d.slug === 'apps-como-complemento',
    )
    expect(tip).toMatchObject({
      file: TIP,
      text: 'Use o app como complemento, não como o único caminho.',
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
      scoped: false,
      published: true,
    })
  })

  it('a tip resting on a ⬜ fact sheet stays off the site, without breaking the build', () => {
    const tip = libraryOf(loadLibrary(VALID)).tips.find(
      (d) => d.slug === 'encontros-presenciais',
    )
    expect(tip).toMatchObject({ inferencia: false, published: false })
  })
})

describe('paths and queries', () => {
  it('a topic at /<topic>, a guide at /<topic>/<slug> and a tip at /dicas/<slug>', () => {
    const library = libraryOf(loadLibrary(VALID))
    expect(topicPath({ slug: 'onde-conhecer' })).toBe('/onde-conhecer')
    expect(library.guides.map(guidePath)).toEqual([
      '/onde-conhecer/onde-os-casais-se-conhecem',
      '/onde-conhecer/app-ou-presencial',
    ])
    expect(tipPath({ slug: 'apps-como-complemento' })).toBe(
      '/dicas/apps-como-complemento',
    )
  })

  it('finds a guide, topic and tip by slug, and the guides where a tip appears', () => {
    const library = libraryOf(loadLibrary(VALID))
    expect(guideBySlug(library, 'app-ou-presencial')?.pergunta).toBe(
      'App ou presencial?',
    )
    expect(topicBySlug(library, 'onde-conhecer')?.titulo).toBe(
      'Onde conhecer pessoas',
    )
    expect(tipBySlug(library, 'apps-como-complemento')?.forca).toBe('moderada')
    expect(topicGuides(library, 'onde-conhecer').map((g) => g.slug)).toEqual([
      'onde-os-casais-se-conhecem',
      'app-ou-presencial',
    ])
    expect(
      guidesWithTip(library, 'apps-como-complemento').map((g) => g.slug),
    ).toEqual(['onde-os-casais-se-conhecem'])
    expect(library.tips.filter(isTipPublished).map((d) => d.slug)).toEqual([
      'apps-como-complemento',
    ])
  })
})

describe('publication rules', () => {
  it('the valid fixture passes the build', () => {
    expect(buildLibrary(validFiles()).ok).toBe(true)
  })

  it('a reference to a fact sheet, tip or guide that does not exist fails', () => {
    const errors = errorsOf(
      withFile(GUIDE, (t) =>
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
    expect(errors).toEqual([
      `${GUIDE}: achados.1.fichas: the fact sheet "costa-2099-sumiu" does not exist in estudos/`,
      `${GUIDE}: Varia conforme o Perfil?: the fact sheet "silva-2099-sumiu" does not exist in estudos/`,
      `${GUIDE}: dicas: the tip "dica-que-sumiu" does not exist in dicas/`,
      `${GUIDE}: relacionadas: the guide "guia-que-sumiu" does not exist in guias/`,
    ])
  })

  it('a tip citing a missing fact sheet fails', () => {
    expect(
      errorsOf(
        withFile(TIP, (t) =>
          t.replace('costa-2018-satisfacao', 'costa-2099-sumiu'),
        ),
      ),
    ).toEqual([
      `${TIP}: fichas: the fact sheet "costa-2099-sumiu" does not exist in estudos/`,
    ])
  })

  it('a guide citing a ⬜ fact sheet, in the text or in a myth, fails', () => {
    const errors = errorsOf(
      withFile(OTHER_GUIDE, (t) =>
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
    const reason =
      'cites the fact sheet "lima-2015-encontros", which was not verified (⬜); a guide only cites ✅ or 🟡 fact sheets'
    expect(errors).toEqual([
      `${OTHER_GUIDE}: short answer: ${reason}`,
      `${OTHER_GUIDE}: mitos.0.fichas: ${reason}`,
    ])
  })

  it('a guide carrying a tip that rests on a ⬜ fact sheet fails', () => {
    expect(
      errorsOf(
        withFile(OTHER_GUIDE, (t) =>
          t.replace('dicas: []', 'dicas: [encontros-presenciais]'),
        ),
      ),
    ).toEqual([
      `${OTHER_GUIDE}: dicas: the tip "encontros-presenciais" cites the fact sheet "lima-2015-encontros", which was not verified (⬜); a guide only cites ✅ or 🟡 fact sheets`,
    ])
  })

  const SILVA = 'estudos/silva-2020-apps-brasil.md'
  const COSTA = 'estudos/costa-2018-satisfacao.md'
  const onlySilva = (t: string) =>
    t
      .replaceAll('costa-2018-satisfacao', 'silva-2020-apps-brasil')
      .replace('confianca: moderada', 'confianca: forte')

  it('strong confidence with a strong ✅ fact sheet passes', () => {
    expect(withFile(OTHER_GUIDE, onlySilva).ok).toBe(true)
  })

  it('confidence above the strongest fact sheet fails', () => {
    const errors = errorsOf(
      withFiles({
        [OTHER_GUIDE]: onlySilva,
        [SILVA]: (t) => t.replace('forca: forte', 'forca: moderada'),
      }),
    )
    expect(errors).toEqual([
      `${OTHER_GUIDE}: confianca: the confidence (forte) is above the strongest fact sheet the guide cites (moderada)`,
    ])
  })

  it('confidence above moderate with only 🟡 fact sheets fails', () => {
    const errors = errorsOf(
      withFiles({
        [OTHER_GUIDE]: (t) =>
          t.replace('confianca: moderada', 'confianca: forte'),
        [COSTA]: (t) => t.replace('forca: moderada', 'forca: forte'),
      }),
    )
    expect(errors).toEqual([
      `${OTHER_GUIDE}: confianca: the confidence (forte) is above moderate, and the guide only cites partial (🟡) fact sheets`,
    ])
  })

  it('an inference with strength above moderate fails', () => {
    expect(
      errorsOf(
        withFile(TIP, (t) => t.replace('forca: moderada', 'forca: forte')),
      ),
    ).toEqual([
      `${TIP}: forca: an inference has at most moderate strength (got forte)`,
    ])
  })

  it("the topic's order must list the folder's guides, each once", () => {
    const missing = errorsOf(
      withFile(TOPIC, (t) => t.replace(', app-ou-presencial]', ']')),
    )
    expect(missing).toEqual([
      `${TOPIC}: ordem: the guide "app-ou-presencial" is in the folder and missing from the order`,
    ])
    const leftover = errorsOf(
      withFile(TOPIC, (t) =>
        t.replace(
          ', app-ou-presencial]',
          ', app-ou-presencial, onde-os-casais-se-conhecem, sem-arquivo]',
        ),
      ),
    )
    expect(leftover).toEqual([
      `${TOPIC}: ordem: the guide "onde-os-casais-se-conhecem" appears more than once`,
      `${TOPIC}: ordem: the guide "sem-arquivo" does not exist in guias/onde-conhecer/`,
    ])
  })

  it('a guide folder without _tema.md fails', () => {
    expect(errorsOf(without(TOPIC))).toEqual([
      'guias/onde-conhecer: missing the _tema.md with the title and the order of the guides',
    ])
  })

  it('a topic slug equal to an app route fails', () => {
    const files = validFiles().map((a) => ({
      ...a,
      path: a.path.replace('guias/onde-conhecer/', 'guias/dicas/'),
    }))
    expect(errorsOf(buildLibrary(files))).toEqual([
      'guias/dicas/_tema.md: a topic cannot be called "dicas", which is a site route (estudos, dicas, grupo-possivel, prioridades, privacidade, sitemap.xml, robots.txt)',
    ])
  })

  it('two guides with the same slug, in different topics, fail', () => {
    const files = [
      ...validFiles(),
      {
        path: 'guias/outro-tema/_tema.md',
        text: '---\ntitulo: Outro\nordem: [app-ou-presencial]\n---\n\nX.\n',
      },
      {
        path: 'guias/outro-tema/app-ou-presencial.md',
        text: validFiles().find((a) => a.path === OTHER_GUIDE)?.text ?? '',
      },
    ]
    expect(errorsOf(buildLibrary(files))).toEqual([
      `guias/outro-tema/app-ou-presencial.md: the slug "app-ou-presencial" already belongs to the guide ${OTHER_GUIDE}; a guide is cited by its slug alone`,
    ])
  })

  it('vale_para outside the closed lists fails', () => {
    expect(
      errorsOf(
        withFile(GUIDE, (t) =>
          t.replace('vale_para: { casal: hetero', 'vale_para: { casal: misto'),
        ),
      ),
    ).toEqual([
      `${GUIDE}: achados.1.vale_para.casal: value outside the closed list (hetero | mesmo-sexo) (got "misto")`,
    ])
  })

  it('the question highlights at most one word in yellow', () => {
    expect(
      errorsOf(
        withFile(GUIDE, (t) =>
          t.replace('Onde os casais', '==Onde== os casais'),
        ),
      ),
    ).toEqual([
      `${GUIDE}: pergunta: the question highlights at most one word in yellow (==word==)`,
    ])
  })

  it('the guide body needs the short answer and the two sections, and nothing else', () => {
    const errors = errorsOf(
      withFile(OTHER_GUIDE, (t) =>
        t
          .replace(/\nDepende[^\n]*\n/, '\n')
          .replace('## Limitações', '## Outra coisa'),
      ),
    )
    expect(errors).toEqual([
      `${OTHER_GUIDE}: missing the short answer before the first "##"`,
      `${OTHER_GUIDE}: Limitações: missing the section "## Limitações"`,
      `${OTHER_GUIDE}: Outra coisa: unknown section "## Outra coisa"; a guide body has only the short answer, "## Varia conforme o Perfil?" and "## Limitações"`,
    ])
  })
})
