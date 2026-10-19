// Caminhos e indexação derivados do conteúdo (#15). O sitemap e os
// metadados de busca entram aqui quando as outras páginas chegarem.
import type { Ficha } from './ficha.ts'

export function caminhoDaFicha(ficha: Pick<Ficha, 'slug'>): string {
  return `/estudos/${ficha.slug}`
}

/** Ficha ⬜ fica fora do índice e do sitemap: só ✅ e 🟡 vão para a busca. */
export function fichaIndexavel(ficha: Pick<Ficha, 'status'>): boolean {
  return ficha.status !== 'nao-verificado'
}
