import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Html } from './guia'
import { trecho } from './guia.exemplo'

const FICHAS = [
  {
    slug: 'silva-2020-apps-brasil',
    titulo: 'Silva e Souza (2020): apps de namoro no Brasil',
  },
  {
    slug: 'costa-2018-satisfacao',
    titulo: 'Costa (2018): satisfação e onde os casais se conheceram',
  },
]

/** Um parágrafo do Guia, com o HTML que o servidor monta do markdown. */
function Paragrafo({ markdown }: { markdown: string }) {
  return <Html como="p" className="prosa" html={trecho(markdown, FICHAS)} />
}

const meta = {
  component: Paragrafo,
  parameters: { layout: 'padded' },
  args: {
    markdown:
      'No Brasil, ==18%== dos casais se conheceram por app [@silva-2020-apps-brasil].',
  },
} satisfies Meta<typeof Paragrafo>

export default meta

type Story = StoryObj<typeof meta>

/** O número no anel, grudado à palavra e ao ponto, com o número-chave em rosa. */
export const UmaReferencia: Story = {
  play: async ({ canvasElement }) => {
    const ref = within(canvasElement).getByRole('link', { name: /^Ficha 1:/ })
    await expect(ref).toHaveAttribute('href', '#ficha-silva-2020-apps-brasil')
    // A palavra, o número e o ponto não se separam na quebra de linha.
    await expect(ref.parentElement).toHaveClass('nw')
    await expect(ref.parentElement).toHaveTextContent('app1.')
  },
}

/** Duas Fichas para a mesma frase: dois anéis lado a lado. */
export const DuasReferencias: Story = {
  args: {
    markdown:
      'A diferença de satisfação entre app e presencial é pequena [@silva-2020-apps-brasil][@costa-2018-satisfacao].',
  },
}

/** No fim de uma linha estreita, o anel desce junto com a palavra. */
export const NaQuebraDeLinha: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 220 }}>{Story()}</div>],
  args: {
    markdown:
      'Quase um em cada cinco casais brasileiros se conheceu por aplicativo [@costa-2018-satisfacao].',
  },
}
