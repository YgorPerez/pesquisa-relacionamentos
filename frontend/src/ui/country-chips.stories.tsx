// The Guide's country chips (#471), over an in-memory router: a tap writes
// `?pais=` and a second tap clears it.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { withRouter } from '@/platform/storybook/with-router'
import { CountryChips } from './country-chips'

const meta = {
  component: CountryChips,
  parameters: { layout: 'padded' },
  decorators: [withRouter],
  args: {
    countries: [
      { slug: 'brasil', name: 'Brasil' },
      { slug: 'eua', name: 'EUA' },
      { slug: 'franca', name: 'França' },
    ],
  },
} satisfies Meta<typeof CountryChips>

export default meta
type Story = StoryObj<typeof meta>

/** "Todos" pressed until a country is chosen. */
export const NoneChosen: Story = {}

/** Choosing EUA presses it alone; tapping it again goes back to "Todos". */
export const ChooseAndClear: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement)
    const chip = (name: string) => page.getByRole('button', { name })
    await userEvent.click(chip('EUA'))
    await expect(chip('EUA')).toHaveAttribute('aria-pressed', 'true')
    await expect(chip('Todos')).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(chip('EUA'))
    await expect(chip('Todos')).toHaveAttribute('aria-pressed', 'true')
  },
}
