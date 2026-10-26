// Guides, Questions and tips in the library (#27, ADR 0042): the one-file
// Guide with its Chapters, inheritance from the fact sheets and the
// publication rules of #7 and #10. The failing cases start from the valid
// fixture and swap a single file.
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  tipPath,
  questionPath,
  topicPath,
  loadLibrary,
  tipBySlug,
  isTipPublished,
  formatProblems,
  questionBySlug,
  questionsWithTip,
  topicQuestions,
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

const GUIDE = 'guides/onde-conhecer.md'
const TIP = 'tips/apps-como-complemento.md'

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

const withGuide = (swap: (original: string) => string) => withFile(GUIDE, swap)

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

/** Another Guide, minimal: one Chapter answering one Question. */
const otherGuide = (
  slug: string,
  position: number,
  question = 'outra-pergunta',
) => `---
title: Outro
position: ${position}
questions:
  - slug: ${question}
    question: Outra?
    answer: Sim [@silva-2020-apps-brasil].
    confidence: moderate
    findings: [um]
findings:
  - id: um
    text: Um achado.
    fact_sheets: [silva-2020-apps-brasil]
---

Abertura de ${slug}.

## Um capítulo

{{question:${question}}}
`

describe('the Guide file', () => {
  it('reads the Topic, its opening, its Chapters in body order and its Questions', () => {
    const library = libraryOf(loadLibrary(VALID))
    expect(library.topics).toHaveLength(1)
    const topic = library.topics[0]
    expect(topic).toMatchObject({
      slug: 'onde-conhecer',
      file: GUIDE,
      title: 'Onde conhecer pessoas',
      position: 10,
      opening: 'Onde os casais se conhecem e se o lugar muda alguma coisa.',
      questions: ['onde-os-casais-se-conhecem', 'app-ou-presencial'],
      unknowns: 'Só capitais, e uma amostra só nos EUA.',
    })
    expect(topic?.chapters).toEqual([
      {
        id: 'o-app-virou-um-caminho-comum',
        title: 'O app virou um caminho comum',
        parts: [
          {
            kind: 'text',
            markdown:
              '{{brazil}} Entre 18 e 24 anos a fatia sobe [@silva-2020-apps-brasil].',
          },
          { kind: 'question', slug: 'onde-os-casais-se-conhecem' },
          { kind: 'myth', id: 'metade-por-app' },
        ],
      },
      {
        id: 'o-lugar-quase-nao-importa',
        title: 'O lugar quase não importa',
        parts: [
          {
            kind: 'text',
            markdown:
              '{{you:satisfacao-parecida}} A diferença de satisfação é pequena [@costa-2018-satisfacao].',
          },
          { kind: 'question', slug: 'app-ou-presencial' },
          { kind: 'tip', slug: 'apps-como-complemento' },
        ],
      },
    ])
    expect(library.questions.map((q) => [q.slug, q.topic, q.chapter])).toEqual([
      [
        'onde-os-casais-se-conhecem',
        'onde-conhecer',
        'o-app-virou-um-caminho-comum',
      ],
      ['app-ou-presencial', 'onde-conhecer', 'o-lugar-quase-nao-importa'],
    ])
  })

  it("a finding inherits the fact sheet's country, period and coverage, and applies_to swaps the coverage for a scope", () => {
    const [inherits, scoped] =
      libraryOf(loadLibrary(VALID)).topics[0]?.findings ?? []
    expect(inherits).toEqual({
      id: 'app-no-brasil',
      text: '18% dos adultos jovens conheceram o parceiro por app.',
      fact_sheets: ['silva-2020-apps-brasil'],
      countries: ['Brasil'],
      period: '2019',
      covers: [
        {
          genders: ['man', 'woman'],
          seeks: ['men', 'women'],
          ages: { min: 18, max: 35 },
        },
      ],
      scoped: false,
    })
    expect(scoped).toMatchObject({
      countries: ['EUA'],
      period: '2017–2018',
      covers: [{ couple: 'different-sex', ages: { min: 25, max: 60 } }],
      scoped: true,
    })
    // A Question gets the findings it names, in that order.
    expect(
      libraryOf(loadLibrary(VALID)).questions[1]?.findings.map((f) => f.id),
    ).toEqual(['satisfacao-parecida'])
  })

  it('numbers the cited fact sheets in page order: opening, each Chapter with what it places, O que levar, O que não se sabe', () => {
    const library = libraryOf(
      withGuide((t) =>
        t
          .replace(
            '{{brazil}} Entre 18',
            'Primeiro [@costa-2018-satisfacao]. {{brazil}} Entre 18',
          )
          .replace('Só capitais', 'Só capitais [@silva-2020-apps-brasil]'),
      ),
    )
    expect(library.topics[0]?.citedFactSheets).toEqual([
      'costa-2018-satisfacao',
      'silva-2020-apps-brasil',
    ])
  })

  it("a Question cites its answer, its findings and its Chapter's fact sheets, which the Fact sheet's page uses", () => {
    const library = libraryOf(loadLibrary(VALID))
    expect(library.questions.map((q) => q.citedFactSheets)).toEqual([
      ['silva-2020-apps-brasil', 'costa-2018-satisfacao'],
      // The Tip of its Chapter also cites Silva.
      ['costa-2018-satisfacao', 'silva-2020-apps-brasil'],
    ])
  })

  it('a heading may give its own anchor, for a title that would repeat a Question slug', () => {
    const library = libraryOf(
      withGuide((t) =>
        t.replace(
          '## O lugar quase não importa',
          '## App ou presencial {#capitulo-app}',
        ),
      ),
    )
    expect(library.topics[0]?.chapters[1]).toMatchObject({
      id: 'capitulo-app',
      title: 'App ou presencial',
    })
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
      strength: 'moderate',
      inference: true,
      countries: ['Brasil', 'EUA'],
      period: '2019; 2017',
      covers: [
        {
          genders: ['man', 'woman'],
          seeks: ['men', 'women'],
          ages: { min: 18, max: 35 },
        },
        { couple: 'different-sex' },
      ],
      scoped: false,
      published: true,
    })
  })

  it('a tip resting on a ⬜ fact sheet stays off the site, without breaking the build', () => {
    const tip = libraryOf(loadLibrary(VALID)).tips.find(
      (d) => d.slug === 'encontros-presenciais',
    )
    expect(tip).toMatchObject({ inference: false, published: false })
  })
})

