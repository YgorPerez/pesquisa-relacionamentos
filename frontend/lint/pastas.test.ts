import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, beforeAll, expect, it } from 'vite-plus/test'
import { foraDoLugar } from './pastas.ts'

let raiz: string

beforeAll(() => {
  raiz = mkdtempSync(join(tmpdir(), 'pastas-'))
  for (const arquivo of [
    // No lugar.
    'frontend/src/routes/$tema/$slug.tsx',
    'frontend/src/routes/__root.tsx',
    'frontend/src/ui/guia.tsx',
    'frontend/src/ui/guia.textos.ts',
    'frontend/src/ui/guia.css',
    'frontend/src/estado/perfil.ts',
    'frontend/src/platform/storybook/com-router.tsx',
    'frontend/src/router.tsx',
    'frontend/src/routeTree.gen.ts',
    'packages/rules/src/profile.ts',
    'packages/rules/src/profile.test.ts',
    // Fora.
    'frontend/src/routes/$tema/-cartao.tsx',
    'frontend/src/routes/guia.css',
    'frontend/src/routes/guia.test.ts',
    'frontend/src/components/botao.tsx',
    'frontend/src/lib/datas.ts',
    'frontend/src/util.ts',
    'frontend/src/ui/__tests__/guia.test.ts',
    'packages/rules/src/grupo/conta.ts',
  ]) {
    const caminho = join(raiz, arquivo)
    mkdirSync(dirname(caminho), { recursive: true })
    writeFileSync(caminho, '')
  }
})

afterAll(() => rmSync(raiz, { recursive: true, force: true }))

it('acha cada arquivo fora do lugar, e só eles', () => {
  expect(
    foraDoLugar(raiz)
      .map((a) => a.arquivo)
      .sort(),
  ).toEqual([
    'frontend/src/components/botao.tsx',
    'frontend/src/lib/datas.ts',
    'frontend/src/routes/$tema/-cartao.tsx',
    'frontend/src/routes/guia.css',
    'frontend/src/routes/guia.test.ts',
    'frontend/src/ui/__tests__/guia.test.ts',
    'frontend/src/util.ts',
    'packages/rules/src/grupo/conta.ts',
  ])
})

it('cada achado diz para onde o arquivo vai', () => {
  const doPacote = foraDoLugar(raiz).find((a) =>
    a.arquivo.startsWith('packages/'),
  )
  expect(doPacote?.motivo).toMatch(/subcaminho/)
})

it('o repositório de verdade está no lugar', () => {
  expect(foraDoLugar()).toEqual([])
})
