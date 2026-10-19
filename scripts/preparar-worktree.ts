// Deixa um checkout pronto para o dev, os testes e o e2e, sem passo na mão
// (ADR 0010, do ADR-0038 do Festival dos Macacos). O T3 Code roda isto em todo
// worktree que cria (`t3.json`, com `T3CODE_PROJECT_ROOT` apontando para o
// checkout principal); fora dele, `node scripts/preparar-worktree.ts` na raiz
// do worktree faz o mesmo, e acha o principal pelo git.
//
// 1. `pnpm install --frozen-lockfile` na raiz, que monta o workspace inteiro
//    (`frontend/`, `packages/*`) e, pelo `prepare`, aplica o patch do
//    `@effect/tsgo` (ADR 0004).
// 2. Num worktree, liga aqui dentro o que o git não leva e o principal tem:
//    os `.env` do front, a pasta privada das Fontes (`fontes/privado/`, que o
//    `pnpm conferir` lê) e a skill do impeccable. O `.env` da raiz e o
//    `.env.deploy` ficam de fora: levam o token da Hostinger e o acesso à
//    VPS, e um worktree de agente não ganha isso de graça.
// 3. Sincroniza o código do Effect em `.repos/` (ADR 0012) a partir da cópia
//    do principal, sem baixar de novo.
// 4. Liga o hook de push (`instalar-hooks.ts`).
// 5. Busca o `origin/main` e diz quantos commits o HEAD está atrás dele. Um
//    worktree nasce de um ramo local, que pode estar dias atrás.
//
// Pode rodar de novo quantas vezes quiser. Roda no `node` puro, que lê
// TypeScript sozinho: só sintaxe que ele apaga.

import { execFileSync, spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { instalarHooks } from './instalar-hooks.ts'
import { portaDoCheckout, RAIZ } from './portas.ts'

/** O que o principal tem, o git não leva, e o worktree precisa. */
const DO_PRINCIPAL = [
  'frontend/.env',
  'frontend/.env.local',
  'fontes/privado',
  '.claude/skills/impeccable',
  '.agents/skills/impeccable',
]

function dizer(linha: string) {
  console.log(`[preparar] ${linha}`)
}

function desistir(motivo: string): never {
  console.error(`[preparar] ${motivo}`)
  process.exit(1)
}

/** Compara depois de seguir links. */
function mesmoCaminho(a: string, b: string) {
  const [x, y] = [realpathSync.native(a), realpathSync.native(b)]
  return process.platform === 'win32'
    ? x.toLowerCase() === y.toLowerCase()
    : x === y
}

/** Liga `relativo` (arquivo ou pasta) do `principal` no `worktree` e devolve
 * o que dizer. O que já é link para lá fica, e um link quebrado é refeito. Um
 * arquivo igual ao do principal, de uma rodada anterior, vira link. O que é
 * diferente, ou um link para outro lugar, é do worktree, e não se mexe nele.
 * Se o sistema recusa o link (o Windows sem o modo de desenvolvedor), copia e
 * diz. */
export function ligar(
  principal: string,
  worktree: string,
  relativo: string,
  criarLink: typeof symlinkSync = symlinkSync,
) {
  const origem = join(principal, relativo)
  const destino = join(worktree, relativo)
  if (!existsSync(origem)) return `${relativo}: o principal não tem. Pulado.`
  const pasta = statSync(origem).isDirectory()
  const atual = lstatSync(destino, { throwIfNoEntry: false })
  if (atual && existsSync(destino)) {
    if (mesmoCaminho(destino, origem))
      return `${relativo}: já é link para o principal.`
    const igual =
      !pasta &&
      !atual.isSymbolicLink() &&
      atual.isFile() &&
      readFileSync(destino).equals(readFileSync(origem))
    if (!igual) return `${relativo}: o worktree tem o seu. Fica.`
  }
  if (atual) rmSync(destino, { recursive: true, force: true })
  mkdirSync(dirname(destino), { recursive: true })
  try {
    criarLink(origem, destino, pasta ? 'junction' : 'file')
    return `${relativo}: link para ${origem}.`
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code !== 'EPERM') throw erro
    cpSync(origem, destino, { recursive: true })
    return (
      `${relativo}: o sistema recusou o link (EPERM), então é uma CÓPIA de ` +
      `${origem}. Mudou o principal, apague a cópia e rode isto de novo.`
    )
  }
}

