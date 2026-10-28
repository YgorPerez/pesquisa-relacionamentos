import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useLocation, useRouter } from '@tanstack/react-router'
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
  const router = useRouter()
  // Came from a text's "Ver no Glossário": circle the Verbete, and go back
  // to the sentence, whose reading point the history kept.
  const { hash, fromText } = useLocation({
    select: (l) => ({ hash: l.hash, fromText: l.state.fromText === true }),
  })
  const cameFrom =
    fromText && hash
      ? { slug: hash, backToText: () => router.history.back() }
      : null
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
        <Glossary terms={terms} cameFrom={cameFrom} />
      </Column>
    </Sheet>
  )
}
