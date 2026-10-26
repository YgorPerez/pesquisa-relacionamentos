// The automatic accessibility check (spec, seam 3; story 105): axe on each
// kind of page in the fixture, on mobile and on desktop (the two projects of
// `playwright.config.ts`). A violation is fixed in the code, not turned off
// here.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const RULES = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

const PROFILE = { gender: 'mulher', seeks: 'homens', age: 30 }

const PAGES: ReadonlyArray<{
  name: string
  path: string
  profile?: boolean
}> = [
  { name: 'home', path: '/' },
  { name: 'Guide without Profile', path: '/onde-conhecer-pessoas' },
  {
    name: 'Guide with the Possible group card, with Profile',
    path: '/onde-conhecer-pessoas',
    profile: true,
  },
  {
    name: 'Guide with the whole frame and the Priorities card, with Profile',
    path: '/escolher-parceiro',
    profile: true,
  },
  { name: 'Fact sheets', path: '/estudos' },
  { name: 'Fact sheet', path: '/estudos/silva-2020-apps-brasil' },
  { name: 'unverified Fact sheet', path: '/estudos/lima-2015-encontros' },
  { name: 'Tips', path: '/dicas' },
  { name: 'Tip', path: '/dicas/apps-como-complemento' },
  { name: 'Possible group', path: '/grupo-possivel' },
  {
    name: 'Possible group with Profile',
    path: '/grupo-possivel',
    profile: true,
  },
  { name: 'Priorities', path: '/prioridades' },
  { name: 'Priorities with Profile', path: '/prioridades', profile: true },
  { name: 'Privacy', path: '/privacidade' },
  { name: 'page that does not exist', path: '/estudos/nao-existe-2020' },
]

type Result = Awaited<ReturnType<AxeBuilder['analyze']>>['violations']

const lines = (results: Result, prefix = '') =>
  results.flatMap((v) =>
    v.nodes.map((n) => {
      const why = [...n.any, ...n.all].map((c) => c.message).join('; ')
      return `${prefix}${v.id} at ${n.target.join(' ')}: ${why || v.help}`
    }),
  )

/** One line per violation: the rule, what it says and where it is.
 *
 * The halftone (the background and shadow dots, `--reticula*` in
 * `tokens.css`) is a background image, and axe does not measure contrast over
 * an image: it leaves the text as "incomplete", neither passing nor failing
 * it. So the contrast runs again with the background images removed, and
 * then no text may stay unmeasured. `overlays` disappear at the same time: a
 * drawing over the text, like the circled Fact sheet's loop, also leaves the
 * contrast unmeasured. */
async function violations(page: Page, overlays?: string): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(RULES)
    // An open Base UI list (the `Select`) puts `FocusGuard`s around it:
    // invisible spans with `tabindex=0` and `aria-hidden` that, on receiving
    // the Tab focus, send it into or out of the list
    // (`@base-ui/react/utils/FocusGuard`). axe sees a hidden focusable
    // (`aria-hidden-focus`), but the focus never stops on them. Only they
    // are excluded.
    .exclude('[data-base-ui-focus-guard]')
    .analyze()
  const hide = overlays ? `${overlays} { display: none !important; }` : ''
  await page.addStyleTag({
    content: `*, *::before, *::after { background-image: none !important; } ${hide}`,
  })
  const contrast = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .analyze()
  return [
    ...lines(violations),
    ...lines(contrast.violations, 'without halftone, '),
    ...lines(contrast.incomplete, 'without halftone, unmeasured, '),
  ]
}

for (const { name, path, profile } of PAGES) {
  test(`${name} passes axe`, async ({ page }) => {
    if (profile)
      await page.addInitScript(
        (p) => localStorage.setItem('tem-estudo:profile', JSON.stringify(p)),
        PROFILE,
      )
    await page.goto(path, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await violations(page)).toEqual([])
  })
}

test('the Guide with the sections open and the circled Fact sheet passes axe', async ({
  page,
}) => {
  await page.goto('/onde-conhecer-pessoas', { waitUntil: 'networkidle' })
  for (const summary of await page
    .locator(
      'main details:not([open]) > summary, main [data-slot="collapsible-trigger"]:not([data-panel-open])',
    )
    .all())
    await summary.click()
  await page
    .locator('[data-slot="resposta"]')
    .first()
    .getByRole('link', { name: /^Ficha 1:/ })
    .click()
  await expect(
    page.getByRole('button', { name: 'voltar ao texto' }),
  ).toBeVisible()
  expect(await violations(page, 'svg.laco, svg.seta-laco')).toEqual([])
})

test('the "Ajudou?" with the reasons for the no passes axe', async ({
  page,
}) => {
  await page.goto('/onde-conhecer-pessoas', { waitUntil: 'networkidle' })
  await page
    .getByRole('region', { name: 'Ajudou?' })
    .first()
    .getByRole('button', { name: 'Não' })
    .click()
  await expect(page.getByRole('group', { name: 'O que faltou?' })).toBeVisible()
  expect(await violations(page)).toEqual([])
})

test('the Possible group with the list of states open passes axe', async ({
  page,
}) => {
  await page.addInitScript(
    (p) => localStorage.setItem('tem-estudo:profile', JSON.stringify(p)),
    PROFILE,
  )
  await page.goto('/grupo-possivel', { waitUntil: 'networkidle' })
  await page.getByRole('combobox', { name: 'Estado' }).click()
  await expect(page.getByRole('option', { name: 'Acre' })).toBeVisible()
  expect(await violations(page)).toEqual([])
})

test('Priorities with the top 3 and one trait open passes axe', async ({
  page,
}) => {
  await page.goto('/prioridades', { waitUntil: 'networkidle' })
  const chips = page.getByRole('region', { name: 'Seu topo 3' })
  for (const name of [/Renda$/, /Química sexual$/, /Aparência$/])
    await chips.getByRole('button', { name }).click()
  await page
    .getByRole('region', { name: 'pesa', exact: true })
    .getByRole('button')
    .first()
    .click()
  expect(await violations(page)).toEqual([])
})
