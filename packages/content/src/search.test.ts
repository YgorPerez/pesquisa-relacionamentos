// Search and stable links (#15, #29): each page's title and description,
// sitemap, robots, the 301s from `previous` and the check against the last
// published sitemap. The cases start from the valid fixture and swap a file.
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  tipSearch,
  factSheetSearch,
  guideSearch,
  topicSearch,
  sitemapPaths,
  tipBySlug,
  factSheetBySlug,
  formatProblems,
  guideBySlug,
  readFiles,
  buildLibrary,
  redirects,
  robotsTxt,
  sitemapXml,
  topicBySlug,
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

const warningsOf = (result: LoadResult) => result.warnings.map((a) => a.message)

type Swap = string | ((original: string) => string)

/** The valid fixture with files swapped or created. */
function filesWith(swaps: Record<string, Swap> = {}): ContentFile[] {
  const files = [...readFiles(VALID)]
  for (const [path, swap] of Object.entries(swaps)) {
    const i = files.findIndex((a) => a.path === path)
    const original = i === -1 ? '' : (files[i]?.text ?? '')
    const current = {
      path,
      text: typeof swap === 'string' ? swap : swap(original),
    }
    if (i === -1) files.push(current)
    else files[i] = current
  }
  return files
}

const buildWith = (swaps: Record<string, Swap>) =>
  buildLibrary(filesWith(swaps))

/** Appends lines to the end of the frontmatter. */
const inFrontmatter = (lines: string) => (original: string) =>
  original.replace(/\n---\n/, `\n${lines}\n---\n`)

const GUIDE = 'guides/onde-conhecer/onde-os-casais-se-conhecem.md'
const OTHER_GUIDE = 'guides/onde-conhecer/app-ou-presencial.md'
const TOPIC = 'guides/onde-conhecer/_topic.md'
const SILVA = 'studies/silva-2020-apps-brasil.md'

describe('search title and description', () => {
  const library = libraryOf(buildLibrary(filesWith()))

  it('guide: the question and the short answer, without marks or references', () => {
    expect(
      guideSearch(guideBySlug(library, 'onde-os-casais-se-conhecem')!),
    ).toEqual({
      title: 'Onde os casais se conhecem hoje?',
      description:
        'No Brasil, 18% dos adultos jovens conheceram o parceiro por app. Nos EUA, a satisfação é parecida.',
    })
  })

  it('guide: a long short answer is cut at a word, in up to 155 characters', () => {
    const longText =
      'Uma frase comprida sobre onde os casais se conhecem, '.repeat(5)
    const guide = guideBySlug(
      libraryOf(
        buildWith({
          [GUIDE]: (t) =>
            t.replace(
              /\nNo Brasil[^\n]*\n/,
              `\n${longText}[@silva-2020-apps-brasil]\n`,
            ),
        }),
      ),
      'onde-os-casais-se-conhecem',
    )!
    const { description } = guideSearch(guide)
    expect(description.length).toBeLessThanOrEqual(155)
    expect(description).toMatch(
      /^Uma frase comprida sobre onde os casais se conhecem, Uma frase .*\S…$/,
    )
    expect(longText.startsWith(description.slice(0, -1))).toBe(true)
  })

  it('topic: the title and the context paragraph', () => {
    expect(topicSearch(topicBySlug(library, 'onde-conhecer')!)).toEqual({
      title: 'Onde conhecer pessoas',
      description: 'Onde os casais se conhecem e se o lugar muda alguma coisa.',
    })
  })

  it('fact sheet: "Author year: topic" and the first finding', () => {
    expect(
      factSheetSearch(factSheetBySlug(library, 'silva-2020-apps-brasil')!),
    ).toEqual({
      title: 'Silva e Souza 2020: apps de namoro no Brasil',
      description: 'Conheceram o parceiro por app: 18%.',
    })
  })

  it('tip: the text in both', () => {
    expect(tipSearch(tipBySlug(library, 'apps-como-complemento')!)).toEqual({
      title: 'Use o app como complemento, não como o único caminho.',
      description: 'Use o app como complemento, não como o único caminho.',
    })
  })

  it('`seo` overrides title and description', () => {
    const seo =
      'seo:\n  title: Onde os casais se conhecem\n  description: Uma descrição escrita à mão.'
    const swapped = libraryOf(
      buildWith({
        [GUIDE]: inFrontmatter(seo),
        [SILVA]: inFrontmatter(seo),
        [TOPIC]: inFrontmatter(seo),
      }),
    )
    const expected = {
      title: 'Onde os casais se conhecem',
      description: 'Uma descrição escrita à mão.',
    }
    expect(
      guideSearch(guideBySlug(swapped, 'onde-os-casais-se-conhecem')!),
    ).toEqual(expected)
    expect(
      factSheetSearch(factSheetBySlug(swapped, 'silva-2020-apps-brasil')!),
    ).toEqual(expected)
    expect(topicSearch(topicBySlug(swapped, 'onde-conhecer')!)).toEqual(
      expected,
    )
  })

  it('the valid fixture gives no warning', () => {
    expect(warningsOf(buildLibrary(filesWith()))).toEqual([])
  })

  it('warns when the title goes over 60 characters, suggesting `seo`', () => {
    const question =
      'Onde os casais brasileiros de todas as idades se conhecem hoje em dia?'
    const result = buildWith({
      [GUIDE]: (t) => t.replace(/^question: .*$/m, `question: ${question}`),
    })
    expect(result.ok).toBe(true)
    expect(warningsOf(result)).toEqual([
      `${GUIDE}: question: the search title has ${question.length} characters and the limit is 60; write a shorter one in seo.title`,
    ])
  })

  it('warns when the `seo` description goes over 155 characters', () => {
    const longText = 'a'.repeat(160)
    const result = buildWith({
      [SILVA]: inFrontmatter(`seo:\n  description: ${longText}`),
    })
    expect(warningsOf(result)).toEqual([
      `${SILVA}: seo.description: the search description has 160 characters and the limit is 155`,
    ])
  })
})

