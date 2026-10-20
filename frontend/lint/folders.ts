// Where a file may live (ADR 0014, from the Festival dos Macacos ADR-0049).
// Each `frontend/src/` folder has a role (`AGENTS.md`, "Onde um arquivo
// mora"), and the packages are flat. No linter looks at the tree, so this
// script does: it lists what is out of place and exits with an error.
//
// Runs in `pnpm check`, right after `vp check`:
//   node frontend/lint/folders.ts
import { existsSync, readdirSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..', '..')

type Rule = {
  /** The folder the rule looks at, relative to the repository root. */
  folder: string
  /** The file, relative to the folder, that is out of place. */
  outside: (file: string) => boolean
  reason: string
}

/** The `frontend/src/` folders, each with its role. */
const APP_FOLDERS = [
  'analytics',
  'content',
  'fonts',
  'platform',
  'routes',
  'state',
  'ui',
]

/** The loose files at the root of `frontend/src/`: the ones TanStack Start
 * and Vite look for there, and the one TanStack Router generates. */
const APP_LOOSE_FILES = [
  'router.tsx',
  'server.ts',
  'styles.css',
  'reset.d.ts',
  'routeTree.gen.ts',
]

const RULES: Rule[] = [
  {
    folder: 'frontend/src/routes',
    outside: (a) =>
      !a.endsWith('.tsx') ||
      a.endsWith('.test.tsx') ||
      a.split('/').some((part) => part.startsWith('-')),
    reason:
      'routes/ holds only route files. The page piece goes to `ui/`, reading the library to `content/`, browser state to `state/`.',
  },
  {
    folder: 'frontend/src',
    outside: (a) =>
      a.includes('/')
        ? !APP_FOLDERS.includes(a.split('/')[0]!)
        : !APP_LOOSE_FILES.includes(a),
    reason: `frontend/src/ holds only ${APP_FOLDERS.map((p) => `${p}/`).join(', ')} and the files Start looks for at the root. A new piece goes into one of them; a new folder needs a line in \`frontend/lint/folders.ts\` and in "Onde um arquivo mora" of AGENTS.md.`,
  },
  {
    folder: 'frontend/src',
    outside: (a) => /(^|\/)(__tests__|tests|testes)\//.test(a),
    reason:
      'A test lives next to what it tests, as `<name>.test.ts`, and not in a tests folder.',
  },
  ...['packages/content/src', 'packages/rules/src'].map((folder) => ({
    folder,
    outside: (a: string) => a.includes('/'),
    reason:
      'The package is flat: one file per subject, imported by its subpath (`@tem-estudo/rules/<name>`).',
  })),
]

function files(folder: string): string[] {
  if (!existsSync(folder)) return []
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => relative(folder, join(e.parentPath, e.name)))
}

/** Each file out of place, relative to the root, with the reason. */
export function outOfPlace(root = ROOT) {
  const found: { file: string; reason: string }[] = []
  for (const rule of RULES)
    for (const native of files(join(root, rule.folder))) {
      const a = native.split(sep).join('/')
      if (rule.outside(a))
        found.push({ file: `${rule.folder}/${a}`, reason: rule.reason })
    }
  return found
}

if (import.meta.main) {
  const found = outOfPlace()
  for (const { file, reason } of found)
    console.error(`[folders] ${file}: ${reason}`)
  if (found.length > 0) process.exit(1)
}
