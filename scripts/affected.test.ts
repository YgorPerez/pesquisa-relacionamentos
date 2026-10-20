import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { diffAgainst, planForDiff, SPEC_TERMS } from './affected.ts'
import { ROOT } from './ports.ts'

describe('SPEC_TERMS', () => {
  it('has every e2e spec, and only them', () => {
    const specs = readdirSync(join(ROOT, 'frontend/e2e')).filter((a) =>
      a.endsWith('.e2e.ts'),
    )
    expect(Object.keys(SPEC_TERMS).sort()).toEqual(specs.sort())
  })
})

describe('planForDiff', () => {
  it("a screen's component runs the frontend and the specs of its term", () => {
    const plan = planForDiff(['frontend/src/ui/perfil.tsx'])
    expect(plan.full).toBeNull()
    expect(plan.packages).toEqual(['frontend'])
    expect(plan.stories).toBe(true)
    expect(plan.build).toBe(true)
    expect(plan.specs).toEqual([
      'acessibilidade.e2e.ts',
      'inicio.e2e.ts',
      'perfil.e2e.ts',
    ])
  })

  it('the route and the state reach their term through the alias', () => {
    expect(planForDiff(['frontend/src/routes/$tema/$slug.tsx']).specs).toEqual(
      expect.arrayContaining([
        'guia.e2e.ts',
        'busca.e2e.ts',
        'navegacao.e2e.ts',
      ]),
    )
    expect(
      planForDiff(['frontend/src/estado/pacotes-do-grupo.ts']).specs,
    ).toContain('grupo-possivel.e2e.ts')
    // A story imports the state the screen reads.
    expect(planForDiff(['frontend/src/estado/perfil.ts']).stories).toBe(true)
  })

  it('a changed spec runs itself, without the stories', () => {
    const plan = planForDiff(['frontend/e2e/link.e2e.ts'])
    expect(plan.specs).toEqual(['link.e2e.ts'])
    expect(plan.stories).toBe(false)
  })

  it('an app file without a term runs the whole e2e and says why', () => {
    const plan = planForDiff(['frontend/src/ui/botao.tsx'])
    expect(plan.full).toBeNull()
    expect(plan.specs).toEqual(Object.keys(SPEC_TERMS).sort())
    expect(plan.reasons.join()).toContain('botao')
  })

  it('what changes outside the graph runs everything', () => {
    for (const file of [
      'pnpm-lock.yaml',
      'frontend/package.json',
      'frontend/vite.config.ts',
      'frontend/src/routes/__root.tsx',
      'frontend/src/styles.css',
      'frontend/src/ui/tokens.css',
      'frontend/src/ui/desenhos.css',
      'frontend/src/ui/fontes.css',
      'frontend/src/platform/redirecionamento.ts',
      'packages/rules/src/possible-group.ts',
      'frontend/e2e/acervo/estudos/x.md',
      'scripts/machine-queue.ts',
      '.github/workflows/pr.yml',
    ])
      expect({ file, full: planForDiff([file]).full }).toEqual({
        file,
        full: expect.any(String),
      })
  })

  it('a root script runs only the root tests', () => {
    const plan = planForDiff(['scripts/affected.ts', '.github/scripts/x.ts'])
    expect(plan).toMatchObject({
      full: null,
      packages: ['.'],
      specs: [],
      build: false,
      stories: false,
    })
  })

  it('the library runs Content and the build, which reads it', () => {
    expect(planForDiff(['estudos/costa-2018.md'])).toMatchObject({
      packages: ['packages/content'],
      build: true,
      specs: [],
    })
  })

  it('text only runs nothing', () => {
    expect(
      planForDiff([
        'AGENTS.md',
        'docs/adr/0001.md',
        '.claude/skills/x/SKILL.md',
      ]),
    ).toMatchObject({ packages: [], specs: [], build: false, stories: false })
  })
})

describe('diffAgainst', () => {
  const folder = mkdtempSync(join(tmpdir(), 'affected-'))
  afterAll(() => rmSync(folder, { recursive: true, force: true }))
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: folder, encoding: 'utf8' }).trim()

  it('gives the merge-base and what changed since it, uncommitted changes included', () => {
    git('init', '-q', '-b', 'main')
    git('config', 'user.email', 'test@example.com')
    git('config', 'user.name', 'Test')
    writeFileSync(join(folder, 'a.txt'), 'a')
    git('add', '.')
    git('commit', '-qm', 'a')
    const base = git('rev-parse', 'HEAD')
    git('switch', '-qc', 'branch')
    writeFileSync(join(folder, 'b.txt'), 'b')
    git('add', '.')
    git('commit', '-qm', 'b')
    writeFileSync(join(folder, 'c.txt'), 'c')
    expect(diffAgainst(folder, 'main', { fetch: false })).toEqual({
      base,
      files: ['b.txt', 'c.txt'],
    })
  })
})
