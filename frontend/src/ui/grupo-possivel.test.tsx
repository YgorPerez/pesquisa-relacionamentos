// A tela do Grupo possível (`/grupo-possivel`) no jsdom (ADR 0035), sobre os
// dados de fixture: o "Brasil" da fixture é só o Acre (`e2e/acervo/dados`).
// O número preso no topo ao rolar, o toque, o teclado e o tamanho dos
// controles ficam no e2e (`e2e/grupo-possivel.e2e.ts`), que tem layout.
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { abrirTela } from '#/platform/telas/abrir-tela'
import { contaNova, faixa, requisito } from '#/platform/telas/grupo-possivel'
import { dizerPerfil } from '#/platform/telas/perfil'

const PAGINA = '/grupo-possivel'
const BOTAO = 'Usar na conta'

it('sem nada dito, já traz o número de exemplo e o Perfil vem primeiro', async () => {
  abrirTela(PAGINA)
  expect(await screen.findByRole('form', { name: 'Seu Perfil' })).toBeVisible()
  expect(faixa()).toMatch(/^entre .+ e .+/)
  // As seções, depois do número preso (que também é um `h2`).
  const secoes = [
    ...document.querySelectorAll('main h2[data-slot="headline"]'),
  ].map((h) => h.textContent)
  expect(secoes.slice(0, 3)).toEqual([
    'Seu Perfil',
    'Seus Requisitos',
    'A conta',
  ])
})

it('o Perfil preenche a idade procurada (±5) e a orientação entra na conta', async () => {
  const usuario = userEvent.setup()
  abrirTela(PAGINA)
  await screen.findByRole('form', { name: 'Seu Perfil' })
  const antes = faixa()
  await dizerPerfil(
    usuario,
    { genero: 'homem', procura: 'mulheres', idade: '30' },
    BOTAO,
  )
  await contaNova(antes)
  expect(requisito('idade').getByLabelText('Idade de')).toHaveValue('25')
  expect(requisito('idade').getByLabelText('até')).toHaveValue('35')
  expect(
    screen.getByText(/a conta só conta quem se interessa por homens/),
  ).toBeVisible()
})

it('cada Requisito ligado muda o número, e soltá-lo volta ao "qualquer"', async () => {
  const usuario = userEvent.setup()
  abrirTela(PAGINA)
  await dizerPerfil(
    usuario,
    { genero: 'mulher', procura: 'homens', idade: '28' },
    BOTAO,
  )
  let atual = await contaNova(null)

  await usuario.click(
    requisito('escolaridade').getByRole('radio', {
      name: 'superior completo',
    }),
  )
  atual = await contaNova(atual)
  expect(requisito('escolaridade').custo()).toMatch(
    /^soltar só este: ×[\d,]+ \(\+.+\)$/,
  )

  await usuario.click(
    requisito('idade').getByRole('button', { name: 'até: mais 1' }),
  )
  atual = await contaNova(atual)
  expect(requisito('idade').valor()).toBe('23 a 34 anos')

  await usuario.click(
    screen.getByRole('button', { name: 'Soltar escolaridade' }),
  )
  await contaNova(atual)
  expect(
    requisito('escolaridade').getByRole('radio', { name: 'qualquer' }),
  ).toBeChecked()
})

it('"sem filhos" fica desabilitado procurando homens, com o motivo', async () => {
  const usuario = userEvent.setup()
  abrirTela(PAGINA)
  await dizerPerfil(
    usuario,
    { genero: 'homem', procura: 'homens', idade: '30' },
    BOTAO,
  )
  await contaNova(null)
  const caixa = requisito('filhos').getByRole('checkbox', {
    name: 'Só quem não tem filhos',
  })
  // O `Checkbox` do Base UI é um `role="checkbox"`, desligado por ARIA.
  expect(caixa).toHaveAttribute('aria-disabled', 'true')
  expect(caixa).toHaveAccessibleDescription(
    'O Censo só pergunta filhos às mulheres. Procurando homens, não dá para filtrar.',
  )
})

it('UF e município ficam salvos no aparelho e voltam ao abrir de novo', async () => {
  const usuario = userEvent.setup()
  const { unmount } = abrirTela(PAGINA)
  await dizerPerfil(
    usuario,
    { genero: 'homem', procura: 'mulheres', idade: '30' },
    BOTAO,
  )
  await usuario.selectOptions(requisito('lugar').getByLabelText('Estado'), 'AC')
  const municipio = requisito('lugar').getByLabelText('Município')
  await waitFor(() => expect(municipio).toBeEnabled())
  await usuario.selectOptions(municipio, 'Rio Branco')
  expect(requisito('lugar').valor()).toBe('Rio Branco (AC)')
  expect(
    JSON.parse(localStorage.getItem('tem-estudo:grupo-possivel') ?? 'null'),
  ).toMatchObject({ lugar: { uf: 'AC', municipio: '1200401' } })

  unmount()
  abrirTela(PAGINA)
  expect(await screen.findByLabelText('Município')).toHaveValue('1200401')
})
