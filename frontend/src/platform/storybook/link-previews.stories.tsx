// The calculators' link previews, as a messaging app shows them: the site's
// fixed image (`public/og.png`), the Open Graph title and description, and the
// address. Each preview comes from the same count as the site's server
// (`link-previews.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ORIGIN } from '@tem-estudo/content/search'
import { expect, within } from 'storybook/test'
import {
  linkPreview,
  type ExampleName,
  type LinkPreview,
} from './link-previews'

function Card({ address, preview }: LinkPreview) {
  if (!preview) throw new Error(`no preview for ${address}`)
  return (
    <figure className="m-0 max-w-88 overflow-hidden rounded-mao-2 border-2 border-tinta bg-folha">
      <img
        src="/og.png"
        alt=""
        width={1200}
        height={630}
        className="block h-auto w-full"
      />
      <figcaption className="p-3">
        <b className="block font-title text-linha leading-tight">
          {preview.title}
        </b>
        <span className="mt-1 block text-nota leading-nota text-tinta-2">
          {preview.description}
        </span>
        <small className="mt-1.5 block text-label break-all text-tinta-2">
          {new URL(ORIGIN).host}
          {address}
        </small>
      </figcaption>
    </figure>
  )
}

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** An example's story: the `loader` does the count, and the card shows it. */
const fromExample = (name: ExampleName, text?: RegExp): Story => ({
  loaders: [() => linkPreview(name)],
  render: (_args, { loaded }) => <Card {...(loaded as LinkPreview)} />,
  ...(text && {
    play: async ({ canvasElement }) => {
      await expect(within(canvasElement).getByText(text)).toBeVisible()
    },
  }),
})

/** No Profile nor Requirements: Brazil's example count. */
export const PossibleGroupWithNothing = fromExample(
  'groupWithNothing',
  /^entre .+ e /i,
)

export const PossibleGroupWithProfile = fromExample('groupWithProfile')

export const PossibleGroupInRioBranco = fromExample(
  'groupInRioBranco',
  /Rio Branco/,
)

export const PrioritiesWithTop3 = fromExample(
  'prioritiesWithTop3',
  /^Topo 3: química sexual/,
)
