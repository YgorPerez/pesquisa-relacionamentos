// A checagem automática de acessibilidade (spec, seam 3; story 105): o axe
// em cada tipo de página da fixture, no celular e no desktop (os dois
// projetos do `playwright.config.ts`). Uma violação se corrige no código,
// não se desliga aqui.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const REGRAS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

const PERFIL = { genero: 'mulher', procura: 'homens', idade: 30 }

const PAGINAS: ReadonlyArray<{
  nome: string
  caminho: string
  perfil?: boolean
}> = [
  { nome: 'início', caminho: '/' },
  { nome: 'Tema', caminho: '/onde-conhecer-pessoas' },
  {
    nome: 'Guia sem Perfil',
    caminho: '/onde-conhecer-pessoas/onde-os-casais-se-conhecem',
  },
  {
    nome: 'Guia com Perfil',
    caminho: '/onde-conhecer-pessoas/onde-os-casais-se-conhecem',
    perfil: true,
  },
  {
    nome: 'Guia com a calculadora, com Perfil',
    caminho: '/onde-conhecer-pessoas/app-ou-presencial',
    perfil: true,
  },
  { nome: 'Fichas', caminho: '/estudos' },
  { nome: 'Ficha', caminho: '/estudos/silva-2020-apps-brasil' },
  { nome: 'Ficha não verificada', caminho: '/estudos/lima-2015-encontros' },
  { nome: 'Dicas', caminho: '/dicas' },
  { nome: 'Dica', caminho: '/dicas/apps-como-complemento' },
  { nome: 'Grupo possível', caminho: '/grupo-possivel' },
  {
    nome: 'Grupo possível com Perfil',
    caminho: '/grupo-possivel',
    perfil: true,
  },
  { nome: 'Prioridades', caminho: '/prioridades' },
  { nome: 'Prioridades com Perfil', caminho: '/prioridades', perfil: true },
  { nome: 'Privacidade', caminho: '/privacidade' },
  { nome: 'página que não existe', caminho: '/estudos/nao-existe-2020' },
]

type Resultado = Awaited<ReturnType<AxeBuilder['analyze']>>['violations']

const linhas = (resultados: Resultado, prefixo = '') =>
  resultados.flatMap((v) =>
    v.nodes.map((n) => {
      const porque = [...n.any, ...n.all].map((c) => c.message).join('; ')
      return `${prefixo}${v.id} em ${n.target.join(' ')}: ${porque || v.help}`
    }),
  )

/** Uma linha por violação: a regra, o que diz e onde está.
 *
 * A retícula (os pontos do fundo e da sombra, `--reticula*` em `tokens.css`)
 * é imagem de fundo, e o axe não mede contraste sobre imagem: deixa o texto
 * como "incompleto", sem aprovar nem reprovar. Por isso o contraste roda de
 * novo com as imagens de fundo tiradas, e aí nenhum texto pode ficar sem
 * medida. `sobrepostos` some na mesma hora: um desenho por cima do texto,
 * como o laço da Ficha circulada, também deixa o contraste sem medida. */
async function violacoes(page: Page, sobrepostos?: string): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(REGRAS)
    .analyze()
  const tirar = sobrepostos
    ? `${sobrepostos} { display: none !important; }`
    : ''
  await page.addStyleTag({
    content: `*, *::before, *::after { background-image: none !important; } ${tirar}`,
  })
  const contraste = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .analyze()
  return [
    ...linhas(violations),
    ...linhas(contraste.violations, 'sem retícula, '),
    ...linhas(contraste.incomplete, 'sem retícula, sem medida, '),
  ]
}

for (const { nome, caminho, perfil } of PAGINAS) {
  test(`${nome} passa no axe`, async ({ page }) => {
    if (perfil)
      await page.addInitScript(
        (p) => localStorage.setItem('tem-estudo:perfil', JSON.stringify(p)),
        PERFIL,
      )
    await page.goto(caminho, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await violacoes(page)).toEqual([])
  })
}

test('o Guia com as seções abertas e a Ficha circulada passa no axe', async ({
  page,
}) => {
  await page.goto('/onde-conhecer-pessoas/onde-os-casais-se-conhecem', {
    waitUntil: 'networkidle',
  })
  for (const resumo of await page
    .locator(
      'main details:not([open]) > summary, main [data-slot="collapsible-trigger"]:not([data-panel-open])',
    )
    .all())
    await resumo.click()
  await page
    .getByRole('region', { name: 'Resposta curta' })
    .getByRole('link', { name: /^Ficha 1:/ })
    .click()
  await expect(
    page.getByRole('button', { name: 'voltar ao texto' }),
  ).toBeVisible()
  expect(await violacoes(page, 'svg.laco, svg.seta-laco')).toEqual([])
})

test('o "Ajudou?" com os motivos do não passa no axe', async ({ page }) => {
  await page.goto('/onde-conhecer-pessoas/onde-os-casais-se-conhecem', {
    waitUntil: 'networkidle',
  })
  await page
    .getByRole('region', { name: 'Ajudou?' })
    .getByRole('button', { name: 'Não' })
    .click()
  await expect(page.getByRole('group', { name: 'O que faltou?' })).toBeVisible()
  expect(await violacoes(page)).toEqual([])
})

test('o Grupo possível com a lista de Estados aberta passa no axe', async ({
  page,
}) => {
  await page.addInitScript(
    (p) => localStorage.setItem('tem-estudo:perfil', JSON.stringify(p)),
    PERFIL,
  )
  await page.goto('/grupo-possivel', { waitUntil: 'networkidle' })
  await page.getByRole('combobox', { name: 'Estado' }).click()
  await expect(page.getByRole('option', { name: 'Acre' })).toBeVisible()
  expect(await violacoes(page)).toEqual([])
})

test('Prioridades com o topo 3 e uma característica aberta passa no axe', async ({
  page,
}) => {
  await page.goto('/prioridades', { waitUntil: 'networkidle' })
  const chips = page.getByRole('region', { name: 'Seu topo 3' })
  for (const nome of [/Renda$/, /Química sexual$/, /Aparência$/])
    await chips.getByRole('button', { name: nome }).click()
  await page
    .getByRole('region', { name: 'pesa', exact: true })
    .getByRole('button')
    .first()
    .click()
  expect(await violacoes(page)).toEqual([])
})
