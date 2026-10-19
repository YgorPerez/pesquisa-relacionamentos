// O Perfil aplicado a uma página de Guia (DESIGN.md, "Perfil: destacar sem
// esconder"): o veredito de cada achado e Dica, quantos achados têm dado, se
// o número-chave da resposta curta vale e, se não vale, qual achado vale.
import { perfilVazio, type Perfil } from './perfil.ts'
import { valeParaVoce, type Cobre, type Veredito } from './vale-para-voce.ts'

export interface CobresDoGuia {
  /** O `cobre` das Fichas citadas junto do número-chave (`==…==`); `null` se a
   * resposta curta não marcou número. */
  readonly chave: ReadonlyArray<Cobre> | null
  /** Um item por achado, na ordem da página. */
  readonly achados: ReadonlyArray<ReadonlyArray<Cobre>>
  readonly dicas: ReadonlyArray<ReadonlyArray<Cobre>>
}

export interface PerfilNoGuia {
  readonly achados: ReadonlyArray<Veredito>
  readonly dicas: ReadonlyArray<Veredito>
  /** Quantos achados têm dado para o Perfil. Zero liga o aviso acima do título. */
  readonly comDado: number
  /** A linha "Para o seu Perfil: …". Quando o número-chave não vale, `achado`
   * é o índice do primeiro achado que vale, ou `null` se nenhum vale. */
  readonly chave: { readonly vale: true } | { readonly vale: false; readonly achado: number | null } | null
}

export function perfilNoGuia(perfil: Perfil | null, guia: CobresDoGuia): PerfilNoGuia | null {
  if (perfilVazio(perfil)) return null
  // Com Perfil, `valeParaVoce` sempre decide.
  const veredito = (cobres: ReadonlyArray<Cobre>) => valeParaVoce(perfil, cobres) as Veredito
  const achados = guia.achados.map(veredito)
  const primeiro = achados.findIndex((v) => v.cobre)
  return {
    achados,
    dicas: guia.dicas.map(veredito),
    comDado: achados.filter((v) => v.cobre).length,
    chave:
      guia.chave === null
        ? null
        : veredito(guia.chave).cobre
          ? { vale: true }
          : { vale: false, achado: primeiro === -1 ? null : primeiro },
  }
}
