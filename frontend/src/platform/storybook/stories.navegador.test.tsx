// Cada story abre num Chrome de verdade (`vitest.stories.config.ts`), no
// celular e no desktop, e quebra se lançar, se o `play` dela falhar ou se
// escrever erro ou aviso no console. Roda com `pnpm test:stories`, fora do
// `pnpm test`: o navegador pesa.
import { composeStories } from '@storybook/react-vite'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vite-plus/test'

const MODULOS = import.meta.glob<Parameters<typeof composeStories>[0]>('../../**/*.stories.tsx', { eager: true })

/** Uma chamada do console em texto, com a mensagem de cada erro. */
const emTexto = (chamada: unknown[]) =>
  chamada.map((valor) => (valor instanceof Error ? `${valor.name}: ${valor.message}` : String(valor))).join(' ')

let erros: MockInstance<typeof console.error>
let avisos: MockInstance<typeof console.warn>
beforeEach(() => {
  erros = vi.spyOn(console, 'error')
  avisos = vi.spyOn(console, 'warn')
})
afterEach(() => vi.restoreAllMocks())

it('acha as stories', () => {
  expect(Object.keys(MODULOS).length).toBeGreaterThan(0)
})

const ARQUIVOS = Object.entries(MODULOS)
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([arquivo, modulo]) => [arquivo.replace(/^(\.\.\/)+/, ''), modulo] as const)

describe.each(ARQUIVOS)('%s', (_arquivo, modulo) => {
  const stories = Object.entries(composeStories(modulo)) as Array<[string, { run: () => Promise<void> }]>
  it.each(stories)('%s', async (_nome, story) => {
    await story.run()
    expect([...erros.mock.calls, ...avisos.mock.calls].map(emTexto)).toEqual([])
  })
})
