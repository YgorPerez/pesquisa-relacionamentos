// The Possible group without network, in a file of its own: the packs that
// arrived stay kept in the module (`state/group-packs.ts`) until the end of
// the file, and in a file with other tests the request this one drops would
// have arrived earlier.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import {
  newCount,
  openPossibleGroup,
  range,
} from '#/platform/screens/possible-group'
import { enterProfile } from '#/platform/screens/profile'
import { goOffline } from '#/platform/screens/network'

it('without network, it says the data did not arrive, and retrying does the count', async () => {
  const user = userEvent.setup()
  const network = goOffline()
  openPossibleGroup()
  await enterProfile(
    user,
    { gender: 'mulher', seeks: 'homens', age: '40' },
    'Usar na conta',
  )
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Não deu para baixar os dados da conta.')
  const before = range()

  network.restore()
  await user.click(
    within(alert).getByRole('button', { name: 'Tentar de novo' }),
  )
  await newCount(before)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
