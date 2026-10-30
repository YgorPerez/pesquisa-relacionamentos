// The Visuals reach the page as finished HTML: the server draws the SVG in
// place of each `{{visual:<id>}}` line, so they read without JS (#182). Over
// the e2e fixture, whose Guide of `onde-conhecer-pessoas` places one of each
// kind in its Chapters; all but its diagram are `chart-view.ts`'s, and
// leave the prose before this draws it. That the rings lead to the page's
// list is in the screen tests (`ui/visual-*.test.tsx`).
import { fileURLToPath } from 'node:url'
import { formatProblems, loadLibrary } from '@tem-estudo/content'
import { topicBySlug } from '@tem-estudo/content/queries'
import { expect, it } from 'vite-plus/test'
import { html } from './view'
import { renderVisuals, type HtmlVisual } from './visuals-view'

const FIXTURE = fileURLToPath(new URL('../../e2e/library', import.meta.url))

/** The fixture Guide's Chapters, as the HTML of their prose, with its
 * Visuals drawn and each Fact sheet numbered in page order. */
function chaptersHtml() {
  const result = loadLibrary(FIXTURE)
  if (!result.ok) throw new Error(formatProblems(result.errors))
  const topic = topicBySlug(result.library, 'onde-conhecer-pessoas')
  if (!topic) throw new Error('the fixture has no onde-conhecer-pessoas')
  const handDrawn = topic.visuals.filter(
    (v): v is HtmlVisual => v.kind === 'diagram',
  )
  const visuals = renderVisuals(
    handDrawn,
    (slug) => {
      const n = topic.citedFactSheets.indexOf(slug) + 1
      return n > 0 ? { n, anchor: `ficha-${slug}`, title: slug } : undefined
    },
    topic.slug,
  )
  const drawn = new Set(handDrawn.map((v) => v.id))
  return topic.chapters
    .flatMap((c) => c.parts)
    .map((p) =>
      p.kind === 'text'
        ? html(
            p.markdown.replace(/^\{\{visual:([a-z0-9-]+)\}\}$/gm, (line, id) =>
              drawn.has(id) ? line : '',
            ),
            visuals,
          )
        : '',
    )
    .join('')
}

it('draws each placed Visual on the server as SVG, where its line was', () => {
  const page = chaptersHtml()
  expect(page).not.toContain('{{visual')
  const figures = [...page.matchAll(/<figure id="([^"]+)"/g)].map((m) => m[1])
  expect(figures).toEqual(['visual-onde-conhecer-pessoas-app-e-satisfacao'])
  expect(page.match(/<svg/g)?.length).toBeGreaterThanOrEqual(1)
  expect(page).toContain(
    '<a class="ref" href="#ficha-silva-2020-apps-brasil" aria-label="Ficha',
  )
  // After the paragraph that comes before its line.
  expect(page.indexOf('a fatia sobe para 24%')).toBeLessThan(
    page.indexOf('<figure'),
  )
})

it('fails loudly when a body places a Visual nobody drew', () => {
  expect(() => html('Antes.\n\n{{visual:sem-desenho}}\n')).toThrow(
    'the body places the Visual "sem-desenho", and none was drawn',
  )
})
