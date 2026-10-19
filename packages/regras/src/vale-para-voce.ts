// O "vale para você" (#5, #16): se o que um estudo cobriu inclui o Perfil.
// Nada some por causa da regra; ela só diz onde vai o selo amarelo e onde vai
// o anel vazio com "Não há dado deste estudo para o seu Perfil.".
import { perfilVazio, type Perfil } from './perfil.ts'

type Lado = 'homens' | 'mulheres'

/** O que a amostra cobriu, no formato do `cobre` da Ficha e do `vale_para`
 * de achados e Dicas. Chave ausente quer dizer que o estudo não separou. */
export interface Cobre {
  readonly generos?: ReadonlyArray<'homem' | 'mulher'>
  readonly procura?: ReadonlyArray<Lado>
  readonly idades?: { readonly min: number; readonly max: number }
  readonly casal?: 'hetero' | 'mesmo-sexo'
}

/** `null`: sem Perfil, não há o que decidir. `so`: quem procura ambos e só um
 * dos lados tem dado (o selo diz qual). */
export type Veredito = { readonly cobre: false } | { readonly cobre: true; readonly so?: Lado }

/** Os lados do Perfil que este `cobre` inclui; vazio se não inclui o Perfil. */
function ladosCobertos(perfil: Perfil, cobre: Cobre): ReadonlyArray<Lado | undefined> {
  const { genero, procura, idade } = perfil
  if (idade !== undefined && cobre.idades && (idade < cobre.idades.min || idade > cobre.idades.max)) return []
  // "outro" só casa com o que não separou por gênero; o par do casal também separa.
  if (genero === 'outro' && (cobre.generos || cobre.casal)) return []
  if ((genero === 'homem' || genero === 'mulher') && cobre.generos && !cobre.generos.includes(genero)) return []

  const lados: ReadonlyArray<Lado | undefined> =
    procura === undefined ? [undefined] : procura === 'ambos' ? ['homens', 'mulheres'] : [procura]
  return lados.filter((lado) => {
    if (lado === undefined) return true
    if (cobre.procura && !cobre.procura.includes(lado)) return false
    if (cobre.casal && (genero === 'homem' || genero === 'mulher')) {
      const mesmoSexo = (genero === 'homem') === (lado === 'homens')
      return mesmoSexo === (cobre.casal === 'mesmo-sexo')
    }
    return true
  })
}

/** Se um achado ou Dica vale para o Perfil: basta um dos `cobre` (um por
 * Ficha citada, ou o `vale_para` do recorte) cobrir. */
export function valeParaVoce(perfil: Perfil | null, cobres: ReadonlyArray<Cobre>): Veredito | null {
  if (!perfil || perfilVazio(perfil)) return null
  const lados = new Set(cobres.flatMap((cobre) => ladosCobertos(perfil, cobre)))
  if (lados.size === 0) return { cobre: false }
  if (perfil.procura === 'ambos' && lados.size === 1) {
    const [so] = lados
    if (so) return { cobre: true, so }
  }
  return { cobre: true }
}
