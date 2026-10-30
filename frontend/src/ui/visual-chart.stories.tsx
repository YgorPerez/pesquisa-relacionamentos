// A chart drawn by the library (#471), with the frame, the legend of the
// definitions and the tap detail. In Storybook the plot mounts after the
// library arrives, as on a page reached by a link inside the site.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { DefinitionGlyph } from './definition-glyph'
import { VisualChart } from './visual-chart'
import {
  BARS,
  DOTS,
  LINE,
  LINE_MIXED,
  RANGE,
  STACKED,
} from './visual-chart.example'
import VisualChartPlot from './visual-chart-plot'
import { VisualDetail } from './visual-detail'

const meta = {
  component: VisualChart,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="prosa max-w-texto">
        <Story />
      </div>
    ),
  ],
  args: { chart: DOTS, country: null, profile: null },
} satisfies Meta<typeof VisualChart>

export default meta
type Story = StoryObj<typeof meta>

/** The card hangs from the page's end, out of the story's canvas. */
const cardElement = () =>
  document.querySelector<HTMLElement>('[data-slot="detalhe-do-grafico"]')
const shownCard = () =>
  waitFor(() => {
    const card = cardElement()
    if (!card) throw new Error('no card')
    return card
  })
const pinnedCard = () =>
  waitFor(() => {
    const card = document.querySelector<HTMLElement>(
      '[data-slot="detalhe-do-grafico"][data-fixado]',
    )
    if (!card) throw new Error('no pinned card')
    return card
  })
/** A mouse move at this fraction of the drawing's width and height. */
const hoverAt = (chart: Element, x: number, y: number) => {
  const box = chart.getBoundingClientRect()
  return fireEvent.pointerMove(chart, {
    pointerType: 'mouse',
    bubbles: true,
    clientX: box.left + box.width * x,
    clientY: box.top + box.height * y,
  })
}

/** One dot per Study, two definitions, Brazil ringed. */
export const Dots: Story = {}

/** Bars, the key value in pink and our own calculation hatched. */
export const Bars: Story = { args: { chart: BARS } }

/** A time line of one unit: the line over the years, 2024 in pink, Brazil
 * ringed at every point. */
export const Line: Story = { args: { chart: LINE } }

/** A time line of two units: the points on the years alone, each year's
 * label under it. */
export const LineMixedUnits: Story = { args: { chart: LINE_MIXED } }

/** A time line with a Profile: "você" above each value its Fact sheet
 * covers. */
export const LineWithProfile: Story = {
  args: { chart: LINE, profile: { gender: 'mulher' } },
}

/** Enter on the time line pins its first point: the value, the year, the
 * country and the Fact sheet; the guide stands on that year. */
export const LineTapDetail: Story = {
  args: { chart: LINE },
  play: async ({ canvasElement }) => {
    const chart = await within(canvasElement).findByRole(
      'img',
      { name: LINE.title },
      { timeout: 10_000 },
    )
    chart.focus()
    await userEvent.keyboard('{Enter}')
    const box = within(await pinnedCard())
    await expect(box.getByText('2004')).toBeInTheDocument()
    await expect(box.getByText('13,5%')).toBeInTheDocument()
    await expect(
      box.getByRole('link', { name: /^Abrir Ficha: / }),
    ).toBeInTheDocument()
    await expect(chart.querySelector('[data-ts-key="guide"]')).not.toBeNull()
    await userEvent.keyboard('{Escape}')
  },
}

/** The mouse anywhere over the plot, far from any dot: the guide and the
 * card snap to the nearest year, and leaving takes both away. */
export const LineHover: Story = {
  args: { chart: LINE },
  play: async ({ canvasElement }) => {
    const chart = await within(canvasElement).findByRole(
      'img',
      { name: LINE.title },
      { timeout: 10_000 },
    )
    await hoverAt(chart, 0.5, 0.1)
    const card = await shownCard()
    await expect(within(card).getByText('2014')).toBeInTheDocument()
    await expect(within(card).queryByRole('link')).toBeNull()
    await expect(chart.querySelector('[data-ts-key="guide"]')).not.toBeNull()
    await userEvent.unhover(chart)
    await waitFor(() => expect(cardElement()).toBeNull())
  },
}

/** A Study of 50 countries: its average on a line from Ghana to Poland,
 * Brazil ringed inside it. */
export const Range: Story = { args: { chart: RANGE } }

/** `?pais=gana`: the Study whose range has Ghana lit, the range's other
 * countries and the other Studies dimmed. */
export const RangeCountryChosen: Story = {
  args: { chart: RANGE, country: 'gana' },
}

/** `?pais=eua`: the United States lit, the others dimmed. */
export const CountryChosen: Story = { args: { country: 'eua' } }

/** A Profile of 30: "você" on the two Studies that cover it. */
export const WithProfile: Story = { args: { profile: { age: 30 } } }

/** Enter on the chart pins the first point's exact value, what its Study
 * measured (the definition its shape stands for) and the way to its Fact
 * sheet; "Fechar" closes it. */
