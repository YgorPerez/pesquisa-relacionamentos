// The navigation: the top bar, the DESIGN.md back links and the loop that
// circles the tapped Fact sheet (`navigation.tsx`, `header.tsx`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FactSheetLoop, BackLink, BackToGuide } from './navigation'
import { Header } from './header'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** The top of any page that is not a Guide's: only the site name. */
export const TopBar: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Header />,
}

export const BackToList: Story = {
  render: () => <BackLink to="/estudos">Todos os estudos</BackLink>,
}

/** Whoever arrived from another Guide goes back to it. */
export const BackToTheGuide: Story = {
  parameters: {
    history: { from: 'Onde os casais se conhecem hoje?' },
  },
  render: () => <BackToGuide />,
}

/** The Fact sheet circled after a tap on a reference number. */
export const CircledFactSheet: Story = {
  render: () => (
    <ul className="m-0 list-none p-0">
      <li className="relative p-3" tabIndex={-1}>
        Rosenfeld, Thomas e Hausen (2019). Disintermediating your friends.
        <FactSheetLoop />
      </li>
    </ul>
  ),
}