describe('sitemap and robots', () => {
  const library = libraryOf(buildLibrary(filesWith()))

  it('lists home, topics, guides, published tips, the lists, the calculators and the ✅/🟡 fact sheets', () => {
    expect(sitemapPaths(library)).toEqual([
      '/',
      '/onde-conhecer',
      '/onde-conhecer/onde-os-casais-se-conhecem',
      '/onde-conhecer/app-ou-presencial',
      '/dicas',
      '/dicas/apps-como-complemento',
      '/estudos',
      '/estudos/costa-2018-satisfacao',
      '/estudos/silva-2020-apps-brasil',
      '/grupo-possivel',
      '/prioridades',
    ])
  })

  it('the XML carries each path with the domain, and the ⬜ fact sheet stays out', () => {
    const xml = sitemapXml(library)
    expect(xml).toMatch(
      /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/,
    )
    expect(xml).toContain('<url><loc>https://temestudo.cloud/</loc></url>')
    expect(xml).toContain(
      '<url><loc>https://temestudo.cloud/estudos/silva-2020-apps-brasil</loc></url>',
    )
    expect(xml).not.toContain('lima-2015-encontros')
    expect(xml).not.toContain('encontros-presenciais')
  })

  it('robots allows everything and points to the sitemap', () => {
    expect(robotsTxt()).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://temestudo.cloud/sitemap.xml\n',
    )
  })
})

