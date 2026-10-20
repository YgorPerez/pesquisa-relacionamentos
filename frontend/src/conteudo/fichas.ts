// As Fichas para as páginas, lidas no servidor. O navegador chama estas
// funções por RPC na navegação, e o acervo inteiro fica fora do bundle dele.
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
// Só os subcaminhos sem `node:fs`: este arquivo também entra no bundle do
// navegador, que fica com os stubs das funções.
import { isFactSheetIndexable } from '@tem-estudo/content/paths'
import { VERIFICATION_STATUSES } from '@tem-estudo/content/lists'
import { resumo, vista, type FichaResumo, type FichaVista } from './vista'
import { citadaEm, type CitadaEm } from './vista-guia'

const ORDEM_DO_STATUS: ReadonlyArray<string> = VERIFICATION_STATUSES

/** Todas as Fichas: as conferidas primeiro, depois por nome. */
export const listarFichas = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<FichaResumo>> => {
    const { default: acervo } = await import('virtual:acervo')
    return [...acervo.factSheets]
      .sort(
        (a, b) =>
          ORDEM_DO_STATUS.indexOf(a.status) -
            ORDEM_DO_STATUS.indexOf(b.status) || a.slug.localeCompare(b.slug),
      )
      .map(resumo)
  },
)

export const buscarFicha = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => {
    if (typeof slug !== 'string') throw new Error('slug inválido')
    return slug
  })
  .handler(
    async ({ data: slug }): Promise<FichaVista & { citadaEm: CitadaEm }> => {
      const { default: acervo } = await import('virtual:acervo')
      const ficha = acervo.factSheets.find((f) => f.slug === slug)
      if (!ficha) throw notFound()
      return {
        ...vista(ficha, isFactSheetIndexable(ficha)),
        citadaEm: citadaEm(slug, acervo),
      }
    },
  )
