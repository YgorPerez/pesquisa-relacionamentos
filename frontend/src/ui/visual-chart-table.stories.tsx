// A Study table of mixed units (#475), over the fixture Guide's: a table,
// whose numbers open the same tap detail as a chart's marks.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { STUDY_TABLE } from './guide.example'
import { VisualChartTable } from './visual-chart-table'

const meta = {
  component: VisualChartTable,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="prosa max-w-texto">
        <Story />
      </div>
    ),
  ],
  args: { table: STUDY_TABLE, country: null, profile: null },
} satisfies Meta<typeof VisualChartTable>

export default meta
type Story = StoryObj<typeof meta>

/** One row per Study, Brazil marked in its context. */
export const Table: Story = {}

/** `?pais=eua`: the United States' row lit, Brazil's dimmed. */
export const CountryChosen: Story = { args: { country: 'eua' } }

/** A man of 30 who seeks men: "você" on Silva (18 to 35), not on Costa
 * (couples of different sexes). */
export const WithProfile: Story = {
  args: { profile: { gender: 'homem', seeks: 'homens', age: 30 } },
}

/** The screen turns narrow with a card pinned: the card asks again which side
 * it takes. */
export const PinnedCardAsksItsSideAgain: Story = {
  play: async ({ canvasElement }) => {
    const number = within(canvasElement).getByRole('button', { name: /^18%/ })
    const root = document.documentElement
    const screenWidth = (width: number) =>
      Object.defineProperty(root, 'clientWidth', {
        configurable: true,
        get: () => width,
      })
    const right = number.getBoundingClientRect().right
    try {
      screenWidth(right + 400)
      await userEvent.click(number)
      const side = () =>
        document
          .querySelector('[data-slot="detalhe-do-grafico"]')
          ?.getAttribute('data-side')
      // Beside the number: the real screen may flip it to its other side.
      await waitFor(() => expect(side()).toMatch(/^(right|left)$/))
      screenWidth(right + 100)
      window.dispatchEvent(new Event('resize'))
      await waitFor(() => expect(side()).toBe('bottom'))
    } finally {
      Reflect.deleteProperty(root, 'clientWidth')
      await userEvent.keyboard('{Escape}')
    }
  },
}

/** A tap on a number pins its card, with the exact value and the Fact sheet;
 * "Fechar" closes it. The card hangs from the page's end. */
export const TapDetail: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /^18%/ }),
    )
    const page = within(document.body)
    const close = await page.findByRole('button', { name: 'Fechar' })
    await expect(
      page.getByRole('link', { name: /^Abrir Ficha: Silva/ }),
    ).toBeInTheDocument()
    await userEvent.click(close)
    await waitFor(() =>
      expect(page.queryByRole('button', { name: 'Fechar' })).toBeNull(),
    )
  },
}