/** O que dizer sobre o HEAD de `pasta` frente ao `origin/main`, depois de
 * buscá-lo. Em dia, nada. Sem rede, avisa e compara com o `origin/main` que já
 * estava aqui. */
export function atrasoDoMain(pasta: string, env = process.env) {
  const git = (...args: string[]) =>
    execFileSync('git', args, {
      cwd: pasta,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      // Sem rede, o fetch não fica pendurado nem pede senha.
      timeout: 60_000,
      env: { ...env, GIT_TERMINAL_PROMPT: '0' },
    }).trim()
  const linhas: string[] = []
  try {
    git('fetch', '--quiet', 'origin', 'main')
  } catch (erro) {
    const { stderr } = erro as { stderr?: string }
    const motivo = stderr?.trim().split('\n')[0] || String(erro)
    linhas.push(
      `o git fetch falhou (${motivo}): comparo com o origin/main que já estava aqui.`,
    )
  }
  let atras: number
  try {
    atras = Number(git('rev-list', '--count', 'HEAD..origin/main'))
  } catch {
    return [...linhas, 'Sem origin/main: não sei se o HEAD está em dia.']
  }
  if (atras > 0)
    linhas.push(
      `${atras} ${atras === 1 ? 'commit' : 'commits'} atrás de origin/main. ` +
        'Para atualizar: git merge origin/main',
    )
  return linhas
}

/** O checkout principal: o que o T3 Code diz, ou a pasta de onde vem o `.git`
 * comum a todos os worktrees. */
function checkoutPrincipal() {
  const doT3 = process.env.T3CODE_PROJECT_ROOT
  if (doT3) return resolve(doT3)
  try {
    const comum = execFileSync(
      'git',
      ['rev-parse', '--path-format=absolute', '--git-common-dir'],
      { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim()
    // Um repositório sem checkout (`--bare`) não tem de onde ligar nada.
    return basename(comum) === '.git' ? dirname(comum) : null
  } catch (erro) {
    const { stderr } = erro as { stderr?: string }
    desistir(
      `O git não disse onde está o checkout principal: ${stderr?.trim() || String(erro)}\n` +
        'Rode de novo com T3CODE_PROJECT_ROOT apontando para ele.',
    )
  }
}

function rodar(comando: string) {
  dizer(comando)
  // `shell: true` para o Windows achar o `pnpm.cmd`.
  const { status } = spawnSync(comando, {
    cwd: RAIZ,
    stdio: 'inherit',
    shell: true,
  })
  if (status !== 0) desistir(`\`${comando}\` saiu com ${status}.`)
}

function sincronizarReferencias(principal: string | null) {
  const args = [join(RAIZ, 'scripts/sincronizar-referencias.ts')]
  if (principal) args.push('--de', join(principal, '.repos/effect-smol'))
  const { status } = spawnSync(process.execPath, args, {
    cwd: RAIZ,
    stdio: 'inherit',
  })
  // Sem rede e sem cópia no principal, o resto do preparo ainda serve.
  if (status !== 0)
    dizer(
      'As referências do Effect NÃO sincronizaram (o motivo está acima). ' +
        'Rode `node scripts/sincronizar-referencias.ts` depois.',
    )
}

if (import.meta.main) {
  const principal = checkoutPrincipal()
  const noPrincipal = principal !== null && mesmoCaminho(RAIZ, principal)
  dizer(noPrincipal ? `checkout principal ${RAIZ}` : `worktree ${RAIZ}`)

  // Sem terminal, como no T3 Code, a pergunta do pnpm antes de refazer os
  // `node_modules` abortava o install.
  rodar('pnpm install --frozen-lockfile --config.confirm-modules-purge=false')

  if (!noPrincipal) {
    if (principal)
      for (const relativo of DO_PRINCIPAL)
        dizer(ligar(principal, RAIZ, relativo))
    else dizer('Sem checkout principal: os .env ficam por sua conta.')
  }

  sincronizarReferencias(noPrincipal ? null : principal)
  // O hook de push: auditoria e testes afetados (ADR 0020). Um
  // `core.hooksPath` de outro lugar fica, com o aviso.
  dizer(instalarHooks(RAIZ).texto)
  for (const linha of atrasoDoMain(RAIZ)) dizer(linha)
  dizer(
    `Pronto. \`pnpm dev\` sobe em http://localhost:${portaDoCheckout('dev')}; ` +
      'as outras portas: `node scripts/portas.ts`.',
  )
}
