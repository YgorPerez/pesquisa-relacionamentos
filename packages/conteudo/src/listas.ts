// As listas fechadas do conteúdo (#10, #5, #16), sem dependência nenhuma:
// o navegador importa daqui sem levar o Effect junto.

/** Status de verificação: ✅ lido no original, 🟡 parcial, ⬜ não verificado. */
export const STATUS = ['ok', 'parcial', 'nao-verificado'] as const
export type Status = (typeof STATUS)[number]

/** Força da evidência da Ficha e da Dica, e a Confiança do Guia. */
export const FORCAS = ['forte', 'moderada', 'fraca'] as const
export type Forca = (typeof FORCAS)[number]

export const DESENHOS = [
  'longitudinal',
  'transversal',
  'experimento',
  'plataforma',
  'administrativo',
  'meta-analise',
] as const
export type Desenho = (typeof DESENHOS)[number]

/** O que um estudo cobre. `outro` e `ambos` existem só no Perfil (#5). */
export const GENEROS = ['homem', 'mulher'] as const
export const PROCURA = ['homens', 'mulheres'] as const
export const CASAIS = ['hetero', 'mesmo-sexo'] as const
