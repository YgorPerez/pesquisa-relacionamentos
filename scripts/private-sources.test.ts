import { execFileSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test'
import {
  dropLegacyLink,
  ensurePrivateSources,
  privateRemoteFor,
} from './private-sources.ts'

const FOLDER = mkdtempSync(join(tmpdir(), 'private-sources-'))
afterAll(() => rmSync(FOLDER, { recursive: true, force: true }))

// The machine's git configuration stays out (commit signing, credential
// helpers).
const emptyConfig = join(FOLDER, 'gitconfig')
writeFileSync(emptyConfig, '')
const env = {
  ...process.env,
  GIT_CONFIG_GLOBAL: emptyConfig,
  GIT_CONFIG_NOSYSTEM: '1',
}

function git(folder: string, ...args: string[]) {
  return execFileSync(
    'git',
    ['-c', 'user.name=test', '-c', 'user.email=test@x', ...args],
    { cwd: folder, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env },
  ).trim()
}

/** The private repo, a bare one with one source in it, next to where the
 * public `origin` of each main checkout points. */
const PRIVATE = join(FOLDER, 'public-fontes.git')
beforeAll(() => {
  const work = join(FOLDER, 'private-work')
  mkdirSync(work)
  git(work, 'init', '--quiet', '-b', 'main')
  writeFileSync(join(work, 'lima-2021.txt'), 'the full text')
  git(work, 'add', '.')
  git(work, 'commit', '--quiet', '-m', 'a source')
  git(FOLDER, 'clone', '--quiet', '--bare', work, PRIVATE)
})

let n = 0
/** A main checkout whose `origin` is `<FOLDER>/public.git`. */
function mainCheckout() {
  const main = join(FOLDER, `main-${++n}`)
  mkdirSync(main)
  git(main, 'init', '--quiet', '-b', 'main')
  git(main, 'remote', 'add', 'origin', join(FOLDER, 'public.git'))
  return main
}

describe('privateRemoteFor', () => {
  it('names the private repo in the form of the public origin', () => {
    expect(
      privateRemoteFor(
        'https://github.com/YgorPerez/pesquisa-relacionamentos.git',
      ),
    ).toBe('https://github.com/YgorPerez/pesquisa-relacionamentos-fontes.git')
    expect(
      privateRemoteFor('git@github.com:YgorPerez/pesquisa-relacionamentos'),
    ).toBe('git@github.com:YgorPerez/pesquisa-relacionamentos-fontes.git')
  })
})

describe('ensurePrivateSources', () => {
  it("clones the private repo next to the origin, with the main checkout's credential helpers", () => {
    const main = mainCheckout()
    git(main, 'config', '--add', 'credential.helper', '')
    git(main, 'config', '--add', 'credential.helper', '!echo pinned')
    expect(ensurePrivateSources(main, { env })).toEqual([
      `sources/private: cloned from ${PRIVATE}.`,
    ])
    const clone = join(main, 'sources/private')
    expect(readFileSync(join(clone, 'lima-2021.txt'), 'utf8')).toBe(
      'the full text',
    )
    // Untrimmed: the empty first value resets the global helpers.
    const helpers = execFileSync(
      'git',
      ['config', '--local', '--get-all', 'credential.helper'],
      { cwd: clone, encoding: 'utf8', env },
    )
    expect(helpers).toBe('\n!echo pinned\n')
  })

  it('leaves a clone that is already there alone', () => {
    const main = mainCheckout()
    ensurePrivateSources(main, { env })
    expect(ensurePrivateSources(main, { env })).toEqual([])
  })

  it('without access, says so in one line and leaves no folder behind', () => {
    const main = mainCheckout()
    const remote = join(FOLDER, 'no-access.git')
    const lines = ensurePrivateSources(main, { env, remote })
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatch(
      new RegExp(
        `^sources/private: could not clone ${remote} \\(.+\\)\\. .*ask YgorPerez for access`,
      ),
    )
    expect(existsSync(join(main, 'sources/private'))).toBe(false)
  })

  it('keeps a plain folder and says it is not a clone', () => {
    const main = mainCheckout()
    mkdirSync(join(main, 'sources/private'), { recursive: true })
    expect(ensurePrivateSources(main, { env })).toEqual([
      'sources/private: a folder, not a clone of the private repo. Kept; its files reach CI only once they are pushed there.',
    ])
  })

  it('points at files left in the old fontes/privado', () => {
    const main = mainCheckout()
    mkdirSync(join(main, 'fontes/privado'), { recursive: true })
    writeFileSync(join(main, 'fontes/privado/a.pdf'), '')
    expect(ensurePrivateSources(main, { env })[0]).toBe(
      'fontes/privado still has 1 file, which nothing reads now: move them into sources/private/, then commit and push there.',
    )
    rmSync(join(main, 'fontes/privado/a.pdf'))
    expect(ensurePrivateSources(main, { env })).toEqual([
      'fontes/privado is empty and nothing reads it now: delete it.',
    ])
  })
})

describe('dropLegacyLink', () => {
  function checkouts() {
    const main = mainCheckout()
    const worktree = join(FOLDER, `worktree-${n}`)
    mkdirSync(join(main, 'fontes/privado'), { recursive: true })
    mkdirSync(join(worktree, 'sources'), { recursive: true })
    return { main, worktree, target: join(worktree, 'sources/private') }
  }

  it('removes the link a worktree kept to the old fontes/privado', () => {
    const { main, worktree, target } = checkouts()
    symlinkSync(join(main, 'fontes/privado'), target, 'junction')
    expect(dropLegacyLink(main, worktree)).toBe(
      'sources/private: removed the link to the old fontes/privado.',
    )
    expect(lstatSync(target, { throwIfNoEntry: false })).toBeUndefined()
  })

  it('leaves any other link or folder alone', () => {
    const { main, worktree, target } = checkouts()
    expect(dropLegacyLink(main, worktree)).toBeNull()
    symlinkSync(join(FOLDER, 'elsewhere'), target, 'junction')
    expect(dropLegacyLink(main, worktree)).toBeNull()
    expect(lstatSync(target).isSymbolicLink()).toBe(true)
  })
})
