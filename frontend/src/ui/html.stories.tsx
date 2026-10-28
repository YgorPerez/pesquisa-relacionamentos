// The library's HTML on the page (`html.tsx`), as the server builds it: a
// sentence with a key number, a reference ring and a Verbete.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { safeHtml } from '#/content/safe-html'
import { Html } from './html'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** One paragraph of a Guide. */
export const Paragraph: Story = {
  render: () => (
    <Html
      className="prosa"
      html={safeHtml(
        '<p>Na <a class="verbete" href="/glossario#satisfacao">satisfação</a>, a diferença é de <mark class="numero-chave">0,08 ponto</mark><a class="ref" href="#ficha-x">1</a>.</p>',
      )}
    />
  ),
}
