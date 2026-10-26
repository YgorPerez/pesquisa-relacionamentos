// The Possible group without network, in a file of its own: the packs that
// arrived stay kept in the module (`state/group-packs.ts`) until the end of
// the file, and in a file with other tests the request this one drops would
// have arrived earlier. The first test leaves the default packs downloaded
// and no detail pack, which is where the second one starts.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { newCount, range, requirement } from '#/platform/screens/possible-group'
import { enterProfile } from '#/platform/screens/profile'
import { goOffline } from '#/platform/screens/network'

it('without network, it says the data did not arrive, and retrying does the count', async () => {
  const user = userEvent.setup()
  const network = goOffline()
  openScreen('/grupo-possivel')
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

it('when the detail data (parents, work, home) does not arrive, it says so like the base data, and retrying does the count', async () => {
  const user = userEvent.setup()
  openScreen('/grupo-possivel')
  await enterProfile(
    user,
    { gender: 'mulher', seeks: 'homens', age: '40' },
    'Usar na conta',
  )
  const before = await newCount(null)

  const network = goOffline({ detailOnly: true })
  await user.click(
    requirement('parents').getByRole('checkbox', {
      name: 'Só quem não mora com os pais',
    }),
  )
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Não deu para baixar os dados da conta.')
  expect(range()).toBe(before)

  network.restore()
  await user.click(
    within(alert).getByRole('button', { name: 'Tentar de novo' }),
  )
  await newCount(before)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
