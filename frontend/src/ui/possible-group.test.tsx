// The Possible group screen (`/grupo-possivel`) in jsdom (ADR 0035), over the
// fixture data: the fixture's "Brazil" is only Acre (`e2e/library/dados`).
// The number pinned at the top on scroll, touch, keyboard and control sizes
// stay in the e2e (`e2e/possible-group.e2e.ts`), which has layout.
import type {
  SensitiveRequirement,
  VisitorRequirement,
} from '@tem-estudo/rules/requirements'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { newCount, range, requirement } from '#/platform/screens/possible-group'
import { enterProfile } from '#/platform/screens/profile'

const PAGE = '/grupo-possivel'
const BUTTON = 'Usar na conta'

it('with nothing said, it already shows the example number and the Profile comes first', async () => {
  openScreen(PAGE)
  expect(await screen.findByRole('form', { name: 'Seu Perfil' })).toBeVisible()
  expect(range()).toMatch(/^entre .+ e .+/)
  // The sections, after the pinned number (which is also an `h2`).
  const sections = [
    ...document.querySelectorAll('main h2[data-slot="headline"]'),
  ].map((h) => h.textContent)
  expect(sections.slice(0, 3)).toEqual([
    'Seu Perfil',
    'Seus Requisitos',
    'A conta',
  ])
})

it('the Profile fills the sought age (±5) and orientation enters the count', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await screen.findByRole('form', { name: 'Seu Perfil' })
  const before = range()
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'mulheres', age: '30' },
    BUTTON,
  )
  await newCount(before)
  expect(requirement('age').getByLabelText('Idade de')).toHaveValue('25')
  expect(requirement('age').getByLabelText('até')).toHaveValue('35')
  expect(
    screen.getByText(/a conta só conta quem se interessa por homens/),
  ).toBeVisible()
})

it('each active Requirement changes the number, and releasing it goes back to "qualquer"', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'mulher', seeks: 'homens', age: '28' },
    BUTTON,
  )
  let current = await newCount(null)

  await user.click(
    requirement('education').getByRole('radio', {
      name: 'superior completo',
    }),
  )
  current = await newCount(current)
  expect(requirement('education').cost()).toMatch(
    /^soltar só este: ×[\d,]+ \(\+.+\)$/,
  )

  await user.click(
    requirement('age').getByRole('button', { name: 'até: mais 1' }),
  )
  current = await newCount(current)
  expect(requirement('age').value()).toBe('23 a 34 anos')

  await user.click(screen.getByRole('button', { name: 'Soltar escolaridade' }))
  await newCount(current)
  expect(
    requirement('education').getByRole('radio', { name: 'qualquer' }),
  ).toBeChecked()
})

it('"O que mais pesa" warns that the effects of releasing each Requirement do not add up', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'mulher', seeks: 'homens', age: '28' },
    BUTTON,
  )
  const current = await newCount(null)
  await user.click(
    requirement('education').getByRole('radio', {
      name: 'superior completo',
    }),
  )
  await newCount(current)
  const count = screen.getByRole('region', { name: 'A conta' })
  expect(
    within(count).getByText(
      'Cada linha solta só aquele Requisito e deixa os outros ligados. Os efeitos não se somam, então soltar dois não dá a soma das duas linhas.',
    ),
  ).toBeVisible()
})

it('"De onde vem a incerteza" gives the independence range apart from the sampling one', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  const independence = () =>
    document.querySelector('[data-slot="gp-independencia"]')?.textContent ??
    null
  // Without a gender, nothing comes from the PNS: one range only.
  await user.click(
    await screen.findByRole('button', { name: 'De onde vem a incerteza' }),
  )
  expect(independence()).toBeNull()

  await enterProfile(
    user,
    { gender: 'mulher', seeks: 'homens', age: '28' },
    BUTTON,
  )
  const current = await newCount(null)
  await user.click(
    requirement('education').getByRole('radio', {
      name: 'superior completo',
    }),
  )
  await newCount(current)
  expect(independence()).toMatch(
    /^Orientação vem da PNS; morar com companheiro\(a\) e escolaridade vêm do Censo\. As duas pesquisas não entrevistaram as mesmas pessoas, então a conta supõe que, no mesmo sexo e idade, um lado não depende do outro\. Se depender, o grupo pode ficar em qualquer ponto entre .+ e .+: o menor e o maior número que os dados permitem\.$/,
  )
  expect(
    screen.getByText('Nenhuma das duas faixas é um intervalo de confiança.'),
  ).toBeVisible()

  // The office share comes from a third survey, under the same assumption.
  await user.click(
    requirement('office').getByRole('checkbox', {
      name: 'Só quem trabalha em escritório',
    }),
  )
  await waitFor(() =>
    expect(independence()).toMatch(
      /^Orientação vem da PNS; ocupação vem da PNAD; morar com companheiro\(a\) e escolaridade vêm do Censo\. As três pesquisas não entrevistaram as mesmas pessoas/,
    ),
  )
  // The top range also carries the PNAD's interval.
  expect(
    screen.getByText(
      /^A faixa junta o erro de amostra do Censo \(.+ registros\) com os intervalos da PNS e da PNAD\.$/,
    ),
  ).toBeVisible()
})

it('"sem filhos" is disabled when seeking men, with the reason', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'homens', age: '30' },
    BUTTON,
  )
  await newCount(null)
  const checkbox = requirement('children').getByRole('checkbox', {
    name: 'Só quem não tem filhos',
  })
  // Base UI's `Checkbox` is a `role="checkbox"`, disabled through ARIA.
  expect(checkbox).toHaveAttribute('aria-disabled', 'true')
  expect(checkbox).toHaveAccessibleDescription(
    'O Censo só pergunta filhos às mulheres. Procurando homens, não dá para filtrar.',
  )
})

