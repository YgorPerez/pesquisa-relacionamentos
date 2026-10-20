import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { piecesWithoutStory } from './stories.ts'

let root: string | undefined

/** A fake `frontend/`, with the given files. */
function frontend(files: Record<string, string>) {
  root = mkdtempSync(join(tmpdir(), 'stories-'))
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  return root
}

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true })
  root = undefined
})

describe('piecesWithoutStory', () => {
  it('fails the piece no story imports', () => {
    expect(
      piecesWithoutStory(
        frontend({
          'src/ui/badge.tsx': 'export const Badge = () => null',
          'src/ui/button.tsx': 'export const Button = () => null',
          'src/ui/button.stories.tsx': "import { Button } from './button'",
        }),
      ),
    ).toEqual(['src/ui/badge.tsx'])
  })

  it('the story may live in another file and import through the app aliases', () => {
    expect(
      piecesWithoutStory(
        frontend({
          'src/ui/guide.tsx': '',
          'src/ui/section.tsx': '',
          'src/ui/shadcn/button.tsx': '',
          'src/ui/shelf.stories.tsx': [
            "import { Guide } from '#/ui/guide'",
            "import { Section } from '@/ui/section.tsx'",
          ].join('\n'),
          'src/platform/storybook/controls.stories.tsx':
            "import { Button } from '@/ui/shadcn/button'",
        }),
      ),
    ).toEqual([])
  })

  it('a piece only a test or another piece imports still fails', () => {
    expect(
      piecesWithoutStory(
        frontend({
          'src/ui/a.tsx': "import { B } from './b'",
          'src/ui/b.tsx': '',
          'src/ui/b.test.tsx': "import { B } from './b'",
          'src/ui/a.stories.tsx': "import { A } from './a'",
        }),
      ),
    ).toEqual(['src/ui/b.tsx'])
  })

  it('what is not a piece (the `.ts`, the `.css`, the story, the test) needs no story', () => {
    expect(
      piecesWithoutStory(
        frontend({
          'src/ui/brand.ts': '',
          'src/ui/tokens.css': '',
          'src/ui/x.test.tsx': '',
          'src/ui/x.stories.tsx': '',
        }),
      ),
    ).toEqual([])
  })

  it('a type-only import does not count as a story', () => {
    expect(
      piecesWithoutStory(
        frontend({
          'src/ui/a.tsx': '',
          'src/ui/a.stories.tsx': "import type { A } from './a'",
        }),
      ),
    ).toEqual(['src/ui/a.tsx'])
  })

  it('in the repository, every `src/ui/` piece has a story', () => {
    expect(piecesWithoutStory()).toEqual([])
  })
})
