import { execFileSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test'
import { behindMain, link } from './prepare-worktree.ts'

const FOLDER = mkdtempSync(join(tmpdir(), 'prepare-worktree-'))
afterAll(() => rmSync(FOLDER, { recursive: true, force: true }))

// The tests' git does not read the machine's configuration: commit signing
// turned on there would ask for a key on every commit here.
const empty = join(FOLDER, 'gitconfig')
writeFileSync(empty, '')
const gitEnv = {
  ...process.env,
  GIT_CONFIG_GLOBAL: empty,
  GIT_CONFIG_NOSYSTEM: '1',
}

function git(folder: string, ...args: string[]) {
  return execFileSync(
    'git',
    ['-c', 'user.name=test', '-c', 'user.email=test@x', ...args],
    {
      cwd: folder,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: gitEnv,
    },
  ).trim()
}

function commit(folder: string, count: number) {
  for (let i = 0; i < count; i++)
    git(folder, 'commit', '--allow-empty', '--quiet', '-m', `c${i}`)
}

describe('behindMain', () => {
  const origin = join(FOLDER, 'origin')
  const clone = join(FOLDER, 'clone')

  beforeAll(() => {
    mkdirSync(origin)
    git(origin, 'init', '--quiet', '-b', 'main')
    commit(origin, 6)
    git(FOLDER, 'clone', '--quiet', origin, clone)
  })

  it('up to date with origin/main, says nothing', () => {
    git(clone, 'checkout', '--quiet', '--detach', 'origin/main')
    expect(behindMain(clone, gitEnv)).toEqual([])
  })

  it('on an old commit, says how many behind and how to update', () => {
    git(clone, 'checkout', '--quiet', '--detach', 'origin/main~5')
    expect(behindMain(clone, gitEnv)).toEqual([
      '5 commits behind origin/main. To update: git merge origin/main',
    ])
  })

  it('counts what the fetch brought, in the singular when it is one', () => {
    git(clone, 'checkout', '--quiet', '--detach', 'origin/main')
    commit(origin, 1)
    expect(behindMain(clone, gitEnv)).toEqual([
      '1 commit behind origin/main. To update: git merge origin/main',
    ])
  })

  it('offline, warns and compares with the origin/main it already had', () => {
    git(clone, 'remote', 'set-url', 'origin', join(FOLDER, 'does-not-exist'))
    git(clone, 'checkout', '--quiet', '--detach', 'origin/main~2')
    const [failure, behind, ...rest] = behindMain(clone, gitEnv)
    expect(failure).toMatch(
      /^git fetch failed \(.+\): comparing with the origin\/main that was already here\.$/,
    )
    expect(behind).toBe(
      '2 commits behind origin/main. To update: git merge origin/main',
    )
    expect(rest).toEqual([])
  })
})

describe('link', () => {
  let n = 0
  /** A main checkout with `relative` (a folder with one file, or a file) and
   * an empty worktree. */
  function checkouts(relative: string, kind: 'folder' | 'file') {
    const main = join(FOLDER, `main-${++n}`)
    const worktree = join(FOLDER, `worktree-${n}`)
    const target =
      kind === 'folder' ? join(main, relative, 'engine') : join(main, relative)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, 'from main')
    mkdirSync(worktree)
    return { main, worktree }
  }

  describe('a folder', () => {
    const RELATIVE = 'sources/private'
    const read = (worktree: string) =>
      readFileSync(join(worktree, RELATIVE, 'engine'), 'utf8')

    it("links the main checkout's, which follows what changes there", () => {
      const { main, worktree } = checkouts(RELATIVE, 'folder')
      expect(link(main, worktree, RELATIVE)).toBe(
        `${RELATIVE}: link to ${join(main, RELATIVE)}.`,
      )
      writeFileSync(join(main, RELATIVE, 'engine'), 'new')
      expect(read(worktree)).toBe('new')
      expect(link(main, worktree, RELATIVE)).toBe(
        `${RELATIVE}: already a link to the main checkout.`,
      )
    })

    it('when the system refuses the link, copies and says it is a copy', () => {
      const { main, worktree } = checkouts(RELATIVE, 'folder')
      const refuse = () => {
        throw Object.assign(new Error('refused'), { code: 'EPERM' })
      }
      expect(link(main, worktree, RELATIVE, refuse)).toMatch(
        /refused the link \(EPERM\), so it is a COPY/,
      )
      expect(read(worktree)).toBe('from main')
      expect(lstatSync(join(worktree, RELATIVE)).isSymbolicLink()).toBe(false)
    })

    it('one the worktree already has stays as it is', () => {
      const { main, worktree } = checkouts(RELATIVE, 'folder')
      mkdirSync(join(worktree, RELATIVE), { recursive: true })
      writeFileSync(join(worktree, RELATIVE, 'engine'), 'mine')
      expect(link(main, worktree, RELATIVE)).toBe(
        `${RELATIVE}: the worktree has its own. Kept.`,
      )
      expect(read(worktree)).toBe('mine')
    })

    it('redoes a broken link', () => {
      const { main, worktree } = checkouts(RELATIVE, 'folder')
      const gone = join(FOLDER, `gone-${n}`)
      mkdirSync(join(gone, RELATIVE), { recursive: true })
      link(gone, worktree, RELATIVE)
      rmSync(gone, { recursive: true })
      expect(existsSync(join(worktree, RELATIVE))).toBe(false)
      expect(link(main, worktree, RELATIVE)).toBe(
        `${RELATIVE}: link to ${join(main, RELATIVE)}.`,
      )
      expect(read(worktree)).toBe('from main')
    })

    it('without it in the main checkout, warns and moves on', () => {
      const { worktree } = checkouts(RELATIVE, 'folder')
      const empty = join(FOLDER, `empty-${n}`)
      mkdirSync(empty)
      expect(link(empty, worktree, RELATIVE)).toBe(
        `${RELATIVE}: the main checkout does not have it. Skipped.`,
      )
      expect(existsSync(join(worktree, RELATIVE))).toBe(false)
    })
  })

  describe('a file', () => {
    const RELATIVE = 'frontend/.env'

    it("links the main checkout's", () => {
      const { main, worktree } = checkouts(RELATIVE, 'file')
      link(main, worktree, RELATIVE)
      expect(lstatSync(join(worktree, RELATIVE)).isSymbolicLink()).toBe(true)
      expect(readFileSync(join(worktree, RELATIVE), 'utf8')).toBe('from main')
    })

    it('an equal copy, from an earlier run, becomes a link', () => {
      const { main, worktree } = checkouts(RELATIVE, 'file')
      mkdirSync(join(worktree, 'frontend'))
      writeFileSync(join(worktree, RELATIVE), 'from main')
      expect(link(main, worktree, RELATIVE)).toBe(
        `${RELATIVE}: link to ${join(main, RELATIVE)}.`,
      )
      expect(lstatSync(join(worktree, RELATIVE)).isSymbolicLink()).toBe(true)
    })

    it('a different one belongs to the worktree, and stays', () => {
      const { main, worktree } = checkouts(RELATIVE, 'file')
      mkdirSync(join(worktree, 'frontend'))
      writeFileSync(join(worktree, RELATIVE), 'mine')
      expect(link(main, worktree, RELATIVE)).toBe(
        `${RELATIVE}: the worktree has its own. Kept.`,
      )
      expect(readFileSync(join(worktree, RELATIVE), 'utf8')).toBe('mine')
    })
  })
})

describe('loading the script', () => {
  // It runs to install `node_modules`, so nothing it loads before running may
  // come from there (#461). A child `node` records every module the import
  // graph resolves; importing (not running) the script loads just that graph.
  it('reaches only node: modules and files of its own', () => {
    const script = new URL('./prepare-worktree.ts', import.meta.url).href
    const recorder = `
      import { registerHooks } from 'node:module'
      const loaded = []
      registerHooks({
        resolve(specifier, context, next) {
          const result = next(specifier, context)
          loaded.push(result.url)
          return result
        },
      })
      await import(${JSON.stringify(script)})
      console.log(JSON.stringify(loaded))
    `
    const loaded: string[] = JSON.parse(
      execFileSync(
        process.execPath,
        ['--input-type=module', '--eval', recorder],
        { encoding: 'utf8' },
      ),
    )
    const scripts = new URL('.', import.meta.url).href
    const outside = loaded.filter(
      (url) =>
        !url.startsWith('node:') &&
        !(url.startsWith(scripts) && !url.includes('/node_modules/')),
    )
    expect(loaded.length).toBeGreaterThan(0)
    expect(outside).toEqual([])
  })
})