describe('paths and queries', () => {
  it('a topic at /<topic>, a question at its answer /<topic>#<slug> and a tip at /dicas/<slug>', () => {
    const library = libraryOf(loadLibrary(VALID))
    expect(topicPath({ slug: 'onde-conhecer' })).toBe('/onde-conhecer')
    expect(library.questions.map(questionPath)).toEqual([
      '/onde-conhecer#onde-os-casais-se-conhecem',
      '/onde-conhecer#app-ou-presencial',
    ])
    expect(tipPath({ slug: 'apps-como-complemento' })).toBe(
      '/dicas/apps-como-complemento',
    )
  })

  it('finds a Question, topic and tip by slug, and the Questions of the Chapter that places a tip', () => {
    const library = libraryOf(loadLibrary(VALID))
    expect(questionBySlug(library, 'app-ou-presencial')?.question).toBe(
      'App ou presencial?',
    )
    expect(topicBySlug(library, 'onde-conhecer')?.title).toBe(
      'Onde conhecer pessoas',
    )
    expect(topicQuestions(library, 'onde-conhecer')).toHaveLength(2)
    const tip = tipBySlug(library, 'apps-como-complemento')
    expect(tip && isTipPublished(tip)).toBe(true)
    expect(
      questionsWithTip(library, 'apps-como-complemento').map((q) => q.slug),
    ).toEqual(['app-ou-presencial'])
    expect(questionsWithTip(library, 'encontros-presenciais')).toEqual([])
  })
})

