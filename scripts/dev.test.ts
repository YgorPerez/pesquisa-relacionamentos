import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { comandoDoUso } from './dev.ts'
import { portaDoCheckout } from './portas.ts'

const PASTA = mkdtempSync(join(tmpdir(), 'dev-'))
afterAll(() => rmSync(PASTA, { recursive: true, force: true }))

const principal = join(PASTA, 'principal')
mkdirSync(join(principal, '.git'), { recursive: true })
const worktree = join(PASTA, 'worktree')
mkdirSync(worktree)
writeFileSync(join(worktree, '.git'), 'gitdir: /x\n')

describe('comandoDoUso', () => {
  it('o dev do principal é o `vp dev` na 4310, que recusa a porta ocupada', () => {
    expect(comandoDoUso('dev', {}, principal)).toEqual({
      porta: 4310,
      comando: 'pnpm exec vp dev --port 4310 --strictPort',
      env: {},
    })
  })

  it('num worktree, cada uso na porta do bloco dele', () => {
    const start = portaDoCheckout('start', worktree)
    expect(comandoDoUso('start', {}, worktree)).toEqual({
      porta: start,
      comando: 'node .output/server/index.mjs',
      env: { PORT: String(start) },
    })
    const storybook = portaDoCheckout('storybook', worktree)
    expect(comandoDoUso('storybook', {}, worktree).comando).toBe(
      `pnpm exec storybook dev --port ${storybook} --no-open --exact-port`,
    )
  })

  it('a porta do ambiente vale mais que a do bloco', () => {
    expect(comandoDoUso('dev', { DEV_PORTA: '5000' }, worktree).porta).toBe(
      5000,
    )
    expect(
      comandoDoUso('storybook', { STORYBOOK_PORTA: '5001' }, worktree).porta,
    ).toBe(5001)
    expect(
      comandoDoUso('start', { START_PORTA: '5002' }, worktree).env,
    ).toEqual({ PORT: '5002' })
  })

  it('o PORT genérico do shell não muda nada: outra ferramenta pode tê-lo posto', () => {
    expect(comandoDoUso('start', { PORT: '3000' }, principal).porta).toBe(4311)
  })

  it('uma porta que não é número para tudo, dizendo qual variável', () => {
    expect(() => comandoDoUso('dev', { DEV_PORTA: 'abc' }, principal)).toThrow(
      'DEV_PORTA="abc": esperado uma porta, de 1 a 65535',
    )
  })
})
