// The home page in jsdom (ADR 0035), over the fixture content: the Topic
// index, with "Onde conhecer pessoas" (position 1, two Guides) and
// "Escolher parceiro" (position 2, one Guide), and "Continuar lendo" (#195)
// with the reading a visit left in this browser. The fold opening without
// JavaScript is the browser's `<details>`, checked in the e2e; landing on the
// paragraph, with real layout, is `e2e/reading.e2e.ts`'s.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { CONTINUE_READING, forget, readShare } from './continue-reading.copy'
import { OPEN_TOPIC, READ, questionCount } from './topic-index.copy'

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

// "Continuar lendo".

const KEY = 'tem-estudo:reading'

const homePlace = (chapterNumber: number, progress: number, at: number) => ({
  chapter:
    chapterNumber === 1
      ? 'o-app-virou-um-caminho-comum'
      : 'o-lugar-quase-nao-muda-a-relacao',
  chapterTitle:
    chapterNumber === 1
      ? 'O app virou um caminho comum'
      : 'O lugar quase não muda a relação',
  chapterNumber,
  chapters: 2,
  paragraph: null,
  progress,
  at,
})

const saveHomeReading = (reading: unknown) =>
  localStorage.setItem(KEY, JSON.stringify(reading))

const block = () => screen.findByRole('region', { name: CONTINUE_READING })

it('with nothing read in this browser, the home page has no "Continuar lendo"', async () => {
  openScreen('/')
  await screen.findByRole('region', { name: 'Os Temas' })
  expect(
    screen.queryByRole('region', { name: CONTINUE_READING }),
  ).not.toBeInTheDocument()
})

it('lists each Guide in progress, the most recent first, with its Chapter and how much was read', async () => {
  saveHomeReading({
    inProgress: {
      'onde-conhecer-pessoas': homePlace(2, 0.6, 1_000),
      'escolher-parceiro': homePlace(1, 0.1, 2_000),
      // A Topic that left the content does not show.
      'tema-que-saiu': homePlace(1, 0.5, 3_000),
    },
    finished: [],
  })
  openScreen('/')
  const items = within(await block()).getAllByRole('listitem')
  expect(items.map((i) => within(i).getByRole('link').textContent)).toEqual([
    `Escolher parceiroCapítulo 1 de 2 · O app virou um caminho comum${readShare(0.1)}`,
    `Onde conhecer pessoasCapítulo 2 de 2 · O lugar quase não muda a relação${readShare(0.6)}`,
  ])
})

it('the × forgets that Guide, and with the last one gone the block goes too', async () => {
  const user = userEvent.setup()
  saveHomeReading({
    inProgress: {
      'onde-conhecer-pessoas': homePlace(2, 0.6, 1_000),
      'escolher-parceiro': homePlace(1, 0.1, 2_000),
    },
    finished: [],
  })
  openScreen('/')
  const region = await block()
  await user.click(
    within(region).getByRole('button', { name: forget('Escolher parceiro') }),
  )
  expect(within(region).getAllByRole('listitem')).toHaveLength(1)
  const left = JSON.parse(localStorage.getItem(KEY)!) as {
    inProgress: object
  }
  expect(left.inProgress).not.toHaveProperty('escolher-parceiro')
  await user.click(
    within(region).getByRole('button', {
      name: forget('Onde conhecer pessoas'),
    }),
  )
  expect(
    screen.queryByRole('region', { name: CONTINUE_READING }),
  ).not.toBeInTheDocument()
})

it('an item leads back into its Guide, asking it to resume where the reader stopped', async () => {
  const user = userEvent.setup()
  saveHomeReading({
    inProgress: { 'onde-conhecer-pessoas': homePlace(2, 0.6, 1_000) },
    finished: [],
  })
  const { router } = openScreen('/')
  await user.click(
    within(await block()).getByRole('link', { name: /Onde conhecer pessoas/ }),
  )
  await expect
    .poll(() => router.state.location.pathname)
    .toBe('/onde-conhecer-pessoas')
  expect(router.state.location.state.resume).toBe(true)
})

it('a Guide read to the end says "lido" in the Topic index, and nowhere else', async () => {
  saveHomeReading({ inProgress: {}, finished: ['escolher-parceiro'] })
  openScreen('/')
  const topics = await screen.findByRole('region', { name: 'Os Temas' })
  const [where, choose] = within(topics).getAllByRole('group')
  expect(await within(choose!).findByText(READ)).toBeVisible()
  expect(within(where!).queryByText(READ)).not.toBeInTheDocument()
  expect(
    screen.queryByRole('region', { name: CONTINUE_READING }),
  ).not.toBeInTheDocument()
})
