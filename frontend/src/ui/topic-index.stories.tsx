// The home page's Topic index (`topic-index.tsx`): six Topics, each a fold.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { TopicIndex } from './topic-index'

const guides = (topic: string, questions: ReadonlyArray<string>) =>
  questions.map((question, i) => ({ topic, slug: `${topic}-${i}`, question }))

const TOPICS = [
  {
    slug: 'onde-conhecer-pessoas',
    title: 'Onde conhecer pessoas',
    questions: guides('onde-conhecer-pessoas', [
      'Onde os casais se conhecem hoje?',
      'O lugar onde nos conhecemos muda a relação?',
      'App ou presencial: onde tenho mais chance?',
      'Com que idade se casa no Brasil?',
    ]),
  },
  {
    slug: 'conversar-e-se-conectar',
    title: 'Conversar e se conectar',
    questions: guides('conversar-e-se-conectar', [
      'Como ter conversas melhores com quem acabei de conhecer?',
      'As 36 perguntas aproximam duas pessoas?',
      'A conversa foi tão ruim quanto eu acho?',
    ]),
  },
  {
    slug: 'escolher-parceiro',
    title: 'Escolher parceiro',
    questions: guides('escolher-parceiro', [
      'Que características do parceiro preveem um bom relacionamento?',
      'Precisamos ser parecidos?',
    ]),
  },
  {
    slug: 'sexo-e-historico',
    title: 'Sexo e histórico antes de assumir',
    questions: guides('sexo-e-historico', ['Como se proteger de IST?']),
  },
  {
    slug: 'manter-a-relacao',
    title: 'Manter a relação',
    questions: guides('manter-a-relacao', [
      'O que prevê um término?',
      'Brigar faz mal à relação?',
    ]),
  },
  {
    slug: 'apps-e-saude-mental',
    title: 'Apps, rejeição e saúde mental',
    questions: guides('apps-e-saude-mental', [
      'Usar apps de namoro faz mal à saúde mental?',
      'Como lidar com a rejeição?',
    ]),
  },
]

const meta = {
  component: TopicIndex,
  parameters: { layout: 'padded' },
  args: { topics: TOPICS },
} satisfies Meta<typeof TopicIndex>

export default meta

type Story = StoryObj<typeof meta>

/** All closed: the six Topics fit on a phone screen. */
export const SixTopics: Story = {}

/** A tap on a Topic opens its Questions and "Abrir o Tema"; another tap
 * closes it. */
export const OpenAndClose: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    const title = screen.getByText('Conversar e se conectar')
    const fold = title.closest('details')!
    await userEvent.click(title)
    await expect(fold).toHaveAttribute('open')
    await expect(
      screen.getByRole('link', {
        name: 'As 36 perguntas aproximam duas pessoas?',
      }),
    ).toBeVisible()
    await userEvent.click(title)
    await expect(fold).not.toHaveAttribute('open')
  },
}

/** A Topic with a single Question says it in the singular. */
export const OneQuestion: Story = {
  args: { topics: TOPICS.slice(3, 4) },
}
