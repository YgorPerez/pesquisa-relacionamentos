// O portão das supressões, do `supressoes.ts` do Festival dos Macacos (ADR
// 0036 dele), com um teto. Uma supressão de lint, de tipo, do React Compiler
// ou de cobertura não entra sozinha:
//
// - O teto (`.github/teto-de-supressoes.json`) diz quantas de cada diretiva a
//   árvore pode ter. Passou dele, falha, com ou sem rótulo. O teto só desce:
//   quem tira uma supressão baixa o número; subir é mudar a configuração de
//   um auditor, e isso espera uma pessoa (abaixo).
// - Toda diretiva nova diz por quê, no formato da ferramenta: depois do `--`
//   no Oxlint, no React Doctor e na fallow, depois da própria diretiva no
//   TypeScript, num comentário na mesma linha no `'use no memo'`. Sem motivo,
//   falha sempre.
// - Com motivo, ou com a configuração de um auditor mudada, o PR espera uma
//   pessoa pôr o rótulo `supressao-revisada`. Agente nenhum põe o rótulo. Fora
//   do CI (o hook de push), isso só avisa: quem barra é o PR.
//
// Roda no `supressoes.yml`, a cada PR, no hook de push
// (`scripts/verificar-push.ts`), e na mão:
//   node .github/scripts/supressoes.ts --base origin/main [--alvo HEAD]
import { spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

export type Achado = {
  arquivo: string
  linha: number
  nome: string
  texto: string
}
export type Contagem = Record<string, number>

export const ROTULO = 'supressao-revisada'
export const ARQUIVO_DO_TETO = '.github/teto-de-supressoes.json'

/** Cada diretiva, como ela começa e o que conta como motivo depois dela. */
const DIRETIVAS = (
  [
    ['oxlint-disable', /oxlint-disable(?:-next-line|-line)?/, /\s--\s*\S/],
    ['eslint-disable', /eslint-disable(?:-next-line|-line)?/, /\s--\s*\S/],
    [
      'react-doctor-disable',
      /react-doctor-disable(?:-next-line|-line)?/,
      /\s--\s*\S/,
    ],
    ['@ts-expect-error', /@ts-expect-error/, /\S/],
    ['@ts-ignore', /@ts-ignore/, /\S/],
    ['@ts-nocheck', /@ts-nocheck/, /\S/],
    ['@effect-diagnostics', /@effect-diagnostics/, /\s--?\s+\S/],
    ['fallow-ignore', /fallow-ignore\S*/, /\s--\s*\S/],
    ['ignore de cobertura', /(?:v8|c8|istanbul) ignore/, /\s--\s*\S/],
  ] satisfies [string, RegExp, RegExp][]
).map(([nome, diretiva, motivo]) => ({
  nome,
  // Só vale a que abre um comentário: um texto que cita a diretiva no meio
  // da frase não desliga nada.
  padrao: new RegExp(String.raw`(?:\/\/|\/\*|^\s*\*)\s*${diretiva.source}(.*)`),
  motivo,
}))
/** O `'use no memo'` tira um componente do React Compiler (ADR 0003). */
const SEM_MEMO = /^\s*['"]use no memo['"];?(.*)$/

export function acharDiretiva(
  linha: string,
): { nome: string; comMotivo: boolean } | null {
  const memo = linha.match(SEM_MEMO)
  if (memo)
    return { nome: 'use no memo', comMotivo: /\/[/*]\s*\S/.test(memo[1] ?? '') }
  for (const { nome, padrao, motivo } of DIRETIVAS) {
    const achado = linha.match(padrao)
    if (achado) return { nome, comMotivo: motivo.test(achado[1] ?? '') }
  }
  return null
}

/** Onde uma diretiva é código. Documentação cita diretivas sem aplicar
 * nenhuma, o vendorizado e o gerado não são escritos aqui, e o auditor e o
 * teste dele as citam de propósito. */
const CODIGO = /\.(?:[cm]?[jt]sx?|css)$/
const FORA = [
  /^\.agents\//,
  /^\.claude\//,
  /^\.repos\//,
  /routeTree\.gen\.ts$/,
  /^\.github\/scripts\/supressoes(?:\.test)?\.ts$/,
]
const ehCodigo = (arquivo: string) =>
  CODIGO.test(arquivo) && !FORA.some((r) => r.test(arquivo))

/** A configuração dos auditores. Qualquer mudança nela passa por uma pessoa.
 * No `package.json`, só as linhas dos scripts que auditam. */
const CONFIGURACAO: { arquivo: RegExp; linha?: RegExp }[] = [
  { arquivo: /(?:^|\/)vite\.config\.ts$/ },
  { arquivo: /(?:^|\/)vitest\.[^/]*config\.ts$/ },
  { arquivo: /^frontend\/doctor\.config\.ts$/ },
  { arquivo: /(?:^|\/)\.fallowrc[^/]*$/ },
  { arquivo: /(?:^|\/)tsconfig[^/]*\.json$/ },
  { arquivo: /^frontend\/lint\/(?![^/]+\.test\.ts$)[^/]+\.ts$/ },
  { arquivo: /^\.github\/teto-de-supressoes\.json$/ },
  {
    arquivo: /(?:^|\/)package\.json$/,
    linha: /fallow|react-doctor|"check"|"lint"|"doctor"|coverage/,
  },
]

/** As supressões que o diff (`git diff --unified=0`) acrescenta, e cada
 * configuração de auditor que ele muda, com as linhas que mudaram nela. */
export function lerDiff(diff: string) {
  const semMotivo: Achado[] = []
  const comMotivo: Achado[] = []
  const configuracao = new Map<string, string[]>()
  let arquivo: string | null = null
  let deOnde: string | null = null
  let linha = 0
  // Entre o `diff --git` e o primeiro `@@`: só ali `---` e `+++` são o
  // cabeçalho. Depois, são uma linha que começa com `--` ou `++`.
  let noCabecalho = false
  const regraDe = (caminho: string) =>
    CONFIGURACAO.find((r) => r.arquivo.test(caminho))

  for (const texto of diff.split('\n')) {
    if (texto.startsWith('diff --git ')) {
      noCabecalho = true
      arquivo = null
      deOnde = null
      continue
    }
    if (noCabecalho && texto.startsWith('--- ')) {
      deOnde = texto === '--- /dev/null' ? null : texto.slice('--- a/'.length)
      continue
    }
    if (noCabecalho && texto.startsWith('+++ ')) {
      arquivo = texto === '+++ /dev/null' ? null : texto.slice('+++ b/'.length)
      continue
    }
    const bloco = texto.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)
    if (bloco) {
      noCabecalho = false
      linha = Number(bloco[1])
      continue
    }
    if (noCabecalho) continue
    // Apagar uma configuração também é mudá-la.
    const mudou = arquivo ?? deOnde ?? ''
    const regra = regraDe(mudou)
    if (regra && /^[+-]/.test(texto) && (regra.linha?.test(texto) ?? true))
      configuracao.set(mudou, [...(configuracao.get(mudou) ?? []), texto])
    if (!texto.startsWith('+')) continue
    const atual = linha++
    if (!arquivo || !ehCodigo(arquivo)) continue
    const achado = acharDiretiva(texto.slice(1))
    if (!achado) continue
    ;(achado.comMotivo ? comMotivo : semMotivo).push({
      arquivo,
      linha: atual,
      nome: achado.nome,
      texto: texto.slice(1).trim(),
    })
  }
  return { semMotivo, comMotivo, configuracao }
}

/** Quantas de cada diretiva a árvore tem, pela saída de
 * `git grep -n -E <diretivas> <commit>` (`<commit>:<arquivo>:<linha>:<texto>`). */
export function contarNoGrep(saida: string): Contagem {
  const contagem: Contagem = {}
  for (const linha of saida.split('\n')) {
    const achado = linha.match(/^[^:]+:([^:]+):\d+:(.*)$/)
    if (!achado || !ehCodigo(achado[1] ?? '')) continue
    const diretiva = acharDiretiva(achado[2] ?? '')
    if (diretiva) contagem[diretiva.nome] = (contagem[diretiva.nome] ?? 0) + 1
  }
  return contagem
}

/** O veredito e o relatório. */
export function julgar({
  semMotivo,
  comMotivo,
  configuracao,
  contagem,
  teto,
  rotulos,
  noCi,
}: ReturnType<typeof lerDiff> & {
  contagem: Contagem
  teto: Contagem
  rotulos: readonly string[]
  noCi: boolean
}) {
  const nomes = [...new Set([...Object.keys(contagem), ...Object.keys(teto)])]
  const acima = nomes.filter((n) => (contagem[n] ?? 0) > (teto[n] ?? 0))
  const abaixo = nomes.filter((n) => (contagem[n] ?? 0) < (teto[n] ?? 0))
  const saida: string[] = []
  const listar = (achados: Achado[]) => {
    for (const s of achados)
      saida.push(`- \`${s.arquivo}:${s.linha}\` ${s.nome}: \`${s.texto}\``)
    saida.push('')
  }
  if (acima.length > 0) {
    saida.push(
      '### Acima do teto',
      '',
      `Tire a supressão nova. O teto (\`${ARQUIVO_DO_TETO}\`) só sobe com uma pessoa, e isto falha mesmo com o rótulo enquanto ele não subir.`,
      '',
      ...acima.map(
        (n) => `- ${n}: ${contagem[n] ?? 0}, e o teto é ${teto[n] ?? 0}`,
      ),
      '',
    )
  }
  if (semMotivo.length > 0) {
    saida.push(
      '### Supressões sem motivo',
      '',
      'Diga por quê ao lado da diretiva. Isto falha mesmo com o rótulo.',
      '',
    )
    listar(semMotivo)
  }
  if (comMotivo.length > 0) {
    saida.push('### Supressões novas', '')
    listar(comMotivo)
  }
  if (configuracao.size > 0) {
    saida.push('### Configuração de auditor mudou', '')
    for (const [c, linhas] of configuracao)
      saida.push(`- \`${c}\``, '', '```diff', ...linhas, '```')
    saida.push('')
  }
  const precisaDeRevisao = comMotivo.length > 0 || configuracao.size > 0
  const revisado = rotulos.includes(ROTULO)
  if (precisaDeRevisao) {
    if (revisado)
      saida.push(
        `Rótulo \`${ROTULO}\` presente: uma pessoa leu o que está acima.`,
      )
    else if (noCi)
      saida.push(
        `Falta uma pessoa ler o que está acima e pôr o rótulo \`${ROTULO}\` no PR. Um agente nunca põe esse rótulo.`,
      )
    else
      saida.push(
        `O PR vai esperar uma pessoa pôr o rótulo \`${ROTULO}\`: mostre o que está acima a ela.`,
      )
  }
  if (abaixo.length > 0)
    saida.push(
      '',
      `A árvore tem menos supressões que o teto: baixe em \`${ARQUIVO_DO_TETO}\` ${abaixo
        .map((n) => `${n} para ${contagem[n] ?? 0}`)
        .join(', ')}.`,
    )
  if (saida.length === 0)
    saida.push(
      'Nenhuma supressão nova, a árvore está no teto e a configuração dos auditores não mudou.',
    )
  const passa =
    acima.length === 0 &&
    semMotivo.length === 0 &&
    (!precisaDeRevisao || revisado || !noCi)
  return { passa, linhas: saida }
}

/** O padrão do `git grep` que acha toda diretiva candidata. */
const CANDIDATAS =
  'oxlint-disable|eslint-disable|react-doctor-disable|@ts-expect-error|@ts-ignore|@ts-nocheck|@effect-diagnostics|fallow-ignore|(v8|c8|istanbul) ignore|use no memo'

if (import.meta.main) {
  const { values: opcoes, positionals } = parseArgs({
    allowPositionals: true,
    options: { base: { type: 'string' }, alvo: { type: 'string' } },
  })
  const base = opcoes.base ?? positionals[0] ?? 'origin/main'
  const alvo = opcoes.alvo ?? 'HEAD'
  const git = (...args: string[]) => {
    const r = spawnSync('git', args, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
    // O `git grep` sai com 1 quando não acha nada.
    if (r.status !== 0 && !(args[0] === 'grep' && r.status === 1)) {
      console.error(`git ${args.join(' ')}: ${r.stderr.trim()}`)
      process.exit(1)
    }
    return r.stdout
  }
  const shaDaBase = git('rev-parse', '--verify', `${base}^{commit}`).trim()
  const shaDoAlvo = git('rev-parse', '--verify', `${alvo}^{commit}`).trim()
  const raiz = git('rev-parse', '--show-toplevel').trim()
  const lido = lerDiff(
    git(
      'diff',
      '--unified=0',
      '--no-color',
      '--no-ext-diff',
      '--src-prefix=a/',
      '--dst-prefix=b/',
      `${shaDaBase}...${shaDoAlvo}`,
    ),
  )
  const teto: Contagem = JSON.parse(
    alvo === 'HEAD'
      ? readFileSync(join(raiz, ARQUIVO_DO_TETO), 'utf8')
      : git('show', `${shaDoAlvo}:${ARQUIVO_DO_TETO}`),
  ).teto
  const { passa, linhas } = julgar({
    ...lido,
    contagem: contarNoGrep(git('grep', '-n', '-E', CANDIDATAS, shaDoAlvo)),
    teto,
    rotulos: JSON.parse(process.env.ROTULOS ?? '[]'),
    noCi: process.env.GITHUB_ACTIONS === 'true',
  })
  const relatorio = linhas.join('\n')
  console.log(relatorio)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${relatorio}\n`)
  process.exit(passa ? 0 : 1)
}
