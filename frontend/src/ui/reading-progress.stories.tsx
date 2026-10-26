// The Guide's reading bar (`reading-progress.tsx`) over a made-up Guide of
// three Chapters: scroll the canvas to see the bar come in, name the Chapter
// and ink the line.
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ProgressLine, ReadingProgress } from './reading-progress'
import { Headline, Section } from './section'
import { Column, Display, Sheet } from './sheet'

const CHAPTERS = [
  {
    id: 'cap-um',
    title: 'O online virou o caminho mais comum, não o da maioria',
  },
  { id: 'cap-dois', title: 'Ninguém mediu a sua chance em cada caminho' },
  { id: 'cap-tres', title: 'O que o app dá, e o que cobra' },
]

const PARAGRAPH =
  'Saber onde os casais se conheceram não diz onde você tem mais chance. Para isso seria preciso contar também quem tentou cada caminho e não achou ninguém, e nenhum estudo que lemos fez essa conta.'

function Guide() {
  return (
    <Sheet>
      <ReadingProgress topic="guia-de-exemplo" chapters={CHAPTERS} />
      <Column>
        <Display>Onde conhecer pessoas</Display>
        <p>{PARAGRAPH}</p>
        <div data-slot="capitulos-texto">
          {CHAPTERS.map((chapter) => (
            <Section
              key={chapter.id}
              id={chapter.id}
              aria-labelledby={`t-${chapter.id}`}
            >
              <Headline id={`t-${chapter.id}`}>{chapter.title}</Headline>
              {[1, 2, 3, 4, 5].map((n) => (
                <p key={n}>{PARAGRAPH}</p>
              ))}
            </Section>
          ))}
        </div>
        <Section id="o-que-levar" aria-labelledby="t-o-que-levar">
          <Headline id="t-o-que-levar">O que levar</Headline>
          <p>{PARAGRAPH}</p>
        </Section>
      </Column>
    </Sheet>
  )
}

const meta = {
  component: Guide,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Guide>

export default meta

type Story = StoryObj<typeof meta>

/** At the top the bar waits; into the second Chapter it names it, and a tap
 * opens the Chapters with the current one filled. */
export const IntoTheSecondChapter: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    const second = canvasElement.ownerDocument.getElementById('cap-dois')!
    second.scrollIntoView({ behavior: 'instant' })
    const bar = await screen.findByRole('button', { name: /^Capítulo 2 de 3/ })
    await userEvent.click(bar)
    await waitFor(() => expect(bar).toHaveAttribute('aria-expanded', 'true'))
    await expect(
      screen.getByRole('link', { current: 'location' }),
    ).toHaveAccessibleName(/Ninguém mediu/)
  },
}

/** The line alone, at a third: dotted where it is still to read. */
export const Line: Story = {
  render: () => (
    <div className="p-md" style={{ '--leitura': 1 / 3 } as CSSProperties}>
      <ProgressLine />
    </div>
  ),
}
