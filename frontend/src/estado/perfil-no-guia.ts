// O Perfil salvo aplicado à vista de um Guia, pela regra do pacote.
import {
  perfilNoGuia,
  type PerfilNoGuia,
} from '@tem-estudo/rules/profile-in-guide'
import type { Perfil } from '@tem-estudo/rules/profile'
import { useMemo } from 'react'
import type { GuiaVista } from '#/conteudo/vista-guia'
import { usePerfil } from './perfil'

export function usePerfilNoGuia(guia: GuiaVista): {
  perfil: Perfil | null
  noGuia: PerfilNoGuia | null
} {
  const perfil = usePerfil()
  const noGuia = useMemo(
    () =>
      perfilNoGuia(perfil, {
        chave: guia.chave,
        achados: guia.achados.map((a) => a.cobre),
        dicas: guia.dicas.map((d) => d.cobre),
      }),
    [perfil, guia],
  )
  return { perfil, noGuia }
}
