// A Study table of mixed units (#475), over the fixture Guide's: a table,
// whose numbers open the same tap detail as a chart's marks.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
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

/** A tap on a number opens its exact value and Fact sheet; "Fechar"
 * closes it. */
export const TapDetail: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement)
    await userEvent.click(page.getByRole('button', { name: /^18%/ }))
    const close = await page.findByRole('button', { name: 'Fechar' })
    await expect(
      page.getAllByRole('link', { name: /^Ficha \d: Silva/ }),
    ).toHaveLength(2)
    await userEvent.click(close)
    await expect(page.queryByRole('button', { name: 'Fechar' })).toBeNull()
  },
}
