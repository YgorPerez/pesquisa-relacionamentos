// O Perfil no Guia, no jsdom (ADR 0035), sobre o conteúdo de fixture: no
// Guia principal, o 1º achado vem de homens e mulheres de 18 a 35 anos e o
// 2º de casais homem-mulher; a Dica cita os dois. O outro Guia só tem o
// achado dos casais homem-mulher. O link que rola até o formulário, o
// tamanho das opções e a ordem do conteúdo ficam no e2e
// (`e2e/perfil.e2e.ts`).
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { abrirTela } from '#/platform/telas/abrir-tela'
import { dizerPerfil, type PerfilNoForm } from '#/platform/telas/perfil'

const GUIA = '/onde-conhecer-pessoas/onde-os-casais-se-conhecem'
const OUTRO_GUIA = '/onde-conhecer-pessoas/app-ou-presencial'
const SEM_DADO = 'Não há dado deste estudo para o seu Perfil.'
const BOTAO = 'Ver o que vale para mim'

/** Cada achado de "O que a evidência diz", na ordem. */
const achados = () => [
  ...screen
    .getByRole('region', { name: 'O que a evidência diz' })
    .querySelectorAll<HTMLElement>('ol[data-slot="achados-guia"] > li'),
]
const selo = (achado: HTMLElement | undefined) =>
  achado?.querySelector('[data-slot="selo-voce"]')?.textContent ?? null
const variaConforme = () =>
  screen.getByRole('region', { name: 'Varia conforme o Perfil?' })

async function abrirComPerfil(url: string, perfil: PerfilNoForm) {
  const usuario = userEvent.setup()
  const tela = abrirTela(url)
  await dizerPerfil(usuario, perfil, BOTAO)
  return { usuario, ...tela }
}

it('sem nada escolhido, o formulário pede uma opção ou a idade, e não salva', async () => {
  const usuario = userEvent.setup()
  abrirTela(GUIA)
  await dizerPerfil(usuario, {}, BOTAO)
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Escolha ao menos uma opção ou diga a sua idade.',
  )
  expect(localStorage.getItem('tem-estudo:perfil')).toBeNull()
})

it('com Perfil, marca o achado que vale e diz qual não tem dado', async () => {
  await abrirComPerfil(GUIA, {
    genero: 'homem',
    procura: 'homens',
    idade: '30',
  })
  expect(
    await within(variaConforme()).findByText(/Seu Perfil:/),
  ).toHaveTextContent('Seu Perfil: homem, procura homens, 30 anos')
  const [primeiro, segundo] = achados()
  expect(selo(primeiro)).toBe('vale para você')
  expect(primeiro).toHaveTextContent(
    'Vale para: homens e mulheres, de 18 a 35 anos.',
  )
  expect(primeiro).not.toHaveTextContent(SEM_DADO)
  // Casais homem-mulher não valem para homem que procura homens.
  expect(selo(segundo)).toBeNull()
  expect(segundo).toHaveTextContent(
    `Vale para: casais homem-mulher. ${SEM_DADO}`,
  )
  expect(variaConforme()).toHaveTextContent(
    '1 de 2 achados tem dado para o seu Perfil.',
  )
})

it('quem procura ambos vê de qual lado há dado', async () => {
  await abrirComPerfil(GUIA, {
    genero: 'homem',
    procura: 'ambos',
    idade: '30',
  })
  await within(variaConforme()).findByText(/Seu Perfil:/)
  const [primeiro, segundo] = achados()
  expect(selo(primeiro)).toBe('vale para você')
  expect(selo(segundo)).toBe('vale para você quando procura mulheres')
})

it('"outro" só casa com o que não separou por gênero: aqui, nada cobre', async () => {
  await abrirComPerfil(GUIA, { genero: 'outro', procura: 'homens' })
  await within(variaConforme()).findByText(/Seu Perfil:/)
  expect(screen.getAllByText(SEM_DADO)).toHaveLength(3)
  expect(variaConforme()).toHaveTextContent(
    'Nenhum dos 2 achados tem dado para o seu Perfil.',
  )
})

it('"mudar" abre o formulário preenchido, e apagar volta ao Guia sem Perfil', async () => {
  const { usuario } = await abrirComPerfil(GUIA, {
    genero: 'mulher',
    procura: 'mulheres',
    idade: '24',
  })
  await usuario.click(
    await within(variaConforme()).findByRole('button', { name: 'mudar' }),
  )
  const form = within(screen.getByRole('form', { name: 'Seu Perfil' }))
  expect(form.getByRole('radio', { name: 'mulher' })).toBeChecked()
  expect(form.getByRole('radio', { name: 'mulheres' })).toBeChecked()
  expect(form.getByLabelText('Sua idade')).toHaveValue(24)

  await dizerPerfil(usuario, { procura: 'homens' }, BOTAO)
  expect(
    await within(variaConforme()).findByText(/Seu Perfil:/),
  ).toHaveTextContent('Seu Perfil: mulher, procura homens, 24 anos')

  await usuario.click(
    within(variaConforme()).getByRole('button', { name: 'mudar' }),
  )
  await usuario.click(screen.getByRole('button', { name: 'Apagar o Perfil' }))
  expect(localStorage.getItem('tem-estudo:perfil')).toBeNull()
  expect(document.querySelector('[data-slot="selo-voce"]')).toBeNull()
})

it('o Perfil salvo vale no outro Guia, com o aviso de que nenhum estudo separou', async () => {
  const { unmount } = await abrirComPerfil(GUIA, {
    genero: 'homem',
    procura: 'homens',
    idade: '30',
  })
  await within(variaConforme()).findByText(/Seu Perfil:/)
  unmount()

  abrirTela(OUTRO_GUIA)
  expect(
    await screen.findByText(/Nenhum estudo deste Guia separou/),
  ).toHaveTextContent('homem, procura homens, 30 anos')
  expect(variaConforme()).toHaveTextContent(
    'O único achado não tem dado para o seu Perfil.',
  )
})
