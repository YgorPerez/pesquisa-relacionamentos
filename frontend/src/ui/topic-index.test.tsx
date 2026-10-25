// The home page's Topic index, in jsdom (ADR 0035), over the fixture content:
// "Onde conhecer pessoas" (position 1, two Guides) and "Escolher parceiro"
// (position 2, one Guide). The fold opening without JavaScript is the
// browser's `<details>`, checked in the e2e.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { OPEN_TOPIC, questionCount } from './topic-index.copy'

const topicsRegion = () => screen.getByRole('region', { name: 'Os Temas' })

it('lists the Topics in their position order, each with how many Questions it has', async () => {
  openScreen('/')
  const region = await screen.findByRole('region', { name: 'Os Temas' })
  const folds = within(region)
    .getAllByRole('group')
    .map((fold) => fold.querySelector('summary')?.textContent)
  expect(folds).toEqual([
    `Onde conhecer pessoas${questionCount(2)}`,
    `Escolher parceiro${questionCount(1)}`,
  ])
})

it("opening a Topic shows its Questions in order and the way to the Topic's page", async () => {
  const user = userEvent.setup()
  const { router } = openScreen('/')
  await screen.findByRole('region', { name: 'Os Temas' })
  const fold = within(topicsRegion()).getAllByRole('group')[0]!
  expect(fold).not.toHaveAttribute('open')

  await user.click(within(fold).getByText('Onde conhecer pessoas'))
  expect(fold).toHaveAttribute('open')
  const questions = within(fold)
    .getAllByRole('listitem')
    .map((item) => item.textContent)
  expect(questions).toEqual([
    'Onde os casais se conhecem hoje?',
    'App ou presencial, onde tenho mais chance?',
  ])

  await user.click(
    within(fold).getByRole('link', {
      name: `${OPEN_TOPIC}: Onde conhecer pessoas`,
    }),
  )
  await expect
    .poll(() => router.state.location.pathname)
    .toBe('/onde-conhecer-pessoas')
})
