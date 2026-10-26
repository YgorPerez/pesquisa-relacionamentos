// The Guide in jsdom (ADR 0035), over the fixture content: two Chapters,
// each answering one Question where its reasoning reaches it, with a Myth, a
// Tip and the marks inside a sentence. The order of the blocks without
// JavaScript stays in the e2e (`e2e/guide.e2e.ts`).
import { screen, within } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'

const follows = (a: Element, b: Element) =>
  (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0

it('the table of contents lists the Chapters in order and leads to each', async () => {
  openScreen('/onde-conhecer-pessoas')
  const contents = await screen.findByRole('navigation', { name: 'Capítulos' })
  const links = within(contents).getAllByRole('link')
  expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
    ['1O app virou um caminho comum', '#o-app-virou-um-caminho-comum'],
    ['2O lugar quase não muda a relação', '#o-lugar-quase-nao-muda-a-relacao'],
  ])
  for (const link of links) {
    const chapter = document.getElementById(link.getAttribute('href')!.slice(1))
    expect(chapter).toHaveAttribute('data-slot', 'capitulo')
  }
})

it('"Em resumo" lists each Question with the first sentence of its answer and leads to where the Guide answers it', async () => {
  openScreen('/onde-conhecer-pessoas')
  const summary = await screen.findByRole('region', { name: 'Em resumo' })
  const links = within(summary).getAllByRole('link')
  expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
    ['Onde os casais se conhecem hoje?', '#onde-os-casais-se-conhecem'],
    ['App ou presencial, onde tenho mais chance?', '#app-ou-presencial'],
  ])
  for (const link of links) {
    const answer = document.getElementById(link.getAttribute('href')!.slice(1))
    expect(answer).toHaveAccessibleName(link.textContent!)
    expect(answer).toHaveAttribute('data-slot', 'resposta')
  }
  expect(summary).toHaveTextContent(
    'No Brasil, 18% dos adultos jovens conheceram o parceiro por app.',
  )
  // The rest of the answer is in its Chapter, not in the summary.
  expect(summary).not.toHaveTextContent('Os estudos divergem')
  expect(within(summary).queryByRole('link', { name: /^Ficha/ })).toBeNull()
})

it('a Chapter reads as prose with its answer, Myth and marks in body order, numbered on the single list', async () => {
  openScreen('/onde-conhecer-pessoas')
  const chapter = await screen.findByRole('region', {
    name: 'O app virou um caminho comum',
  })
  const answer = within(chapter).getByRole('region', {
    name: 'Onde os casais se conhecem hoje?',
  })
  expect(answer).toHaveTextContent('confiança moderada')
  const myth = chapter.querySelector('[data-slot="mito"]')!
  expect(myth).toHaveTextContent(
    'Mais da metade dos casais se conhece por app.',
  )
  expect(follows(answer, myth)).toBe(true)
  expect(within(chapter).getByText('no Brasil')).toHaveClass('marca-brasil')
  // The findings back the answer at build time; the page does not list them.
  expect(
    screen.queryByRole('region', { name: 'O que a evidência diz' }),
  ).toBeNull()
  // Costa 2018 is number 2 in the first Chapter: the Guide has one list, so
  // it is 2 in the second Chapter too, and leads to the second Fact sheet.
  const second = screen.getByRole('region', {
    name: 'O lugar quase não muda a relação',
  })
  const [reference] = within(second).getAllByRole('link', { name: /^Ficha 2:/ })
  const [, costa] = within(
    screen.getByRole('region', { name: 'Fichas citadas' }),
  ).getAllByRole('listitem')
  const target = document.getElementById(
    reference!.getAttribute('href')!.replace(/^#/, ''),
  )
  expect(target?.closest('li')).toBe(costa)
})

it('the frame closes the Guide: O que levar, O que não se sabe, the Fact sheets, one Ajudou? and the Questions of other Topics', async () => {
  openScreen('/onde-conhecer-pessoas')
  const takeaways = await screen.findByRole('region', { name: 'O que levar' })
  const unknowns = screen.getByRole('region', { name: 'O que não se sabe' })
  const factSheets = screen.getByRole('region', { name: 'Fichas citadas' })
  const helped = screen.getByRole('region', { name: 'Ajudou?' })
  const elsewhere = screen.getByRole('region', {
    name: 'Perguntas de outros Temas',
  })
  expect(unknowns).toHaveTextContent('Nenhum estudo separou app de rede social')
  expect(follows(takeaways, unknowns)).toBe(true)
  expect(follows(unknowns, factSheets)).toBe(true)
  expect(follows(factSheets, helped)).toBe(true)
  expect(follows(helped, elsewhere)).toBe(true)
  expect(screen.getAllByRole('region', { name: 'Ajudou?' })).toHaveLength(1)
  expect(within(elsewhere).getByRole('link')).toHaveTextContent(
    'Que características do parceiro preveem uma boa relação?',
  )
})
