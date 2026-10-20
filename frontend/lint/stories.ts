// Toda peça de `src/ui/` abre no Storybook (ADR 0036, do `lint/stories.ts` e
// da ADR-0047 do Festival dos Macacos). Lá a conta é por tela: cada rota tem
// uma story que a abre. Aqui é por peça: cada `.tsx` de `src/ui/` (os
// controles de `ui/shadcn/` também) é importado por alguma story, e a peça
// que nenhuma story importa falha o `pnpm check`. Um teste, ou outra peça que
// a usa, não conta: a story é onde ela se vê e onde `pnpm test:stories` a
// abre no celular e no desktop.
//
// Lê os imports como texto, pelo parser do Vite, sem importar nada do app.
// Roda no `pnpm check`, depois das pastas:
//   node frontend/lint/stories.ts
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { parseSync } from 'vite-plus'

const RAIZ = resolve(import.meta.dirname, '..')

const PECA = /\.tsx$/
const NAO_E_PECA = /\.(stories|test)\.tsx$/

function arquivos(pasta: string): string[] {
  if (!existsSync(pasta)) return []
  return readdirSync(pasta, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name))
}

/** O caminho, relativo a `frontend/` e com `/`, de cada import com valor do
 * arquivo que aponta para dentro de `src/`: o relativo, o `#/` e o `@/`. */
function importados(raiz: string, arquivo: string): string[] {
  const { program } = parseSync(arquivo, readFileSync(arquivo, 'utf8'))
  return program.body.flatMap((no) => {
    if (no.type !== 'ImportDeclaration' || no.importKind === 'type') return []
    const de = String(no.source.value)
    const alvo = /^[#@]\//.test(de)
      ? join(raiz, 'src', de.slice(2))
      : de.startsWith('.')
        ? join(dirname(arquivo), de)
        : null
    return alvo
      ? [
          relative(raiz, alvo)
            .split(sep)
            .join('/')
            .replace(/\.tsx$/, ''),
        ]
      : []
  })
}

/** Cada peça de `src/ui/` que nenhuma story importa, relativa a
 * `frontend/`. */
export function pecasSemStory(raiz = RAIZ): string[] {
  const doFront = (a: string) => relative(raiz, a).split(sep).join('/')
  const pecas = arquivos(join(raiz, 'src', 'ui'))
    .filter((a) => PECA.test(a) && !NAO_E_PECA.test(a))
    .map(doFront)
  const vistas = new Set(
    arquivos(join(raiz, 'src'))
      .filter((a) => a.endsWith('.stories.tsx'))
      .flatMap((a) => importados(raiz, a)),
  )
  return pecas.filter((p) => !vistas.has(p.replace(/\.tsx$/, ''))).sort()
}

if (import.meta.main) {
  const sem = pecasSemStory()
  for (const peca of sem)
    console.error(
      `[stories] ${peca}: nenhuma story importa esta peça. Escreva ao lado dela uma \`<nome>.stories.tsx\` que a mostre, ou ponha-a numa story que já existe.`,
    )
  if (sem.length > 0) process.exit(1)
}
