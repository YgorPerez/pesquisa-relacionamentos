import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { reads } from '#/content/reads'
import { useReadingPointInHistory } from '#/ui/navigation'
import { CalculatorRow } from '#/ui/question-row'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Notice, Headline, Section } from '#/ui/section'
import { TopicIndex } from '#/ui/topic-index'

export const Route = createFileRoute('/')({
  // It only waits for the read: the data goes to the browser through the
  // `queryClient`, and not through `loaderData`, which would send it twice in
  // the HTML.
  loader: async ({ context }) => {
    await context.queryClient.query(reads.topics())
  },
  component: Home,
})

/** The two calculators. Their pages arrive in tickets #32 and #33. */
const CALCULATORS = [
  {
    to: '/grupo-possivel',
    name: 'Grupo possível',
    summary: 'Quantas pessoas no Brasil atendem ao que você procura.',
  },
  {
    to: '/prioridades',
    name: 'Prioridades vs. evidência',
    summary:
      'Toque no que mais importa para você e veja quanto a evidência põe em cada um.',
  },
] as const

/** "Os Temas": the index of the Topics, in the content's order, or, with no
 * Guide published, the way to the studies. */
function Topics() {
  const { data: topics } = useSuspenseQuery(reads.topics())
  return (
    <Section aria-labelledby="temas">
      <Headline id="temas">Os Temas</Headline>
      {topics.length === 0 ? (
        <Notice>
          Os Guias entram no ar quando os estudos que os sustentam forem
          conferidos na fonte. Enquanto isso,{' '}
          <Link to="/estudos">veja os estudos do acervo</Link>.
        </Notice>
      ) : (
        <TopicIndex topics={topics} />
      )}
    </Section>
  )
}

/** The home page: the site's sentence, the Topics with their Questions and
 * the shortcuts to the calculators. */
function Home() {
  // Back from a Guide, the Topic that was open opens again, at the same
  // scroll.
  useReadingPointInHistory()
  return (
    <Sheet>
      <Column>
        <Display>
          Dúvida de relacionamento, com a{' '}
          <span className="marca-texto">fonte</span> junto
        </Display>
        <Lead>
          Respostas curtas para o que se pergunta de um relacionamento, de onde
          conhecer alguém a como manter a relação. Cada afirmação leva ao estudo
          de onde saiu, e a gente avisa quando a pesquisa ainda não sabe.
        </Lead>

        <Topics />

        <Section aria-labelledby="calculadoras">
          <Headline id="calculadoras">Faça a conta</Headline>
          <ul className="isolate m-0 list-none p-0">
            {CALCULATORS.map((c) => (
              <li key={c.to} className="not-first:mt-md">
                <CalculatorRow href={c.to} title={c.name} summary={c.summary} />
              </li>
            ))}
          </ul>
        </Section>

        <footer className="mt-rodape text-nota text-tinta-2">
          <p>
            <Link to="/estudos">Todos os estudos</Link> ·{' '}
            <Link to="/dicas">Todas as Dicas</Link>
          </p>
        </footer>
      </Column>
    </Sheet>
  )
}
