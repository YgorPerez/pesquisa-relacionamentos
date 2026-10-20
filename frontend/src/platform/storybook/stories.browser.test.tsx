// Each story opens in a real Chrome (`vitest.stories.config.ts`), on mobile
// and on desktop, and breaks if it throws, if its `play` fails or if it
// writes an error or warning to the console. Runs with `pnpm test:stories`,
// outside `pnpm test`: the browser is heavy.
import { composeStories } from '@storybook/react-vite'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vite-plus/test'

const MODULES = import.meta.glob<Parameters<typeof composeStories>[0]>(
  '../../**/*.stories.tsx',
  { eager: true },
)

/** A console call as text, with each error's message. */
const asText = (call: unknown[]) =>
  call
    .map((value) =>
      value instanceof Error
        ? `${value.name}: ${value.message}`
        : String(value),
    )
    .join(' ')

let errors: MockInstance<typeof console.error>
let warnings: MockInstance<typeof console.warn>
beforeEach(() => {
  errors = vi.spyOn(console, 'error')
  warnings = vi.spyOn(console, 'warn')
})
afterEach(() => vi.restoreAllMocks())

it('finds the stories', () => {
  expect(Object.keys(MODULES).length).toBeGreaterThan(0)
})

const FILES = Object.entries(MODULES)
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([file, mod]) => [file.replace(/^(\.\.\/)+/, ''), mod] as const)

describe.each(FILES)('%s', (_file, mod) => {
  const stories = Object.entries(composeStories(mod)) as Array<
    [string, { run: () => Promise<void> }]
  >
  it.each(stories)('%s', async (_name, story) => {
    await story.run()
    expect([...errors.mock.calls, ...warnings.mock.calls].map(asText)).toEqual(
      [],
    )
  })
})
