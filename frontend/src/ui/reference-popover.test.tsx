// The reference ring that shows what it cites (#467) in jsdom (ADR 0035),
// over the fixture's Guide (`guide.example.ts`): Fact sheet 1 is Silva's
// and 2 is Costa's. jsdom has neither the CSS Custom Highlight API nor
// layout, so the test gives it a registry of painted ranges; the paint in a
// real Chrome is the e2e's (`e2e/navigation.e2e.ts`).
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import { excerpt, GUIDE } from './guide.example'
import { Html } from './html'
import { ReferencePopover } from './reference-popover'
import { OPEN_FACT_SHEET, referenceLabel } from './reference-popover.copy'

const [SILVA, COSTA] = GUIDE.factSheets
const FIRST = 'No Brasil, 18% dos casais se conheceram por app'
const SECOND = 'A diferença de satisfação entre app e presencial é pequena'

class FakeHighlight extends Set<Range> {
  constructor(...ranges: Range[]) {
    super(ranges)
  }
}

beforeEach(() => {
  vi.stubGlobal('Highlight', FakeHighlight)
  vi.stubGlobal('CSS', { highlights: new Map<string, FakeHighlight>() })
})
afterEach(() => vi.unstubAllGlobals())

/** The text the page marks as cited, or `''`. */
const marked = () =>
  [
    ...((CSS.highlights.get('citacao') as unknown as Set<Range> | undefined) ??
      []),
  ]
    .map((range) => range.toString())
    .join('')

/** `children` on a page of its own, with a router for the links. */
async function page(children: ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => children }),
    history: createMemoryHistory(),
  })
  render(<RouterProvider router={router} />)
  await router.load()
}

/** A Guide paragraph as the server builds it, and the popover. */
const paragraph = (markdown: string) =>
  page(
    <main>
      <Html
        as="p"
        className="prosa"
        html={excerpt(markdown, [SILVA!, COSTA!])}
      />
      <ReferencePopover factSheets={GUIDE.factSheets} />
    </main>,
  )

const ring = (n: number) =>
  screen.getByRole('link', { name: new RegExp(`^Ficha ${n}:`) })

/** A finger's tap, which leaves no pointer over the ring. */
const tap = (user: ReturnType<typeof userEvent.setup>, target: Element) =>
  user.pointer({ keys: '[TouchA]', target })

it('a tap marks the text since the previous ring and opens the Fact sheet', async () => {
  const user = userEvent.setup()
  await paragraph(`${FIRST} [@${SILVA!.slug}]. ${SECOND} [@${COSTA!.slug}].`)
  await tap(user, ring(2))
  const popover = within(
    await screen.findByRole('dialog', { name: referenceLabel(COSTA!) }),
  )
  expect(popover.getByRole('link', { name: COSTA!.title })).toBeVisible()
  expect(popover.getByText(COSTA!.context)).toBeVisible()
  expect(popover.getByRole('link', { name: OPEN_FACT_SHEET })).toHaveAttribute(
    'href',
    `/estudos/${COSTA!.slug}`,
  )
  expect(marked()).toBe(SECOND)

  // A tap outside closes it, and the mark goes with it.
  await tap(user, screen.getByRole('main'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(marked()).toBe('')
})

it('rings side by side mark the same text, and each opens its own Fact sheet', async () => {
  const user = userEvent.setup()
  await paragraph(
    `${FIRST} [@${SILVA!.slug}]. ${SECOND} [@${SILVA!.slug}][@${COSTA!.slug}].`,
  )
  const [, second, third] = screen.getAllByRole('link', { name: /^Ficha/ })
  await tap(user, third!)
  expect(
    await screen.findByRole('dialog', { name: referenceLabel(COSTA!) }),
  ).toBeVisible()
  expect(marked()).toBe(SECOND)

  await user.keyboard('{Escape}')
  await tap(user, second!)
  expect(
    await screen.findByRole('dialog', { name: referenceLabel(SILVA!) }),
  ).toBeVisible()
  expect(marked()).toBe(SECOND)
})

it('the pointer over a ring, or the keyboard on it, marks the text without the popover', async () => {
  const user = userEvent.setup()
  await paragraph(`${FIRST} [@${SILVA!.slug}]. ${SECOND} [@${COSTA!.slug}].`)
  await user.hover(ring(1))
  expect(marked()).toBe(FIRST)
  expect(screen.queryByRole('dialog')).toBeNull()
  await user.unhover(ring(1))
  expect(marked()).toBe('')

  await user.tab()
  await user.tab()
  expect(ring(2)).toHaveFocus()
  expect(marked()).toBe(SECOND)
  await user.tab()
  expect(marked()).toBe('')
})

it('a ring in a Visual marks the whole figure', async () => {
  const user = userEvent.setup()
  await page(
    <main>
      <figure data-slot="visual" aria-label="Onde os casais se conhecem">
        <p>
          Fontes:{' '}
          <a
            className="ref"
            href={`#${SILVA!.anchor}`}
            aria-label={referenceLabel(SILVA!)}
          >
            1
          </a>
        </p>
      </figure>
      <ReferencePopover factSheets={GUIDE.factSheets} />
    </main>,
  )
  const figure = screen.getByRole('figure')
  await user.hover(ring(1))
  expect(figure).toHaveAttribute('data-citado')
  await user.unhover(ring(1))
  expect(figure).not.toHaveAttribute('data-citado')
})
