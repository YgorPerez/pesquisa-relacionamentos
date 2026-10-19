// Faz os ícones do site e o manifesto a partir da marca do DESIGN.md
// (`src/ui/marca.ts`), e os grava em `public/`, de onde o servidor os serve
// na raiz. No molde do `scripts/icones-da-marca.ts` do Festival dos Macacos.
//
//   node scripts/icones-da-marca.ts
//
// O desenho é o do título do site: o "?" em Bricolage, em tinta, sobre o
// marca-texto amarelo, no papel. Ele ocupa 80% do lado: o Android recorta o
// ícone num círculo, e só o que cabe nele aparece em todo aparelho. Rode de
// novo quando a marca mudar; o `marca.test.ts` confere o manifesto.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { CORES_DA_MARCA, ICONES_DO_SITE, manifesto } from '../src/ui/marca.ts'

const FRONT = join(import.meta.dirname, '..')
const PUBLICO = join(FRONT, 'public')
const BRICOLAGE = join(
  FRONT,
  'src/fontes/bricolage-grotesque-latin-wght-normal.woff2',
)

const dados = (arquivo: string, tipo: string) =>
  `data:${tipo};base64,${readFileSync(arquivo).toString('base64')}`

/** O marca-texto do título (`.marca-texto` em `ui/desenhos.css`). */
const MARCA_TEXTO = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40' preserveAspectRatio='none'%3E%3Cpath d='M4 8C50 6 130 7 196 5l1 8-1 9 1 9-3 3C130 33 60 33 5 35l-2-8 1-9-1-8z' fill='${encodeURIComponent(CORES_DA_MARCA['amarelo-voce'])}'/%3E%3C/svg%3E")`

/** A página que desenha o ícone, em unidades do lado dela. */
const DESENHO = `<style>
  @font-face{font-family:Bricolage;font-weight:500 800;src:url(${dados(BRICOLAGE, 'font/woff2')})}
  html,body{margin:0;height:100%}
  body{display:grid;place-items:center;background:${CORES_DA_MARCA.papel}}
  span{position:relative;z-index:0;font:700 72vw/1 Bricolage;color:${CORES_DA_MARCA.tinta}}
  span::before{content:'';position:absolute;z-index:-1;left:-14vw;right:-14vw;top:18%;bottom:6%;
    background:${MARCA_TEXTO} center / 100% 100% no-repeat;transform:rotate(-0.5deg)}
</style><span>?</span>`

const navegador = await chromium.launch({ channel: 'chrome' })
const pagina = await navegador.newPage()
for (const { arquivo, lado } of ICONES_DO_SITE) {
  await pagina.setViewportSize({ width: lado, height: lado })
  await pagina.setContent(DESENHO)
  await pagina.evaluate(() => document.fonts.ready)
  const destino = join(PUBLICO, arquivo)
  await pagina.screenshot({ path: destino })
  console.log(destino)
}
await navegador.close()

const destino = join(PUBLICO, 'manifest.webmanifest')
writeFileSync(destino, `${JSON.stringify(manifesto(), null, 2)}\n`)
console.log(destino)
