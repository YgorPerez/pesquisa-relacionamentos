// Conferência de Fichas (#37): para cada linha dos Achados, o Trecho está na
// Fonte local, o número do Valor está no Trecho e o `Cálculo` reproduz o
// Valor. Roda só na máquina de quem escreve ou revisa, porque a Fonte local
// pode estar na pasta privada, fora do git.
//
//   pnpm conferir estudos/<slug>.md [mais Fichas] [--fonte <caminho>]
//
// Sem `--fonte`, procura `fontes/<slug>.<ext>` e depois
// `fontes/privado/<slug>.<ext>`, com ext pdf, html, txt ou md. O pdf passa
// pelo `pdftotext` (poppler-utils); o html perde as tags. Qualquer falha sai
// com código 1.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { lerFicha } from '../packages/conteudo/src/ficha.ts'

export interface Falha {
  /** A linha da tabela de Achados, a partir de 1; `null` quando a falha é da Ficha inteira. */
  readonly linha: number | null
  readonly medida: string | null
  readonly motivo: string
}

export interface Conferencia {
  readonly ficha: string
  /** A Fonte local usada, relativa à raiz, ou `null` se nenhuma foi achada. */
  readonly fonte: string | null
  readonly falhas: ReadonlyArray<Falha>
  /** Quantas linhas dos Achados passaram em tudo. */
  readonly conferidas: number
}

export interface Opcoes {
  /** A raiz do repositório; os caminhos são relativos a ela. */
  readonly raiz: string
  /** A Fonte local, quando não segue o nome da Ficha. */
  readonly fonte?: string
}

const EXTENSOES = ['pdf', 'html', 'txt', 'md'] as const

function acharFonte(raiz: string, slug: string): string | null {
  for (const pasta of ['fontes', 'fontes/privado']) {
    for (const ext of EXTENSOES) {
      const caminho = `${pasta}/${slug}.${ext}`
      if (existsSync(join(raiz, caminho))) return caminho
    }
  }
  return null
}

/** O texto da fonte, de um arquivo de texto ou de um PDF via `pdftotext`. */
function lerFonte(raiz: string, caminho: string): string {
  if (/\.html?$/.test(caminho)) return textoDoHtml(readFileSync(join(raiz, caminho), 'utf8'))
  if (!caminho.endsWith('.pdf')) return readFileSync(join(raiz, caminho), 'utf8')
  const r = spawnSync('pdftotext', ['-enc', 'UTF-8', join(raiz, caminho), '-'], { encoding: 'utf8' })
  if (r.status !== 0)
    throw new Error(`pdftotext falhou em ${caminho} (instale o poppler-utils): ${(r.stderr || r.error?.message || '').trim()}`)
  return r.stdout
}

const ENTIDADES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '­' }

/** O texto de um snapshot de página: sem script, style e tags, com as entidades lidas. */
function textoDoHtml(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (inteira, nome: string) => {
      if (nome.startsWith('#x') || nome.startsWith('#X')) return String.fromCodePoint(parseInt(nome.slice(2), 16))
      if (nome.startsWith('#')) return String.fromCodePoint(Number(nome.slice(1)))
      return ENTIDADES[nome.toLowerCase()] ?? inteira
    })
}

