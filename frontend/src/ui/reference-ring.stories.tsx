import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Html } from './guide'
import { excerpt } from './guide.example'

const FACT_SHEETS = [
  {
    slug: 'silva-2020-apps-brasil',
    title: 'Silva e Souza (2020): apps de namoro no Brasil',
  },
  {
    slug: 'costa-2018-satisfacao',
    title: 'Costa (2018): satisfação e onde os casais se conheceram',
  },
]

/** A Guide paragraph, with the HTML the server builds from markdown. */
function Paragraph({ markdown }: { markdown: string }) {
  return <Html as="p" className="prosa" html={excerpt(markdown, FACT_SHEETS)} />
}

const meta = {
  component: Paragraph,
  parameters: { layout: 'padded' },
  args: {
    markdown:
      'No Brasil, ==18%== dos casais se conheceram por app [@silva-2020-apps-brasil].',
  },
} satisfies Meta<typeof Paragraph>

export default meta

type Story = StoryObj<typeof meta>

/** The number in the ring, glued to the word and the period, with the key
 * number in pink. */
export const OneReference: Story = {
  play: async ({ canvasElement }) => {
    const ref = within(canvasElement).getByRole('link', { name: /^Ficha 1:/ })
    await expect(ref).toHaveAttribute('href', '#ficha-silva-2020-apps-brasil')
    // The word, the number and the period do not split at a line break.
    await expect(ref.parentElement).toHaveClass('nw')
    await expect(ref.parentElement).toHaveTextContent('app1.')
  },
}

/** Two Fact sheets for the same sentence: two rings side by side. */
export const TwoReferences: Story = {
  args: {
    markdown:
      'A diferença de satisfação entre app e presencial é pequena [@silva-2020-apps-brasil][@costa-2018-satisfacao].',
  },
}

/** At the end of a narrow line, the ring goes down with the word. */
export const AtLineBreak: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 220 }}>{Story()}</div>],
  args: {
    markdown:
      'Quase um em cada cinco casais brasileiros se conheceu por aplicativo [@costa-2018-satisfacao].',
  },
}
