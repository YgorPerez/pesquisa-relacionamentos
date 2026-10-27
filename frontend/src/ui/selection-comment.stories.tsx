// "Comentar" of the popover on selected text (`selection-comment.tsx`, #337)
// alone: the button, and the form it opens under it. The send is the screen
// test's (`selection-comment.test.tsx`), with GitHub faked.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Textarea } from '@/ui/shadcn/textarea'
import { CommentOnQuote } from './selection-comment'
import { COMMENT } from './selection-comment.copy'
import type { Quote } from './selection-quote'

const QUOTE: Omit<Quote, 'range'> = {
  text: 'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.',
  link: 'https://temestudo.cloud/onde-conhecer-pessoas#o-lugar:~:text=A%20satisfa%C3%A7%C3%A3o%20de%20quem,conheceu%20pessoalmente%20fica%20perto',
  path: '/onde-conhecer-pessoas',
  anchor: 'o-lugar',
}

/** The button, and under it the panel it fills, as in the popover. */
function CommentButton() {
  const [panel, setPanel] = useState<ReactNode>(null)
  const [range] = useState(() => document.createRange())
  return (
    <div className="max-w-88 rounded-mao border-2 border-tinta bg-papel p-xs">
      <CommentOnQuote
        quote={{ ...QUOTE, range }}
        show={setPanel}
        close={() => {}}
      />
      {panel !== null && <div className="mt-xs">{panel}</div>}
    </div>
  )
}

const meta = {
  component: CommentButton,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CommentButton>

export default meta

type Story = StoryObj<typeof meta>

/** The form open: the four types, the text and the anonymity note. */
export const Form: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Comentar' }))
    await expect(canvas.getByLabelText(COMMENT.text)).toBeVisible()
    await expect(
      canvas.getByRole('radio', { name: 'Falta estudo' }),
    ).toBeVisible()
  },
}

/** The free-text field alone (`ui/shadcn/textarea.tsx`). */
export const TextField: Story = {
  render: () => <Textarea aria-label="Texto" defaultValue="Um comentário." />,
}
