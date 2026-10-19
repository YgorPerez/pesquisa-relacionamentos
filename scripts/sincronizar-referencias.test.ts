import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test'
import { sincronizar, versaoDoEffect } from './sincronizar-referencias.ts'

describe('versaoDoEffect', () => {
  it('lê o effect do catálogo, mesmo depois de um comentário', () => {
    const workspace = [
      'packages:',
      '  - frontend',
      '',
      'catalog:',
      "  '@effect/tsgo': 0.53.4",
      '  # O Schema só decodifica igual com o mesmo `effect`.',
      '  effect: 4.0.2',
      '  typescript: 7.0.2',
    ].join('\n')
    expect(versaoDoEffect(workspace)).toBe('4.0.2')
  })

  it('um effect fora do catálogo não conta', () => {
    expect(versaoDoEffect('overrides:\n  effect: 3.0.0\n')).toBeUndefined()
  })
})

describe('sincronizar', () => {
  const PASTA = mkdtempSync(join(tmpdir(), 'referencias-'))
  const origem = join(PASTA, 'effect')
  const destino = join(PASTA, 'repo/.repos/effect-smol')
  const env = {
    ...process.env,
    GIT_CONFIG_GLOBAL: join(PASTA, 'gitconfig'),
    GIT_CONFIG_NOSYSTEM: '1',
  }
  const git = (...args: string[]) =>
    execFileSync(
      'git',
      ['-c', 'user.name=teste', '-c', 'user.email=teste@x', ...args],
      { cwd: origem, env, stdio: 'ignore' },
    )

  beforeAll(() => {
    writeFileSync(env.GIT_CONFIG_GLOBAL, '')
    mkdirSync(origem)
    git('init', '--quiet', '-b', 'main')
    writeFileSync(join(origem, 'LLMS.md'), 'v1')
    git('add', '.')
    git('commit', '--quiet', '-m', 'v1')
    git('tag', 'effect@4.0.1')
    writeFileSync(join(origem, 'LLMS.md'), 'v2')
    git('commit', '--quiet', '-am', 'v2')
    // Um commit leva a tag de cada pacote que sai junto.
    git('tag', 'effect@4.0.2')
    git('tag', '@effect/vitest@4.0.2')
  })
  afterAll(() => rmSync(PASTA, { recursive: true, force: true }))

  it('clona a tag da versão, e não faz nada quando já está nela', () => {
    expect(sincronizar({ versao: '4.0.1', destino, origem, env })).toBe(
      `.repos/effect-smol vai para effect@4.0.1, clonado de ${origem}.`,
    )
    expect(existsSync(join(destino, 'LLMS.md'))).toBe(true)
    expect(sincronizar({ versao: '4.0.1', destino, origem, env })).toBe(
      '.repos/effect-smol já está em effect@4.0.1.',
    )
  })

  it('a versão nova do catálogo clona de novo', () => {
    expect(sincronizar({ versao: '4.0.2', destino, origem, env })).toBe(
      `.repos/effect-smol sai de effect@4.0.1 e vai para effect@4.0.2, clonado de ${origem}.`,
    )
    expect(sincronizar({ versao: '4.0.2', destino, origem, env })).toBe(
      '.repos/effect-smol já está em effect@4.0.2.',
    )
  })

  it('uma tag que não existe falha com o que o git disse', () => {
    expect(() =>
      sincronizar({
        versao: '9.9.9',
        destino: join(PASTA, 'outro'),
        origem,
        env,
      }),
    ).toThrow(/effect@9\.9\.9/)
  })
})
