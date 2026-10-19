import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { instalarHooks } from './instalar-hooks.ts'
import { semGitDoHook } from './registro-da-suite.ts'

const temporarios: string[] = []
afterEach(() => {
  for (const pasta of temporarios.splice(0))
    rmSync(pasta, { recursive: true, force: true })
})

const git = (cwd: string, ...args: string[]) =>
  spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: semGitDoHook(),
  }).stdout.trim()

function repositorio({ comHook = true } = {}) {
  const raiz = mkdtempSync(join(tmpdir(), 'instalar-hooks-'))
  temporarios.push(raiz)
  git(raiz, 'init', '-q')
  if (comHook) {
    mkdirSync(join(raiz, '.githooks'))
    writeFileSync(join(raiz, '.githooks/pre-push'), '#!/bin/sh\n')
  }
  return raiz
}

describe('instalarHooks', () => {
  it('liga o core.hooksPath, e de novo diz que já está', () => {
    const raiz = repositorio()
    expect(instalarHooks(raiz).ok).toBe(true)
    expect(git(raiz, 'config', '--get', 'core.hooksPath')).toBe('.githooks')
    expect(instalarHooks(raiz)).toMatchObject({
      ok: true,
      texto: expect.stringMatching(/^já instalado/),
    })
  })

  it('o caminho absoluto do .githooks deste checkout conta como instalado', () => {
    const raiz = repositorio()
    git(raiz, 'config', '--local', 'core.hooksPath', join(raiz, '.githooks'))
    expect(instalarHooks(raiz).texto).toMatch(/^já instalado/)
  })

  it('não troca um core.hooksPath de outro lugar, nem desliga um hook que existe', () => {
    const outro = repositorio()
    git(outro, 'config', '--local', 'core.hooksPath', '/outro/lugar')
    expect(instalarHooks(outro)).toMatchObject({ ok: false })
    expect(git(outro, 'config', '--get', 'core.hooksPath')).toBe('/outro/lugar')

    const comHook = repositorio()
    writeFileSync(join(comHook, '.git/hooks/pre-commit'), '#!/bin/sh\n')
    expect(instalarHooks(comHook).texto).toMatch(/pre-commit/)
    expect(git(comHook, 'config', '--get', 'core.hooksPath')).toBe('')
  })

  it('sem o .githooks/pre-push, não há o que instalar', () => {
    expect(instalarHooks(repositorio({ comHook: false })).ok).toBe(false)
  })
})
