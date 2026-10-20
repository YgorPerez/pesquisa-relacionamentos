// Every `src/ui/` piece opens in Storybook (ADR 0036, from the Festival dos
// Macacos `lint/stories.ts` and ADR-0047). There the count is per screen:
// each route has a story that opens it. Here it is per piece: each `.tsx` in
// `src/ui/` (the `ui/shadcn/` controls too) is imported by some story, and
// the piece no story imports fails `pnpm check`. A test, or another piece
// that uses it, does not count: the story is where it is seen and where
// `pnpm test:stories` opens it on phone and desktop.
//
// Reads the imports as text, with Vite's parser, without importing anything
// from the app. Runs in `pnpm check`, after the folders:
//   node frontend/lint/stories.ts
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { parseSync } from 'vite-plus'

const ROOT = resolve(import.meta.dirname, '..')

const PIECE = /\.tsx$/
const NOT_A_PIECE = /\.(stories|test)\.tsx$/

function files(folder: string): string[] {
  if (!existsSync(folder)) return []
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name))
}

/** The path, relative to `frontend/` and with `/`, of each value import of
 * the file that points inside `src/`: the relative one, `#/` and `@/`. */
function imported(root: string, file: string): string[] {
  const { program } = parseSync(file, readFileSync(file, 'utf8'))
  return program.body.flatMap((node) => {
    if (node.type !== 'ImportDeclaration' || node.importKind === 'type')
      return []
    const from = String(node.source.value)
    const target = /^[#@]\//.test(from)
      ? join(root, 'src', from.slice(2))
      : from.startsWith('.')
        ? join(dirname(file), from)
        : null
    return target
      ? [
          relative(root, target)
            .split(sep)
            .join('/')
            .replace(/\.tsx$/, ''),
        ]
      : []
  })
}

/** Each `src/ui/` piece no story imports, relative to `frontend/`. */
export function piecesWithoutStory(root = ROOT): string[] {
  const fromFront = (a: string) => relative(root, a).split(sep).join('/')
  const pieces = files(join(root, 'src', 'ui'))
    .filter((a) => PIECE.test(a) && !NOT_A_PIECE.test(a))
    .map(fromFront)
  const seen = new Set(
    files(join(root, 'src'))
      .filter((a) => a.endsWith('.stories.tsx'))
      .flatMap((a) => imported(root, a)),
  )
  return pieces.filter((p) => !seen.has(p.replace(/\.tsx$/, ''))).sort()
}

if (import.meta.main) {
  const missing = piecesWithoutStory()
  for (const piece of missing)
    console.error(
      `[stories] ${piece}: no story imports this piece. Write a \`<name>.stories.tsx\` next to it that shows it, or put it in an existing story.`,
    )
  if (missing.length > 0) process.exit(1)
}
