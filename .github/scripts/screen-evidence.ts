// A PR that changes a screen shows the screen in its description: in the
// `## Screen` section, screenshots and videos from before and after. CI
// compares no screen, and a reviewer only sees what changed if the PR shows
// it (docs/agents/evidencia-de-tela.md). It came from the Festival dos
// Macacos `evidencia-de-tela.ts`.
//
// Counts in the description as GitHub renders it (the API's `body_html`), not
// in the markdown: the same bare `github.com/user-attachments/assets/<uuid>`
// becomes a player if the attachment is a video and a link if it is an image,
// and `gh --attach` writes the video as `[name.mp4](url)`, which also becomes
// a player. Only the HTML says what each attachment is: an image is an
// attachment `<img>`, a video is a `<video>`.
//
// Asks for at least two different images and two different videos, before
// and after. A PR whose screen does not change ticks `- [x] No screen change`
// in the section and passes. PRs opened before the template moved to English
// (ADR 0039) still use `## Tela` and `Nenhuma mudança de tela`; both count.
//
// Runs in `screen-evidence.yml` on every PR and every description edit, and
// by hand: `node .github/scripts/screen-evidence.ts <PR number>`.
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

/** What shows up on someone's screen: the app and what it serves from
 * `public/`. */
const SCREEN = [/^frontend\/src\//, /^frontend\/public\//]

/** From the app, what draws nothing: tests, stories, the Storybook
 * scaffolding, the GoatCounter count, the server's log and redirect, the
 * generated route tree and types. */
const OFF_SCREEN = [
  /\.(?:test|stories)\.tsx?$/,
  /\.d\.ts$/,
  /\.md$/,
  /^frontend\/src\/platform\//,
  /^frontend\/src\/analytics\//,
  /^frontend\/src\/routeTree\.gen\.ts$/,
  /^frontend\/src\/server\.ts$/,
  /\.server\.tsx?$/,
]

export function changesScreen(path: string): boolean {
  return (
    SCREEN.some((r) => r.test(path)) && !OFF_SCREEN.some((r) => r.test(path))
  )
}

/** The Screen section of the description HTML: from `<h2>Screen</h2>` up to
 * the next `<h2`. */
function screenSection(html: string): string | null {
  const start = html.search(/<h2\b[^>]*>\s*(?:Screen|Tela)\s*<\/h2>/i)
  if (start < 0) return null
  const rest = html.slice(start).replace(/^<h2\b[^>]*>[^<]*<\/h2>/i, '')
  const end = rest.search(/<h2\b/i)
  return end < 0 ? rest : rest.slice(0, end)
}

/** An attachment's uuid, which comes both in `github.com/user-attachments/assets/`
 * and in the signed address at `private-user-images.githubusercontent.com`. */
const ATTACHMENT = String.raw`(?:user-attachments/assets/|private-user-images\.githubusercontent\.com/\d+/\d+-)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`

function countEvidence(section: string) {
  const attachments = (tag: string) =>
    new Set(
      Array.from(
        section.matchAll(
          new RegExp(String.raw`<${tag}\b[^>]*\bsrc="[^"]*?${ATTACHMENT}`, 'g'),
        ),
        (found) => found[1],
      ),
    )
  return {
    images: attachments('img').size,
    videos: attachments('video').size,
    noChange:
      /<input\b[^>]*\bchecked\b[^>]*>\s*(?:No screen change|Nenhuma mudança de tela)/i.test(
        section,
      ),
  }
}

export type Verdict = { passes: boolean; lines: string[] }

export function evaluate(html: string, files: readonly string[]): Verdict {
  const screenFiles = files.filter(changesScreen)
  if (screenFiles.length === 0)
    return {
      passes: true,
      lines: ['No screen file changed: there is nothing to show.'],
    }
  const lines = [
    'Files that change a screen:',
    ...screenFiles.map((f) => `- ${f}`),
    '',
  ]
  const section = screenSection(html)
  if (section === null)
    return {
      passes: false,
      lines: [
        ...lines,
        'The description lacks the template\'s "## Screen" section (.github/pull_request_template.md). Add the section, with the before and after screenshots and videos.',
      ],
    }
  const { images, videos, noChange } = countEvidence(section)
  if (noChange)
    return {
      passes: true,
      lines: [
        ...lines,
        '"No screen change" is ticked: the PR says the screen stays the same.',
      ],
    }
  lines.push(`In "## Screen": ${images} image(s), ${videos} video(s).`)
  const missing: string[] = []
  if (images < 2)
    missing.push(
      `Missing screenshots: at least 2, before and after, and there are ${images}. Take them with \`node frontend/scripts/capturar.ts <route>\` on each side.`,
    )
  if (videos < 2)
    missing.push(
      `Missing videos: at least 2, before and after, and there are ${videos}. Record them with \`node frontend/scripts/capturar.ts <route> --video\` on each side.`,
    )
  if (missing.length === 0) return { passes: true, lines }
  return {
    passes: false,
    lines: [
      ...lines,
      ...missing,
      'Attach with `gh pr edit <n> --body-file body.md --attach ./before.png --attach ./before.mp4 ...`, or tick "- [x] No screen change" if the screen stays the same. How: docs/agents/evidencia-de-tela.md.',
    ],
  }
}

// The end that talks to the GitHub API; what it decides is `evaluate`.
if (import.meta.main) {
  const gh = (...args: string[]) =>
    execFileSync('gh', args, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
  const pr = process.argv[2]
  if (!pr || !/^\d+$/.test(pr)) {
    console.error('Usage: node .github/scripts/screen-evidence.ts <PR number>')
    process.exit(2)
  }
  // gh resolves `{owner}/{repo}` from the checkout, or from GH_REPO in CI.
  const html = gh(
    'api',
    `repos/{owner}/{repo}/pulls/${pr}`,
    '-H',
    'Accept: application/vnd.github.html+json',
    '--jq',
    '.body_html // ""',
  )
  const files = gh(
    'api',
    '--paginate',
    `repos/{owner}/{repo}/pulls/${pr}/files`,
    '--jq',
    '.[].filename',
  )
    .split('\n')
    .filter(Boolean)
  const { passes, lines } = evaluate(html, files)
  const report = lines.join('\n')
  if (passes) console.log(report)
  else console.error(report)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`)
  process.exit(passes ? 0 : 1)
}
