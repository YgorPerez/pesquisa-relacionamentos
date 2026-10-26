// The Guide in jsdom (ADR 0035), over the fixture content: the Topic's page
// holds both Questions in its order, each a section anchored by its slug.
// `app-ou-presencial` has "Então, vale a pena?", which cites the same Fact
// sheet as the first Question. The order of the blocks without JavaScript
// stays in the e2e (`e2e/guide.e2e.ts`).
import { screen, within } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'

const follows = (a: Element, b: Element) =>
  (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0

it('the index lists each Question with its short answer and leads to its section', async () => {
  openScreen('/onde-conhecer-pessoas')
  const index = await screen.findByRole('navigation', {
    name: 'Perguntas deste Guia',
  })
  const links = within(index).getAllByRole('link')
  expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
    ['Onde os casais se conhecem hoje?', '#onde-os-casais-se-conhecem'],
    ['App ou presencial, onde tenho mais chance?', '#app-ou-presencial'],
  ])
  for (const link of links) {
    const section = document.getElementById(link.getAttribute('href')!.slice(1))
    expect(section).toHaveAccessibleName(link.textContent!)
  }
  expect(index).toHaveTextContent('18% dos adultos jovens')
  // The index makes no claim of its own: the numbers are in the sections.
  expect(within(index).queryByRole('link', { name: /^Ficha/ })).toBeNull()
})

it("shows a Question's own section before the evidence and Varia conforme o Perfil?, numbered on the Guide's single list", async () => {
  openScreen('/onde-conhecer-pessoas')
  const second = await screen.findByRole('region', {
    name: 'App ou presencial, onde tenho mais chance?',
  })
  const own = within(second).getByRole('region', {
    name: 'Então, vale a pena?',
  })
  expect(own).toHaveTextContent('Vale como um caminho entre outros')
  const evidence = within(second).getByRole('region', {
    name: 'O que a evidência diz',
  })
  const profile = within(second).getByRole('region', {
    name: 'Varia conforme o Perfil?',
  })
  expect(follows(own, evidence)).toBe(true)
  expect(follows(evidence, profile)).toBe(true)
  // Costa 2018 was already number 2 in the first Question: the Guide has one
  // list, so here it is 2 too, and it leads to the second of "Fichas citadas".
  const reference = within(own).getByRole('link', { name: /^Ficha 2:/ })
  const [, second2] = within(
    screen.getByRole('region', { name: 'Fichas citadas' }),
  ).getAllByRole('listitem')
  const target = document.getElementById(
    reference.getAttribute('href')!.replace(/^#/, ''),
  )
  expect(target?.closest('li')).toBe(second2)
})

it('the frame closes the Guide: the Limitations of each Question, the Fact sheets, then the Questions of other Topics', async () => {
  openScreen('/onde-conhecer-pessoas')
  const limitations = await screen.findByRole('region', {
    name: 'Limitações e o que não se sabe',
  })
  const groups = within(limitations).getAllByRole('heading', { level: 3 })
  expect(groups.map((h) => h.textContent)).toEqual([
    'Onde os casais se conhecem hoje?',
    'App ou presencial, onde tenho mais chance?',
  ])
  const factSheets = screen.getByRole('region', { name: 'Fichas citadas' })
  const lastQuestion = screen.getByRole('region', {
    name: 'App ou presencial, onde tenho mais chance?',
  })
  expect(follows(lastQuestion, limitations)).toBe(true)
  expect(follows(limitations, factSheets)).toBe(true)
  // Both Questions relate only to each other, in the same Topic.
  expect(
    screen.queryByRole('region', { name: 'Perguntas de outros Temas' }),
  ).toBeNull()
})
