// The navigation: the top bar, the DESIGN.md back links and the loop that
// circles the tapped Fact sheet (`navigation.tsx`, `header.tsx`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FactSheetLoop } from './fact-sheet-loop'
import { BackLink, BackToGuide, FoldArrow } from './navigation'
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
    history: { from: 'Escolher parceiro' },
  },
  render: () => <BackToGuide />,
}

/** The fold's little arrow, closed and open (`<details>`, as on the home). */
export const FoldArrows: Story = {
  render: () => (
    <div className="flex flex-col gap-md">
      {[false, true].map((open) => (
        <details key={String(open)} open={open} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 font-bold [&::-webkit-details-marker]:hidden">
            <FoldArrow className="group-open:rotate-90" />
            {open ? 'Aberta' : 'Fechada'}
          </summary>
          <p>O que a dobra guarda.</p>
        </details>
      ))}
    </div>
  ),
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
