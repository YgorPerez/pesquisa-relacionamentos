// The share image (`share-image.tsx`): the two buttons and, drawn below, the
// images themselves, square and 9:16, for whoever reviews how they look.
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { GroupImage } from '@tem-estudo/rules/link'
import { useEffect, useRef } from 'react'
import { ShareImage } from './share-image'
import {
  drawGroupImage,
  loadImageFonts,
  type ImageFormat,
} from './share-image.draw'

const IMAGE: GroupImage = {
  before: 'Entre',
  numbers: '120 mil e 180 mil',
  unstable: false,
  who: 'mulheres de 25 a 35 em São Paulo (SP)',
  also: ['ensino superior', 'não fuma', 'trabalha em escritório'],
  sources: 'Censo 2022, PNS 2019 e PNAD Contínua 2022',
}

const meta = {
  component: ShareImage,
  parameters: { layout: 'padded' },
  args: { image: IMAGE },
} satisfies Meta<typeof ShareImage>

export default meta

type Story = StoryObj<typeof meta>

/** The buttons, as in "Compartilhar". */
export const Buttons: Story = {}

function Drawn({ image, format }: { image: GroupImage; format: ImageFormat }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    void loadImageFonts().then(() => {
      if (canvas.current) drawGroupImage(canvas.current, image, format)
    })
  }, [image, format])
  return (
    <canvas
      ref={canvas}
      aria-label={`Imagem ${format}`}
      className="h-auto w-80 border-2 border-tinta"
    />
  )
}

/** The images as they go out. */
export const Images: Story = {
  render: ({ image }) => (
    <div className="flex flex-wrap items-start gap-md">
      <Drawn image={image} format="square" />
      <Drawn image={image} format="story" />
    </div>
  ),
}

/** Many Requirements and a small, unstable group: the answer shrinks to
 * fit. */
export const Crowded: Story = {
  ...Images,
  args: {
    image: {
      before: 'Cerca de',
      numbers: '1,2 mil',
      unstable: true,
      who: 'homens e mulheres de 40 anos ou mais em Santana do Livramento (RS)',
      also: [
        'não mora com companheiro(a)',
        'ensino superior',
        'renda de 5 salários mínimos ou mais',
        'preta, parda ou indígena',
        'umbanda ou candomblé, ou sem religião',
        'sem filhos',
        'de 170 a 190 cm',
        'não fuma',
      ],
      sources: 'Censo 2022 e PNS 2019',
    },
  },
}
