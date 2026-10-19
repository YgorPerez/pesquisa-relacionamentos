// O tamanho do PR vira rótulo, de `tamanho:PP` a `tamanho:XG`, como no
// Festival dos Macacos (que o tirou do `pr-size.yml` do t3code). Quem abre a
// lista de PRs vê de longe o que é uma linha e o que é uma tarde de leitura.
//
// Conta só o que alguém escreveu: lockfile, rota gerada, selo e skill
// vendorizada ficam de fora, e arquivo binário não tem linha. Num PR que mexe
// em código e em teste, o teste também fica de fora, para o teste que
// acompanha a mudança não empurrar o rótulo para cima. Num PR só de teste, ele
// conta.
//
// Roda no `tamanho-do-pr.yml`, a cada push num PR. Na mão, só mede:
//   node .github/scripts/tamanho-do-pr.ts origin/main
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

type Tamanho = { nome: string; faixa: string; ate: number; cor: string }

const XG: Tamanho = {
  nome: 'tamanho:XG',
  faixa: '1000 ou mais',
  ate: Number.POSITIVE_INFINITY,
  cor: 'b60205',
}
const TAMANHOS: Tamanho[] = [
  { nome: 'tamanho:PP', faixa: '0 a 9', ate: 9, cor: '0e8a16' },
  { nome: 'tamanho:P', faixa: '10 a 29', ate: 29, cor: '5ebd3e' },
  { nome: 'tamanho:M', faixa: '30 a 99', ate: 99, cor: 'fbca04' },
  { nome: 'tamanho:G', faixa: '100 a 499', ate: 499, cor: 'fe7d37' },
  { nome: 'tamanho:GG', faixa: '500 a 999', ate: 999, cor: 'd93f0b' },
  XG,
]

/** O que ninguém escreveu à mão. */
const GERADO = [
  /(?:^|\/)pnpm-lock\.yaml$/,
  /(?:^|\/)skills-lock\.json$/,
  /routeTree\.gen\.ts$/,
  /^docs\/badges\//,
  /^\.agents\//,
]
const TESTE = /\.(?:test|e2e)\.tsx?$|^frontend\/e2e\//

/** O tamanho, pelo `git diff --numstat` do PR. */
export function medir(numstat: string) {
  const arquivos = numstat
    .split('\n')
    .filter(Boolean)
    .flatMap((linha) => {
      const [mais, menos, caminho = ''] = linha.split('\t')
      // Binário vem como `-\t-`: não tem linha para contar.
      if (mais === '-' || GERADO.some((r) => r.test(caminho))) return []
      return [{ caminho, linhas: Number(mais) + Number(menos) }]
    })
  const testes = arquivos.filter((a) => TESTE.test(a.caminho))
  const codigo = arquivos.filter((a) => !TESTE.test(a.caminho))
  const soTeste = codigo.length === 0
  const contados = soTeste ? testes : codigo
  const linhas = contados.reduce((soma, a) => soma + a.linhas, 0)
  return {
    tamanho: TAMANHOS.find((t) => linhas <= t.ate) ?? XG,
    linhas,
    contados: contados.length,
    testes: soTeste ? 0 : testes.length,
  }
}

if (import.meta.main) {
  const base = process.argv[2] ?? 'origin/main'
  const pr = process.env.PR
  const rotulos: string[] = JSON.parse(process.env.ROTULOS ?? '[]')
  const { tamanho, linhas, contados, testes } = medir(
    execFileSync(
      'git',
      ['diff', '--numstat', '-M', '--no-color', `${base}...HEAD`],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    ),
  )
  const relatorio = [
    `### ${tamanho.nome}`,
    '',
    `${linhas} linhas mudadas em ${contados} arquivos` +
      (testes > 0 ? `, fora ${testes} de teste.` : '.'),
  ].join('\n')
  console.log(relatorio)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${relatorio}\n`)

  if (process.env.GITHUB_ACTIONS === 'true' && pr) {
    const gh = (...args: string[]) =>
      execFileSync('gh', args, { stdio: ['ignore', 'ignore', 'inherit'] })
    // `--force` também acerta a cor e a descrição de um rótulo que já existe.
    gh(
      'label',
      'create',
      tamanho.nome,
      '--force',
      '--color',
      tamanho.cor,
      '--description',
      `${tamanho.faixa} linhas escritas à mão (sem os testes, num PR que também muda código).`,
    )
    for (const velho of rotulos) {
      if (!velho.startsWith('tamanho:') || velho === tamanho.nome) continue
      gh(
        'api',
        '--method',
        'DELETE',
        `repos/{owner}/{repo}/issues/${pr}/labels/${encodeURIComponent(velho)}`,
      )
    }
    if (!rotulos.includes(tamanho.nome))
      gh(
        'api',
        `repos/{owner}/{repo}/issues/${pr}/labels`,
        '-f',
        `labels[]=${tamanho.nome}`,
      )
  }
}
