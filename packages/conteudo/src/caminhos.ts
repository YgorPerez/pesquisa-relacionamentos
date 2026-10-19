// Caminhos e indexação derivados do conteúdo (#15). O sitemap e os
// metadados de busca entram aqui quando as outras páginas chegarem.
import type { Ficha } from './ficha.ts'
import type { Guia } from './itens.ts'

export function caminhoDaFicha(ficha: Pick<Ficha, 'slug'>): string {
  return `/estudos/${ficha.slug}`
}

export function caminhoDoTema(tema: { readonly slug: string }): string {
  return `/${tema.slug}`
}

export function caminhoDoGuia(guia: Pick<Guia, 'tema' | 'slug'>): string {
  return `/${guia.tema}/${guia.slug}`
}

export function caminhoDaDica(dica: { readonly slug: string }): string {
  return `/dicas/${dica.slug}`
}

/** Ficha ⬜ fica fora do índice e do sitemap: só ✅ e 🟡 vão para a busca. */
export function fichaIndexavel(ficha: Pick<Ficha, 'status'>): boolean {
  return ficha.status !== 'nao-verificado'
}
