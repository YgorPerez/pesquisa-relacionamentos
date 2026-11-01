// What a page mounts for the reader's actions on its text
// (`page-selection.tsx`), over a paragraph marked quotable. The story selects
// the sentence when it opens. The actions themselves are
// `selection-popover.stories.tsx`'s.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { expect, within } from 'storybook/test'
import { withRouter } from '@/platform/storybook/with-router'
import { PageSelection } from './page-selection'
import { POPOVER_LABEL } from './selection-popover.copy'
import { quotable } from './selection-quote'

const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.'

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
      <PageSelection />
    </div>
  )
}

const meta = {
  component: PageSelection,
  decorators: [withRouter],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageSelection>

export default meta

type Story = StoryObj<typeof meta>

/** A sentence selected: the popover opens, without "De onde vem isso?". */
export const OnASentence: Story = {
  render: () => <SelectedParagraph />,
  play: async () => {
    const popover = await within(document.body).findByRole('dialog', {
      name: POPOVER_LABEL,
    })
    await expect(
      within(popover).getByRole('button', { name: 'Grifar' }),
    ).toBeVisible()
    await expect(
      within(popover).queryByRole('button', { name: 'De onde vem isso?' }),
    ).not.toBeInTheDocument()
  },
}
