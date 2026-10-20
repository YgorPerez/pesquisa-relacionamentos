// Captura uma rota do app no celular (390×844) e no desktop (1280×800), para
// a evidência de tela de um PR (docs/agents/evidencia-de-tela.md) e para
// critique: `node scripts/capturar.ts <rota> [opções]` (`--help` lista as
// opções). Veio do `capturar.ts` do Festival dos Macacos.
//
// Usa o Chrome da máquina (`channel: 'chrome'`), como o e2e. O movimento vai
// reduzido, para a captura sair no estado final e não no meio de uma entrada;
// com `--video`, vai ligado, porque o vídeo existe para mostrá-lo. O
// Playwright grava em .webm; com o `ffmpeg` no PATH, sai em .mp4, que toca em
// todo navegador, o Safari incluído.
//
// O app padrão é o `pnpm start` deste checkout, e o Storybook o `pnpm
// storybook` dele (`scripts/portas.ts`).
//
// Com `--story <id> --em 0,500,1000`, fotografa uma story do Storybook em
// instantes da animação, em vez de uma rota (`capturarStory`).

import { execFileSync } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type Browser, chromium, type Page } from '@playwright/test'
import { portaPedida } from '../../scripts/portas.ts'
import {
  idsDoIndice,
  idsParecidos,
  lerArgumentos,
  type Opcoes,
  type OpcoesDaStory,
  TELAS,
  type Tela,
  USO,
} from './capturar-argumentos.ts'

const abrirNavegador = () => chromium.launch({ channel: 'chrome' })

/** O contexto de uma tela: o tamanho, o toque do celular e a língua. */
function daTela(tela: Tela, movimento: boolean) {
  return {
    viewport: TELAS[tela],
    deviceScaleFactor: 2,
    isMobile: tela === 'celular',
    hasTouch: tela === 'celular',
    reducedMotion: movimento ? ('no-preference' as const) : ('reduce' as const),
    locale: 'pt-BR',
  }
}

/** Espera as fontes e as imagens: sem isso, a captura saía com a letra do
 * sistema e um buraco no lugar da foto. */
async function quieta(pagina: Page) {
  await pagina.evaluate(() => document.fonts.ready)
  await pagina
    .waitForFunction(
      () => [...document.images].every((imagem) => imagem.complete),
      undefined,
      { timeout: 15_000 },
    )
    .catch(() => console.error('Alguma imagem não chegou em 15s.'))
}

/** Uma tela de erro na captura quase sempre é uma leitura que falhou, e o
 * motivo só aparece aqui. */
function relatarFalhas(pagina: Page, tela: Tela) {
  pagina.on('pageerror', (erro) =>
    console.error(`[${tela}] erro na página: ${erro.message}`),
  )
  pagina.on('response', (resposta) => {
    if (resposta.status() >= 400)
      console.error(
        `[${tela}] ${resposta.status()}: ${resposta.request().method()} ${resposta.url()}`,
      )
  })
}

/** Uma tela, num contexto só dela; devolve os arquivos gravados, o print e,
 * com `--video`, o vídeo. */
async function capturarTela(navegador: Browser, opcoes: Opcoes, tela: Tela) {
  const contexto = await navegador.newContext({
    ...daTela(tela, opcoes.video),
    ...(opcoes.video && {
      recordVideo: { dir: opcoes.saida, size: TELAS[tela] },
    }),
  })
  const pagina = await contexto.newPage()
  relatarFalhas(pagina, tela)
  await pagina.goto(`${opcoes.base}${opcoes.rota}`, { waitUntil: 'load' })
  await quieta(pagina)
  for (const seletor of opcoes.toques) {
    // No vídeo, quem assiste precisa ver a tela antes de ela mudar.
    if (opcoes.video) await pagina.waitForTimeout(800)
    await pagina.locator(seletor).first().click()
    await quieta(pagina)
  }
  const arquivo = join(opcoes.saida, `${opcoes.nome}-${tela}.png`)
  await pagina.screenshot({ path: arquivo, fullPage: opcoes.inteira })
  if (!opcoes.video) {
    await contexto.close()
    return [arquivo]
  }
  await pagina.waitForTimeout(1200)
  const video = pagina.video()
  // O Playwright só termina de escrever o vídeo quando o contexto fecha.
  await contexto.close()
  const webm = join(opcoes.saida, `${opcoes.nome}-${tela}.webm`)
  await video?.saveAs(webm)
  await video?.delete()
  return [arquivo, await emMp4(webm)]
}

