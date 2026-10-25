// The Guide's own sections, in jsdom (ADR 0035), over the fixture content:
// `app-ou-presencial` has "Então, vale a pena?", which cites the same Fact
// sheet as its short answer. The section order of a Guide without own
// sections stays in the e2e (`e2e/guide.e2e.ts`).
import { screen, within } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'

it("shows the Guide's own section after the evidence and before Varia conforme o Perfil?, with the Fact sheet's number", async () => {
  openScreen('/onde-conhecer-pessoas/app-ou-presencial')
  const own = await screen.findByRole('region', {
    name: 'Então, vale a pena?',
  })
  expect(own).toHaveTextContent('Vale como um caminho entre outros')
  const evidence = screen.getByRole('region', { name: 'O que a evidência diz' })
  const profile = screen.getByRole('region', {
    name: 'Varia conforme o Perfil?',
  })
  expect(
    evidence.compareDocumentPosition(own) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  expect(
    own.compareDocumentPosition(profile) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  // The short answer already cites the same Fact sheet, so here it is number
  // 1 too, and it leads to the first of "Fichas citadas".
  const reference = within(own).getByRole('link', { name: /^Ficha 1:/ })
  const [first] = within(
    screen.getByRole('region', { name: 'Fichas citadas' }),
  ).getAllByRole('listitem')
  const target = document.getElementById(
    reference.getAttribute('href')!.replace(/^#/, ''),
  )
  expect(target?.closest('li')).toBe(first)
})