/**
 * O texto do jeito que a conferência compara: sem a hifenização de fim de
 * linha, com aspas, ligaduras e espaços unificados. Fonte e Trecho passam pela
 * mesma função, então "long-term" quebrado em "long-\nterm" e "relation-\nship"
 * casam com o Trecho escrito numa linha só.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFKC')
    .replace(/­/g, '')
    .replace(/[‐‑]/g, '-')
    .replace(/(\p{L})-[ \t]*\r?\n\s*(\p{L})/gu, '$1$2')
    .replace(/(\p{L})-(?=\p{L})/gu, '$1')
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export function conferirFicha(arquivo: string, opcoes: Opcoes): Conferencia {
  const { raiz } = opcoes
  const slug = arquivo.replace(/^.*\//, '').replace(/\.md$/, '')
  const falhas: Falha[] = []
  const geral = (motivo: string): Conferencia => ({
    ficha: arquivo,
    fonte: null,
    falhas: [{ linha: null, medida: null, motivo }],
    conferidas: 0,
  })

  const lida = lerFicha(arquivo, readFileSync(join(raiz, arquivo), 'utf8'))
  if (!lida.ok) return geral(`a Ficha não passa no build: ${lida.erros.map((e) => e.mensagem).join('; ')}`)

  const fonte = opcoes.fonte ?? acharFonte(raiz, slug)
  if (!fonte) return geral(`sem Fonte local: nenhum fontes/${slug}.{${EXTENSOES}} nem fontes/privado/${slug}.{${EXTENSOES}}`)
  if (!existsSync(join(raiz, fonte))) return geral(`a Fonte local ${fonte} não existe`)
  const texto = normalizar(lerFonte(raiz, fonte))
  if (lida.ficha.achados.length === 0) return { ...geral('a tabela de Achados está vazia'), fonte }

  let conferidas = 0
  lida.ficha.achados.forEach((achado, i) => {
    const antes = falhas.length
    const falha = (motivo: string) => falhas.push({ linha: i + 1, medida: achado.medida, motivo })
    const trecho = achado.trecho ? limparTrecho(achado.trecho) : ''
    if (!trecho) falha('sem Trecho')
    else if (!texto.includes(normalizar(trecho))) falha(`o Trecho não está na fonte: "${trecho}"`)
    if (achado.calculo) {
      // Um número calculado não está no Trecho; o Trecho traz os insumos e o
      // Cálculo tem de devolver o Valor.
      const saida = rodarCalculo(raiz, achado.calculo)
      if (!saida.ok) falha(saida.motivo)
      else {
        const doCalculo = numeros(saida.texto)
        const faltam = numeros(achado.valor).filter((n) => !doCalculo.some((c) => mesmoNumero(n, c)))
        if (faltam.length > 0)
          falha(`o Cálculo deu "${saida.texto}", que não reproduz ${faltam.map((n) => n.bruto).join(', ')}`)
      }
    } else if (trecho) {
      const noTrecho = numeros(trecho)
      for (const n of numeros(achado.valor)) {
        if (!noTrecho.some((t) => mesmoNumero(n, t))) falha(`o número ${n.bruto} não aparece no Trecho`)
      }
    }
    if (falhas.length === antes) conferidas++
  })

  return { ficha: arquivo, fonte, falhas, conferidas }
}

const INTERPRETES: Record<string, string> = {
  ts: process.execPath,
  js: process.execPath,
  mjs: process.execPath,
  py: 'python3',
  sh: 'bash',
}

type Saida = { readonly ok: true; readonly texto: string } | { readonly ok: false; readonly motivo: string }

/**
 * Roda a célula Cálculo: o caminho de um script do repositório, relativo à
 * raiz, com argumentos opcionais (`scripts/calculos/kowal-2025-brasil.py BR`).
 * A saída padrão, sem espaços nas pontas, é o que se compara com o Valor.
 */
