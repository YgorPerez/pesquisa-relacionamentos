// The site search (`site-search.tsx`), over the fixture
// (`site-search.example.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MANY, NOTHING, WORDS } from './site-search.example'
import {
  SearchForm,
  SearchResultsList,
  SearchResultsSkeleton,
} from './site-search'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** The field, as the magnifier opens it. */
export const Field: Story = {
  render: () => <SearchForm query="" />,
}

/** A word in every kind of page: Guides first, each page with all its
 * hits. */
export const Results: Story = {
  render: () => (
    <>
      <SearchForm query={MANY.query} />
      <SearchResultsList results={MANY} />
    </>
  ),
}

/** The exact phrase occurs nowhere: the hits with every word. */
export const EveryWord: Story = {
  render: () => <SearchResultsList results={WORDS} />,
}

export const NothingFound: Story = {
  render: () => <SearchResultsList results={NOTHING} />,
}

/** While a search runs: the results' shape in grey. */
export const Searching: Story = {
  render: () => (
    <>
      <SearchForm query="complemento" />
      <SearchResultsSkeleton />
    </>
  ),
}
