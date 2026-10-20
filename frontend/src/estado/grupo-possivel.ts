// O Grupo possível no navegador: os Requisitos salvos e a conta.
//
// Os Requisitos ficam em `localStorage['tem-estudo:grupo-possivel']`, no
// formato `Requisitos` de `@tem-estudo/rules/requirements` (JSON puro, lido
// por `lerRequisitos`). `null` quer dizer que o visitante nunca mexeu: o
// cartão do B5 (#32) mostra o número do Brasil, e o link (#34) leva só o
// Perfil. A conta roda aqui, sobre os pacotes por lugar que o build grava
// (`vite/grupo-possivel.ts`, baixados por `pacotes-do-grupo.ts`): nada do
// que o visitante pede sai do aparelho.
import type {
  DadosDoLugar,
  LugarDoPacote,
} from '@tem-estudo/rules/possible-group-data'
import {
  estimarGrupo,
  type Estimativa,
} from '@tem-estudo/rules/possible-group'
import type { Perfil } from '@tem-estudo/rules/profile'
import {
  lerRequisitos,
  REQUISITOS_PADRAO,
  type Requisitos,
} from '@tem-estudo/rules/requirements'
import { useEffect, useMemo, useState } from 'react'
import grupoPossivel from 'virtual:grupo-possivel'
import { armazenado, useArmazenado } from './armazenado'
import { pedirPacote, usePacote } from './pacotes-do-grupo'

const requisitosSalvos = armazenado<Requisitos>('grupo-possivel', lerRequisitos)

/** Os Requisitos salvos; `null` se o visitante nunca mexeu (e no servidor). */
export const useRequisitosSalvos = (): Requisitos | null =>
  useArmazenado(requisitosSalvos)

/** Salva os Requisitos (validados como quem lê); `null` apaga. */
export const gravarRequisitos = (requisitos: Requisitos | null) =>
  requisitosSalvos.gravar(requisitos && lerRequisitos(requisitos))

/** Os lugares com dados: o Brasil e as UFs que o build empacotou. */
export const LUGARES_COM_DADOS = grupoPossivel.lugares

/** A conta de quem não disse nada (Brasil, sem Perfil), já feita no build. */
const ESTIMATIVA_DE_EXEMPLO: Estimativa = grupoPossivel.exemplo

export interface ContaNoNavegador {
  /** A estimativa dos Requisitos pedidos ou, enquanto os dados chegam, a última que deu para fazer. */
  readonly estimativa: Estimativa
  /** A estimativa ainda não é a dos Requisitos pedidos. */
  readonly carregando: boolean
  /** O pacote não chegou (sem rede?). `tentar` pede de novo. */
  readonly falhou: boolean
  readonly tentar: () => void
  /** Os dados da UF escolhida, para a lista de municípios. */
  readonly uf: DadosDoLugar | undefined
}

/** A conta do Perfil e dos Requisitos, refeita a cada mudança. */
export function useGrupoPossivel(
  perfil: Perfil | null,
  salvos: Requisitos | null,
): ContaNoNavegador {
  const requisitos = salvos ?? REQUISITOS_PADRAO
  const uf = requisitos.lugar?.uf
  const precisa: LugarDoPacote[] = uf ? ['BR', uf] : ['BR']
  const doBrasil = usePacote('BR')
  const daUfPedida = usePacote(uf)

  // Quem nunca disse nada vê a conta feita no build, sem baixar nada.
  const deExemplo = perfil === null && salvos === null

  useEffect(() => {
    if (!deExemplo) for (const lugar of precisa) pedirPacote(lugar)
  })

  const brasil = doBrasil.dados
  const daUf = daUfPedida.dados
  const prontos = brasil && (!uf || daUf)
  const calculada = useMemo(() => {
    if (!prontos || deExemplo) return null
    const dados = { brasil, ...(daUf && { uf: daUf }) }
    try {
      return estimarGrupo({ perfil, requisitos }, dados)
    } catch {
      // Um município salvo que os dados de agora não têm: vale a UF inteira.
      const naUf = {
        ...requisitos,
        lugar: requisitos.lugar && { uf: requisitos.lugar.uf },
      }
      return estimarGrupo({ perfil, requisitos: naUf }, dados)
    }
  }, [prontos, deExemplo, perfil, requisitos, brasil, daUf])
  // Enquanto os dados chegam, vale a última que deu para fazer. Guardada no
  // estado e trocada durante o render, como o React manda guardar o que veio
  // de um render anterior.
  const [ultima, setUltima] = useState<Estimativa>(ESTIMATIVA_DE_EXEMPLO)
  const estimativa = deExemplo ? ESTIMATIVA_DE_EXEMPLO : (calculada ?? ultima)
  if (estimativa !== ultima) setUltima(estimativa)

  return {
    estimativa,
    carregando: !deExemplo && !calculada,
    falhou: doBrasil.falhou || daUfPedida.falhou,
    tentar: () => precisa.forEach((lugar) => pedirPacote(lugar, true)),
    uf: daUf,
  }
}
