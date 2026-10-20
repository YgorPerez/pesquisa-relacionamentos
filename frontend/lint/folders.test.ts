import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, beforeAll, expect, it } from 'vite-plus/test'
import { outOfPlace } from './folders.ts'

let root: string

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'folders-'))
  for (const file of [
    // In place.
    'frontend/src/routes/$tema/$slug.tsx',
    'frontend/src/routes/__root.tsx',
    'frontend/src/ui/guide.tsx',
    'frontend/src/ui/guide.copy.ts',
    'frontend/src/ui/guide.css',
    'frontend/src/state/profile.ts',
    'frontend/src/platform/storybook/with-router.tsx',
    'frontend/src/router.tsx',
    'frontend/src/routeTree.gen.ts',
    'packages/rules/src/profile.ts',
    'packages/rules/src/profile.test.ts',
    // Out of place.
    'frontend/src/routes/$tema/-card.tsx',
    'frontend/src/routes/guide.css',
    'frontend/src/routes/guide.test.ts',
    'frontend/src/components/button.tsx',
    'frontend/src/lib/dates.ts',
    'frontend/src/util.ts',
    'frontend/src/ui/__tests__/guide.test.ts',
    'packages/rules/src/group/count.ts',
  ]) {
    const path = join(root, file)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, '')
  }
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

it('finds each file out of place, and only those', () => {
  expect(
    outOfPlace(root)
      .map((a) => a.file)
      .sort(),
  ).toEqual([
    'frontend/src/components/button.tsx',
    'frontend/src/lib/dates.ts',
    'frontend/src/routes/$tema/-card.tsx',
    'frontend/src/routes/guide.css',
    'frontend/src/routes/guide.test.ts',
    'frontend/src/ui/__tests__/guide.test.ts',
    'frontend/src/util.ts',
    'packages/rules/src/group/count.ts',
  ])
})

it('each finding says where the file goes', () => {
  const fromPackage = outOfPlace(root).find((a) =>
    a.file.startsWith('packages/'),
  )
  expect(fromPackage?.reason).toMatch(/subpath/)
})

it('the real repository is in place', () => {
  expect(outOfPlace()).toEqual([])
})
