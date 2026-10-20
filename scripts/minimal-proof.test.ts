import { describe, expect, it } from 'vite-plus/test'
import { proofPlan } from './minimal-proof.ts'

const exists = (file: string) => !file.includes('deleted')
const plan = (files: string[]) => proofPlan({ files, base: 'abc1234', exists })
const names = (steps: ReturnType<typeof plan>) =>
  steps.map((p) => (p.skip ? `skip ${p.name}` : p.name))

describe('proofPlan', () => {
  it("an app component: the frontend's types and tests, the folders and the file's check", () => {
    const steps = plan(['frontend/src/ui/perfil.tsx'])
    expect(names(steps)).toEqual([
      'types:frontend',
      'vitest:frontend',
      'folders',
      'components',
      'check',
      'skip stories',
    ])
    expect(steps.find((p) => p.name === 'vitest:frontend')).toMatchObject({
      folder: 'frontend',
      command: [
        'pnpm',
        'exec',
        'vp',
        'test',
        'run',
        '--changed',
        'abc1234',
        '--passWithNoTests',
      ],
    })
    expect(steps.find((p) => p.name === 'check')?.command).toEqual([
      'pnpm',
      'exec',
      'vp',
      'check',
      '--no-error-on-unmatched-pattern',
      'frontend/src/ui/perfil.tsx',
    ])
  })

  it("a pure package brings along the app's types and tests, since the app imports it", () => {
    expect(names(plan(['packages/rules/src/possible-group.ts']))).toEqual(
      expect.arrayContaining([
        'types:@tem-estudo/rules',
        'types:frontend',
        'vitest:packages/rules',
        'vitest:frontend',
      ]),
    )
  })

  it('a root script: the root tests, without package types', () => {
    expect(names(plan(['scripts/affected.ts']))).toEqual(['vitest:.', 'check'])
  })

  it('a deleted file does not go to the check; text does, for the format', () => {
    const steps = plan(['scripts/deleted.ts', 'AGENTS.md', 'scripts/x.ts'])
    expect(steps.find((p) => p.name === 'check')?.command.slice(5)).toEqual([
      'AGENTS.md',
      'scripts/x.ts',
    ])
  })

  it('text only: only the check of the text', () => {
    expect(names(plan(['docs/agents/integracao.md']))).toEqual(['check'])
  })
})
