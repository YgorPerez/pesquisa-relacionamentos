// O Perfil salvo aplicado à vista de um Guia, pela regra do pacote.
import {
  profileInGuide,
  type ProfileInGuide,
} from '@tem-estudo/rules/profile-in-guide'
import type { Profile } from '@tem-estudo/rules/profile'
import { useMemo } from 'react'
import type { GuiaVista } from '#/conteudo/vista-guia'
import { usePerfil } from './perfil'

export function usePerfilNoGuia(guia: GuiaVista): {
  perfil: Profile | null
  noGuia: ProfileInGuide | null
} {
  const perfil = usePerfil()
  const noGuia = useMemo(
    () =>
      profileInGuide(perfil, {
        key: guia.chave,
        findings: guia.achados.map((a) => a.cobre),
        tips: guia.dicas.map((d) => d.cobre),
      }),
    [perfil, guia],
  )
  return { perfil, noGuia }
}