describe('publication rules', () => {
  it('the valid fixture passes the build', () => {
    expect(buildLibrary(validFiles()).ok).toBe(true)
  })

  it('a reference to a fact sheet, tip or Question that does not exist fails', () => {
    const errors = errorsOf(
      withGuide((t) =>
        t
          .replace(
            'fact_sheets: [costa-2018-satisfacao]\n    country',
            'fact_sheets: [costa-2099-sumiu]\n    country',
          )
          .replace('{{tip:apps-como-complemento}}', '{{tip:dica-que-sumiu}}')
          .replace('myths:', 'related: [pergunta-que-sumiu]\nmyths:')
          .replace(
            'a fatia sobe [@silva-2020-apps-brasil]',
            'a fatia sobe [@silva-2099-sumiu]',
          ),
      ),
    )
    expect(errors).toEqual([
      `${GUIDE}: O lugar quase não importa: the tip "dica-que-sumiu" does not exist in tips/`,
      `${GUIDE}: O app virou um caminho comum: the fact sheet "silva-2099-sumiu" does not exist in studies/`,
      `${GUIDE}: findings.1.fact_sheets: the fact sheet "costa-2099-sumiu" does not exist in studies/`,
      `${GUIDE}: related: the Question "pergunta-que-sumiu" does not exist in guides/`,
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
      `${TIP}: fact_sheets: the fact sheet "costa-2099-sumiu" does not exist in studies/`,
    ])
  })

  it('a Guide citing a ⬜ fact sheet, in an answer, a Chapter or a Myth, fails', () => {
    const errors = errorsOf(
      withGuide((t) =>
        t
          .replace(
            'Depende de quem você procura [@costa-2018-satisfacao]',
            'Depende [@lima-2015-encontros]',
          )
          .replace(
            'é pequena [@costa-2018-satisfacao]',
            'é pequena [@lima-2015-encontros]',
          )
          .replace(
            'fact_sheets: [silva-2020-apps-brasil]\n---',
            'fact_sheets: [lima-2015-encontros]\n---',
          ),
      ),
    )
    const reason =
      'cites the fact sheet "lima-2015-encontros", which was not verified (⬜); a guide only cites ✅ or 🟡 fact sheets'
    expect(errors).toEqual([
      `${GUIDE}: O lugar quase não importa: ${reason}`,
      `${GUIDE}: questions.1.answer: ${reason}`,
      `${GUIDE}: myths.0.fact_sheets: ${reason}`,
    ])
  })

  it('a Guide placing a tip that rests on a ⬜ fact sheet fails', () => {
    expect(
      errorsOf(
        withGuide((t) =>
          t.replace(
            '{{tip:apps-como-complemento}}',
            '{{tip:encontros-presenciais}}',
          ),
        ),
      ),
    ).toEqual([
      `${GUIDE}: O lugar quase não importa: the tip "encontros-presenciais" cites the fact sheet "lima-2015-encontros", which was not verified (⬜); a guide only cites ✅ or 🟡 fact sheets`,
    ])
  })

  const SILVA = 'studies/silva-2020-apps-brasil.md'
  const COSTA = 'studies/costa-2018-satisfacao.md'
  /** The second Question rests on the Silva finding, with strong
   * confidence. */
  const onSilva = (t: string) =>
    t.replace(
      'confidence: moderate\n    findings: [satisfacao-parecida]',
      'confidence: strong\n    findings: [app-no-brasil]',
    )

  it('strong confidence with a strong ✅ fact sheet in its findings passes', () => {
    expect(withGuide(onSilva).ok).toBe(true)
  })

  it('the ceiling counts only the findings the Question names, not what its answer or Chapter cite', () => {
    // The answer cites Costa (🟡 moderate) and the Chapter's Tip cites Silva,
    // but the ceiling only looks at the named Silva finding: still strong.
    expect(withGuide(onSilva).ok).toBe(true)
    expect(
      errorsOf(
        withGuide((t) =>
          t.replace(
            'confidence: moderate\n    findings: [satisfacao-parecida]',
            'confidence: strong\n    findings: [satisfacao-parecida]',
          ),
        ),
      ),
    ).toEqual([
      `${GUIDE}: questions.1.confidence: the confidence (strong) is above the strongest fact sheet of the findings the answer rests on (moderate)`,
    ])
  })

  it('confidence above the strongest fact sheet fails', () => {
    const errors = errorsOf(
      withFiles({
        [GUIDE]: onSilva,
        [SILVA]: (t) => t.replace('strength: strong', 'strength: moderate'),
      }),
    )
    expect(errors).toEqual([
      `${GUIDE}: questions.1.confidence: the confidence (strong) is above the strongest fact sheet of the findings the answer rests on (moderate)`,
    ])
  })

  it('confidence above moderate with only 🟡 fact sheets fails', () => {
    const errors = errorsOf(
      withFiles({
        [GUIDE]: (t) =>
          t.replace(
            'confidence: moderate\n    findings: [satisfacao-parecida]',
            'confidence: strong\n    findings: [satisfacao-parecida]',
          ),
        [COSTA]: (t) => t.replace('strength: moderate', 'strength: strong'),
      }),
    )
    expect(errors).toEqual([
      `${GUIDE}: questions.1.confidence: the confidence (strong) is above moderate, and the answer's findings only cite partial (🟡) fact sheets`,
    ])
  })

  it('an inference with strength above moderate fails', () => {
    expect(
      errorsOf(
        withFile(TIP, (t) =>
          t.replace('strength: moderate', 'strength: strong'),
        ),
      ),
    ).toEqual([
      `${TIP}: strength: an inference has at most moderate strength (got strong)`,
    ])
  })

  it('the topics follow their position, and two topics cannot share one', () => {
    const other = (position: number): ContentFile[] => [
      ...validFiles(),
      { path: 'guides/conversar.md', text: otherGuide('conversar', position) },
    ]
    // "conversar" comes first in slug order, and after by its position.
    expect(
      libraryOf(buildLibrary(other(15))).topics.map((t) => t.slug),
    ).toEqual(['onde-conhecer', 'conversar'])
    expect(errorsOf(buildLibrary(other(10)))).toEqual([
      `${GUIDE}: position: the position 10 already belongs to the topic "conversar"; each topic has its own place on the home page`,
    ])
  })

  it('a folder of Question files left in guides/ fails, so no Question disappears without a word', () => {
    // On disk: the valid fixture with an old Question folder left over.
    const root = mkdtempSync(join(tmpdir(), 'guides-'))
    try {
      cpSync(VALID, root, { recursive: true })
      mkdirSync(join(root, 'guides/onde-conhecer'))
      writeFileSync(join(root, 'guides/onde-conhecer/velha.md'), '---\n---\n')
      expect(errorsOf(loadLibrary(root))).toEqual([
        'guides/onde-conhecer/velha.md: a Guide is one file, guides/<topic>.md; the folders of Question files are gone (ADR 0042)',
      ])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('a topic slug equal to an app route fails', () => {
    const files = validFiles().map((a) => ({
      ...a,
      path: a.path.replace(GUIDE, 'guides/dicas.md'),
    }))
    expect(errorsOf(buildLibrary(files))).toEqual([
      'guides/dicas.md: a topic cannot be called "dicas", which is a site route (estudos, dicas, grupo-possivel, prioridades, privacidade, sitemap.xml, robots.txt)',
    ])
  })

  it('two Questions with the same slug, in different Guides, fail', () => {
    const files = [
      ...validFiles(),
      {
        path: 'guides/outro-tema.md',
        text: otherGuide('outro-tema', 20, 'app-ou-presencial'),
      },
    ]
    expect(errorsOf(buildLibrary(files))).toEqual([
      `guides/outro-tema.md: questions: the Question "app-ou-presencial" already belongs to ${GUIDE}; a Question is cited by its slug alone`,
    ])
  })

  it('applies_to outside the closed lists fails', () => {
    expect(
      errorsOf(
        withGuide((t) =>
          t.replace(
            'applies_to: { couple: different-sex',
            'applies_to: { couple: misto',
          ),
        ),
      ),
    ).toEqual([
      `${GUIDE}: findings.1.applies_to.couple: value outside the closed list (different-sex | same-sex) (got "misto")`,
    ])
  })

  it('the question highlights at most one word in yellow', () => {
    expect(
      errorsOf(
        withGuide((t) => t.replace('Onde os casais', '==Onde== os casais')),
      ),
    ).toEqual([
      `${GUIDE}: questions.0.question: the question highlights at most one word in yellow (==word==)`,
    ])
  })
})

describe('the Chapters and what they place (ADR 0042)', () => {
  it('each Question is answered once, in a Chapter, and each answer rests on declared findings', () => {
    expect(
      errorsOf(
        withGuide((t) =>
          t
            .replace('{{question:app-ou-presencial}}', '')
            .replace(
              '{{myth:metade-por-app}}',
              '{{question:onde-os-casais-se-conhecem}}\n\n{{myth:metade-por-app}}',
            )
            .replace('findings: [satisfacao-parecida]', 'findings: [sumiu]'),
        ),
      ),
    ).toEqual([
      `${GUIDE}: questions.1.findings: the finding "sumiu" is not declared in \`findings\``,
      `${GUIDE}: the body answers the Question "onde-os-casais-se-conhecem" 2 times`,
      `${GUIDE}: questions: the Question "app-ou-presencial" is not answered in the body; put {{question:app-ou-presencial}} on a line of its own in the Chapter where it fits`,
    ])
  })

  it('an answer with no finding, a Myth not placed, or a mark naming nothing fails', () => {
    expect(
      errorsOf(
        withGuide((t) =>
          t
            .replace('findings: [satisfacao-parecida]', 'findings: []')
            .replace('{{myth:metade-por-app}}', '{{myth:sumiu}}')
            .replace('{{you:satisfacao-parecida}}', '{{you:sumiu}}'),
        ),
      ),
    ).toEqual([
      `${GUIDE}: questions.1.findings: the answer rests on at least one finding: name it in \`findings\``,
      `${GUIDE}: myths: the Myth "metade-por-app" is declared and not placed; put {{myth:metade-por-app}} on a line of its own in a Chapter`,
      `${GUIDE}: the body places the Myth "sumiu", which \`myths\` does not declare`,
      `${GUIDE}: {{you:sumiu}} names a finding that \`findings\` does not declare`,
    ])
  })

  it('the answer stays plain text, a block goes only in a Chapter, and an unknown mark fails', () => {
    expect(
      errorsOf(
        withGuide((t) =>
          t
            .replace(
              'A diferença é pequena.',
              'A diferença é pequena {{brazil}}.',
            )
            .replace(
              'Onde os casais se conhecem e se o lugar muda alguma coisa.',
              'Onde os casais se conhecem.\n\n{{tip:apps-como-complemento}}',
            )
            .replace('{{brazil}} Entre', '{{brasil}} Entre'),
        ),
      ),
    ).toEqual([
      `${GUIDE}: O app virou um caminho comum: unknown mark "{{brasil}}"; the body knows {{question:…}}, {{tip:…}}, {{myth:…}}, {{visual:…}}, {{brazil}} and {{you:<finding>}}`,
      `${GUIDE}: opening: "{{tip:apps-como-complemento}}" places a block, which only goes inside a Chapter`,
      `${GUIDE}: questions.1.answer: "{{brazil}}": the answer stays plain text, which "Em resumo" and the search also show`,
    ])
  })

  it('"O que não se sabe" is the last section and not empty; a Guide has a Chapter and an opening', () => {
    expect(
      errorsOf(
        withGuide((t) =>
          t.replace(
            '## O que não se sabe\n\nSó capitais, e uma amostra só nos EUA.',
            '## O que não se sabe\n\n## Depois\n\nTexto.',
          ),
        ),
      ),
    ).toEqual([
      `${GUIDE}: O que não se sabe: "## O que não se sabe" is the last section of the Guide`,
      `${GUIDE}: O que não se sabe: the section "## O que não se sabe" is empty`,
    ])
    expect(
      errorsOf(
        withGuide((t) => t.slice(0, t.indexOf('\n---\n') + 5) + '\nSó isso.\n'),
      ),
    ).toEqual([
      `${GUIDE}: a Guide has at least one Chapter ("## …")`,
      expect.stringContaining('is not answered in the body'),
      expect.stringContaining('is not answered in the body'),
      expect.stringContaining('is declared and not placed'),
    ])
  })

  it("a Chapter's anchor cannot repeat another, a Question slug or one of the page's own", () => {
    expect(
      errorsOf(
        withGuide((t) =>
          t
            .replace('## O lugar quase não importa', '## Em resumo')
            .replace('## O app virou um caminho comum', '## App ou presencial'),
        ),
      ),
    ).toEqual([
      `${GUIDE}: the Chapter anchor #app-ou-presencial is also a Question's slug; change the title`,
      `${GUIDE}: the Chapter anchor #em-resumo is one of the page's own (capitulos, em-resumo, perfil, o-que-levar, o-que-nao-se-sabe, fichas, ajudou, outros-temas); change the title`,
    ])
  })

  it("a question slug cannot take one of the page's own anchors", () => {
    expect(
      errorsOf(
        withGuide((t) =>
          t
            .replace('slug: app-ou-presencial', 'slug: fichas')
            .replace('{{question:app-ou-presencial}}', '{{question:fichas}}'),
        ),
      ),
    ).toEqual([
      `${GUIDE}: questions.1.slug: a question cannot be called "fichas": the Guide's page already uses #fichas (capitulos, em-resumo, perfil, o-que-levar, o-que-nao-se-sabe, fichas, ajudou, outros-temas)`,
    ])
  })
})
