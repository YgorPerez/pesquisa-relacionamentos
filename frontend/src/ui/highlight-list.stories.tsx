// The list of `/grifos` (`highlight-list.tsx`, #335): Grifos on a Guide, a
// Tip and a Fact sheet, one with a Nota and one whose passage changed, and
// the empty page.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import type { Highlight } from '#/state/highlight-record'
import { HighlightList } from './highlight-list'
import { CHANGED, EMPTY_HEADING, removeLabel } from './highlight-list.copy'

function grifo(
  id: string,
  path: string,
  pageTitle: string,
  text: string,
  more: Partial<Highlight> = {},
): Highlight {
  return {
    id,
    path,
    pageTitle,
    link: `${path}#secao:~:text=${encodeURIComponent(text)}`,
    text,
    exact: text,
    prefix: '',
    suffix: '',
    note: '',
    changed: false,
    at: Number(id),
    ...more,
  }
}

const HIGHLIGHTS: ReadonlyArray<Highlight> = [
  grifo(
    '1',
    '/onde-conhecer-pessoas',
    'Onde conhecer pessoas',
    'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.',
    { note: 'Conferir a amostra do estudo.' },
  ),
  grifo(
    '2',
    '/onde-conhecer-pessoas',
    'Onde conhecer pessoas',
    'Nenhum estudo separou app de rede social.',
    { changed: true, note: 'Mandar para a Ana.' },
  ),
  grifo(
    '3',
    '/dicas/apps-como-complemento',
    'Use o app como complemento, não como o único caminho.',
    'Use o app como complemento',
  ),
  grifo(
    '4',
    '/estudos/silva-2020-apps-brasil',
    'Silva 2020: apps de namoro no Brasil',
    'Uma amostra de usuários de aplicativos de quatro capitais.',
  ),
]

/** With "Tirar grifo" working, as on the page. */
function Removing({ highlights }: { highlights: ReadonlyArray<Highlight> }) {
  const [left, setLeft] = useState(highlights)
  return (
    <HighlightList
      highlights={left}
      onRemove={(id) => setLeft((now) => now.filter((h) => h.id !== id))}
    />
  )
}

const meta = {
  component: Removing,
  parameters: { layout: 'padded' },
  args: { highlights: HIGHLIGHTS },
} satisfies Meta<typeof Removing>

export default meta

type Story = StoryObj<typeof meta>

/** Three pages, Guides first; the second Grifo's passage changed. */
export const ThreePages: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText(CHANGED)).toHaveLength(1)
  },
}

/** No Grifo yet: how to make one. */
export const Empty: Story = { args: { highlights: [] } }

/** "Tirar grifo" takes a Grifo off; with the last one gone, the empty page. */
export const RemoveAll: Story = {
  args: { highlights: HIGHLIGHTS.slice(2, 3) },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(
      screen.getByRole('button', {
        name: removeLabel('Use o app como complemento'),
      }),
    )
    await expect(
      screen.getByRole('heading', { name: EMPTY_HEADING }),
    ).toBeVisible()
  },
}
