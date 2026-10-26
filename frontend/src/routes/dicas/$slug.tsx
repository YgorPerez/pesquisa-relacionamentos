import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { reads } from '#/content/reads'
import { CitedFactSheets } from '#/ui/guide'
import { QuestionRow } from '#/ui/question-row'
import { StrengthBadge } from '#/ui/badges'
import { BackLink } from '#/ui/navigation'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Headline, Panel, Section } from '#/ui/section'

export const Route = createFileRoute('/dicas/$slug')({
  // The `loaderData` carries only what the `head` uses; the Tip goes through
  // the `queryClient`.
  loader: async ({ context, params }) => {
    const tip = await context.queryClient.query(reads.tip(params.slug))
    return { search: tip.search }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.search.title} · Tem estudo?` },
          { name: 'description', content: loaderData.search.description },
        ]
      : [],
  }),
  notFoundComponent: TipNotFound,
  component: TipPage,
})

function TipPage() {
  const { data: tip } = useSuspenseQuery(reads.tip(Route.useParams().slug))

  return (
    <Sheet>
      <Column>
        <BackLink to="/dicas">Todas as Dicas</BackLink>

        <Display small>{tip.text}</Display>

        <Panel
          as="section"
          className="[&>p]:m-0"
          aria-label="Quanto a evidência pesa"
        >
          <div className="mt-0 flex flex-wrap items-center gap-x-4 gap-y-1">
            <StrengthBadge strength={tip.strength} withLabel />
          </div>
          {tip.inference && (
            <p className="mt-1 mb-0 text-nota text-tinta-2 italic">
              Inferência nossa: nenhum estudo testou isso direto. Saiu das
              Fichas citadas.
            </p>
          )}
          <p className="mt-xs mb-0 text-label leading-nota font-normal text-tinta-2">
            <b className="text-tinta">Vale para:</b> {tip.appliesTo}
          </p>
        </Panel>

        <Section aria-labelledby="t-guias">
          <Headline id="t-guias">Aparece nos Guias</Headline>
          {tip.questions.length === 0 ? (
            <p className="text-tinta-2">Nenhum Guia traz esta Dica ainda.</p>
          ) : (
            <ul className="isolate m-0 list-none p-0">
              {tip.questions.map((question) => (
                <li key={question.slug} className="not-first:mt-md">
                  <QuestionRow question={question} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section aria-labelledby="t-fichas">
          <Headline id="t-fichas">Fichas citadas</Headline>
          <CitedFactSheets factSheets={tip.factSheets} />
        </Section>
      </Column>
    </Sheet>
  )
}

function TipNotFound() {
  return (
    <Sheet>
      <Column>
        <Display>Essa Dica não está no ar</Display>
        <Lead>
          O endereço pode ter mudado, ou a Dica ainda espera os estudos serem
          conferidos. <Link to="/dicas">Veja as Dicas publicadas</Link>.
        </Lead>
      </Column>
    </Sheet>
  )
}
