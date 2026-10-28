import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { glossaryQuery } from '#/content/glossary'
import { Glossary } from '#/ui/glossary'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'

export const Route = createFileRoute('/glossario')({
  loader: async ({ context }) => {
    await context.queryClient.query(glossaryQuery())
  },
  head: () => ({
    meta: [
      { title: 'Glossário · Tem estudo?' },
      {
        name: 'description',
        content:
          'O que quer dizer cada palavra de pesquisa dos Guias, e como cada estudo definiu as que mudam de um estudo para outro.',
      },
    ],
  }),
  component: GlossaryPage,
})

/** The Verbetes (#351), alphabetical, each on its anchor. */
function GlossaryPage() {
  const { data: terms } = useSuspenseQuery(glossaryQuery())
  return (
    <Sheet>
      <Column>
        <Display>
          <span className="marca-texto">Glossário</span>
        </Display>
        <Lead>
          As palavras de pesquisa que aparecem nos Guias. Algumas, como
          satisfação, cada estudo mede de um jeito, e aqui fica como cada um
          mediu.
        </Lead>
        <Glossary terms={terms} />
      </Column>
    </Sheet>
  )
}
