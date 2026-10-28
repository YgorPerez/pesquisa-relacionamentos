// The Verbetes (#351) in jsdom (ADR 0035), over the fixture's Verbetes
// (`term-popover.example.ts`): "satisfação" varies by Study and Costa's
// Fact sheet defines it; Silva's is of the Instituto Exemplo. The link the
// server draws is tested in `content/terms-view.test.ts`; the popover's
// place on the screen is the stories'.
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { expect, it } from 'vite-plus/test'
import { Glossary } from './glossary'
import { TermPopover } from './term-popover'
import {
  BACK_TO_TEXT,
  EACH_STUDY,
  IN_STUDY,
  SEE_IN_GLOSSARY,
  STUDIES_OF,
  termLabel,
} from './term-popover.copy'
import { SATISFACTION, TERMS } from './term-popover.example'

const COSTA = 'Costa (2018): satisfação e onde os casais se conheceram'
const SILVA = 'Silva e Souza (2020): apps de namoro no Brasil'
const COSTA_DEFINITION = 'Uma nota de 1 a 7 que cada cônjuge deu ao casamento.'

/** `children` on a page of its own, with a router for the links. */
async function page(children: ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => children }),
    history: createMemoryHistory(),
  })
  render(<RouterProvider router={router} />)
  await router.load()
}

/** A sentence as the server draws it, citing `factSheets`. */
const sentence = (factSheets: string) => (
  <p>
    A diferença de{' '}
    <a
      className="verbete"
      href="/glossario#satisfacao"
      data-verbete="satisfacao"
      data-fichas={factSheets}
    >
      satisfação
    </a>{' '}
    é pequena.
  </p>
)

it('a tap opens the general definition and how the cited Study defined the word', async () => {
  const user = userEvent.setup()
  await page(
    <>
      {sentence('costa-2018-satisfacao')}
      <TermPopover terms={{ satisfacao: SATISFACTION }} />
    </>,
  )
  await user.click(screen.getByRole('link', { name: 'satisfação' }))
  const popover = within(
    await screen.findByRole('dialog', { name: termLabel('satisfação') }),
  )
  expect(
    popover.getByText('Quanto a pessoa diz gostar da relação.', {
      exact: false,
    }),
  ).toBeVisible()
  expect(popover.getByText(IN_STUDY.one)).toBeVisible()
  expect(popover.getByRole('link', { name: COSTA })).toHaveAttribute(
    'href',
    '/estudos/costa-2018-satisfacao',
  )
  expect(popover.getByText(COSTA_DEFINITION)).toBeVisible()
  expect(popover.getByRole('link', { name: SEE_IN_GLOSSARY })).toHaveAttribute(
    'href',
    '/glossario#satisfacao',
  )
})

it('a sentence that cites no Study shows the general definition only', async () => {
  const user = userEvent.setup()
  await page(
    <>
      {sentence('')}
      <TermPopover terms={{ satisfacao: SATISFACTION }} />
    </>,
  )
  await user.click(screen.getByRole('link', { name: 'satisfação' }))
  const popover = within(
    await screen.findByRole('dialog', { name: termLabel('satisfação') }),
  )
  expect(popover.queryByText(IN_STUDY.one)).toBeNull()
  expect(popover.getByRole('link', { name: SEE_IN_GLOSSARY })).toBeVisible()
})

it('lists every Verbete in the Glossário, with each Study’s definition and an institution’s Studies', async () => {
  await page(<Glossary terms={TERMS} />)
  const entries = screen
    .getAllByRole('region')
    .filter((r) => r.dataset['slot'] === 'verbete-glossario')
  expect(entries.map((e) => e.id)).toEqual(['instituto-exemplo', 'satisfacao'])
  const [institute, satisfaction] = entries.map((e) => within(e))
  expect(institute!.getByText(STUDIES_OF)).toBeVisible()
  expect(institute!.getByRole('link', { name: SILVA })).toHaveAttribute(
    'href',
    '/estudos/silva-2020-apps-brasil',
  )
  expect(satisfaction!.getByText(EACH_STUDY)).toBeVisible()
  expect(satisfaction!.getByText(COSTA_DEFINITION)).toBeVisible()
  // Not from a text: no way back.
  expect(screen.queryByRole('button', { name: BACK_TO_TEXT })).toBeNull()
})
