// Onde um arquivo pode morar (ADR 0014, do ADR-0049 do Festival dos Macacos).
// Cada pasta de `frontend/src/` tem um papel (`AGENTS.md`, "Onde um arquivo
// mora"), e os pacotes são planos. Nenhum linter olha a árvore, então é este
// script que olha: lista o que está fora do lugar e sai com erro.
//
// Roda no `pnpm check`, logo depois do `vp check`:
//   node frontend/lint/pastas.ts
import { existsSync, readdirSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

const RAIZ = resolve(import.meta.dirname, '..', '..')

type Regra = {
  /** A pasta que a regra olha, relativa à raiz do repositório. */
  pasta: string
  /** O arquivo, relativo à pasta, que está fora do lugar. */
  fora: (arquivo: string) => boolean
  motivo: string
}

/** As pastas de `frontend/src/`, cada uma com o seu papel. */
const PASTAS_DO_APP = [
  'analytics',
  'conteudo',
  'estado',
  'fontes',
  'platform',
  'routes',
  'ui',
]

/** Os arquivos soltos na raiz de `frontend/src/`: os que o TanStack Start e o
 * Vite procuram ali, e o que o TanStack Router gera. */
const SOLTOS_DO_APP = [
  'router.tsx',
  'server.ts',
  'styles.css',
  'reset.d.ts',
  'routeTree.gen.ts',
]

const REGRAS: Regra[] = [
  {
    pasta: 'frontend/src/routes',
    fora: (a) =>
      !a.endsWith('.tsx') ||
      a.endsWith('.test.tsx') ||
      a.split('/').some((parte) => parte.startsWith('-')),
    motivo:
      'routes/ tem só arquivos de rota. A peça da página vai para `ui/`, a leitura do acervo para `conteudo/`, o estado do navegador para `estado/`.',
  },
  {
    pasta: 'frontend/src',
    fora: (a) =>
      a.includes('/')
        ? !PASTAS_DO_APP.includes(a.split('/')[0]!)
        : !SOLTOS_DO_APP.includes(a),
    motivo: `frontend/src/ tem só ${PASTAS_DO_APP.map((p) => `${p}/`).join(', ')} e os arquivos que o Start procura na raiz. Uma peça nova vai para uma delas; uma pasta nova pede uma linha em \`frontend/lint/pastas.ts\` e em "Onde um arquivo mora" do AGENTS.md.`,
  },
  {
    pasta: 'frontend/src',
    fora: (a) => /(^|\/)(__tests__|testes)\//.test(a),
    motivo:
      'O teste mora ao lado do que ele testa, como `<nome>.test.ts`, e não numa pasta de testes.',
  },
  ...['packages/conteudo/src', 'packages/regras/src'].map((pasta) => ({
    pasta,
    fora: (a: string) => a.includes('/'),
    motivo:
      'O pacote é plano: um arquivo por assunto, importado pelo subcaminho (`@tem-estudo/regras/<nome>`).',
  })),
]

function arquivos(pasta: string): string[] {
  if (!existsSync(pasta)) return []
  return readdirSync(pasta, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => relative(pasta, join(e.parentPath, e.name)))
}

/** Cada arquivo fora do lugar, relativo à raiz, com o motivo. */
export function foraDoLugar(raiz = RAIZ) {
  const achados: { arquivo: string; motivo: string }[] = []
  for (const regra of REGRAS)
    for (const nativo of arquivos(join(raiz, regra.pasta))) {
      const a = nativo.split(sep).join('/')
      if (regra.fora(a))
        achados.push({ arquivo: `${regra.pasta}/${a}`, motivo: regra.motivo })
    }
  return achados
}

if (import.meta.main) {
  const achados = foraDoLugar()
  for (const { arquivo, motivo } of achados)
    console.error(`[pastas] ${arquivo}: ${motivo}`)
  if (achados.length > 0) process.exit(1)
}
