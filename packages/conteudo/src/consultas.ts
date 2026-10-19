// Consultas sobre o acervo já montado. Só tipos de fora: o navegador e as
// server functions importam daqui sem levar `node:fs` nem o Effect.
import type { Acervo } from './acervo.ts'
import type { Dica, Guia, Tema } from './itens.ts'

export const guiaPorSlug = (acervo: Acervo, slug: string): Guia | undefined =>
  acervo.guias.find((g) => g.slug === slug)

export const temaPorSlug = (acervo: Acervo, slug: string): Tema | undefined =>
  acervo.temas.find((t) => t.slug === slug)

export const dicaPorSlug = (acervo: Acervo, slug: string): Dica | undefined =>
  acervo.dicas.find((d) => d.slug === slug)

/** Os Guias do Tema, na `ordem` dele. */
export const guiasDoTema = (acervo: Acervo, tema: string): ReadonlyArray<Guia> =>
  acervo.guias.filter((g) => g.tema === tema)

/** Os Guias que trazem a Dica, na ordem dos Temas. */
export const guiasComADica = (acervo: Acervo, dica: string): ReadonlyArray<Guia> =>
  acervo.guias.filter((g) => g.dicas.includes(dica))

/** Só a Dica com todas as Fichas ✅ ou 🟡 vai para o site. */
export const dicaPublicada = (dica: Pick<Dica, 'publicada'>): boolean => dica.publicada
