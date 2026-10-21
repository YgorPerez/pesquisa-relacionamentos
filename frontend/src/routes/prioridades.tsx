// /prioridades (variant A of the second round of #19): the visitor taps the
// three traits that matter most, picks the outcome and sees on which shelf
// the evidence puts each one.
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ProfileGender } from '@tem-estudo/rules/profile'
import {
  OUTCOME_NAME,
  top3Alert,
  toggleInTop3,
  type PrioritiesState,
} from '@tem-estudo/rules/priorities'
import {
  linkSentence,
  readLink,
  prioritiesPreview,
  linkQuery,
  type LinkState,
} from '@tem-estudo/rules/link'
import { useMemo, useState } from 'react'
import { reads } from '#/content/reads'
import { previewMeta } from '#/content/preview'
import type { PrioritiesView } from '#/content/priorities-view'
import { useReceivedLink } from '#/state/link'
import { useProfile } from '#/state/profile'
import { Share } from '#/ui/share'
import { COUNTING_NOTICE } from '#/ui/share.copy'
import { savePriorities, usePriorities } from '#/state/priorities'
import { countCalculatorUse } from '#/analytics/counting'
import { AnswerConfidence } from '#/ui/guide'
import {
  Top3Warning,
  SatisfactionBar,
  Top3Picker,
  Bookcase,
  OutcomePicker,
} from '#/ui/priorities'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Notice, Headline, Panel, Section } from '#/ui/section'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/shadcn/collapsible'

export const Route = createFileRoute('/prioridades')({
  loader: async ({ context, location }) => {
    const view = await context.queryClient.query(reads.priorities())
    // The link preview, for the social network's bot: the top 3 and the
    // alert, without the Profile. Only on the server; in the browser it
    // serves no one. It stays in `loaderData`, which only `head` reads; the
    // view goes through the `queryClient`.
    const state =
      view && typeof window === 'undefined'
        ? readLink('prioridades', location.searchStr, idsOf(view))
        : null
    const preview =
      state?.calculator === 'prioridades'
        ? prioritiesPreview(view!.traits, state.priorities)
        : null
    return { preview }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: 'Prioridades vs. evidência · Tem estudo?' },
      {
        name: 'description',
        content:
          'Toque nas três características que mais importam para você num parceiro e veja quanto a evidência põe em cada uma.',
      },
      ...previewMeta(loaderData?.preview ?? null),
    ],
  }),
  component: PrioritiesPage,
})

const idsOf = (view: PrioritiesView) => view.traits.map((c) => c.id)

function PrioritiesPage() {
  const { data: view } = useSuspenseQuery(reads.priorities())
  return (
    <Sheet>
      <Column>
        <Display>
          O que você <span className="marca-texto">valoriza</span> pesa mesmo?
        </Display>
        {view ? (
          <Calculator view={view} />
        ) : (
          <Notice>
            Esta conta entra no ar quando os estudos que ela usa forem
            conferidos na fonte. Enquanto isso,{' '}
            <Link to="/estudos">veja os estudos do acervo</Link>.
          </Notice>
        )}
      </Column>
    </Sheet>
  )
}

/** Every change the visitor makes to Priorities goes through here, and
 * counts the use. */
function saveAndCount(next: PrioritiesState) {
  savePriorities(next)
  countCalculatorUse('prioridades')
}

function Calculator({ view }: { view: PrioritiesView }) {
  const { traits } = view
  const ids = useMemo(() => idsOf(view), [view])
  const received = useReceivedLink('prioridades', ids)
  const state = usePriorities(ids)
  const gender = useProfile()?.gender
  const { top3, outcome } = state

  return (
    <>
      <Lead>
        Das dez, quais são as três que mais importam para você num parceiro?
        Toque nelas na ordem.
      </Lead>
      <LinkNotice received={received} />

      <Top3Picker
        traits={traits}
        top3={top3}
        onToggle={(id) =>
          saveAndCount({ ...state, top3: toggleInTop3(top3, id) })
        }
      />

      <div
        className="sticky top-0 z-5 -mx-md mt-lg mb-0 border-b-2 border-tinta bg-papel px-md py-2.5 folha:-mx-16 folha:px-16"
        data-slot="desfecho-preso"
      >
        <OutcomePicker
          outcome={outcome}
          onChoose={(d) => saveAndCount({ ...state, outcome: d })}
        />
      </div>

      {outcome === 'satisfacao' && <BeforeTheList split={view.bar} />}

      <Top3Warning sentence={top3Alert(traits, top3, outcome)} />

      <WhereTheEvidencePuts traits={traits} state={state} gender={gender} />

      <Notice role="note">
        Só um destes estudos inclui o Brasil, entre os 43 países que cobre; os
        outros vêm sobretudo dos EUA e da Europa. Quase todos são de casais
        homem-mulher.
      </Notice>

      <SharePriorities traits={traits} state={state} gender={gender} />

      {view.fromGuide && <FromGuide guide={view.fromGuide} />}
    </>
  )
}

