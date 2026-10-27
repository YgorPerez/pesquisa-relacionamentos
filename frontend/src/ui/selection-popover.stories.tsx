// The popover on selected text (`selection-popover.tsx`, #333) over a
// paragraph marked quotable, and its copy actions (`selection-copy.tsx`)
// alone. The story selects the sentence when it opens. The real clipboard
// and the side it opens on are the e2e's (`e2e/selection.e2e.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState, type ReactNode } from 'react'
import { expect, within } from 'storybook/test'
import { withRouter } from '@/platform/storybook/with-router'
import { CopyLink, CopyText } from './selection-copy'
import { SelectionPopover } from './selection-popover'
import { POPOVER_LABEL } from './selection-popover.copy'
import { quotable, type Quote } from './selection-quote'

const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.'

/** A Guide's paragraph, with its sentence selected once it is drawn. */
function SelectedParagraph() {
  useEffect(() => {
    const text = document.querySelector('[data-quote] p')?.firstChild
    if (!text) return
    const range = document.createRange()
    range.setStart(text, 0)
    range.setEnd(text, SENTENCE.length - 1)
    document.getSelection()?.removeAllRanges()
    document.getSelection()?.addRange(range)
  }, [])
  return (
    <div className="prosa mt-24 max-w-texto" {...quotable('o-lugar')}>
      <p>{SENTENCE}</p>
      <SelectionPopover />
    </div>
  )
}

const meta = {
  component: SelectionPopover,
  decorators: [withRouter],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SelectionPopover>

export default meta

type Story = StoryObj<typeof meta>

/** A sentence of a Guide selected: the row of actions above it. */
export const OnASentence: Story = {
  render: () => <SelectedParagraph />,
  play: async () => {
    const popover = await within(document.body).findByRole('dialog', {
      name: POPOVER_LABEL,
    })
    await expect(
      within(popover).getByRole('button', { name: 'Copiar link' }),
    ).toBeVisible()
  },
}

const QUOTE: Omit<Quote, 'range'> = {
  text: SENTENCE,
  link: 'https://temestudo.cloud/onde-conhecer-pessoas#o-lugar:~:text=A%20satisfa%C3%A7%C3%A3o%20de%20quem,conheceu%20pessoalmente%20fica%20perto',
  path: '/onde-conhecer-pessoas',
  anchor: 'o-lugar',
}

/** The two copy buttons, with the panel each one fills under the row. */
function CopyButtons() {
  const [panel, setPanel] = useState<ReactNode>(null)
  const [range] = useState(() => document.createRange())
  const quote = { ...QUOTE, range }
  return (
    <>
      <CopyText quote={quote} show={setPanel} close={() => {}} />{' '}
      <CopyLink quote={quote} show={setPanel} close={() => {}} />
      {panel}
    </>
  )
}

/** "Copiar" and "Copiar link" alone. */
export const CopyActions: Story = {
  render: () => <CopyButtons />,
}
