// The site search's pieces in jsdom (ADR 0035), over the fixture content,
// which the tests load through `virtual:library`. What a query finds and the
// link each hit carries are in `content/site-search-view.test.ts`; the
// header's magnifier, the page with and without JavaScript, landing on the
// sentence, the anchors on each page and the count of a search with no
// result, in the e2e (`e2e/site-search.e2e.ts`).
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import library from 'virtual:library'
import { expect, it, vi } from 'vite-plus/test'
import { searchSite } from '#/content/site-search-view'
import {
  SearchForm,
  SearchResultsList,
  SearchResultsSkeleton,
} from './site-search'
import {
  FIELD,
  KIND_TAG,
  SEARCHING,
  WORDS_ONLY,
  found,
  nothingFound,
} from './site-search.copy'

const pages = () =>
  screen
    .getAllByRole('listitem')
    .filter((item) => item.dataset['slot'] === 'pagina-encontrada')

it('lists each page with its kind, Guides first, and each hit leads to its sentence with the match marked', () => {
  render(<SearchResultsList results={searchSite(library, 'complemento')} />)
  expect(screen.getByRole('heading', { name: found(3, 3) })).toBeInTheDocument()
  expect(
    pages().map((page) => within(page).getByRole('heading').textContent),
  ).toEqual([
    `${KIND_TAG.guide}Escolher parceiro`,
    `${KIND_TAG.guide}Onde conhecer pessoas`,
    `${KIND_TAG.tip}Use o app como complemento, não como o único caminho.`,
  ])
  const [, guide] = pages()
  const hit = within(guide!).getByRole('link', { name: /complemento/ })
  expect(hit).toHaveAttribute(
    'href',
    expect.stringMatching(
      /^\/onde-conhecer-pessoas#o-lugar-quase-nao-muda-a-relacao:~:text=/,
    ),
  )
  expect(hit).toHaveTextContent('O lugar quase não muda a relação')
  expect(within(hit).getByText('complemento').tagName).toBe('MARK')
})

it('without the exact phrase, says the hits have every word', () => {
  render(
    <SearchResultsList
      results={searchSite(library, 'pessoalmente satisfação')}
    />,
  )
  expect(screen.getByText(WORDS_ONLY)).toBeInTheDocument()
})

it('says when nothing was found', () => {
  render(<SearchResultsList results={searchSite(library, 'poliamor')} />)
  expect(
    screen.getByRole('heading', { name: nothingFound('poliamor') }),
  ).toBeInTheDocument()
})

it('the empty field has the cursor, and Enter searches what was typed', async () => {
  const user = userEvent.setup()
  const onSearch = vi.fn<(query: string) => void>()
  render(<SearchForm query="" autoFocus onSearch={onSearch} />)
  const field = screen.getByRole('searchbox', { name: FIELD })
  expect(field).toHaveFocus()
  await user.type(field, 'Pessoalmente{Enter}')
  expect(onSearch).toHaveBeenCalledWith('Pessoalmente')
})

it('the field the page holds shows its text and hands over each key', async () => {
  const user = userEvent.setup()
  const onType = vi.fn<(text: string) => void>()
  render(<SearchForm query="amo" onType={onType} />)
  const field = screen.getByRole('searchbox', { name: FIELD })
  expect(field).toHaveValue('amo')
  await user.type(field, 'r')
  expect(onType).toHaveBeenLastCalledWith('amor')
})

it('while a search runs, tells the screen reader and hides the grey lines from it', () => {
  render(<SearchResultsSkeleton />)
  expect(screen.getByRole('status')).toHaveTextContent(SEARCHING)
  expect(screen.getByRole('region', { busy: true })).toBeInTheDocument()
})
