// As peças da página (`folha.tsx`) e das seções (`secao.tsx`): a folha, a
// coluna, o título grande, o lead, a seção com o título, o painel e o aviso.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Coluna, Display, Folha, Lead } from './folha'
import { Aviso, Headline, Painel, Secao } from './secao'

const meta = {
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const UmaPagina: Story = {
  render: () => (
    <Folha>
      <Coluna>
        <Display>
          Quantas pessoas atendem ao que você{' '}
          <span className="marca-texto">procura</span>?
        </Display>
        <Lead>Diga quem você procura e veja quantas pessoas sobram.</Lead>
        <Aviso role="note">
          Nenhum destes estudos é brasileiro. A evidência vem dos EUA e da
          Europa.
        </Aviso>
        <Secao aria-labelledby="t-exemplo">
          <Headline id="t-exemplo">Do Guia</Headline>
          <Painel>
            <p className="m-0">Que características preveem uma boa relação?</p>
          </Painel>
        </Secao>
      </Coluna>
    </Folha>
  ),
}
