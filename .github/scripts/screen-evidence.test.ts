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

const SCREEN = ['frontend/src/ui/profile.tsx']

describe('changesScreen', () => {
  it('what shows up on screen is screen', () => {
    for (const path of [
      'frontend/src/ui/profile.tsx',
      'frontend/src/ui/profile.css',
      'frontend/src/ui/badges.copy.ts',
      'frontend/src/routes/estudos/$slug.tsx',
      'frontend/src/content/guide-view.ts',
      'frontend/src/state/profile.ts',
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
      'frontend/src/ui/loop.test.ts',
      'frontend/src/ui/profile.stories.tsx',
      'frontend/src/platform/storybook/with-router.tsx',
      'frontend/src/platform/request-log.ts',
      'frontend/src/analytics/goatcounter.ts',
      'frontend/src/routeTree.gen.ts',
      'frontend/src/server.ts',
      'frontend/src/content/virtual-library.d.ts',
      'frontend/e2e/profile.e2e.ts',
      'frontend/scripts/capture.ts',
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
