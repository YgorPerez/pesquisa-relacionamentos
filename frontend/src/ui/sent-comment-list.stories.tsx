// The Comentários section of "Seus trechos" (`sent-comment-list.tsx`, #347):
// two sent from a Guide and a Tip, one whose passage changed, and the empty
// section.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import type { SentComment } from '#/state/sent-comments'
import { CHANGED } from './highlight-list.copy'
import { SentCommentList } from './sent-comment-list'
import { NO_COMMENTS, removeCommentLabel } from './sent-comment-list.copy'

function sent(
  id: string,
  path: string,
  pageTitle: string,
  text: string,
  more: Partial<SentComment> = {},
): SentComment {
  return {
    id,
    path,
    pageTitle,
    link: `${path}#secao:~:text=${encodeURIComponent(text)}`,
    text,
    exact: text,
    prefix: '',
    suffix: '',
    kind: 'wrong',
    comment: 'O número não bate com a Ficha.',
    issue: Number(id) + 40,
    changed: false,
    at: Date.parse('2026-10-20T15:00:00Z'),
    ...more,
  }
}

const COMMENTS: ReadonlyArray<SentComment> = [
  sent(
    '1',
    '/onde-conhecer-pessoas',
    'Onde conhecer pessoas',
    'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.',
    // Recebido, with the key that edits it (#443).
    { editKey: 'k'.repeat(43) },
  ),
  sent(
    '2',
    '/dicas/apps-como-complemento',
    'Use o app como complemento',
    'Use o app como complemento',
    {
      kind: 'missing-study',
      status: 'corrected',
      seenStatus: 'received',
      comment: 'Tem estudo sobre isso no Brasil?',
      at: Date.parse('2026-10-27T15:00:00Z'),
    },
  ),
  sent(
    '3',
    '/onde-conhecer-pessoas',
    'Onde conhecer pessoas',
    'Nenhum estudo separou app de rede social.',
    {
      kind: 'unclear',
      status: 'not-planned',
      seenStatus: 'not-planned',
      comment: 'Não entendi o que é rede social aqui.',
      changed: true,
      at: Date.parse('2026-10-10T15:00:00Z'),
    },
  ),
]

/** With "Tirar da lista" working, as on the page. */
function Removing({ comments }: { comments: ReadonlyArray<SentComment> }) {
  const [left, setLeft] = useState(comments)
  return (
    <SentCommentList
      comments={left}
      onRemove={(id) => setLeft((now) => now.filter((c) => c.id !== id))}
    />
  )
}

const meta = {
  component: Removing,
  parameters: { layout: 'padded' },
  args: { comments: COMMENTS },
} satisfies Meta<typeof Removing>

export default meta

type Story = StoryObj<typeof meta>

/** Three sent, newest first; the oldest one's passage changed. */
export const ThreeSent: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText(CHANGED)).toHaveLength(1)
  },
}

/** None sent from this browser: how to send one. */
export const Empty: Story = { args: { comments: [] } }

/** "Tirar da lista" takes one off; with the last one gone, the empty
 * section. */
export const RemoveAll: Story = {
  args: { comments: COMMENTS.slice(1, 2) },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(
      screen.getByRole('button', {
        name: removeCommentLabel('Use o app como complemento'),
      }),
    )
    await expect(screen.getByText(NO_COMMENTS, { exact: false })).toBeVisible()
  },
}