describe('previous: 301 from the old path', () => {
  it("a fact sheet, tip and guide point the old slug to today's path", () => {
    const library = libraryOf(
      buildWith({
        [SILVA]: inFrontmatter('previous: [silva-2020-apps]'),
        'tips/apps-como-complemento.md': inFrontmatter(
          'previous: [app-complemento]',
        ),
        [GUIDE]: inFrontmatter(
          'previous: [onde-casais-se-conhecem, escolher-parceiro/onde-se-conhecem]',
        ),
      }),
    )
    expect(redirects(library)).toEqual({
      '/estudos/silva-2020-apps': '/estudos/silva-2020-apps-brasil',
      '/dicas/app-complemento': '/dicas/apps-como-complemento',
      '/onde-conhecer/onde-casais-se-conhecem':
        '/onde-conhecer/onde-os-casais-se-conhecem',
      '/escolher-parceiro/onde-se-conhecem':
        '/onde-conhecer/onde-os-casais-se-conhecem',
    })
  })

  it('a renamed topic takes its guides along, with the old slugs', () => {
    const library = libraryOf(
      buildWith({
        [TOPIC]: inFrontmatter('previous: [conhecer-gente]'),
        [OTHER_GUIDE]: inFrontmatter('previous: [app-ou-bar]'),
      }),
    )
    expect(redirects(library)).toEqual({
      '/conhecer-gente': '/onde-conhecer',
      '/conhecer-gente/onde-os-casais-se-conhecem':
        '/onde-conhecer/onde-os-casais-se-conhecem',
      '/conhecer-gente/app-ou-presencial': '/onde-conhecer/app-ou-presencial',
      '/onde-conhecer/app-ou-bar': '/onde-conhecer/app-ou-presencial',
      '/conhecer-gente/app-ou-bar': '/onde-conhecer/app-ou-presencial',
    })
  })

  it('without `previous`, no redirect', () => {
    expect(redirects(libraryOf(buildLibrary(filesWith())))).toEqual({})
  })

  it('fails when `previous` points to a path that still exists', () => {
    expect(
      errorsOf(
        buildWith({
          [OTHER_GUIDE]: inFrontmatter(
            'previous: [onde-os-casais-se-conhecem]',
          ),
        }),
      ),
    ).toContain(
      `${OTHER_GUIDE}: previous: the path /onde-conhecer/onde-os-casais-se-conhecem is still a page of the site; "previous" only lists paths that disappeared`,
    )
  })

  it('fails when two files declare the same old path', () => {
    expect(
      errorsOf(
        buildWith({
          [GUIDE]: inFrontmatter('previous: [velho]'),
          [OTHER_GUIDE]: inFrontmatter('previous: [velho]'),
        }),
      ),
    ).toContain(
      `${OTHER_GUIDE}: previous: the path /onde-conhecer/velho is already in the "previous" of ${GUIDE}`,
    )
  })

  it("fails when the topic's `previous` is a site route", () => {
    expect(
      errorsOf(buildWith({ [TOPIC]: inFrontmatter('previous: [estudos]') })),
    ).toContain(
      `${TOPIC}: previous: the path /estudos is still a page of the site; "previous" only lists paths that disappeared`,
    )
  })
})

describe('the last published sitemap', () => {
  const sitemap = (...paths: string[]) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
      .map((c) => `  <url><loc>https://temestudo.cloud${c}</loc></url>`)
      .join('\n')}\n</urlset>\n`

  it('passes when every path in it is still a page of the site, even a fact sheet that became ⬜', () => {
    const previous = sitemap(
      '/',
      '/onde-conhecer/app-ou-presencial',
      '/estudos/lima-2015-encontros',
      '/prioridades',
    )
    expect(buildLibrary(filesWith(), { previousSitemap: previous }).ok).toBe(
      true,
    )
  })

  it("fails when a path disappeared without being in some file's `previous`", () => {
    const previous = sitemap(
      '/',
      '/onde-conhecer/app-ou-bar',
      '/estudos/silva-2020',
    )
    expect(
      errorsOf(buildLibrary(filesWith(), { previousSitemap: previous })),
    ).toEqual([
      'published sitemap.xml: /onde-conhecer/app-ou-bar disappeared from the site; declare the old path in the "previous" of the file that replaced it',
      'published sitemap.xml: /estudos/silva-2020 disappeared from the site; declare the old path in the "previous" of the file that replaced it',
    ])
  })

  it('passes when the path that disappeared is in `previous`', () => {
    const previous = sitemap('/onde-conhecer/app-ou-bar', '/estudos/silva-2020')
    const result = buildLibrary(
      filesWith({
        [OTHER_GUIDE]: inFrontmatter('previous: [app-ou-bar]'),
        [SILVA]: inFrontmatter('previous: [silva-2020]'),
      }),
      { previousSitemap: previous },
    )
    expect(result.ok).toBe(true)
  })

  it('fails when the published sitemap has no <loc>', () => {
    expect(
      errorsOf(
        buildLibrary(filesWith(), { previousSitemap: '<html>erro</html>' }),
      ),
    ).toEqual([
      'published sitemap.xml: found no <loc>; check the downloaded file',
    ])
  })
})
