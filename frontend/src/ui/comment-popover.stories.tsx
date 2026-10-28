// A sent Comentário on its page (#441): a Guide's paragraph whose quote the
// layer (`highlight-layer.tsx`) marks with the dotted underline, the
// Comentário's popover, and the line a Grifo's popover shows when the
// passage has a Comentário too. The tap on the quote is the jsdom test's
// (`highlight-layer.test.tsx`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { withRouter } from '@/platform/storybook/with-router'
import {
  addSentComment,
  removeSentComment,
  type NewSentComment,
} from '#/state/sent-comments'
import { usePaintedComments } from './comment-paint'
import { AlsoCommented, CommentPopover } from './comment-popover'
import { COMMENT_LABEL } from './comment-popover.copy'
import { HighlightLayer } from './highlight-layer'
import { quotable } from './selection-quote'

const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.'
const QUOTE = 'de quem se conheceu pessoalmente'
const WRITTEN = 'O número não bate com a Ficha.'

const SENT: NewSentComment = {
  path: '/',
  pageTitle: 'Onde conhecer pessoas',
  link: '/#o-lugar:~:text=de%20quem%20se%20conheceu%20pessoalmente',
  text: QUOTE,
  exact: QUOTE,
  prefix: 'conheceu online e ',
  suffix: ' fica perto.',
  kind: 'wrong',
  comment: WRITTEN,
  issue: 41,
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
  // The Comentário sent from this browser, as Comentar leaves it.
  beforeEach: () => {
    const { id } = addSentComment(SENT)
    return () => removeSentComment(id)
  },
} satisfies Meta<typeof HighlightLayer>

export default meta

type Story = StoryObj<typeof meta>

/** The sent Comentário's quote on its paragraph: the dotted ink underline. */
export const MarkedOnText: Story = {
  render: () => (
    <>
      <Paragraph />
      <HighlightLayer />
    </>
  ),
}

/** The popover of the Comentário the layer marked. */
function OpenComment() {
  const [painted] = usePaintedComments()
  return (
    <>
      <Paragraph />
      <HighlightLayer />
      {painted && <CommentPopover painted={painted} close={() => {}} />}
    </>
  )
}

/** Its type, its status and what the reader wrote. */
export const Open: Story = {
  render: () => <OpenComment />,
  play: async () => {
    const popover = await within(document.body).findByRole('dialog', {
      name: COMMENT_LABEL,
    })
    await expect(within(popover).getByText(WRITTEN)).toBeVisible()
  },
}

/** In a Grifo's popover, when the passage has a Comentário too. */
export const InAGrifo: Story = {
  render: () => <AlsoCommented open={() => {}} />,
}
