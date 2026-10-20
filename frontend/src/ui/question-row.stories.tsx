// The big row (`question-row.tsx`): a Guide's Question and a home page
// calculator.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalculatorRow, QuestionRow } from './question-row'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Question: Story = {
  render: () => (
    <QuestionRow
      guide={{
        topic: 'onde-conhecer-pessoas',
        slug: 'app-ou-presencial',
        question: 'App ou presencial: onde é melhor conhecer alguém?',
        firstSentence: 'Os casais que se conheceram online não duram menos.',
      }}
    />
  ),
}

export const Calculator: Story = {
  render: () => (
    <CalculatorRow
      href="/grupo-possivel"
      title="Grupo possível"
      summary="Quantas pessoas no Brasil atendem ao que você procura."
    />
  ),
}
