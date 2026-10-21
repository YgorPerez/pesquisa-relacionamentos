// The Priorities screen (`/prioridades`) in jsdom (ADR 0035), over the
// fixture content (`e2e/library/data/priorities`). In satisfaction: "pesa"
// has sexual chemistry; "quase nada", being alike; "não sabemos", income,
// education, religion and age. The picker stuck on scroll, the colors, the
// chip size and the keyboard stay in the e2e (`e2e/priorities.e2e.ts`).
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'

const PAGE = '/prioridades'

const chips = () => within(screen.getByRole('region', { name: 'Seu topo 3' }))
const chip = (name: string) =>
  chips().getByRole('button', { name: new RegExp(`${name}$`) })
const shelf = (name: string) =>
  within(screen.getByRole('region', { name: name }))
/** A chosen one's name: "sua 1ª: Renda". In jsdom, the trailing space of the
 * `sr-only` drops from the name. */
const chosen = (n: number, name: string) => new RegExp(`^sua ${n}ª: ?${name}$`)
const saved = () =>
  JSON.parse(localStorage.getItem('tem-estudo:priorities') ?? 'null')

async function open() {
  const user = userEvent.setup()
  const screenHandle = openScreen(PAGE)
  await screen.findByRole('region', { name: 'Seu topo 3' })
  return { user, ...screenHandle }
}

it('tapping gives the next number, tapping again removes it and renumbers', async () => {
  const { user } = await open()
  expect(screen.getByText(/^Nenhuma escolhida ainda\./)).toBeVisible()

  await user.click(chip('Renda'))
  await user.click(chip('Aparência'))
  expect(chip('Renda')).toHaveAccessibleName(chosen(1, 'Renda'))
  expect(chip('Aparência')).toHaveAccessibleName(chosen(2, 'Aparência'))
  expect(chip('Aparência')).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('Falta 1.')).toBeVisible()

  await user.click(chip('Renda'))
  expect(chip('Aparência')).toHaveAccessibleName(chosen(1, 'Aparência'))
  expect(chip('Renda')).toHaveAttribute('aria-pressed', 'false')
  expect(saved()).toEqual({ top3: ['aparencia'], outcome: 'satisfacao' })
})

it('with three, the other chips become unavailable, with the swap hint', async () => {
  const { user } = await open()
  for (const name of ['Gentileza', 'Ser parecido comigo', 'Idade parecida'])
    await user.click(chip(name))
  const hint = 'Pronto. Para trocar, toque numa das escolhidas e ela sai.'
  expect(screen.getByText(hint)).toBeVisible()
  const income = chip('Renda')
  expect(income).toHaveAttribute('aria-disabled', 'true')
  expect(income).toHaveAccessibleDescription(hint)
  await user.click(income)
  expect(saved()).toMatchObject({ top3: ['gentileza', 'parecido', 'idade'] })
})

it('the chosen ones land numbered on their shelf, and the alert says it in a sentence', async () => {
  const { user } = await open()
  for (const name of ['Renda', 'Química sexual', 'Ser parecido comigo'])
    await user.click(chip(name))

  expect(
    shelf('pesa').getByRole('button', {
      name: chosen(2, 'Química sexual'),
    }),
  ).toBeVisible()
  expect(
    shelf('quase nada').getByRole('button', {
      name: chosen(3, 'Ser parecido comigo'),
    }),
  ).toBeVisible()
  // The chosen one comes first on the shelf.
  const weDoNotKnow = shelf('não sabemos').getAllByRole('button')
  expect(weDoNotKnow[0]).toHaveAccessibleName(chosen(1, 'Renda'))
  expect(weDoNotKnow.slice(1).map((b) => b.textContent)).toEqual([
    'Mesma escolaridade',
    'Mesma religião',
    'Idade parecida',
  ])
  expect(document.querySelector('[data-slot="alerta"]')).toHaveTextContent(
    'No seu topo 3, para satisfação: ser parecido comigo pesa quase nada; para renda não há boa evidência.',
  )
})

it("Joel's bar says the partner adds almost nothing, with the measured range", async () => {
  await open()
  expect(
    screen.getByRole('img', {
      name: 'Satisfação: 45% explicado pela relação, quase nada a mais pelo parceiro (0% a 1,9%), 55% sem explicação',
    }),
  ).toBeVisible()
  expect(
    screen.getByText(
      /^tudo o que se sabe do parceiro soma de 0% a 1,9% \(de 0,9% a 3,5% no fim dos estudos\)/,
    ),
  ).toBeVisible()
})

it("the outcome changes the shelves, and Joel's bar only shows in satisfaction", async () => {
  const { user } = await open()
  await user.click(chip('Aparência'))
  const before = 'Antes: o parceiro explica pouco da satisfação'
  expect(screen.getByText(before)).toBeVisible()

  await user.click(screen.getByRole('radio', { name: 'Atração' }))
  expect(screen.queryByText(before)).not.toBeInTheDocument()
  expect(
    shelf('pesa').getByRole('button', {
      name: chosen(1, 'Aparência'),
    }),
  ).toBeVisible()

  await user.click(screen.getByRole('radio', { name: 'Duração' }))
  expect(
    shelf('não sabemos').getByRole('button', {
      name: chosen(1, 'Aparência'),
    }),
  ).toBeVisible()
  expect(saved()).toEqual({ top3: ['aparencia'], outcome: 'duracao' })
})

it("tapping a trait opens the detail, with the bias for the Profile's gender", async () => {
  localStorage.setItem(
    'tem-estudo:profile',
    JSON.stringify({ gender: 'mulher' }),
  )
  const { user } = await open()

  const looks = shelf('pesa pouco').getByRole('button', {
    name: 'Aparência',
  })
  await user.click(looks)
  expect(looks).toHaveAttribute('aria-expanded', 'true')
  const detail = screen.getByRole('region', {
    name: 'Aparência, satisfação',
  })
  expect(detail).toHaveTextContent('Medida: r = 0,10, só maridos')
  expect(
    within(detail).getByRole('link', { name: 'Costa (2018)' }),
  ).toHaveAttribute('href', '/estudos/costa-2018-satisfacao')

  // Income has a bias by gender only: with "mulher" in the Profile, the
  // women's one applies.
  await user.click(shelf('não sabemos').getByRole('button', { name: 'Renda' }))
  expect(
    screen.queryByRole('region', { name: 'Aparência, satisfação' }),
  ).not.toBeInTheDocument()
  const income = screen.getByRole('region', { name: 'Renda, satisfação' })
  expect(income).toHaveTextContent('Mulheres tendem a dar mais peso à renda')
  expect(income).not.toHaveTextContent('Homens tendem')
})

it('the top 3 and the outcome come back when opening again', async () => {
  const { user, unmount } = await open()
  await user.click(chip('Gentileza'))
  await user.click(screen.getByRole('radio', { name: 'Atração' }))
  unmount()

  await open()
  expect(chip('Gentileza')).toHaveAccessibleName(chosen(1, 'Gentileza'))
  expect(screen.getByRole('radio', { name: 'Atração' })).toBeChecked()
})
