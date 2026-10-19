// Traz para `.repos/` o código-fonte do Effect v4, na versão exata do
// `catalog:` do `pnpm-workspace.yaml` (ADR 0012, do ADR-0039 do Festival dos
// Macacos). A API da v4 difere da v3 que o agente leu, e quem escreve código
// Effect (o Schema do `packages/conteudo`) lê `.repos/effect-smol/LLMS.md` e o
// fonte dali antes de inventar uma função.
//
// É um clone raso de uma tag, ignorado pelo git, que este script refaz quando
// a versão do catálogo muda.
//
//   node scripts/sincronizar-referencias.ts
//   node scripts/sincronizar-referencias.ts --de <outro checkout>/.repos/effect-smol
//
// O `--de` clona de uma cópia local em vez do GitHub. É o que o
// `preparar-worktree.ts` usa, para um worktree novo não baixar tudo de novo.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const GITHUB = 'https://github.com/Effect-TS/effect.git'

/** A versão do `effect` no `catalog:` do workspace. O `node` puro não traz
 * leitor de YAML, e a linha é `  effect: <versão>` dentro do bloco. */
export function versaoDoEffect(workspace: string) {
  return /^catalog:\n(?:[ \t#].*\n|\n)*?[ \t]+effect: *['"]?([^\s'"]+)/m.exec(
    workspace,
  )?.[1]
}

type Pedido = {
  versao: string
  destino: string
  /** Uma cópia local (outro `.repos/effect-smol`) ou a URL do repositório. */
  origem?: string
  env?: NodeJS.ProcessEnv
}

/** Deixa `destino` na tag `effect@<versao>` e diz o que fez. Falha com a
 * saída do git se o clone não der certo. */
export function sincronizar({
  versao,
  destino,
  origem = GITHUB,
  env = process.env,
}: Pedido) {
  const git = (args: string[], cwd?: string) =>
    spawnSync('git', args, { cwd, encoding: 'utf8', env })
  const tag = `effect@${versao}`
  // Um commit do Effect leva a tag de cada pacote que sai junto (`effect@`,
  // `@effect/vitest@`...), por isso a pergunta é se a nossa está entre elas.
  const tags = existsSync(join(destino, '.git'))
    ? git(['tag', '--points-at', 'HEAD'], destino).stdout.split(/\r?\n/)
    : []
  if (tags.includes(tag)) return `.repos/effect-smol já está em ${tag}.`
  const atual = tags.find((t) => t.startsWith('effect@'))

  const local = !/^[a-z]+:\/\//.test(origem)
  rmSync(destino, { recursive: true, force: true })
  mkdirSync(dirname(destino), { recursive: true })
  const clone = git([
    'clone',
    '--quiet',
    '--depth',
    '1',
    '--branch',
    tag,
    '--single-branch',
    // Um caminho local vira `file://`, senão o git ignora o `--depth`.
    local ? `file://${resolve(origem).replaceAll('\\', '/')}` : origem,
    destino,
  ])
  if (clone.status !== 0)
    throw new Error(`o clone de ${tag} falhou: ${clone.stderr.trim()}`)
  return `.repos/effect-smol ${atual ? `sai de ${atual} e ` : ''}vai para ${tag}, clonado de ${origem}.`
}

if (import.meta.main) {
  const raiz = dirname(import.meta.dirname)
  const versao = versaoDoEffect(
    readFileSync(join(raiz, 'pnpm-workspace.yaml'), 'utf8'),
  )
  if (!versao) {
    console.error('[referencias] Não achei o `effect` no `catalog:`.')
    process.exit(1)
  }
  const indice = process.argv.indexOf('--de')
  const copia = indice === -1 ? undefined : process.argv[indice + 1]
  try {
    console.log(
      `[referencias] ${sincronizar({
        versao,
        destino: join(raiz, '.repos/effect-smol'),
        // Sem a cópia (o principal ainda não sincronizou), o GitHub.
        ...(copia && existsSync(join(copia, '.git')) ? { origem: copia } : {}),
      })}`,
    )
  } catch (erro) {
    console.error(`[referencias] ${(erro as Error).message}`)
    process.exit(1)
  }
}