/** O .webm em .mp4 com o `ffmpeg` do PATH, ou o próprio .webm sem ele. */
async function emMp4(webm: string): Promise<string> {
  const mp4 = webm.replace(/\.webm$/, '.mp4')
  try {
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-loglevel',
        'error',
        '-i',
        webm,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        mp4,
      ],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    )
  } catch {
    // Sem o `ffmpeg`, fica o .webm, que o GitHub também toca.
    return webm
  }
  await rm(webm)
  return mp4
}

async function capturar(opcoes: Opcoes) {
  await mkdir(opcoes.saida, { recursive: true })
  const navegador = await abrirNavegador()
  const gravados: string[] = []
  try {
    for (const tela of opcoes.telas)
      gravados.push(...(await capturarTela(navegador, opcoes, tela)))
  } finally {
    await navegador.close()
  }
  return gravados
}

/** O passo do relógio entre um quadro e o outro, como numa tela de 60 Hz. */
const QUADRO_MS = 16
/** Uma data fixa no relógio da página: a story sai igual em toda captura. */
const INICIO_DO_RELOGIO = new Date('2026-10-03T15:00:00-03:00')

/** Fotografa uma story em cada instante pedido. O relógio da página é o do
 * Playwright, parado desde antes de a story carregar: `setTimeout`,
 * `requestAnimationFrame` e `performance.now` só andam quando a captura
 * manda, de quadro em quadro. As animações do CSS correm no relógio do
 * navegador, que o Playwright não para; por isso cada uma é pausada assim
 * que aparece e posta no instante em que a página está (`assentar`). */
async function capturarStory(opcoes: OpcoesDaStory) {
  await conferirId(opcoes)
  await mkdir(opcoes.saida, { recursive: true })
  const navegador = await abrirNavegador()
  try {
    const contexto = await navegador.newContext(daTela(opcoes.tela, true))
    const pagina = await contexto.newPage()
    relatarFalhas(pagina, opcoes.tela)
    await pagina.clock.install({ time: INICIO_DO_RELOGIO.getTime() - 60_000 })
    await pagina.clock.pauseAt(INICIO_DO_RELOGIO)
    await pagina.goto(
      `${opcoes.base}/iframe.html?id=${encodeURIComponent(opcoes.story)}&viewMode=story`,
    )
    await storyNaTela(pagina)
    await pagina.evaluate(assentar)
    await pagina.evaluate(() => document.fonts.ready)
    await ate(pagina, () => [...document.images].every((i) => i.complete))
    await pagina.evaluate(assentar)
    return await fotografarInstantes(pagina, opcoes)
  } finally {
    await navegador.close()
  }
}

async function fotografarInstantes(pagina: Page, opcoes: OpcoesDaStory) {
  const largura = String(opcoes.instantes.at(-1)).length
  const gravados: string[] = []
  let agora = 0
  for (const instante of opcoes.instantes) {
    while (agora < instante) {
      const passo = Math.min(QUADRO_MS, instante - agora)
      await pagina.clock.runFor(passo)
      agora += passo
      await pagina.evaluate(assentar)
    }
    const ms = String(instante).padStart(largura, '0')
    const arquivo = join(
      opcoes.saida,
      `${opcoes.nome}-${opcoes.tela}-${ms}ms.png`,
    )
    await pagina.screenshot({ path: arquivo })
    gravados.push(arquivo)
  }
  return gravados
}

