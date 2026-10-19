// A issue de um aviso automático, achada pelo título: a "Suíte noturna
// vermelha" (`suite-noturna.ts`) e a "Testes intermitentes"
// (`intermitentes.ts`). Cada aviso comenta na aberta, ou abre uma.
//
// Roda no `node` puro, sem `node_modules`.

import { spawnSync } from 'node:child_process'

/** Um `gh` que devolve a saída e lança se ele falha. */
export type Gh = (args: string[], entrada?: string) => string

/** O `gh` em `cwd`. `comando` é o executável e os argumentos antes dos do
 * `gh`: os testes põem um falso. Sem shell, o corpo vai inteiro pela
 * entrada, sem o `cmd` mexer nas aspas. */
export function ghEm(
  cwd: string,
  [executavel, ...antes]: string[] = ['gh'],
): Gh {
  return (args, entrada) => {
    const saida = spawnSync(executavel ?? 'gh', [...antes, ...args], {
      cwd,
      encoding: 'utf8',
      input: entrada,
    })
    if (saida.status !== 0)
      throw new Error(
        `gh ${args.slice(0, 2).join(' ')}: ${saida.stderr || saida.error?.message}`,
      )
    return saida.stdout.trim()
  }
}

/** A issue aberta com exatamente este título, se houver. */
export function issueAberta(gh: Gh, titulo: string): number | null {
  const lista = JSON.parse(
    gh([
      'issue',
      'list',
      '--state',
      'open',
      '--search',
      `"${titulo}" in:title`,
      '--json',
      'number,title',
    ]),
  ) as { number: number; title: string }[]
  return lista.find(({ title }) => title === titulo)?.number ?? null
}

/** Abre a issue e devolve o número dela, lido da URL que o `gh` imprime. */
export function abrirIssue(
  gh: Gh,
  titulo: string,
  corpo: string,
  rotulos: string[] = [],
): number {
  const url = gh(
    [
      'issue',
      'create',
      '--title',
      titulo,
      ...rotulos.flatMap((rotulo) => ['--label', rotulo]),
      '--body-file',
      '-',
    ],
    corpo,
  )
  const numero = Number(url.match(/\/issues\/(\d+)/)?.[1])
  if (!Number.isInteger(numero))
    throw new Error(`gh issue create não devolveu a issue: ${url}`)
  return numero
}
