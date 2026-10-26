// The Visuals reach the page as finished HTML: the server draws the SVG in
// place of each `{{visual:<id>}}` line, so they read without JS (#182). Over
// the e2e fixture, whose `app-ou-presencial` places one of each kind in
// "Varia conforme o Perfil?".
import { fileURLToPath } from 'node:url'
import { formatProblems, loadLibrary } from '@tem-estudo/content'
import { guideBySlug } from '@tem-estudo/content/queries'
import { expect, it } from 'vite-plus/test'
import { guideView } from './guide-view'
import { html } from './view'

const FIXTURE = fileURLToPath(new URL('../../e2e/library', import.meta.url))

function fixtureGuide() {
  const result = loadLibrary(FIXTURE)
  if (!result.ok) throw new Error(formatProblems(result.errors))
  const guide = guideBySlug(result.library, 'app-ou-presencial')
  if (!guide) throw new Error('the fixture has no app-ou-presencial')
  return guideView(guide, result.library)
}

/** The HTML of "Varia conforme o Perfil?", where the fixture places them. */
const sectionHtml = () => fixtureGuide().profileHtml

it('draws each placed Visual on the server, as SVG or a table, where its line was', () => {
  const html = sectionHtml()
  expect(html).not.toContain('{{visual')
  const figures = [...html.matchAll(/<figure id="([^"]+)"/g)].map((m) => m[1])
  expect(figures).toEqual([
    'visual-app-ou-presencial-app-por-idade',
    'visual-app-ou-presencial-dois-retratos',
    'visual-app-ou-presencial-estudos-lado-a-lado',
    'visual-app-ou-presencial-app-e-satisfacao',
  ])
  expect(html.match(/<svg/g)?.length).toBeGreaterThanOrEqual(3)
  expect(html).toContain('<table')
  // After the paragraph that comes before the lines.
  expect(html.indexOf('Nenhum estudo separou por idade')).toBeLessThan(
    html.indexOf('<figure'),
  )
})

it('numbers the Visual’s references like the rest of the page', () => {
  const guide = fixtureGuide()
  const silva = guide.factSheets.find(
    (f) => f.slug === 'silva-2020-apps-brasil',
  )
  expect(guide.profileHtml).toContain(
    `<a class="ref" href="#${silva?.anchor}" aria-label="Ficha ${silva?.n}: ${silva?.title}">${silva?.n}</a>`,
  )
})

it('fails loudly when a body places a Visual nobody drew', () => {
  expect(() => html('Antes.\n\n{{visual:sem-desenho}}\n')).toThrow(
    'the body places the Visual "sem-desenho", and none was drawn',
  )
})
