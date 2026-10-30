// A chart drawn by the library (#471), with the frame, the legend of the
// definitions and the tap detail. In Storybook the plot mounts after the
// library arrives, as on a page reached by a link inside the site.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { DefinitionGlyph } from './definition-glyph'
import { VisualChart } from './visual-chart'
import { BARS, DOTS, STACKED } from './visual-chart.example'
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

/** One dot per Study, two definitions, Brazil ringed. */
export const Dots: Story = {}

/** Bars, the key value in pink and our own calculation hatched. */
export const Bars: Story = { args: { chart: BARS } }

/** `?pais=eua`: the United States lit, the others dimmed. */
export const CountryChosen: Story = { args: { country: 'eua' } }

/** A Profile of 30: "você" on the two Studies that cover it. */
export const WithProfile: Story = { args: { profile: { age: 30 } } }

/** Enter on the chart opens the first point's exact value and its Fact
 * sheet's ring; "Fechar" closes it. */
export const TapDetail: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement)
    const chart = await page.findByRole(
      'img',
      { name: DOTS.title },
      { timeout: 10_000 },
    )
    chart.focus()
    await userEvent.keyboard('{Enter}')
    const close = await page.findByRole('button', { name: 'Fechar' })
    await expect(
      page.getByRole('link', { name: /^Ficha \d: / }),
    ).toBeInTheDocument()
    await userEvent.click(close)
    await expect(page.queryByRole('button', { name: 'Fechar' })).toBeNull()
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
    const detail = await page.findByText('Contentes', {
      selector: '[data-slot="detalhe-do-grafico"] span',
    })
    await expect(detail).toBeInTheDocument()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect(
      await page.findByText('Neutros', {
        selector: '[data-slot="detalhe-do-grafico"] span',
      }),
    ).toBeInTheDocument()
  },
}

/** The plot alone, as the library draws it. */
export const Plot: StoryObj = {
  render: () => (
    <VisualChartPlot
      chart={DOTS}
      country={null}
      profile={null}
      onSelect={() => {}}
    />
  ),
}

/** The tap detail of our own calculation, with its definition and "você". */
export const Detail: StoryObj = {
  render: () => (
    <VisualDetail
      point={{ ...DOTS.points[1]!, number: BARS.points[1]!.number }}
      definitions={DOTS.definitions}
      you
      onClose={() => {}}
    />
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
