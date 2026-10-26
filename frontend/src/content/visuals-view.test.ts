// The Visuals reach the page as finished HTML: the server draws the SVG in
// place of each `{{visual:<id>}}` line, so they read without JS (#182). Over
// the e2e fixture, whose `app-ou-presencial` places one of each kind in
// "Varia conforme o Perfil?". That the Guide passes them to every body, and
// numbers their rings like the page, is in the screen tests
// (`ui/visual-*.test.tsx`).
import { fileURLToPath } from 'node:url'
import { formatProblems, loadLibrary } from '@tem-estudo/content'
import { guideBySlug } from '@tem-estudo/content/queries'
import { expect, it } from 'vite-plus/test'
import { html } from './view'
import { renderVisuals, visualView } from './visuals-view'

const FIXTURE = fileURLToPath(new URL('../../e2e/library', import.meta.url))

/** The fixture Question's "Varia conforme o Perfil?" with its Visuals
 * drawn, each Fact sheet numbered in the order the Question cites them. */
function profileHtml() {
  const result = loadLibrary(FIXTURE)
  if (!result.ok) throw new Error(formatProblems(result.errors))
  const guide = guideBySlug(result.library, 'app-ou-presencial')
  if (!guide) throw new Error('the fixture has no app-ou-presencial')
  const visuals = renderVisuals(
    guide.visuals ?? [],
    result.library,
    (slug) => {
      const n = guide.citedFactSheets.indexOf(slug) + 1
      return n > 0 ? { n, anchor: `ficha-${slug}`, title: slug } : undefined
    },
    guide.slug,
  )
  return html(guide.variesByProfile, visuals)
}

it('draws each placed Visual on the server, as SVG or a table, where its line was', () => {
  const page = profileHtml()
  expect(page).not.toContain('{{visual')
  const figures = [...page.matchAll(/<figure id="([^"]+)"/g)].map((m) => m[1])
  expect(figures).toEqual([
    'visual-app-ou-presencial-app-por-idade',
    'visual-app-ou-presencial-dois-retratos',
    'visual-app-ou-presencial-estudos-lado-a-lado',
    'visual-app-ou-presencial-app-e-satisfacao',
  ])
  expect(page.match(/<svg/g)?.length).toBeGreaterThanOrEqual(3)
  expect(page).toContain('<table')
  expect(page).toContain(
    '<a class="ref" href="#ficha-silva-2020-apps-brasil" aria-label="Ficha',
  )
  // After the paragraph that comes before the lines.
  expect(page.indexOf('Nenhum estudo separou por idade')).toBeLessThan(
    page.indexOf('<figure'),
  )
})

it('fails loudly when a body places a Visual nobody drew', () => {
  expect(() => html('Antes.\n\n{{visual:sem-desenho}}\n')).toThrow(
    'the body places the Visual "sem-desenho", and none was drawn',
  )
})

it('lets the axis top replace a round tick that would print on top of it, and puts a word unit only there', () => {
  const result = loadLibrary(FIXTURE)
  if (!result.ok) throw new Error(formatProblems(result.errors))
  const view = visualView(
    {
      id: 'escala-de-sete',
      kind: 'bars',
      title: 'Uma escala de 1 a 7',
      unit: 'pontos',
      max: 7,
      bars: [
        { label: 'Um', value: 5.6, fact_sheet: 'silva-2020-apps-brasil' },
        { label: 'Outro', value: 5.3, fact_sheet: 'silva-2020-apps-brasil' },
      ],
    },
    result.library,
    () => undefined,
    'teste',
  )
  if (view.kind !== 'bars') throw new Error('not a bar comparison')
  expect(view.ticks.map((t) => t.text)).toEqual(['0', '2', '4', '7 pontos'])
})