/** The notice that a received link replaced the saved top 3 (and, if it
 * brought one, the Profile's gender). Without a link, nothing. */
function LinkNotice({ received }: { received: LinkState | null }) {
  if (!received) return null
  const changedGender =
    received.calculator === 'prioridades' && received.gender !== null
  return (
    <Notice role="status">
      {changedGender
        ? 'Este link trocou o seu topo 3 e o gênero do seu Perfil pelos de quem mandou.'
        : 'Este link trocou o seu topo 3 salvo pelo de quem mandou.'}
    </Notice>
  )
}

/** "Antes: o parceiro explica pouco da satisfação", open, with the bar. */
function BeforeTheList({ split }: { split: PrioritiesView['bar'] }) {
  return (
    <Collapsible id="antes-da-lista" defaultOpen className="mt-md">
      <CollapsibleTrigger>
        <svg
          className="flex-none transition-transform duration-250 ease-sai group-data-panel-open:rotate-90 motion-reduce:transition-none"
          width="14"
          height="16"
          viewBox="0 0 14 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 2.5l6.5 5.6L4 13.6" />
        </svg>
        Antes: o parceiro explica pouco da satisfação
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SatisfactionBar split={split} />
      </CollapsibleContent>
    </Collapsible>
  )
}

/** The bookcase: on which shelf the evidence puts each trait, for the chosen
 * outcome. One trait at a time is open. */
function WhereTheEvidencePuts({
  traits,
  state: { top3, outcome },
  gender,
}: {
  traits: PrioritiesView['traits']
  state: PrioritiesState
  gender: ProfileGender | undefined
}) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section aria-labelledby="t-estante">
      <h2 id="t-estante" className="sr-only">
        Onde a evidência põe cada uma, para{' '}
        {OUTCOME_NAME[outcome].toLowerCase()}
      </h2>
      <Bookcase
        traits={traits}
        outcome={outcome}
        top3={top3}
        open={open}
        onOpen={setOpen}
        gender={gender}
      />
      <p className="mx-0 mt-sm mb-lg text-nota text-tinta-2">
        Toque numa característica para ver o estudo.
      </p>
    </section>
  )
}

/** The Priorities "Copiar link": the top 3, the outcome and the gender. */
function SharePriorities({
  traits,
  state,
  gender,
}: {
  traits: PrioritiesView['traits']
  state: PrioritiesState
  gender: ProfileGender | undefined
}) {
  const link: LinkState = {
    calculator: 'prioridades',
    gender: gender ?? null,
    priorities: state,
  }
  const names = Object.fromEntries(traits.map((c) => [c.id, c.name]))
  return (
    <Share
      query={linkQuery(link)}
      sentence={linkSentence(link, { names })}
      notice={COUNTING_NOTICE}
    />
  )
}

/** The "Do Guia" block: the Question that hosts the calculator and the short
 * answer. */
function FromGuide({
  guide,
}: {
  guide: NonNullable<PrioritiesView['fromGuide']>
}) {
  return (
    <Section aria-labelledby="t-do-guia">
      <Headline id="t-do-guia">Do Guia</Headline>
      <Panel className="[&>p]:m-0 [&>p]:mt-xs [&>p:first-child]:mt-0 [&>p:first-child]:mb-sm">
        <p className="font-title text-title leading-body font-bold tracking-normal text-tinta">
          {guide.question}
        </p>
        <AnswerConfidence confidence={guide.confidence} />
        <p className="text-lead">{guide.answer}</p>
        <p>
          <Link
            to="/$tema/$slug"
            params={{ tema: guide.topic, slug: guide.slug }}
            className="inline-flex min-h-toque items-center font-bold"
          >
            Ler o Guia inteiro
          </Link>
        </p>
      </Panel>
    </Section>
  )
}
