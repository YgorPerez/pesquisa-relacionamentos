import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { reads } from '#/content/reads'
import { AnswerConfidence, CitedFactSheets, Html } from '#/ui/guide'
import { QuestionRow } from '#/ui/question-row'
import {
  useReadingPointInHistory,
  useReferences,
  BackToGuide,
  type CircledFactSheet,
} from '#/ui/navigation'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Headline, Panel, Section } from '#/ui/section'
import {
  NoDataNotice,
  ProfileBox,
  ProfileLink,
  ForYourProfile,
} from '#/ui/profile'
import { useProfileInGuide } from '#/state/profile-in-guide'
import { usePriorities } from '#/state/priorities'
import type { PrioritiesView } from '#/content/priorities-view'
import { PrioritiesCard } from '#/ui/priorities'
import {
  GuideTips,
  Evidence,
  Myths,
  OwnSections,
  SourcesArrow,
} from '#/ui/guide-sections'
import { WasItHelpful } from '#/ui/counting'
import { useCountOpenedFactSheets } from '#/analytics/counting'
import { Share } from '#/ui/share'
import { usePossibleGroup, useSavedRequirements } from '#/state/possible-group'
import { PossibleGroupCard } from '#/ui/possible-group'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  DEFAULT_REQUIREMENTS,
  requirementValue,
} from '@tem-estudo/rules/requirements'

export const Route = createFileRoute('/$tema/$slug')({
  // The `loaderData` carries only what the `head` and the Topic tag in the
  // header (`ui/header.tsx`) use; the Guide goes through the `queryClient`.
  loader: async ({ context, params }) => {
    const guide = await context.queryClient.query(
      reads.guide(params.tema, params.slug),
    )
    return {
      search: guide.search,
      topic: guide.topic,
      topicTitle: guide.topicTitle,
    }
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
  notFoundComponent: GuideNotFound,
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
 * each section of the page reads it from there, without requesting it
 * again. */
function useGuide() {
  const { tema, slug } = Route.useParams()
  return useSuspenseQuery(reads.guide(tema, slug)).data
}

function GuidePage() {
  const guide = useGuide()
  const { circled, backToText } = useReferences(guide.slug)
  useReadingPointInHistory()
  useCountOpenedFactSheets(guide.slug)
  const { profile, inGuide } = useProfileInGuide(guide)

  return (
    <Sheet>
      <Column>
        <BackToGuide />
        {profile && inGuide?.withData === 0 && (
          <NoDataNotice profile={profile} />
        )}
        <Display>
          <Html as="span" html={guide.questionHtml} />
        </Display>

        <ShortAnswer inGuide={inGuide} />

        <SourcesArrow />

        <ProfileLink profile={profile} />

        {guide.tips.length > 0 && (
          <GuideTips tips={guide.tips} verdicts={inGuide?.tips} />
        )}

        {guide.priorities && <B1Card priorities={guide.priorities} />}
        {guide.possibleGroup && <B5Card profile={profile} />}

        <Evidence guide={guide} verdicts={inGuide?.findings} />

        <OwnSections sections={guide.sections} />

        <VariesByProfile profile={profile} withData={inGuide?.withData} />

        {guide.myths.length > 0 && <Myths myths={guide.myths} />}

        <Section aria-labelledby="t-limitacoes">
          <Headline id="t-limitacoes">Limitações e o que não se sabe</Headline>
          <Html className="prosa limites" html={guide.limitationsHtml} />
        </Section>

        <GuideFactSheets circled={circled} backToText={backToText} />

        <WasItHelpful key={guide.slug} guide={guide.slug} />

        {guide.related.length > 0 && <RelatedQuestions />}

        <Share
          untitled
          sentence="O link leva só o endereço do Guia, sem o seu Perfil."
        />
      </Column>
    </Sheet>
  )
}

/** The short answer, with the Confidence and, with a Profile, the "Para o
 * seu Perfil" line. */
function ShortAnswer({
  inGuide,
}: {
  inGuide: ReturnType<typeof useProfileInGuide>['inGuide']
}) {
  const guide = useGuide()
  return (
    <Panel
      as="section"
      className="mb-2 [&>p]:m-0 [&>p]:mt-xs"
      aria-labelledby="t-resposta"
    >
      <h2 id="t-resposta" className="sr-only">
        Resposta curta
      </h2>
      <AnswerConfidence confidence={guide.confidence} />
      <Html className="prosa text-lead" html={guide.answerHtml} />
      {inGuide && (
        <ForYourProfile keyNumber={inGuide.key} findings={guide.findings} />
      )}
    </Panel>
  )
}

/** "Varia conforme o Perfil?": the Guide's text and the Profile box, with
 * how many findings have data for it (`withData`, only with a Profile). */
function VariesByProfile({
  profile,
  withData,
}: {
  profile: Profile | null
  withData: number | undefined
}) {
  const guide = useGuide()
  return (
    <Section id="perfil" aria-labelledby="t-perfil">
      <Headline id="t-perfil">Varia conforme o Perfil?</Headline>
      <Html className="prosa" html={guide.profileHtml} />
      <ProfileBox
        profile={profile}
        withData={withData ?? null}
        findingTotal={guide.findings.length}
      />
    </Section>
  )
}

/** "Fichas citadas": the numbered list, with the way there and back between
 * the number in the text and the Fact sheet. */
function GuideFactSheets({
  circled,
  backToText,
}: {
  circled: CircledFactSheet | null
  backToText: () => void
}) {
  const guide = useGuide()
  return (
    <Section id="fichas" aria-labelledby="t-fichas">
      <Headline id="t-fichas">Fichas citadas</Headline>
      <p className="-mt-1 mr-0 mb-3.5 ml-6 flex max-w-88 items-end gap-1 text-nota leading-folgada text-agua-tinta italic">
        <Marker />
        cada número do texto leva à Ficha com o mesmo número aqui
      </p>
      <CitedFactSheets
        factSheets={guide.factSheets}
        circled={circled}
        backToText={backToText}
      />
    </Section>
  )
}

/** The Topic's other Questions, each on its own row. */
function RelatedQuestions() {
  const guide = useGuide()
  return (
    <Section aria-labelledby="t-relacionadas">
      <Headline id="t-relacionadas">Perguntas relacionadas</Headline>
      <ul className="isolate m-0 list-none p-0">
        {guide.related.map((other) => (
          <li key={other.slug} className="not-first:mt-md">
            <QuestionRow guide={other} from={guide.question} />
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** The Priorities card, with the top 3 the visitor left on the page. */
function B1Card({ priorities }: { priorities: PrioritiesView }) {
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

function GuideNotFound() {
  return (
    <Sheet>
      <Column>
        <Display>Esse Guia não existe</Display>
        <Lead>
          O endereço pode ter mudado.{' '}
          <Link to="/">Veja os Temas na página inicial</Link>.
        </Lead>
      </Column>
    </Sheet>
  )
}
