// A prévia de link do Grupo possível (#34, story 66), montada no servidor: o
// robô da rede social não roda o JavaScript da página, então a faixa da
// prévia sai da mesma conta (`previa-do-grupo.ts`), feita aqui sobre os
// pacotes por lugar que o build grava (`vite/grupo-possivel.ts`). Só a
// página aberta com a query de link chama isto, e só no servidor: no
// navegador, a conta continua local.
import { createServerFn } from '@tanstack/react-start'
import {
  abrirPacote,
  type DadosDoLugar,
  type LugarDoPacote,
} from '@tem-estudo/rules/possible-group-data'
import type { Previa } from '@tem-estudo/rules/link'
import { montarPreviaDoGrupo } from './previa-do-grupo'

/** O Open Graph da prévia, para o `head` da calculadora; vazio sem prévia. */
export const metaDaPrevia = (previa: Previa | null) =>
  previa
    ? [
        { property: 'og:title', content: previa.titulo },
        { property: 'og:description', content: previa.descricao },
      ]
    : []

const abertos = new Map<string, Promise<DadosDoLugar | null>>()

/** O pacote do lugar: o arquivo em `public/` ao lado do servidor do build
 * (`.output/public`, ou `/app/public` na imagem) ou, no `vite dev`, o que o
 * plugin serve. Fica guardado na memória depois do primeiro pedido. */
async function pacote(
  base: string,
  lugar: LugarDoPacote,
): Promise<DadosDoLugar | null> {
  const chave = `${base}/${lugar}`
  let pedido = abertos.get(chave)
  if (!pedido) {
    pedido = lerPacote(base, lugar).then((bruto) =>
      bruto ? abrirPacote(bruto) : null,
    )
    abertos.set(chave, pedido)
  }
  return pedido
}

async function lerPacote(base: string, lugar: LugarDoPacote): Promise<unknown> {
  const [fs, caminho, url] = await Promise.all([
    import('node:fs/promises'),
    import('node:path'),
    import('node:url'),
  ])
  const arquivo = caminho.join('public', base, `${lugar}.json`)
  for (
    let pasta = caminho.dirname(url.fileURLToPath(import.meta.url));
    ;
    pasta = caminho.dirname(pasta)
  ) {
    try {
      return JSON.parse(await fs.readFile(caminho.join(pasta, arquivo), 'utf8'))
    } catch {
      if (caminho.dirname(pasta) === pasta) break
    }
  }
  const { getRequestUrl } = await import('@tanstack/react-start/server')
  const resposta = await fetch(
    new URL(`${base}/${lugar}.json`, getRequestUrl()),
  )
  return resposta.ok ? resposta.json() : null
}

/** A prévia do link do Grupo possível; `null` se a query não é de link ou os dados faltam. */
export const buscarPreviaDoGrupo = createServerFn({ method: 'GET' })
  .validator((query: unknown) =>
    typeof query === 'string' ? query.slice(0, 2000) : '',
  )
  .handler(async ({ data: query }): Promise<Previa | null> => {
    const { default: dados } = await import('virtual:grupo-possivel')
    return montarPreviaDoGrupo(query, dados, (lugar) =>
      pacote(dados.base, lugar),
    )
  })