/** Pausa cada animação nova e põe todas no instante do relógio da página,
 * contado de quando cada uma apareceu. Antes, deixa o React desenhar o que o
 * último passo do relógio mudou: ele agenda o desenho por `MessageChannel`,
 * que o relógio do Playwright não controla. Roda na página. */
async function assentar() {
  for (let i = 0; i < 3; i++)
    await new Promise<void>((pronto) => {
      const canal = new MessageChannel()
      canal.port1.onmessage = () => pronto()
      canal.port2.postMessage(null)
    })
  const pagina = window as typeof window & {
    __nascimentos?: WeakMap<Animation, number>
  }
  pagina.__nascimentos ??= new WeakMap()
  const agora = performance.now()
  for (const animacao of document.getAnimations()) {
    let nascimento = pagina.__nascimentos.get(animacao)
    if (nascimento === undefined) {
      nascimento = agora
      pagina.__nascimentos.set(animacao, agora)
      animacao.pause()
    }
    animacao.currentTime = agora - nascimento
  }
}

/** Espera a story montar e o `play` terminar, sem esperar o Storybook dar a
 * story por pronta: antes disso ele espera as animações acabarem, num
 * `setTimeout` que o relógio parado nunca dispara. */
async function storyNaTela(pagina: Page) {
  await ate(pagina, () => {
    const fase = (
      window as typeof window & {
        __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } }
      }
    ).__STORYBOOK_PREVIEW__?.currentRender?.phase
    return ['completing', 'completed', 'errored', 'aborted'].includes(
      fase ?? '',
    )
  })
  if (await pagina.locator('.sb-show-errordisplay').count())
    throw new Error(
      `A story deu erro: ${await pagina.locator('#error-message').innerText()}`,
    )
}

/** Pergunta à página até ela dizer sim, com o relógio do node: o da página
 * está parado. */
async function ate(pagina: Page, condicao: () => boolean, limite = 60_000) {
  const fim = Date.now() + limite
  while (!(await pagina.evaluate(condicao))) {
    if (Date.now() > fim) throw new Error(`A story não carregou em ${limite}ms`)
    await new Promise((pronto) => setTimeout(pronto, 100))
  }
}

/** Confere o id no `index.json` do Storybook antes de abrir o navegador; um
 * id errado sai com os parecidos. */
async function conferirId(opcoes: OpcoesDaStory) {
  const endereco = `${opcoes.base}/index.json`
  const resposta = await fetch(endereco).catch(() => null)
  if (!resposta?.ok)
    throw new Error(
      `Nenhum Storybook em ${opcoes.base}: suba um com \`pnpm storybook\` ou passe --porta.`,
    )
  const ids = idsDoIndice(await resposta.json())
  if (ids.includes(opcoes.story)) return
  const parecidos = idsParecidos(opcoes.story, ids)
  throw new Error(
    parecidos.length > 0
      ? `Nenhuma story "${opcoes.story}" em ${endereco}. Parecidas:\n${parecidos.map((id) => `  ${id}`).join('\n')}`
      : `Nenhuma story "${opcoes.story}" em ${endereco}, nem parecida.`,
  )
}

if (import.meta.main) {
  const argv = process.argv.slice(2)
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(USO)
    process.exit(0)
  }
  const opcoes = lerArgumentos(argv, {
    saida: join(tmpdir(), 'capturas'),
    app: `http://localhost:${portaPedida('start')}`,
    storybook: `http://localhost:${portaPedida('storybook')}`,
  })
  if ('erro' in opcoes) {
    console.error(`${opcoes.erro}\n\n${USO}`)
    process.exit(2)
  }
  try {
    const gravados =
      'story' in opcoes ? await capturarStory(opcoes) : await capturar(opcoes)
    for (const arquivo of gravados) console.log(arquivo)
  } catch (erro) {
    console.error(erro instanceof Error ? erro.message : erro)
    process.exitCode = 1
  }
}
