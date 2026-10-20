// O Perfil do visitante, salvo no navegador e lido por qualquer página: o
// Guia, a página da Dica e os cartões e páginas das calculadoras.
import { readProfile, type Profile } from '@tem-estudo/rules/profile'
import { armazenado, useArmazenado } from './armazenado'

export const perfilSalvo = armazenado<Profile>('perfil', readProfile)

/** O Perfil salvo, ou `null` (sem Perfil, no servidor e na hidratação). */
export const usePerfil = (): Profile | null => useArmazenado(perfilSalvo)

/** Salva o Perfil (passa pela mesma validação de quem lê); `null` apaga. */
export const gravarPerfil = (perfil: Profile | null) =>
  perfilSalvo.gravar(perfil && readProfile(perfil))