it('state and municipality are saved on the device and come back on reopening', async () => {
  const user = userEvent.setup()
  const { unmount } = openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'mulheres', age: '30' },
    BUTTON,
  )
  await user.click(
    requirement('place').getByRole('combobox', { name: 'Estado' }),
  )
  await user.click(await screen.findByRole('option', { name: 'Acre' }))
  const municipality = requirement('place').getByRole('combobox', {
    name: 'Município',
  })
  await waitFor(() => expect(municipality).toBeEnabled())
  await user.click(municipality)
  await user.click(await screen.findByRole('option', { name: 'Rio Branco' }))
  expect(requirement('place').value()).toBe('Rio Branco (AC)')
  expect(
    JSON.parse(localStorage.getItem('tem-estudo:requirements') ?? 'null'),
  ).toMatchObject({ place: { state: 'AC', municipality: '1200401' } })

  unmount()
  openScreen(PAGE)
  expect(
    await screen.findByRole('combobox', { name: 'Município' }),
  ).toHaveTextContent('Rio Branco')
})

it('the state is chosen by keyboard and goes back to the whole of Brazil', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'mulheres', age: '30' },
    BUTTON,
  )
  // Once the Profile is saved, focus goes to its summary in the next box: the
  // keyboard only starts after that, or the summary takes the focus from the
  // state midway.
  const summary = await within(
    screen.getByRole('region', { name: 'Seu Perfil' }),
  ).findByText(/Seu Perfil:/)
  await waitFor(() => expect(summary).toHaveFocus())
  const state = requirement('place').getByRole('combobox', { name: 'Estado' })
  expect(state).toHaveTextContent('Brasil inteiro')
  state.focus()
  await user.keyboard('{Enter}')
  expect(await screen.findByRole('listbox')).toBeVisible()
  // The list opens and only then focuses the checked option: the arrow moves
  // from there.
  await waitFor(() =>
    expect(
      screen.getByRole('option', { name: 'Brasil inteiro' }),
    ).toHaveFocus(),
  )
  await user.keyboard('{ArrowDown}{Enter}')
  await waitFor(() => expect(state).toHaveTextContent('Acre'))
  expect(requirement('place').value()).toBe('Acre')
  await user.click(state)
  await user.click(
    await screen.findByRole('option', { name: 'Brasil inteiro' }),
  )
  expect(state).toHaveTextContent('Brasil inteiro')
  expect(
    requirement('place').queryByRole('combobox', { name: 'Município' }),
  ).toBeNull()
})

it('"tem casa própria" downloads the detail data when turned on, and the count shrinks', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'mulheres', age: '30' },
    BUTTON,
  )
  const before = await newCount(null)
  await user.click(
    requirement('home').getByRole('checkbox', {
      name: 'Só quem tem casa própria',
    }),
  )
  await newCount(before)
  expect(requirement('home').value()).toBe('tem casa própria')
  expect(requirement('home').cost()).toMatch(/^soltar só este: ×[\d,]+/)
})

it('Requirements saved with "trabalha" on open straight on its count', async () => {
  // What a shared link also leaves on the device (`state/link.ts`).
  localStorage.setItem(
    'tem-estudo:profile',
    JSON.stringify({ seeks: 'mulheres', age: 30 }),
  )
  localStorage.setItem(
    'tem-estudo:requirements',
    JSON.stringify({ work: 'trabalha', noLiveInPartner: true }),
  )
  openScreen(PAGE)
  // The cost shows only once the count with "trabalha" came out.
  await waitFor(() =>
    expect(requirement('work').cost()).toMatch(/^soltar só este: ×[\d,]+/),
  )
  expect(
    requirement('work').getByRole('radio', { name: 'trabalha' }),
  ).toBeChecked()
})
it.each<
  [
    id: Extract<VisitorRequirement, SensitiveRequirement>,
    checkbox: string,
    value: string,
    note: RegExp,
  ]
>([
  // The weight and height are self-reported.
  [
    'obesity',
    'Só quem tem IMC abaixo de 30',
    'IMC abaixo de 30',
    /peso e a altura que a pessoa declarou/,
  ],
  // The PHQ-9 covers the last 2 weeks, not a trait.
  [
    'depression',
    'Só quem não teve sintomas de depressão',
    'sem sintomas de depressão',
    /2 últimas semanas: mede um período da vida/,
  ],
  [
    'bisexual',
    'Só quem se declara bissexual',
    'bissexual',
    /estatística experimental do IBGE/,
  ],
  [
    'worship',
    'Só quem vai à religião toda semana',
    'vai à religião toda semana',
    /não pergunta qual religião/,
  ],
])(
  'the sensitive "%s" enters the count and its row says what it measures and that it stays on the device',
  async (id, checkbox, value, note) => {
    const user = userEvent.setup()
    openScreen(PAGE)
    await enterProfile(
      user,
      { gender: 'mulher', seeks: 'homens', age: '28' },
      BUTTON,
    )
    const before = await newCount(null)
    await user.click(requirement(id).getByRole('checkbox', { name: checkbox }))
    await newCount(before)
    expect(requirement(id).value()).toBe(value)
    expect(requirement(id).getByText(note)).toBeVisible()
    expect(
      requirement(id).getByText(/Dado sensível: fica só neste aparelho/),
    ).toBeVisible()
  },
)
