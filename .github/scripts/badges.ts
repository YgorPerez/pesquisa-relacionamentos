// Desenha os selos do README (`docs/badges/*.svg`) a partir do que a fallow,
// o React Doctor e a cobertura acabaram de medir, como o `badges.ts` do
// Festival dos Macacos. São SVGs commitados: nenhum número fica escrito à mão
// no README, e o selo não depende de um serviço de fora estar no ar.
//
// Roda no `badges.yml`, da raiz do repo, depois do `test:coverage` de cada
// pacote, de `fallow health --format json` e de `react-doctor --json`. Na mão,
// com os mesmos arquivos no lugar:
//   node .github/scripts/badges.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

/** O pedaço do `fallow health --format json` que o selo lê. */
type Health = { health_score: { score: number; grade: string } }
/** O pedaço do `react-doctor --json` que o selo lê. */
type Doctor = { summary?: { score: number | null; scoreLabel: string } }
/** Um arquivo do `coverage-final.json` (formato do istanbul): cada statement,
 * a linha em que começa e quantas vezes rodou. */
type Cobertura = Record<
  string,
  {
    statementMap: Record<string, { start: { line: number } }>
    s: Record<string, number>
  }
>

/** A cor segue a letra da fallow: é ela que resume a nota. */
const COR_DA_NOTA = {
  A: '#4c1',
  B: '#97ca00',
  C: '#dfb317',
  D: '#fe7d37',
  F: '#e05d44',
}

/** Para um número de 0 a 100 sem letra. As faixas são as do React Doctor: 90
 * é "Excellent", 75 "Good", 60 "Needs work". */
function corDaFaixa(score: number) {
  if (score >= 90) return COR_DA_NOTA.A
  if (score >= 75) return COR_DA_NOTA.B
  if (score >= 60) return COR_DA_NOTA.C
  if (score >= 40) return COR_DA_NOTA.D
  return COR_DA_NOTA.F
}

/** A largura média de um caractere a 11px na Verdana; as letras largas e o
 * `%` pesam mais. O `textLength` do SVG ajusta o resto. */
function largura(texto: string) {
  return Math.round(
    texto
      .split('')
      .reduce(
        (total, c) =>
          total + (/[mwMW%]/.test(c) ? 10 : /[ .·()ilj]/.test(c) ? 3.5 : 7),
        10,
      ),
  )
}

/** O desenho "flat" do shields: duas caixas, texto com sombra. */
function selo(rotulo: string, mensagem: string, cor: string) {
  const lr = largura(rotulo)
  const lm = largura(mensagem)
  const total = lr + lm
  const texto = (t: string, x: number, l: number) =>
    `<text aria-hidden="true" x="${x * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${l * 10}">${t}</text>` +
    `<text x="${x * 10}" y="140" transform="scale(.1)" fill="#fff" textLength="${l * 10}">${t}</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${rotulo}: ${mensagem}">
<title>${rotulo}: ${mensagem}</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)"><rect width="${lr}" height="20" fill="#555"/><rect x="${lr}" width="${lm}" height="20" fill="${cor}"/><rect width="${total}" height="20" fill="url(#s)"/></g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
${texto(rotulo, lr / 2, lr - 10)}
${texto(mensagem, lr + lm / 2, lm - 10)}
</g>
</svg>
`
}

/** O que não é código, pelo caminho a partir da pasta do pacote: testes,
 * stories, tipos, o andaime do Storybook e o que é gerado. */
const FORA_DA_CONTA = [
  /\.test\.tsx?$/,
  /\.stories\.tsx$/,
  /\.d\.ts$/,
  /^src\/platform\/storybook\//,
  /^src\/routeTree\.gen\.ts$/,
]

/** A cobertura de linhas de vários pacotes juntos, como o istanbul conta:
 * uma linha é a de início de algum statement, e está coberta se algum deles
 * rodou. Para baixo: 89,6% não é 90%. */
export function coberturaDeLinhas(
  pacotes: readonly { pasta: string; arquivos: Cobertura }[],
) {
  let linhas = 0
  let cobertas = 0
  for (const { pasta, arquivos } of pacotes)
    for (const [caminho, arquivo] of Object.entries(arquivos)) {
      const doPacote = relative(pasta, caminho).replaceAll('\\', '/')
      if (FORA_DA_CONTA.some((padrao) => padrao.test(doPacote))) continue
      const porLinha = new Map<number, boolean>()
      for (const [id, { start }] of Object.entries(arquivo.statementMap)) {
        const rodou = (arquivo.s[id] ?? 0) > 0
        porLinha.set(start.line, (porLinha.get(start.line) ?? false) || rodou)
      }
      linhas += porLinha.size
      for (const rodou of porLinha.values()) if (rodou) cobertas += 1
    }
  return linhas === 0 ? 0 : Math.floor((cobertas / linhas) * 100)
}

export function selos({
  health,
  doctor,
  cobertura,
}: {
  health: Health
  doctor: Doctor
  cobertura: number
}) {
  const { score, grade } = health.health_score
  const nota = `${grade} (${Math.round(score)})`
  // Sem a API do React Doctor (`--no-score`) o score vem `null`.
  const doDoctor = doctor.summary?.score
  return {
    fallow: selo(
      'fallow health',
      nota,
      COR_DA_NOTA[grade as keyof typeof COR_DA_NOTA] ?? '#9f9f9f',
    ),
    reactDoctor:
      typeof doDoctor === 'number'
        ? selo(
            'react doctor',
            `${doDoctor} · ${doctor.summary?.scoreLabel}`,
            corDaFaixa(doDoctor),
          )
        : selo('react doctor', 'sem score', '#9f9f9f'),
    cobertura: selo('cobertura', `${cobertura}%`, corDaFaixa(cobertura)),
    resumo: `fallow: ${nota} · react doctor: ${doDoctor ?? 'sem score'} · cobertura: ${cobertura}%`,
  }
}

/** Os pacotes cuja cobertura entra no selo: o app, os pacotes puros e os
 * scripts da raiz. */
const PACOTES = ['frontend', 'packages/conteudo', 'packages/regras', '.']

if (import.meta.main) {
  const ler = (arquivo: string) => JSON.parse(readFileSync(arquivo, 'utf8'))
  const { fallow, reactDoctor, cobertura, resumo } = selos({
    health: ler('frontend/coverage/health.json'),
    doctor: ler('frontend/coverage/doctor.json'),
    cobertura: coberturaDeLinhas(
      PACOTES.filter((p) =>
        existsSync(join(p, 'coverage/coverage-final.json')),
      ).map((p) => ({
        pasta: resolve(p),
        arquivos: ler(join(p, 'coverage/coverage-final.json')),
      })),
    ),
  })
  mkdirSync('docs/badges', { recursive: true })
  writeFileSync('docs/badges/fallow.svg', fallow)
  writeFileSync('docs/badges/react-doctor.svg', reactDoctor)
  writeFileSync('docs/badges/cobertura.svg', cobertura)
  console.log(resumo)
}
