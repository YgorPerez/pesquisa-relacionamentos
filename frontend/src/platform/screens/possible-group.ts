// What the Possible group screen tests read: the number pinned at the top and
// each Requirement's row, found by its role and its title.
import {
  REQUIREMENT_TITLE,
  type VisitorRequirement,
} from '@tem-estudo/rules/requirements'
import { screen, waitFor, within } from '@testing-library/react'
import { expect } from 'vite-plus/test'

/** The range of the number pinned at the top ("entre … e …"). */
export const range = () =>
  document.querySelector('[data-slot="gp-preso"] [data-slot="gp-faixa"]')
    ?.textContent ?? null

/** A Requirement's row: the group with its title ("Onde", "Idade"). */
export function requirement(id: VisitorRequirement | 'orientation') {
  const row = screen.getByRole('group', { name: REQUIREMENT_TITLE[id] })
  return Object.assign(within(row), {
    /** What the row says about the Requirement ("23 a 34 anos"). */
    value: () => row.querySelector('[data-slot="gp-req-valor"]')?.textContent,
    /** How much it shrinks the group ("soltar só este: ×2,1 (+…)"). */
    cost: () => row.querySelector('[data-slot="gp-req-custo"]')?.textContent,
  })
}

/** Waits for the count of the requested Requirements to come out, different
 * from `before`, and returns the new range. */
export async function newCount(before: string | null) {
  await waitFor(() => {
    expect(range()).not.toBe(before)
    expect(document.querySelector('[data-slot="gp-preso"]')).toHaveAttribute(
      'aria-busy',
      'false',
    )
  })
  return range()
}
