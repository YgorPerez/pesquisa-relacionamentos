// The HTML below follows what the API returns in `body_html` for a PR with
// attachments (the format Festival dos Macacos recorded in its PR #979), with
// the `?jwt=` cut from the addresses.
import { describe, expect, it } from 'vite-plus/test'
import { changesScreen, evaluate } from './screen-evidence.ts'

const attachment = (id: string, type: string) =>
  `https://private-user-images.githubusercontent.com/151045494/669128291-${id}.${type}`
const ID = (n: number) => `${n}2722361-1352-4244-896f-92760ae1b8cb`

const image = (n: number) =>
  `<td><a target="_blank" rel="noopener noreferrer" href="${attachment(ID(n), 'png')}"><img src="${attachment(ID(n), 'png')}" alt="before" style="max-width: 100%;"></a></td>`
const video = (
  n: number,
) => `<td><details open="" class="details-reset border rounded-2">
  <summary class="tmp-px-3 py-2"><span class="m-1">before.mp4</span></summary>
  <video src="${attachment(ID(n), 'mp4')}" controls="controls" muted="muted" class="d-block">
  </video>
</details>
</td>`
const checkbox = (ticked: boolean, label = 'No screen change') =>
  `<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" id="" disabled="" class="task-list-item-checkbox" aria-label="${ticked ? 'Completed' : 'Incomplete'} task"${ticked ? ' checked=""' : ''}> ${label}</li>
</ul>`

const description = (
  screen: string,
  heading = 'Screen',
) => `<h2 dir="auto">Why</h2>
<p dir="auto">${image(8)}${video(9)}</p>
<h2 dir="auto">${heading}</h2>
${screen}
<h2 dir="auto">Verification</h2>
<p dir="auto">${video(7)}</p>`

const SCREEN = ['frontend/src/ui/perfil.tsx']

describe('changesScreen', () => {
  it('what shows up on screen is screen', () => {
    for (const path of [
      'frontend/src/ui/perfil.tsx',
      'frontend/src/ui/perfil.css',
      'frontend/src/ui/selos.textos.ts',
      'frontend/src/routes/estudos/$slug.tsx',
      'frontend/src/conteudo/vista-guia.ts',
      'frontend/src/estado/perfil.ts',
      'frontend/src/styles.css',
      'frontend/public/og.png',
    ])
      expect({ path, screen: changesScreen(path) }).toEqual({
        path,
        screen: true,
      })
  })

  it('tests, stories, server, analytics and the rest of the repository are not', () => {
    for (const path of [
      'frontend/src/ui/laco.test.ts',
      'frontend/src/ui/perfil.stories.tsx',
      'frontend/src/platform/storybook/com-router.tsx',
      'frontend/src/platform/registro-do-pedido.ts',
      'frontend/src/analytics/goatcounter.ts',
      'frontend/src/routeTree.gen.ts',
      'frontend/src/server.ts',
      'frontend/src/conteudo/virtual-acervo.d.ts',
      'frontend/e2e/perfil.e2e.ts',
      'frontend/scripts/capturar.ts',
      'packages/rules/src/possible-group.ts',
      'estudos/algum-estudo.md',
    ])
      expect({ path, screen: changesScreen(path) }).toEqual({
        path,
        screen: false,
      })
  })
})

describe('evaluate', () => {
  it('with no screen file, passes without looking at the description', () => {
    expect(evaluate('', ['scripts/ports.ts']).passes).toBe(true)
  })

  it('two different screenshots and two videos in the Screen section pass', () => {
    const html = description(
      `<table><tr>${image(1)}${image(2)}</tr><tr>${video(3)}${video(4)}</tr></table>`,
    )
    expect(evaluate(html, SCREEN).passes).toBe(true)
  })

  it('screenshots only fail on the videos', () => {
    const { passes, lines } = evaluate(
      description(`<table><tr>${image(1)}${image(2)}</tr></table>`),
      SCREEN,
    )
    expect(passes).toBe(false)
    expect(lines.some((l) => l.startsWith('Missing videos'))).toBe(true)
    expect(lines.some((l) => l.startsWith('Missing screenshots'))).toBe(false)
  })

  it('the same attachment twice counts once, and one outside the section does not count', () => {
    const { passes, lines } = evaluate(
      description(`${image(1)}${image(1)}${video(3)}${video(3)}`),
      SCREEN,
    )
    expect(passes).toBe(false)
    expect(lines).toContain('In "## Screen": 1 image(s), 1 video(s).')
  })

  it('the ticked box passes with no attachment', () => {
    expect(evaluate(description(checkbox(true)), SCREEN).passes).toBe(true)
  })

  it('the unticked box excuses nothing', () => {
    const { passes, lines } = evaluate(description(checkbox(false)), SCREEN)
    expect(passes).toBe(false)
    expect(lines.some((l) => l.startsWith('Missing screenshots'))).toBe(true)
  })

  it('a description from the Portuguese template still counts', () => {
    expect(
      evaluate(
        description(checkbox(true, 'Nenhuma mudança de tela'), 'Tela'),
        SCREEN,
      ).passes,
    ).toBe(true)
  })

  it('without the Screen section, fails and says to add it', () => {
    const { passes, lines } = evaluate(
      '<h2 dir="auto">Why</h2><p dir="auto">x</p>',
      SCREEN,
    )
    expect(passes).toBe(false)
    expect(
      lines.some((l) => l.includes('lacks the template\'s "## Screen"')),
    ).toBe(true)
  })
})
