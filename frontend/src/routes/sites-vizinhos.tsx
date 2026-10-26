import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { readingGroupsQuery } from '#/content/neighbor-sites'
import { ReadingList } from '#/ui/readings'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Notice, Headline, Section, SmallLink } from '#/ui/section'

export const Route = createFileRoute('/sites-vizinhos')({
  loader: async ({ context }) => {
    await context.queryClient.query(readingGroupsQuery())
  },
  head: () => ({
    meta: [
      { title: 'Sites vizinhos · Tem estudo?' },
      {
        name: 'description',
        content:
          'Páginas de outros sites sobre relacionamento que citam os estudos de que falam, por Tema, com o aviso quando o site vende algo ou defende uma causa.',
      },
    ],
  }),
  component: NeighborSitesPage,
})

/** The Neighbor sites' Readings (#179), one group per Topic, Portuguese
 * first. No rating: the site, the line and the notices. */
function NeighborSitesPage() {
  const { data: groups } = useSuspenseQuery(readingGroupsQuery())

  return (
    <Sheet>
      <Column>
        <Display>
          Sites <span className="marca-texto">vizinhos</span>
        </Display>
        <Lead>
          Páginas de outros sites que falam de relacionamento e citam os estudos
          de onde tiram o que dizem. São para ler mais. Os Guias do Tem estudo?
          não se apoiam nelas, só nas Fichas.
        </Lead>

        <Section className="prosa" aria-labelledby="como-entram">
          <Headline id="como-entram">Como uma página entra aqui</Headline>
          <p>
            A gente abre cada página e confere se ela linka ou cita os estudos
            que discute. Não damos nota a nenhuma.
          </p>
          <p>
            Quando o site ou quem escreveu vende algo, ou o site defende uma
            causa declarada, a página traz o aviso logo abaixo. As páginas em
            português vêm primeiro em cada Tema. São poucas, porque achamos
            pouco site brasileiro sobre relacionamento que cite as fontes.
          </p>
        </Section>

        {groups.length === 0 ? (
          <Section aria-labelledby="sem-leituras">
            <Headline id="sem-leituras">Nenhuma página ainda</Headline>
            <Notice>As páginas entram aqui depois de conferidas.</Notice>
          </Section>
        ) : (
          groups.map((group) => (
            <Section
              key={group.topic}
              id={group.topic}
              aria-labelledby={`t-${group.topic}`}
              data-slot="tema-leituras"
            >
              <Headline id={`t-${group.topic}`}>{group.title}</Headline>
              <ReadingList readings={group.readings} />
              <SmallLink to="/$tema" params={{ tema: group.topic }}>
                Ler o Guia<span className="sr-only">: {group.title}</span>
              </SmallLink>
            </Section>
          ))
        )}
      </Column>
    </Sheet>
  )
}
