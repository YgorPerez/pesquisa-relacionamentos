import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { pecasSemStory } from './stories.ts'

let raiz: string | undefined

/** Um `frontend/` de mentira, com os arquivos dados. */
function frontend(arquivos: Record<string, string>) {
  raiz = mkdtempSync(join(tmpdir(), 'stories-'))
  for (const [caminho, texto] of Object.entries(arquivos)) {
    mkdirSync(dirname(join(raiz, caminho)), { recursive: true })
    writeFileSync(join(raiz, caminho), texto)
  }
  return raiz
}

afterEach(() => {
  if (raiz) rmSync(raiz, { recursive: true, force: true })
  raiz = undefined
})

describe('pecasSemStory', () => {
  it('a peça que nenhuma story importa falha', () => {
    expect(
      pecasSemStory(
        frontend({
          'src/ui/selo.tsx': 'export const Selo = () => null',
          'src/ui/botao.tsx': 'export const Botao = () => null',
          'src/ui/botao.stories.tsx': "import { Botao } from './botao'",
        }),
      ),
    ).toEqual(['src/ui/selo.tsx'])
  })

  it('a story pode morar em outro arquivo e importar pelos apelidos do app', () => {
    expect(
      pecasSemStory(
        frontend({
          'src/ui/guia.tsx': '',
          'src/ui/secao.tsx': '',
          'src/ui/shadcn/button.tsx': '',
          'src/ui/prateleira.stories.tsx': [
            "import { Guia } from '#/ui/guia'",
            "import { Secao } from '@/ui/secao.tsx'",
          ].join('\n'),
          'src/platform/storybook/controles.stories.tsx':
            "import { Button } from '@/ui/shadcn/button'",
        }),
      ),
    ).toEqual([])
  })

  it('a peça que só um teste ou outra peça importa ainda falha', () => {
    expect(
      pecasSemStory(
        frontend({
          'src/ui/a.tsx': "import { B } from './b'",
          'src/ui/b.tsx': '',
          'src/ui/b.test.tsx': "import { B } from './b'",
          'src/ui/a.stories.tsx': "import { A } from './a'",
        }),
      ),
    ).toEqual(['src/ui/b.tsx'])
  })

  it('o que não é peça (o `.ts`, o `.css`, a story, o teste) não pede story', () => {
    expect(
      pecasSemStory(
        frontend({
          'src/ui/marca.ts': '',
          'src/ui/tokens.css': '',
          'src/ui/x.test.tsx': '',
          'src/ui/x.stories.tsx': '',
        }),
      ),
    ).toEqual([])
  })

  it('o import só de tipo não conta como story', () => {
    expect(
      pecasSemStory(
        frontend({
          'src/ui/a.tsx': '',
          'src/ui/a.stories.tsx': "import type { A } from './a'",
        }),
      ),
    ).toEqual(['src/ui/a.tsx'])
  })

  it('no repositório, toda peça de `src/ui/` tem story', () => {
    expect(pecasSemStory()).toEqual([])
  })
})
