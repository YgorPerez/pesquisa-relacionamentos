// O Perfil do visitante, salvo no navegador e lido por qualquer página: o
// Guia, a página da Dica e os cartões e páginas das calculadoras.
import { lerPerfil, type Perfil } from '@tem-estudo/regras/perfil'
import { armazenado, useArmazenado } from './armazenado'

export const perfilSalvo = armazenado<Perfil>('perfil', lerPerfil)

/** O Perfil salvo, ou `null` (sem Perfil, no servidor e na hidratação). */
export const usePerfil = (): Perfil | null => useArmazenado(perfilSalvo)

/** Salva o Perfil (passa pela mesma validação de quem lê); `null` apaga. */
export const gravarPerfil = (perfil: Perfil | null) =>
  perfilSalvo.gravar(perfil && lerPerfil(perfil))
