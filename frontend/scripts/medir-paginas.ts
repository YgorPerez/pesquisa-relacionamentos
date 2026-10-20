// Mede as cinco páginas no celular contra a meta (ADR 0033) e imprime uma
// tabela. No molde do `medir-paginas.ts` do Festival dos Macacos.
//
//   pnpm --filter frontend medir [--site https://temestudo.cloud] [--vezes 5]
//     [--paginas início,Ficha] [--guia <caminho>] [--ficha <caminho>]
//     [--conferir]
//
// Sem `--site`, mede o `pnpm start` deste checkout (`scripts/portas.ts`). O
// Guia e a Ficha padrão são os da fixture (`e2e/acervo`), que o build do e2e
// serve; com o acervo de verdade, passe `--ficha` e meça sem o Guia.
//
// Cada página abre `--vezes` num Chrome limpo, com a tela do celular, a rede
// e a CPU do Lighthouse mobile. De cada abertura saem os bytes de JS e de CSS
// como chegaram, o LCP, e o INP de um toque logo que a página pinta (`toque`
// em `./medir-paginas-meta.ts`). A meta lê a mediana.
//
// Em localhost, um proxy na frente do servidor comprime como o Nginx da VPS
// (`nginx/temestudo.conf`): o servidor do app não comprime, e sem isso a
// medida local pesaria o JS cru.
//
// `--conferir` abre cada página uma vez, sem throttling, e diz se o alvo do
// toque aparece: uma página que mudou de marcação faria a medida esperar e
// falhar.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { readFileSync } from 'node:fs'
import { createServer, request, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { createGzip } from 'node:zlib'
import { type Browser, chromium } from '@playwright/test'
import { portaPedida } from '../../scripts/portas.ts'
import {
  CAMINHOS_DA_FIXTURE,
  comprimeComoONginx,
  type Execucao,
  type Gzip,
  gzipDoNginx,
  linhaDe,
  type Linha,
  type Pagina,
  paginas,
  tabela,
} from './medir-paginas-meta.ts'

/** A rede e a CPU do Lighthouse mobile com devtools (`mobileSlow4G` em
 * `core/config/constants.js`): 150 ms de RTT, que o devtools aplica como
 * 562,5 ms por pedido, 1,6 Mbps e a CPU 4× mais lenta. A tela é a do Moto G
 * Power, a do preset. */
const REDE = {
  offline: false,
  latency: 562.5,
  downloadThroughput: (1474.56 * 1024) / 8,
  uploadThroughput: (675 * 1024) / 8,
}
const CPU = 4
const CELULAR = {
  viewport: { width: 412, height: 823 },
  deviceScaleFactor: 1.75,
  isMobile: true,
  hasTouch: true,
}

const { values: opcoes } = parseArgs({
  options: {
    site: { type: 'string' },
    vezes: { type: 'string', default: '3' },
    paginas: { type: 'string' },
    guia: { type: 'string', default: CAMINHOS_DA_FIXTURE.guia },
    ficha: { type: 'string', default: CAMINHOS_DA_FIXTURE.ficha },
    conferir: { type: 'boolean', default: false },
  },
})
const SITE = (
  opcoes.site ?? `http://localhost:${portaPedida('start')}`
).replace(/\/+$/, '')
const VEZES = Number(opcoes.vezes)

/** Um proxy em `127.0.0.1` que repassa ao `destino` e comprime a resposta
 * como o Nginx comprimiria. */
async function proxyComGzip(destino: string, gzip: Gzip): Promise<Server> {
  const alvo = new URL(destino)
  const servidor = createServer((pedido, resposta) => {
    const repasse = request(
      {
        host: alvo.hostname,
        port: alvo.port,
        method: pedido.method,
        path: pedido.url,
        headers: { ...pedido.headers, host: alvo.host },
      },
      (veio) => {
        const cabecalhos = { ...veio.headers }
        const aceita = /\bgzip\b/.test(pedido.headers['accept-encoding'] ?? '')
        const comprime =
          aceita &&
          !cabecalhos['content-encoding'] &&
          comprimeComoONginx(cabecalhos['content-type'], gzip)
        if (!comprime) {
          resposta.writeHead(veio.statusCode ?? 502, cabecalhos)
          veio.pipe(resposta)
          return
        }
        delete cabecalhos['content-length']
        cabecalhos['content-encoding'] = 'gzip'
        cabecalhos.vary = 'Accept-Encoding'
        resposta.writeHead(veio.statusCode ?? 502, cabecalhos)
        veio.pipe(createGzip({ level: gzip.nivel })).pipe(resposta)
      },
    )
    repasse.on('error', () => resposta.destroy())
    pedido.pipe(repasse)
  })
  await new Promise<void>((pronto) => servidor.listen(0, '127.0.0.1', pronto))
  return servidor
}

/** Observa o LCP e o INP desde o primeiro byte. O INP é a maior duração de
 * uma interação: o `first-input` vem sempre, e o `event` só de 16 ms para
 * cima. */
const OBSERVADORES = `
  window.__lcp = 0
  window.__inp = 0
  window.__tocou = false
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__lcp = e.startTime
  }).observe({ type: 'largest-contentful-paint', buffered: true })
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__inp = Math.max(window.__inp, e.duration)
      window.__tocou = true
    }
  }).observe({ type: 'first-input', buffered: true })
  new PerformanceObserver((l) => {
    for (const e of l.getEntries())
      if (e.interactionId) window.__inp = Math.max(window.__inp, e.duration)
  }).observe({ type: 'event', durationThreshold: 16, buffered: true })
`

type Janela = { __lcp: number; __inp: number; __tocou: boolean }

/** Uma abertura da página num contexto limpo, com a rede e a CPU lentas. */
async function abrir(
  browser: Browser,
  base: string,
  pagina: Pagina,
): Promise<Execucao> {
  const contexto = await browser.newContext(CELULAR)
  await contexto.addInitScript(OBSERVADORES)
  const aba = await contexto.newPage()
  const cdp = await contexto.newCDPSession(aba)
  const tipos = new Map<string, string>()
  const bytes = { Script: 0, Stylesheet: 0 }
  cdp.on('Network.responseReceived', (e) => tipos.set(e.requestId, e.type))
  cdp.on('Network.loadingFinished', (e) => {
    const tipo = tipos.get(e.requestId)
    if (tipo === 'Script' || tipo === 'Stylesheet')
      bytes[tipo] += e.encodedDataLength
  })
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', REDE)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU })

  await aba.goto(`${base}${pagina.caminho}`, {
    waitUntil: 'load',
    timeout: 120_000,
  })
  await aba.locator(pagina.toque).first().tap({ timeout: 60_000 })
  await aba.waitForFunction(() => (window as unknown as Janela).__tocou, null, {
    timeout: 30_000,
  })
  // O JS que a página pede depois do toque também é dela.
  await aba.waitForLoadState('networkidle', { timeout: 60_000 })
  const { lcp, inp } = await aba.evaluate(() => {
    const janela = window as unknown as Janela
    return { lcp: janela.__lcp, inp: janela.__inp }
  })
  await contexto.close()
  return { js: bytes.Script, css: bytes.Stylesheet, lcp, inp }
}

/** `--conferir`: abre cada página uma vez e diz se o alvo do toque apareceu. */
async function conferir(browser: Browser, base: string, lista: Pagina[]) {
  for (const pagina of lista) {
    const contexto = await browser.newContext(CELULAR)
    const aba = await contexto.newPage()
    const resposta = await aba.goto(`${base}${pagina.caminho}`)
    const achou = await aba
      .locator(pagina.toque)
      .first()
      .waitFor({ timeout: 15_000 })
      .then(
        () => true,
        () => false,
      )
    console.log(
      `[medir] ${achou ? 'ok    ' : 'FALTOU'} ${pagina.nome} (${resposta?.status()}): ${pagina.toque}`,
    )
    await contexto.close()
  }
}

function paginasAMedir(): Pagina[] {
  const todas = paginas({ guia: opcoes.guia, ficha: opcoes.ficha })
  if (!opcoes.paginas) return todas
  const escolhidas = new Set(opcoes.paginas.split(',').map((p) => p.trim()))
  return todas.filter((p) => escolhidas.has(p.nome))
}

async function medir() {
  const local = ['localhost', '127.0.0.1'].includes(new URL(SITE).hostname)
  const proxy = local
    ? await proxyComGzip(
        SITE,
        gzipDoNginx(
          readFileSync(
            join(import.meta.dirname, '../nginx/temestudo.conf'),
            'utf8',
          ),
        ),
      )
    : undefined
  const base = proxy
    ? `http://127.0.0.1:${(proxy.address() as AddressInfo).port}`
    : SITE
  const browser = await chromium.launch({ channel: 'chrome' })
  try {
    const lista = paginasAMedir()
    if (opcoes.conferir) return await conferir(browser, base, lista)
    const linhas: Linha[] = []
    for (const pagina of lista) {
      const execucoes: Execucao[] = []
      for (let i = 0; i < VEZES; i++)
        execucoes.push(await abrir(browser, base, pagina))
      const linha = linhaDe(pagina.nome, execucoes)
      linhas.push(linha)
      console.log(
        `[medir] ${pagina.nome}: ${execucoes
          .map(
            (e) =>
              `JS ${Math.round(e.js / 1024)} KB, CSS ${Math.round(e.css / 1024)} KB, LCP ${Math.round(e.lcp)} ms, INP ${Math.round(e.inp)} ms`,
          )
          .join(' · ')}`,
      )
    }
    console.log(
      `\n${SITE}${proxy ? ' (com o gzip do Nginx)' : ''}, mediana de ${VEZES} no celular com o 4G lento do Lighthouse.\n`,
    )
    console.log(tabela(linhas))
    if (linhas.some((l) => l.falhas.length)) process.exitCode = 1
  } finally {
    await browser.close()
    proxy?.close()
  }
}

await medir()