export const TapDetail: Story = {
  play: async ({ canvasElement }) => {
    const chart = await within(canvasElement).findByRole(
      'img',
      { name: DOTS.title },
      { timeout: 10_000 },
    )
    chart.focus()
    await userEvent.keyboard('{Enter}')
    const box = within(await pinnedCard())
    await expect(box.getByText('Mede')).toBeInTheDocument()
    await expect(box.getByText(DOTS.definitions[0]!.legend)).toBeInTheDocument()
    await expect(
      box.getByRole('link', { name: /^Abrir Ficha: / }),
    ).toBeInTheDocument()
    await userEvent.click(box.getByRole('button', { name: 'Fechar' }))
    await waitFor(() => expect(cardElement()).toBeNull())
  },
}

/** The mouse on a row's title, above its mark: the row lights, the others
 * dim and the card shows without buttons. A click pins it with the Fact
 * sheet's link, it holds while the mouse moves on, and a click outside closes
 * it. */
export const HoverAndPin: Story = {
  play: async ({ canvasElement }) => {
    const chart = await within(canvasElement).findByRole(
      'img',
      { name: DOTS.title },
      { timeout: 10_000 },
    )
    // The second of three rows, on its title's line.
    const y = 0.42
    await hoverAt(chart, 0.2, y)
    const card = await shownCard()
    await expect(within(card).getByText('Rosenfeld (2019)')).toBeInTheDocument()
    await expect(within(card).queryByRole('button')).toBeNull()
    await expect(
      chart.querySelector('[data-ts-key="active-row"]'),
    ).not.toBeNull()

    const box = chart.getBoundingClientRect()
    await fireEvent.click(chart, {
      clientX: box.left + box.width * 0.2,
      clientY: box.top + box.height * y,
    })
    const pinned = within(await pinnedCard())
    await expect(pinned.getByRole('link')).toHaveTextContent(
      'Abrir Ficha: Rosenfeld (2019)',
    )
    await hoverAt(chart, 0.2, 0.05)
    await expect(pinned.getByText('Rosenfeld (2019)')).toBeInTheDocument()

    // The mouse leaves for the click outside.
    await fireEvent.mouseLeave(chart.parentElement!)
    await userEvent.click(document.body)
    await waitFor(() => expect(cardElement()).toBeNull())
  },
}

/** The arrows move the card along the rows, unpinned; Enter pins; Esc
 * closes. */
export const KeyboardCard: Story = {
  play: async ({ canvasElement }) => {
    const chart = await within(canvasElement).findByRole(
      'img',
      { name: DOTS.title },
      { timeout: 10_000 },
    )
    chart.focus()
    await userEvent.keyboard('{ArrowDown}')
    const card = await waitFor(async () => {
      const shown = await shownCard()
      await expect(shown).toHaveTextContent('Rosenfeld (2019)')
      return shown
    })
    await expect(within(card).queryByRole('button')).toBeNull()
    await userEvent.keyboard('{Enter}')
    await pinnedCard()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(cardElement()).toBeNull())
  },
}

/** Stacked bars, the four answers of each group from the left. With a
 * Profile of a woman who seeks men, "você" on the women's bar. */
export const Stacked: Story = {
  args: { chart: STACKED, profile: { gender: 'mulher', seeks: 'homens' } },
}

/** Enter on stacked bars opens the first part, with its answer, and the
 * arrow keys go through the parts bar by bar. */
export const StackedTap: Story = {
  args: { chart: STACKED },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement)
    const chart = await page.findByRole(
      'img',
      { name: STACKED.title },
      { timeout: 10_000 },
    )
    chart.focus()
    await userEvent.keyboard('{Enter}')
    await expect(await pinnedCard()).toHaveTextContent('Contentes')
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await waitFor(async () =>
      expect(await pinnedCard()).toHaveTextContent('Neutros'),
    )
    await userEvent.keyboard('{Escape}')
    await page.findByRole('img', { name: STACKED.title })
  },
}

/** The plot alone, as the library draws it. */
export const Plot: StoryObj = {
  render: () => (
    <VisualChartPlot
      chart={DOTS}
      country={null}
      profile={null}
      active={null}
      onHover={() => {}}
      onSelect={() => {}}
    />
  ),
}

/** The words of a pinned card of our own calculation, with its definition
 * and "você". */
export const Detail: StoryObj = {
  render: () => (
    <div className="w-75 text-nota leading-nota">
      <VisualDetail
        point={{ ...DOTS.points[1]!, number: BARS.points[1]!.number }}
        definitions={DOTS.definitions}
        you
        onClose={() => {}}
      />
    </div>
  ),
}

/** The four shapes, in the order of a Visual's definitions. */
export const Shapes: StoryObj = {
  render: () => (
    <p>
      {[0, 1, 2, 3].map((shape) => (
        <DefinitionGlyph key={shape} shape={shape} />
      ))}
    </p>
  ),
}
