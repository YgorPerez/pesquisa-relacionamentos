// Os textos do Grupo possível que a página e as peças dividem. Fora do
// `grupo-possivel.tsx`, que só exporta componentes: assim o Fast Refresh
// guarda o estado da tela quando ele muda.
import type { Custo, Estimativa } from '@tem-estudo/rules/possible-group'
import { formatarGanho, formatarVezes } from '@tem-estudo/rules/numbers'

/** Quem atende, para a frase: "mulheres", "homens" ou "pessoas". */
export const NOME_DO_ALVO: Record<Estimativa['alvo'], string> = {
  homens: 'homens',
  mulheres: 'mulheres',
  pessoas: 'pessoas',
}

/** "soltar só este: ×3,4 (+670)". Abaixo de 5%, diz que quase não muda. */
export function textoDoCusto(custo: Custo): string {
  if (custo.vezes < 1.05) return 'soltar este quase não muda o grupo'
  return `soltar só este: ${formatarVezes(custo.vezes)} (${formatarGanho(custo.ganho)})`
}
