// As seções que só o Guia tem (`secoes-do-guia.tsx`), sobre a vista de um
// Guia da fixture (`e2e/acervo`), montada como a página a monta
// (`guia.exemplo.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GUIA as guia } from './guia.exemplo'
import { DicasDoGuia, Evidencia, Mitos, SetaDasFontes } from './secoes-do-guia'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const SetaParaAsFichas: Story = {
  render: () => <SetaDasFontes />,
}

export const Dicas: Story = {
  render: () => <DicasDoGuia dicas={guia.dicas} vereditos={undefined} />,
}

/** Os achados com país e ano, e a tabela da divergência. */
export const OQueAEvidenciaDiz: Story = {
  render: () => <Evidencia guia={guia} vereditos={undefined} />,
}

export const MitosRiscados: Story = {
  render: () => <Mitos mitos={guia.mitos} />,
}
