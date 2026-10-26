// The Possible group's "Compartilhar" (`group-share.tsx`) over a real count:
// the `loader` downloads Brazil's pack that Storybook's plugin serves
// (fixture data, Acre only), as in `possible-group.stories.tsx`. What the
// consent changes in the copied link belongs to the screen test
// (`share-consent.test.tsx`), and the image's text to `share-image.test.tsx`.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { openPack } from '@tem-estudo/rules/possible-group-data'
import { estimateGroup, type Estimate } from '@tem-estudo/rules/possible-group'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  DEFAULT_REQUIREMENTS,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import possibleGroup from 'virtual:possible-group'
import { GroupShare } from './group-share'

const PROFILE: Profile = { gender: 'mulher', seeks: 'homens', age: 28 }

const requirements = (change: Partial<Requirements>): Requirements => ({
  ...DEFAULT_REQUIREMENTS,
  education: 'superior',
  ...change,
})

async function count(): Promise<{ estimate: Estimate }> {
  const response = await fetch(`${possibleGroup.base}/BR.json`)
  const brazil = openPack(await response.json())
  return {
    estimate: estimateGroup(
      { profile: PROFILE, requirements: requirements({ bisexual: true }) },
      { brazil },
    ),
  }
}

type Loaded = Awaited<ReturnType<typeof count>>

const meta = {
  parameters: { layout: 'padded' },
  loaders: [count],
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** No sensitive Requirement on: the link, its sentence and the image. */
export const Plain: Story = {
  render: (_args, { loaded }) => (
    <GroupShare
      profile={PROFILE}
      saved={requirements({ nonSmoker: true })}
      estimate={(loaded as Loaded).estimate}
      municipality={undefined}
    />
  ),
}

/** A sensitive Requirement on and no consent yet: the box asks, and the
 * link and the image leave it out. */
export const SensitiveLeftOut: Story = {
  render: (_args, { loaded }) => (
    <GroupShare
      profile={PROFILE}
      saved={requirements({ bisexual: true })}
      estimate={(loaded as Loaded).estimate}
      municipality={undefined}
    />
  ),
}
