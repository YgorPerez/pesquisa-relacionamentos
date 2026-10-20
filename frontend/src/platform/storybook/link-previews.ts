// The calculators' link previews for the story (`link-previews.stories.tsx`),
// in the role of the Festival dos Macacos' `cartoes-do-link.ts` (ADR 0037).
// Storybook has no server: the story does, in the browser, the same count the
// site's server does for the social network's bot, over the fixture content
// Storybook loads (`.storybook/vite.config.ts`). The Possible group goes
// through `buildGroupPreview` (`content/group-preview.ts`), the one behind
// `fetchGroupPreview`, with the packs the plugin serves; Priorities, through
// `prioritiesPreview` over the library's view, like the route's loader.
import { openPack } from '@tem-estudo/rules/possible-group-data'
import {
  readLink,
  prioritiesPreview,
  linkQuery,
  type LinkState,
  type Preview,
} from '@tem-estudo/rules/link'
import { DEFAULT_REQUIREMENTS } from '@tem-estudo/rules/requirements'
import library from 'virtual:library'
import possibleGroup from 'virtual:possible-group'
import { buildGroupPreview } from '#/content/group-preview'
import { buildPrioritiesView } from '#/content/priorities-view'

/** The example links, one per story. */
const EXAMPLES = {
  groupWithNothing: {
    calculator: 'grupo-possivel',
    profile: null,
    requirements: null,
  },
  groupWithProfile: {
    calculator: 'grupo-possivel',
    profile: { gender: 'homem', seeks: 'mulheres', age: 30 },
    requirements: null,
  },
  groupInRioBranco: {
    calculator: 'grupo-possivel',
    profile: { gender: 'mulher', seeks: 'homens', age: 28 },
    requirements: {
      ...DEFAULT_REQUIREMENTS,
      place: { state: 'AC', municipality: '1200401' },
      nonSmoker: true,
    },
  },
  prioritiesWithTop3: {
    calculator: 'prioridades',
    gender: null,
    priorities: {
      top3: ['sexo', 'parecido', 'renda'],
      outcome: 'satisfacao',
    },
  },
} satisfies Record<string, LinkState>

export type ExampleName = keyof typeof EXAMPLES

/** What the bot reads from the link: the address and the Open Graph
 * preview. */
export interface LinkPreview {
  /** The path with the link query: `/grupo-possivel?v=1&…`. */
  readonly address: string
  readonly preview: Preview | null
}

const PATH = {
  'grupo-possivel': '/grupo-possivel',
  prioridades: '/prioridades',
} as const

async function pack(place: string) {
  const response = await fetch(`${possibleGroup.base}/${place}.json`)
  return response.ok ? openPack(await response.json()) : null
}

export async function linkPreview(name: ExampleName): Promise<LinkPreview> {
  const state: LinkState = EXAMPLES[name]
  const query = linkQuery(state)
  const address = `${PATH[state.calculator]}?${query}`
  if (state.calculator === 'grupo-possivel')
    return {
      address,
      preview: await buildGroupPreview(query, possibleGroup, pack),
    }
  const view = buildPrioritiesView(library)
  const read =
    view &&
    readLink(
      'prioridades',
      query,
      view.traits.map((c) => c.id),
    )
  return {
    address,
    preview:
      view && read?.calculator === 'prioridades'
        ? prioritiesPreview(view.traits, read.priorities)
        : null,
  }
}
