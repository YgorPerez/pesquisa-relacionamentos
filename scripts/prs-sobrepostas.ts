// Os PRs abertos que mexem nos mesmos arquivos que este branch, como no
// Festival dos Macacos. O `suite-do-pr.ts` os lista antes de rodar: lá, duas
// sessões subiram a mesma dependência ao mesmo tempo, e uma só soube da outra
// pelo usuário. A lista de PRs abertos é o único lugar onde uma sessão vê o
// que as outras fazem.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { spawnSync } from 'node:child_process'

/** Um PR aberto, como o `gh pr list --json number,title,headRefName,files` o dá. */
export type PrAberto = {
  number: number
  title: string
  headRefName: string
  files: { path: string }[]
}

export type Sobreposta = { numero: number; titulo: string; comuns: string[] }

/** Os PRs de `prs` com algum arquivo de `arquivos`, menos os dos branches em
 * `ignorar`: o deste branch, e o de baixo de um PR empilhado. */
export function sobrepostas(
  arquivos: string[],
  prs: PrAberto[],
  ignorar: string[],
): Sobreposta[] {
  const doBranch = new Set(arquivos)
  return prs
    .filter((pr) => !ignorar.includes(pr.headRefName))
    .map((pr) => ({
      numero: pr.number,
      titulo: pr.title,
      comuns: pr.files.map((f) => f.path).filter((p) => doBranch.has(p)),
    }))
    .filter((pr) => pr.comuns.length > 0)
    .sort((a, b) => a.numero - b.numero)
}

/** As linhas do aviso, até `MAX_ARQUIVOS` arquivos por PR. */
const MAX_ARQUIVOS = 5
export function aviso(lista: Sobreposta[]): string[] {
  return lista.map(({ numero, titulo, comuns }) => {
    const mostrados = comuns.slice(0, MAX_ARQUIVOS).join(', ')
    const resto =
      comuns.length > MAX_ARQUIVOS
        ? ` e mais ${comuns.length - MAX_ARQUIVOS}`
        : ''
    return `#${numero} ${titulo}: ${mostrados}${resto}`
  })
}

/** Os PRs abertos do repo, ou por que não deu para ler. Sem `gh` ou sem rede,
 * a suíte segue sem o aviso. */
export function prsAbertos(pasta: string): PrAberto[] | { motivo: string } {
  const saida = spawnSync(
    'gh',
    [
      'pr',
      'list',
      '--state',
      'open',
      '--limit',
      '100',
      '--json',
      'number,title,headRefName,files',
    ],
    { cwd: pasta, encoding: 'utf8' },
  )
  if (saida.error) return { motivo: `gh não rodou: ${saida.error.message}` }
  if (saida.status !== 0)
    return { motivo: `gh pr list falhou: ${saida.stderr.trim()}` }
  return JSON.parse(saida.stdout) as PrAberto[]
}
