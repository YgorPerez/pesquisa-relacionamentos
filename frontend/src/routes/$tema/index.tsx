import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { appliesToYou } from '@tem-estudo/rules/applies-to-you'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  DEFAULT_REQUIREMENTS,
  requirementValue,
} from '@tem-estudo/rules/requirements'
import { reads } from '#/content/reads'
import type { QuestionView } from '#/content/guide-view'
import type { PrioritiesView } from '#/content/priorities-view'
import { useCountOpenedFactSheets } from '#/analytics/counting'
import { useProfile } from '#/state/profile'
import { useProfileInGuide } from '#/state/profile-in-guide'
import { usePriorities } from '#/state/priorities'
import { usePossibleGroup, useSavedRequirements } from '#/state/possible-group'
import { AnswerConfidence, CitedFactSheets, Html } from '#/ui/guide'
import {
  Evidence,
  GuideIndex,
  GuideTips,
  Limitations,
  Myths,
  OwnSections,
  SourcesArrow,
  Takeaways,
} from '#/ui/guide-sections'
import { WasItHelpful } from '#/ui/counting'
import {
  BackToGuide,
  useReadingPointInHistory,
  useReferences,
  type CircledFactSheet,
} from '#/ui/navigation'
import {
  ForYourProfile,
  NoDataNotice,
  ProfileBox,
  ProfileCount,
  ProfileLink,
} from '#/ui/profile'
import { PrioritiesCard } from '#/ui/priorities'
import { PossibleGroupCard } from '#/ui/possible-group'
import { QuestionRow } from '#/ui/question-row'
import { Headline, Panel, Section, Subhead, Subsection } from '#/ui/section'
import { Share } from '#/ui/share'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'

// The Topic's page is its Guide (ADR 0042): the index, the opening, one
// section per Question (anchored by the Question's slug), "O que levar", the
// Limitations, one list of Fact sheets and the Questions of other Topics.
export const Route = createFileRoute('/$tema/')({
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
  const profile = useProfile()
  const { circled, backToText } = useReferences(guide.topic)
  useReadingPointInHistory()
  useCountOpenedFactSheets(guide.topic)

  return (
    <Sheet>
      <Column>
        <BackToGuide />
        <Display>{guide.title}</Display>
        <GuideIndex index={guide.index} />
        <Html
          className="prosa mt-secao text-lead"
          slot="abertura"
          html={guide.openingHtml}
        />
        <SourcesArrow />

        <Section id="perfil" aria-labelledby="t-perfil">
          <Headline id="t-perfil">Seu Perfil</Headline>
          <p className="m-0 text-nota leading-nota text-tinta-2">
            Opcional. Em cada Pergunta, o Guia marca o que vale para você e o
            que vem de outras amostras, sem esconder nada.
          </p>
          <ProfileBox profile={profile} withData={null} findingTotal={0} />
        </Section>

        {guide.questions.map((question) => (
          <QuestionSection key={question.slug} question={question} />
        ))}

        {guide.takeaways.length > 0 && (
          <Takeaways
            tips={guide.takeaways}
            verdicts={
              profile
                ? guide.takeaways.map((t) => appliesToYou(profile, t.coverage))
                : undefined
            }
          />
        )}

        {guide.limitations.length > 0 && (
          <Limitations groups={guide.limitations} />
        )}

        <GuideFactSheets circled={circled} backToText={backToText} />

        {guide.elsewhere.length > 0 && <OtherTopics />}

        <Share
          untitled
          sentence="O link leva só o endereço do Guia, sem o seu Perfil."
        />
      </Column>
    </Sheet>
  )
}

/** One Question of the Guide: the short answer with its Confidence, the
 * narrative, "E no Brasil?", what varies by Profile, the Myths, the
 * calculator card and "Ajudou?". */
function QuestionSection({ question }: { question: QuestionView }) {
  const { profile, inGuide } = useProfileInGuide(question)
  const looseTips = question.tips.some((t) => t.finding === null)
  const looseMyths = question.myths.some((m) => m.finding === null)
  return (
    <Section
      id={question.slug}
      aria-labelledby={`${question.slug}-pergunta`}
      className="scroll-mt-md"
      data-question={question.slug}
    >
      <Headline id={`${question.slug}-pergunta`}>
        <Html as="span" html={question.questionHtml} />
      </Headline>
      {profile && inGuide?.withData === 0 && <NoDataNotice profile={profile} />}
      <Panel className="mb-2 [&>p]:m-0 [&>p]:mt-xs" data-slot="resposta">
        <AnswerConfidence confidence={question.confidence} />
        <Html className="prosa text-lead" html={question.answerHtml} />
        {inGuide && (
          <ForYourProfile
            keyNumber={inGuide.key}
            findings={question.findings}
          />
        )}
      </Panel>

      <OwnSections sections={question.sections} />

      <Evidence question={question} verdicts={inGuide ?? undefined} />

      {looseTips && (
        <GuideTips question={question} verdicts={inGuide ?? undefined} />
      )}

      {question.inBrazilHtml && (
        <Subsection aria-labelledby={`${question.slug}-brasil`}>
          <Subhead id={`${question.slug}-brasil`}>E no Brasil?</Subhead>
          <Html className="prosa" html={question.inBrazilHtml} />
        </Subsection>
      )}

      <Subsection aria-labelledby={`${question.slug}-perfil`}>
        <Subhead id={`${question.slug}-perfil`}>
          Varia conforme o Perfil?
        </Subhead>
        <Html className="prosa" html={question.profileHtml} />
        {inGuide && (
          <ProfileCount
            withData={inGuide.withData}
            findingTotal={question.findings.length}
            className="mt-sm"
          />
        )}
        <ProfileLink profile={profile} />
      </Subsection>

      {looseMyths && <Myths question={question} />}

      {question.calculator === 'priorities' && <B1Card />}
      {question.calculator === 'possible-group' && <B5Card profile={profile} />}

      <WasItHelpful question={question.slug} />
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
