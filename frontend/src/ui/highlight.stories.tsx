// The Grifo (#334): a Guide's paragraph with a Grifo saved on it, which the
// layer (`highlight-layer.tsx`) paints, and its popover with a Nota
// (`highlight-popover.tsx`). "Grifar" (`highlight-action.tsx`) is the third
// button of the popover on selected text, shown over the same paragraph.
// The tap on a painted Grifo is the e2e's (`e2e/highlight.e2e.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'
import { withRouter } from '@/platform/storybook/with-router'
import {
  addHighlight,
  removeHighlight,
  setNote,
  type NewHighlight,
} from '#/state/highlights'
import { HighlightAction } from './highlight-action'
import { HIGHLIGHT_LABEL } from './highlight.copy'
import { HighlightLayer } from './highlight-layer'
import { HighlightNote } from './highlight-note'
import { usePainted } from './highlight-paint'
import { HighlightPopover } from './highlight-popover'
import type { Quote } from './selection-action'
import { quotable } from './selection-quote'

const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.'
const GRIFO = 'de quem se conheceu pessoalmente'

const NOTE = 'Conferir a amostra do estudo.'

const SAVED: NewHighlight = {
  path: '/',
  pageTitle: 'Onde conhecer pessoas',
  link: '/#o-lugar:~:text=de%20quem%20se%20conheceu%20pessoalmente',
  text: GRIFO,
  exact: GRIFO,
  prefix: 'conheceu online e ',
  suffix: ' fica perto.',
}

const Paragraph = () => (
  <div className="prosa mt-24 max-w-texto" {...quotable('o-lugar')}>
    <p>{SENTENCE}</p>
  </div>
)

const meta = {
  component: HighlightLayer,
  decorators: [withRouter],
  parameters: { layout: 'padded' },
  // The Grifo saved in this browser, as "Grifar" leaves it, with a Nota.
  beforeEach: () => {
    const { id } = addHighlight(SAVED)
    setNote(id, NOTE)
    return () => removeHighlight(id)
  },
} satisfies Meta<typeof HighlightLayer>

export default meta

type Story = StoryObj<typeof meta>

/** A saved Grifo, painted on its paragraph: the wavy ink underline. */
export const PaintedOnText: Story = {
  render: () => (
    <>
      <Paragraph />
      <HighlightLayer />
    </>
  ),
}

/** The popover of the Grifo the layer painted. */
function OpenGrifo() {
  const [painted] = usePainted()
  return (
    <>
      <Paragraph />
      <HighlightLayer />
      {painted && <HighlightPopover painted={painted} close={() => {}} />}
    </>
  )
}

/** The Grifo's popover: its Nota and the actions on it. */
export const WithItsNote: Story = {
  render: () => <OpenGrifo />,
  play: async () => {
    const popover = await within(document.body).findByRole('dialog', {
      name: HIGHLIGHT_LABEL,
    })
    await expect(within(popover).getByText(NOTE)).toBeVisible()
  },
}

/** "Grifar" alone, as the popover on selected text shows it. */
function GrifarButton() {
  const [range] = useState(() => document.createRange())
  const quote: Quote = {
    text: SENTENCE,
    link: 'https://temestudo.cloud/#o-lugar',
    path: '/',
    anchor: 'o-lugar',
    range,
  }
  return <HighlightAction quote={quote} show={() => {}} close={() => {}} />
}

export const GrifarAction: Story = {
  render: () => <GrifarButton />,
}

/** A Nota alone, under its heading, as the popover and `/grifos` show it. */
export const ANote: Story = {
  render: () => <HighlightNote note={NOTE} />,
}
