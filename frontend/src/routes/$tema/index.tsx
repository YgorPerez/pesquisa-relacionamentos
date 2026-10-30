import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { appliesToYou } from '@tem-estudo/rules/applies-to-you'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  DEFAULT_REQUIREMENTS,
  requirementValue,
} from '@tem-estudo/rules/requirements'
import { reads } from '#/content/reads'
import type { PrioritiesView } from '#/content/priorities-view'
import { useCountOpenedFactSheets } from '#/analytics/counting'
import { useChosenCountry } from '#/state/country'
import { useProfile } from '#/state/profile'
import { CountryChips } from '#/ui/country-chips'
import { usePriorities } from '#/state/priorities'
import { usePossibleGroup, useSavedRequirements } from '#/state/possible-group'
import { CitedFactSheets, Html } from '#/ui/guide'
import {
  Chapters,
  GuideContents,
  GuideSummary,
  SourcesArrow,
  Takeaways,
  Unknowns,
} from '#/ui/guide-sections'
import { WasItHelpful } from '#/ui/counting'
import { BackToGuide, useReadingPointInHistory } from '#/ui/navigation'
import { ProfileBox } from '#/ui/profile'
import { PrioritiesCard } from '#/ui/priorities'
import { PossibleGroupCard } from '#/ui/possible-group'
import { QuestionRow } from '#/ui/question-row'
import { ReadingProgress } from '#/ui/reading-progress'
import { FurtherReading } from '#/ui/readings'
import { Headline, Section } from '#/ui/section'
import { PageSelection } from '#/ui/page-selection'
import { ReferencePopover } from '#/ui/reference-popover'
import { TermPopover } from '#/ui/term-popover'
import { quotable } from '#/ui/selection-quote'
import { Share } from '#/ui/share'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'

// The Topic's page is its Guide (ADR 0042): the title and the Chapters,
// "Em resumo", the Profile, the opening and the Chapters (each Question
// answered where it fits, anchored by its slug), "O que levar", "O que não
// se sabe", "Para ler além daqui" (when the Topic has Readings, #179), one
// list of Fact sheets, one "Ajudou?" and the Questions of other Topics. The reading bar sits on top of all that (#195).
export const Route = createFileRoute('/$tema/')({
  // The country the charts light up (`state/country.ts`, #470); the page
  // checks it against its charts' countries.
  validateSearch: (search: Record<string, unknown>): { pais?: string } =>
    typeof search['pais'] === 'string' ? { pais: search['pais'] } : {},
  // The `loaderData` carries only what the `head` uses; the Guide goes
  // through the `queryClient`.
  loader: async ({ context, params }) => {
    const guide = await context.queryClient.query(reads.guide(params.tema))
    return { search: guide.search }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] }
    const { search } = loaderData
    // The link preview repeats the search title and description; the image
    // is the site's fixed one, from the root.
    return {
      meta: [
        { title: `${search.title} · Tem estudo?` },
        { name: 'description', content: search.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: search.title },
        { property: 'og:description', content: search.description },
      ],
    }
  },
  notFoundComponent: TopicNotFound,
  component: GuidePage,
})

const Marker = () => (
  <svg
    className="flex-none"
    width="30"
    height="34"
    viewBox="0 0 30 34"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M24 3C10 6 4 16 8 30M8 30l-4-7M8 30l6-5" />
  </svg>
)

/** The address's Guide, which the loader already put in the `queryClient`:
 * each block of the page reads it from there, without requesting it again. */
function useGuide() {
  return useSuspenseQuery(reads.guide(Route.useParams().tema)).data
}

function GuidePage() {
  const guide = useGuide()
  useReadingPointInHistory()
  useCountOpenedFactSheets(guide.topic)
  const profile = useProfile()

  return (
    <Sheet>
      <ReadingProgress topic={guide.topic} chapters={guide.chapters} />
      <Column>
        <BackToGuide />
        <Display {...quotable(null, true)}>{guide.title}</Display>
        <GuideContents chapters={guide.chapters} />
        <GuideSummary questions={guide.summary} />
        <YourProfile />
        {guide.countries.length > 0 && (
          <CountryChips countries={guide.countries} />
        )}
        <Html
          className="prosa mt-secao text-lead"
          slot="abertura"
          html={guide.openingHtml}
          quote={null}
        />
        <SourcesArrow />
        <Chapters
          chapters={guide.chapters}
          youMarks={guide.youMarks}
          afterAnswer={(question) =>
            question.calculator === 'priorities' ? (
              <B1Card />
            ) : question.calculator === 'possible-group' ? (
              <B5Card profile={profile} />
            ) : null
          }
        />
        <GuideTakeaways />
        {guide.unknownsHtml && <Unknowns html={guide.unknownsHtml} />}
        {guide.readings.length > 0 && (
          <FurtherReading readings={guide.readings} />
        )}
        <GuideFactSheets />
        <WasItHelpful guide={guide.topic} />
        {guide.elsewhere.length > 0 && <OtherTopics />}

        <GuideShare />

      </Column>
      <PageSelection factSheets={guide.factSheets} page="guide" />
      <TermPopover terms={guide.terms} />
      <ReferencePopover key={guide.topic} factSheets={guide.factSheets} />
    </Sheet>
  )
}

