// A Verbete's popover (`term-popover.tsx`), over the fixture's Verbetes
// (`term-popover.example.ts`). On the page, the sheet hangs from the tapped
// word; here, the word and the sheet's contents.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SATISFACTION } from './term-popover.example'
import { TermCard } from './term-popover'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** The dotted word in a sentence, as the server draws it. */
export const MarkedWord: Story = {
  render: () => (
    <p className="prosa">
      A diferença de{' '}
      <a className="verbete" href="/glossario#satisfacao">
        satisfação
      </a>{' '}
      entre os dois caminhos é pequena.
    </p>
  ),
}

/** The sentence cites Costa, which says how it measured satisfação. */
export const WithTheStudy: Story = {
  render: () => (
    <div className="max-w-88 rounded-mao border-2 border-tinta bg-papel p-xs">
      <TermCard term={SATISFACTION} factSheets={['costa-2018-satisfacao']} />
    </div>
  ),
}

/** The sentence cites no Study: the general definition only. */
export const GeneralOnly: Story = {
  render: () => (
    <div className="max-w-88 rounded-mao border-2 border-tinta bg-papel p-xs">
      <TermCard term={SATISFACTION} factSheets={[]} />
    </div>
  ),
}