function rodarCalculo(raiz: string, celula: string): Saida {
  const [script = '', ...args] = celula.replace(/`/g, '').trim().split(/\s+/)
  const ext = script.replace(/^.*\./, '')
  const interprete = INTERPRETES[ext]
  if (script.startsWith('/') || script.split('/').includes('..'))
    return { ok: false, motivo: `o Cálculo precisa ser um caminho dentro do repositório: ${script}` }
  if (!existsSync(join(raiz, script))) return { ok: false, motivo: `o script do Cálculo não existe: ${script}` }
  if (!interprete) return { ok: false, motivo: `não sei rodar .${ext}; use ${Object.keys(INTERPRETES).join(', ')}` }
  const r = spawnSync(interprete, [script, ...args], { cwd: raiz, encoding: 'utf8', timeout: 60_000 })
  if (r.status !== 0)
    return { ok: false, motivo: `o Cálculo ${script} falhou: ${(r.stderr || r.error?.message || '').trim()}` }
  return { ok: true, texto: r.stdout.trim() }
}

interface Numero {
  /** Como o número foi escrito: "18,5", "1,204", ".04". */
  readonly bruto: string
  /** As leituras possíveis: "1,204" é 1204 em inglês e 1,204 em português. */
  readonly leituras: ReadonlyArray<number>
}

/**
 * Os números de um texto, sem o sinal. O Valor vem em português ("0,04",
 * "11.196") e o Trecho na língua da fonte ("0.04", ".04", "11,196"), então
 * cada número guarda todas as leituras que a escrita permite.
 */
export function numeros(texto: string): Numero[] {
  return [...texto.matchAll(/(?<![\d.,])(?:\d+(?:[.,]\d+)*|[.,]\d+)/g)].map(([bruto]) => ({
    bruto,
    leituras: leituras(bruto),
  }))
}

function leituras(bruto: string): number[] {
  if (/^[.,]/.test(bruto)) return [Number(`0.${bruto.slice(1)}`)]
  const partes = bruto.split(/[.,]/)
  const seps = bruto.replace(/\d/g, '')
  if (partes.length === 1) return [Number(bruto)]
  const [inteira, ...resto] = partes
  const milhar = resto.every((p) => p.length === 3)
  if (partes.length === 2) {
    const decimal = Number(`${inteira}.${resto[0]}`)
    return milhar ? [decimal, Number(partes.join(''))] : [decimal]
  }
  // Três ou mais grupos: separadores iguais são milhar ("1.234.567"); com um
  // separador diferente no fim, o último é o decimal ("1,204.5", "1.204,5").
  if (new Set(seps).size === 1) return milhar ? [Number(partes.join(''))] : []
  const ultimo = partes.pop() ?? ''
  return partes.slice(1).every((p) => p.length === 3) ? [Number(`${partes.join('')}.${ultimo}`)] : []
}

function mesmoNumero(a: Numero, b: Numero): boolean {
  return a.leituras.some((x) => b.leituras.some((y) => Math.abs(x - y) < 1e-9))
}

export interface Ambiente {
  readonly raiz: string
  readonly escrever: (linha: string) => void
}

const USO = 'uso: node scripts/conferir-ficha.ts estudos/<slug>.md [mais Fichas] [--fonte <caminho>]'

/** A linha de comando: devolve o código de saída, 1 em qualquer falha. */
export function main(argv: ReadonlyArray<string>, { raiz, escrever }: Ambiente): number {
  const fichas: string[] = []
  let fonte: string | undefined
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? ''
    if (arg === '--fonte') fonte = argv[++i] ?? ''
    else fichas.push(arg)
  }
  if (fichas.length === 0 || fonte === '') {
    escrever(USO)
    return 1
  }
  if (fonte !== undefined && fichas.length > 1) {
    escrever('--fonte vale para uma Ficha só.')
    return 1
  }

  let falhou = false
  for (const ficha of fichas) {
    const r = conferirFicha(ficha, { raiz, ...(fonte ? { fonte } : {}) })
    const comFalha = new Set(r.falhas.flatMap((f) => (f.linha === null ? [] : [f.linha]))).size
    const resumo = `${r.conferidas} de ${r.conferidas + comFalha} linhas conferidas`
    const onde = r.fonte ? ` (${r.fonte})` : ''
    if (r.falhas.length === 0) {
      escrever(`ok    ${ficha}${onde}: ${resumo}`)
      continue
    }
    falhou = true
    escrever(`FALHA ${ficha}${onde}: ${resumo}`)
    for (const f of r.falhas)
      escrever(f.linha === null ? `  ${f.motivo}` : `  linha ${f.linha} (${f.medida}): ${f.motivo}`)
  }
  return falhou ? 1 : 0
}

if (import.meta.main) {
  process.exitCode = main(process.argv.slice(2), { raiz: process.cwd(), escrever: (l) => console.log(l) })
}

/** Tira as aspas de fora e a ênfase markdown que a célula da tabela pode ter. */
function limparTrecho(celula: string): string {
  return celula
    .trim()
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/\*/g, '')
    .trim()
}
