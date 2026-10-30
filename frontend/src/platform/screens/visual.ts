// What the Visual screen tests open: the fixture Guide, which has one Visual
// of each kind, and the Visual by its title.
import { screen, type ByRoleOptions } from '@testing-library/react'
import { openScreen } from './open-screen'

/** Opens the fixture Guide, with the link's `search` (`?pais=eua`) if any,
 * and waits for the Visual named `name`: a `figure`, or the `table` of the
 * Studies. */
export function openVisual(
  name: string,
  role: 'figure' | 'table' = 'figure',
  search = '',
) {
  openScreen(`/onde-conhecer-pessoas${search}`)
  return screen.findByRole(role, { name } satisfies ByRoleOptions)
}
