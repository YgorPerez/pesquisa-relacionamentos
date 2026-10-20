// Os dados do Grupo possível no navegador (#31). O CSV do Censo tem 31 MB:
// em vez dele, o build grava um pacote JSON por lugar (o Brasil e cada UF,
// esta com os municípios dela), e a página baixa só o que a conta precisa.
// A conta roda no navegador, então os Requisitos e o Perfil não saem do
// aparelho (story 68).
//
// Os pacotes ficam em `/dados/grupo-possivel/<versão>/<lugar>.json`, com a
// versão tirada do conteúdo: um CSV novo muda o caminho, e o cache longo
// nunca serve dado velho. `virtual:grupo-possivel` diz a versão, os lugares
// e a estimativa de quem ainda não disse nada (Brasil, sem Perfil), que a
// página desenha no servidor antes de baixar qualquer pacote.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  openPack,
  readGroupBase,
  packForPlace,
  type GroupFiles,
  type PackPlace,
} from '@tem-estudo/rules/possible-group-data'
import { estimateGroup, type Estimate } from '@tem-estudo/rules/possible-group'
import { DEFAULT_REQUIREMENTS, STATES } from '@tem-estudo/rules/requirements'
import type { Plugin } from 'vite-plus'

const ID = 'virtual:grupo-possivel'
const RESOLVIDO = `\0${ID}`
const CAMINHO = '/dados/grupo-possivel'

const ARQUIVOS: Record<keyof GroupFiles, string> = {
  census: 'censo-2022.csv',
  ages: 'sidra-9514-idade.csv',
  municipalities: 'sidra-10185-municipios.csv',
  pns: 'pns-2019.csv',
}

export interface DadosMontados {
  readonly versao: string
  /** O texto JSON de cada pacote. */
  readonly pacotes: ReadonlyMap<PackPlace, string>
  readonly exemplo: Estimate
}

/** Lê `dados/grupo-possivel/` e monta os pacotes. */
export function montarPacotes(pasta: string): DadosMontados {
  const textos = Object.fromEntries(
    Object.entries(ARQUIVOS).map(([chave, nome]) => [
      chave,
      readFileSync(resolve(pasta, nome), 'utf8'),
    ]),
  ) as unknown as GroupFiles
  const base = readGroupBase(textos)
  const lugares: PackPlace[] = [
    'BR',
    ...STATES.map((u) => u.abbr).filter((uf) =>
      base.census.some((linha) => linha.uf === uf),
    ),
  ]
  const pacotes = new Map(
    lugares.map((lugar) => [lugar, JSON.stringify(packForPlace(base, lugar))]),
  )
  const hash = createHash('sha256')
  for (const texto of pacotes.values()) hash.update(texto)
  const brasil = openPack(JSON.parse(pacotes.get('BR')!))
  return {
    versao: hash.digest('hex').slice(0, 10),
    pacotes,
    exemplo: estimateGroup(
      { profile: null, requirements: DEFAULT_REQUIREMENTS },
      { brazil: brasil },
    ),
  }
}

/** `raiz` é a do acervo, já validada (`vite/ambiente.ts`). */
export function grupoPossivel({ raiz }: { raiz: string }): Plugin {
  const pasta = resolve(raiz, 'dados', 'grupo-possivel')
  let montados: DadosMontados | undefined
  const dados = () => (montados ??= montarPacotes(pasta))

  return {
    name: 'tem-estudo:grupo-possivel',
    resolveId(id) {
      return id === ID ? RESOLVIDO : undefined
    },
    load(id) {
      if (id !== RESOLVIDO) return undefined
      for (const nome of Object.values(ARQUIVOS))
        this.addWatchFile(resolve(pasta, nome))
      const { versao, pacotes, exemplo } = dados()
      return `export default ${JSON.stringify({
        base: `${CAMINHO}/${versao}`,
        lugares: [...pacotes.keys()],
        exemplo,
      })}`
    },
    // Os pacotes vão para a saída do navegador, servida como arquivo estático.
    generateBundle() {
      if (this.environment.name !== 'client') return
      const { versao, pacotes } = dados()
      for (const [lugar, texto] of pacotes)
        this.emitFile({
          type: 'asset',
          fileName: `${CAMINHO.slice(1)}/${versao}/${lugar}.json`,
          source: texto,
        })
    },
    configureServer(servidor) {
      servidor.middlewares.use(CAMINHO, (pedido, resposta, seguir) => {
        const [, versao, arquivo] = (pedido.url ?? '').split('/')
        const lugar = arquivo?.replace(/\.json$/, '') as PackPlace | undefined
        const texto =
          lugar && versao === dados().versao
            ? dados().pacotes.get(lugar)
            : undefined
        if (!texto) return seguir()
        resposta.setHeader('content-type', 'application/json')
        resposta.end(texto)
      })
    },
  }
}
