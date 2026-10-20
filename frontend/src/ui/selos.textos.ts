// O Desenho do estudo escrito por extenso, para a página da Ficha. Fora do
// `selos.tsx`, que só exporta componentes: assim o Fast Refresh guarda o
// estado da tela quando ele muda.
import type { Desenho } from '@tem-estudo/content'

export const PALAVRA_DO_DESENHO: Record<Desenho, string> = {
  longitudinal: 'longitudinal (acompanha as mesmas pessoas no tempo)',
  transversal: 'transversal (um retrato num momento)',
  experimento: 'experimento',
  plataforma: 'dados de plataforma',
  administrativo: 'registro administrativo',
  'meta-analise': 'meta-análise (junta vários estudos)',
}
