// A tela de Prioridades (`/prioridades`) no jsdom (ADR 0035), sobre o
// conteúdo de fixture (`e2e/acervo/dados/prioridades`). Em satisfação: "pesa"
// tem a química sexual; "quase nada", ser parecido; "não sabemos", renda,
// escolaridade, religião e idade. O seletor preso ao rolar, as cores, o
// tamanho dos chips e o teclado ficam no e2e (`e2e/prioridades.e2e.ts`).
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { abrirTela } from '#/platform/telas/abrir-tela'

const PAGINA = '/prioridades'

const chips = () => within(screen.getByRole('region', { name: 'Seu topo 3' }))
const chip = (nome: string) =>
  chips().getByRole('button', { name: new RegExp(`${nome}$`) })
const prateleira = (nome: string) =>
  within(screen.getByRole('region', { name: nome }))
/** O nome de uma escolhida: "sua 1ª: Renda". No jsdom, o espaço do fim do
 * `sr-only` some do nome. */
const escolhida = (n: number, nome: string) =>
  new RegExp(`^sua ${n}ª: ?${nome}$`)
const salvo = () =>
  JSON.parse(localStorage.getItem('tem-estudo:prioridades') ?? 'null')

async function abrir() {
  const usuario = userEvent.setup()
  const tela = abrirTela(PAGINA)
  await screen.findByRole('region', { name: 'Seu topo 3' })
  return { usuario, ...tela }
}

it('tocar dá o próximo número, tocar de novo tira e renumera', async () => {
  const { usuario } = await abrir()
  expect(screen.getByText(/^Nenhuma escolhida ainda\./)).toBeVisible()

  await usuario.click(chip('Renda'))
  await usuario.click(chip('Aparência'))
  expect(chip('Renda')).toHaveAccessibleName(escolhida(1, 'Renda'))
  expect(chip('Aparência')).toHaveAccessibleName(escolhida(2, 'Aparência'))
  expect(chip('Aparência')).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('Falta 1.')).toBeVisible()

  await usuario.click(chip('Renda'))
  expect(chip('Aparência')).toHaveAccessibleName(escolhida(1, 'Aparência'))
  expect(chip('Renda')).toHaveAttribute('aria-pressed', 'false')
  expect(salvo()).toEqual({ topo3: ['aparencia'], desfecho: 'satisfacao' })
})

it('com três, os outros chips ficam indisponíveis, com a dica de troca', async () => {
  const { usuario } = await abrir()
  for (const nome of ['Gentileza', 'Ser parecido comigo', 'Idade parecida'])
    await usuario.click(chip(nome))
  const dica = 'Pronto. Para trocar, toque numa das escolhidas e ela sai.'
  expect(screen.getByText(dica)).toBeVisible()
  const renda = chip('Renda')
  expect(renda).toHaveAttribute('aria-disabled', 'true')
  expect(renda).toHaveAccessibleDescription(dica)
  await usuario.click(renda)
  expect(salvo()).toMatchObject({ topo3: ['gentileza', 'parecido', 'idade'] })
})

it('as escolhidas caem numeradas na prateleira delas, e o alerta diz em frase', async () => {
  const { usuario } = await abrir()
  for (const nome of ['Renda', 'Química sexual', 'Ser parecido comigo'])
    await usuario.click(chip(nome))

  expect(
    prateleira('pesa').getByRole('button', {
      name: escolhida(2, 'Química sexual'),
    }),
  ).toBeVisible()
  expect(
    prateleira('quase nada').getByRole('button', {
      name: escolhida(3, 'Ser parecido comigo'),
    }),
  ).toBeVisible()
  // A escolhida vem primeiro na prateleira.
  const naoSabemos = prateleira('não sabemos').getAllByRole('button')
  expect(naoSabemos[0]).toHaveAccessibleName(escolhida(1, 'Renda'))
  expect(naoSabemos.slice(1).map((b) => b.textContent)).toEqual([
    'Mesma escolaridade',
    'Mesma religião',
    'Idade parecida',
  ])
  expect(document.querySelector('[data-slot="alerta"]')).toHaveTextContent(
    'No seu topo 3, para satisfação: ser parecido comigo pesa quase nada; para renda não há boa evidência.',
  )
})

it('o desfecho muda as prateleiras, e a barra da Joel só aparece em satisfação', async () => {
  const { usuario } = await abrir()
  await usuario.click(chip('Aparência'))
  const antes = 'Antes: o parceiro explica pouco da satisfação'
  expect(screen.getByText(antes)).toBeVisible()

  await usuario.click(screen.getByRole('radio', { name: 'Atração' }))
  expect(screen.queryByText(antes)).not.toBeInTheDocument()
  expect(
    prateleira('pesa').getByRole('button', {
      name: escolhida(1, 'Aparência'),
    }),
  ).toBeVisible()

  await usuario.click(screen.getByRole('radio', { name: 'Duração' }))
  expect(
    prateleira('não sabemos').getByRole('button', {
      name: escolhida(1, 'Aparência'),
    }),
  ).toBeVisible()
  expect(salvo()).toEqual({ topo3: ['aparencia'], desfecho: 'duracao' })
})

it('tocar numa característica abre o detalhe, com o viés do gênero do Perfil', async () => {
  localStorage.setItem(
    'tem-estudo:perfil',
    JSON.stringify({ genero: 'mulher' }),
  )
  const { usuario } = await abrir()

  const aparencia = prateleira('pesa pouco').getByRole('button', {
    name: 'Aparência',
  })
  await usuario.click(aparencia)
  expect(aparencia).toHaveAttribute('aria-expanded', 'true')
  const detalhe = screen.getByRole('region', {
    name: 'Aparência, satisfação',
  })
  expect(detalhe).toHaveTextContent('Medida: r = 0,10, só maridos')
  expect(
    within(detalhe).getByRole('link', { name: 'Costa (2018)' }),
  ).toHaveAttribute('href', '/estudos/costa-2018-satisfacao')

  // Renda tem viés só por gênero: com "mulher" no Perfil, vale o das mulheres.
  await usuario.click(
    prateleira('não sabemos').getByRole('button', { name: 'Renda' }),
  )
  expect(
    screen.queryByRole('region', { name: 'Aparência, satisfação' }),
  ).not.toBeInTheDocument()
  const renda = screen.getByRole('region', { name: 'Renda, satisfação' })
  expect(renda).toHaveTextContent('Mulheres tendem a dar mais peso à renda')
  expect(renda).not.toHaveTextContent('Homens tendem')
})

it('o topo 3 e o desfecho voltam ao abrir de novo', async () => {
  const { usuario, unmount } = await abrir()
  await usuario.click(chip('Gentileza'))
  await usuario.click(screen.getByRole('radio', { name: 'Atração' }))
  unmount()

  await abrir()
  expect(chip('Gentileza')).toHaveAccessibleName(escolhida(1, 'Gentileza'))
  expect(screen.getByRole('radio', { name: 'Atração' })).toBeChecked()
})