/** "Copiar link": the Guide's address, with the chosen country when there
 * is one (`?pais=`), never the Profile. */
function GuideShare() {
  const { countries } = useGuide()
  const country = useChosenCountry(countries.map((c) => c.slug))
  return (
    <Share
      untitled
      {...(country && { query: `pais=${country}` })}
      sentence={
        country
          ? 'O link leva o endereço do Guia e o país destacado, sem o seu Perfil.'
          : 'O link leva só o endereço do Guia, sem o seu Perfil.'
      }
    />
  )
}

/** The page's one Profile box, before the first Question. */
function YourProfile() {
  const profile = useProfile()
  return (
    <Section id="perfil" aria-labelledby="t-perfil">
      <Headline id="t-perfil">Seu Perfil</Headline>
      <p className="m-0 text-nota leading-nota text-tinta-2">
        Opcional. Com ele, o Guia marca com {'"vale para você"'} o que tem dado
        para o seu Perfil, sem esconder nada.
      </p>
      <ProfileBox profile={profile} />
    </Section>
  )
}

/** "O que levar", with the "vale para você" of each Tip for the Profile. */
function GuideTakeaways() {
  const { takeaways } = useGuide()
  const profile = useProfile()
  if (takeaways.length === 0) return null
  return (
    <Takeaways
      tips={takeaways}
      verdicts={
        profile
          ? takeaways.map((t) => appliesToYou(profile, t.coverage))
          : undefined
      }
    />
  )
}

/** "Fichas citadas": the numbered list, where a number in the text leads
 * without JS. */
function GuideFactSheets() {
  const guide = useGuide()
  return (
    <Section id="fichas" aria-labelledby="t-fichas">
      <Headline id="t-fichas">Fichas citadas</Headline>
      <p className="-mt-1 mr-0 mb-3.5 ml-6 flex max-w-88 items-end gap-1 text-nota leading-folgada text-agua-tinta italic">
        <Marker />
        cada número do texto leva à Ficha com o mesmo número aqui
      </p>
      <CitedFactSheets factSheets={guide.factSheets} />
    </Section>
  )
}

/** The related Questions of other Topics, each on its own row. */
function OtherTopics() {
  const guide = useGuide()
  return (
    <Section id="outros-temas" aria-labelledby="t-outros-temas">
      <Headline id="t-outros-temas">Perguntas de outros Temas</Headline>
      <ul className="isolate m-0 list-none p-0">
        {guide.elsewhere.map((other) => (
          <li key={other.slug} className="not-first:mt-md">
            <QuestionRow question={other} from={guide.title} />
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** The Priorities card, with the top 3 the visitor left on the page. */
function B1Card() {
  const { priorities } = useGuide()
  return priorities ? <PrioritiesCardWithTop3 priorities={priorities} /> : null
}

function PrioritiesCardWithTop3({
  priorities,
}: {
  priorities: PrioritiesView
}) {
  const { top3 } = usePriorities(priorities.traits.map((c) => c.id))
  return (
    <PrioritiesCard
      split={priorities.bar}
      traits={priorities.traits}
      top3={top3}
    />
  )
}

/** The Possible group card, with the count the visitor left on the page. */
function B5Card({ profile }: { profile: Profile | null }) {
  const saved = useSavedRequirements()
  const { estimate, loading, stateData } = usePossibleGroup(profile, saved)
  const r = saved ?? DEFAULT_REQUIREMENTS
  const municipality = r.place?.municipality
    ? stateData?.municipalities.get(r.place.municipality)?.name
    : undefined
  return (
    <PossibleGroupCard
      estimate={estimate}
      used={profile !== null || saved !== null}
      active={estimate.active.map((k) =>
        requirementValue(k, profile, r, municipality),
      )}
      loading={loading}
    />
  )
}

function TopicNotFound() {
  return (
    <Sheet>
      <Column>
        <Display>Essa página não existe</Display>
        <Lead>
          O endereço pode ter mudado.{' '}
          <Link to="/">Veja os Temas na página inicial</Link>.
        </Lead>
      </Column>
    </Sheet>
  )
}
