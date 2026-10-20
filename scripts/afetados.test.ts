import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { diffContra, planoDoDiff, TERMOS_DAS_SPECS } from './afetados.ts'
import { RAIZ } from './portas.ts'

describe('TERMOS_DAS_SPECS', () => {
  it('tem cada spec do e2e, e só elas', () => {
    const specs = readdirSync(join(RAIZ, 'frontend/e2e')).filter((a) =>
      a.endsWith('.e2e.ts'),
    )
    expect(Object.keys(TERMOS_DAS_SPECS).sort()).toEqual(specs.sort())
  })
})

describe('planoDoDiff', () => {
  it('uma peça de uma tela roda o front e as specs do termo dela', () => {
    const plano = planoDoDiff(['frontend/src/ui/perfil.tsx'])
    expect(plano.completo).toBeNull()
    expect(plano.pacotes).toEqual(['frontend'])
    expect(plano.stories).toBe(true)
    expect(plano.build).toBe(true)
    expect(plano.specs).toEqual([
      'acessibilidade.e2e.ts',
      'inicio.e2e.ts',
      'perfil.e2e.ts',
    ])
  })

  it('a rota e o estado chegam ao termo pelo apelido', () => {
    expect(planoDoDiff(['frontend/src/routes/$tema/$slug.tsx']).specs).toEqual(
      expect.arrayContaining([
        'guia.e2e.ts',
        'busca.e2e.ts',
        'navegacao.e2e.ts',
      ]),
    )
    expect(
      planoDoDiff(['frontend/src/estado/pacotes-do-grupo.ts']).specs,
    ).toContain('grupo-possivel.e2e.ts')
    // Uma story importa o estado que a tela lê.
    expect(planoDoDiff(['frontend/src/estado/perfil.ts']).stories).toBe(true)
  })

  it('uma spec que mudou roda ela mesma, sem as stories', () => {
    const plano = planoDoDiff(['frontend/e2e/link.e2e.ts'])
    expect(plano.specs).toEqual(['link.e2e.ts'])
    expect(plano.stories).toBe(false)
  })

  it('um arquivo do app sem termo roda o e2e inteiro e diz por quê', () => {
    const plano = planoDoDiff(['frontend/src/ui/botao.tsx'])
    expect(plano.completo).toBeNull()
    expect(plano.specs).toEqual(Object.keys(TERMOS_DAS_SPECS).sort())
    expect(plano.motivos.join()).toContain('botao')
  })

  it('o que muda por fora do grafo roda tudo', () => {
    for (const arquivo of [
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
      'scripts/fila-da-maquina.ts',
      '.github/workflows/pr.yml',
    ])
      expect({ arquivo, completo: planoDoDiff([arquivo]).completo }).toEqual({
        arquivo,
        completo: expect.any(String),
      })
  })

  it('um script da raiz roda só os testes da raiz', () => {
    const plano = planoDoDiff(['scripts/afetados.ts', '.github/scripts/x.ts'])
    expect(plano).toMatchObject({
      completo: null,
      pacotes: ['.'],
      specs: [],
      build: false,
      stories: false,
    })
  })

  it('o acervo roda o Conteúdo e o build, que o lê', () => {
    expect(planoDoDiff(['estudos/costa-2018.md'])).toMatchObject({
      pacotes: ['packages/content'],
      build: true,
      specs: [],
    })
  })

  it('só texto não roda nada', () => {
    expect(
      planoDoDiff([
        'AGENTS.md',
        'docs/adr/0001.md',
        '.claude/skills/x/SKILL.md',
      ]),
    ).toMatchObject({ pacotes: [], specs: [], build: false, stories: false })
  })
})

describe('diffContra', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'afetados-'))
  afterAll(() => rmSync(pasta, { recursive: true, force: true }))
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: pasta, encoding: 'utf8' }).trim()

  it('dá o merge-base e o que mudou desde ele, o que não foi commitado inclusive', () => {
    git('init', '-q', '-b', 'main')
    git('config', 'user.email', 'teste@exemplo.com')
    git('config', 'user.name', 'Teste')
    writeFileSync(join(pasta, 'a.txt'), 'a')
    git('add', '.')
    git('commit', '-qm', 'a')
    const base = git('rev-parse', 'HEAD')
    git('switch', '-qc', 'ramo')
    writeFileSync(join(pasta, 'b.txt'), 'b')
    git('add', '.')
    git('commit', '-qm', 'b')
    writeFileSync(join(pasta, 'c.txt'), 'c')
    expect(diffContra(pasta, 'main', { buscar: false })).toEqual({
      base,
      arquivos: ['b.txt', 'c.txt'],
    })
  })
})
