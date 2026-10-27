// "De onde vem isso?" (`selection-source.tsx`, #336) over the fixture
// Guide's Chapters: the story selects a sentence when it opens and asks
// where it comes from, and the last one asks it in a Grifo's popover, as a
// page mounts them (`page-selection.tsx`). Which Fact sheets each kind of
// sentence lists is `selection-source.test.tsx`'s.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { withRouter } from '@/platform/storybook/with-router'
import { addHighlight, removeHighlight } from '#/state/highlights'
import { HIGHLIGHT_LABEL } from './highlight.copy'
import { requestOpen, usePainted } from './highlight-paint'
import { GUIDE } from './guide.example'
import { Chapters } from './guide-sections'
import { PageSelection } from './page-selection'
import { SelectionPopover } from './selection-popover'
import { ACTION_LABEL, POPOVER_LABEL } from './selection-popover.copy'
import { PageSources } from './selection-source'

/** The Chapters, with the first text node that has `text` selected. */
function SelectedSentence({ text }: { text: string }) {
  useEffect(() => {
    const walker = document.createTreeWalker(
      document.querySelector('[data-slot="capitulos-texto"]')!,
      NodeFilter.SHOW_TEXT,
    )
    let node = walker.nextNode() as Text | null
    while (node && !node.data.includes(text))
      node = walker.nextNode() as Text | null
    if (!node) return
    const range = document.createRange()
    const at = node.data.indexOf(text)
    range.setStart(node, at)
    range.setEnd(node, at + text.length)
    document.getSelection()?.removeAllRanges()
    document.getSelection()?.addRange(range)
  }, [text])
  return (
    <PageSources factSheets={GUIDE.factSheets} page="guide">
      <div className="max-w-texto">
        <Chapters chapters={GUIDE.chapters} youMarks={GUIDE.youMarks} />
      </div>
      <SelectionPopover />
    </PageSources>
  )
}

const meta = {
  component: SelectedSentence,
  decorators: [withRouter],
  parameters: { layout: 'padded' },
  args: { text: 'A satisfação de quem se conheceu online' },
  play: async () => {
    const popover = within(
      await within(document.body).findByRole('dialog', {
        name: POPOVER_LABEL,
      }),
    )
    await userEvent.click(
      popover.getByRole('button', { name: ACTION_LABEL.source }),
    )
    await expect(popover.getByRole('status')).toBeVisible()
  },
} satisfies Meta<typeof SelectedSentence>

export default meta

type Story = StoryObj<typeof meta>

/** A cited sentence: its Fact sheet, with the Status and the Strength. */
export const CitedSentence: Story = {}

/** A sentence that cites no Fact sheet: it says so, and lists the
 * Chapter's. */
export const UncitedSentence: Story = {
  args: { text: 'Depende de quem você procura' },
}

const GRIFO = 'A satisfação de quem se conheceu online'

/** The Chapters with a Grifo on a cited sentence, its popover open. */
function GrifoOnASentence() {
  const [painted] = usePainted()
  useEffect(() => {
    if (painted) requestOpen(painted.highlight.id)
  }, [painted])
  return (
    <>
      <div className="max-w-texto">
        <Chapters chapters={GUIDE.chapters} youMarks={GUIDE.youMarks} />
      </div>
      <PageSelection factSheets={GUIDE.factSheets} page="guide" />
    </>
  )
}

/** A Grifo's popover: "De onde vem isso?" over the Grifo's text. */
export const OnAGrifo: Story = {
  render: () => <GrifoOnASentence />,
  beforeEach: () => {
    const { id } = addHighlight({
      path: '/',
      pageTitle: 'Onde conhecer pessoas',
      link: '/#o-lugar',
      text: GRIFO,
      exact: GRIFO,
      prefix: '',
      suffix: '',
    })
    return () => removeHighlight(id)
  },
  play: async () => {
    const popover = within(
      await within(document.body).findByRole('dialog', {
        name: HIGHLIGHT_LABEL,
      }),
    )
    await userEvent.click(
      popover.getByRole('button', { name: ACTION_LABEL.source }),
    )
    await expect(popover.getByRole('status')).toBeVisible()
  },
}
