import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { Estimate } from '@tem-estudo/rules/possible-group'
import { formatAmount } from '@tem-estudo/rules/numbers'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  MAX_HEIGHT,
  MIN_HEIGHT,
  COLORS,
  MIN_EDUCATIONS,
  soughtAge,
  MAX_SOUGHT_AGE,
  MIN_SOUGHT_AGE,
  RELIGIONS,
  MIN_INCOMES,
  REQUIREMENTS,
  DEFAULT_REQUIREMENTS,
  COLOR_LABEL,
  EDUCATION_LABEL,
  RELIGION_LABEL,
  INCOME_LABEL,
  WORKS,
  WORK_LABEL,
  release,
  REQUIREMENT_TITLE,
  STATES,
  TARGET_NAME,
  requirementValue,
  type VisitorRequirement,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import {
  isLink,
  linkSentence,
  linkQuery,
  type LinkState,
} from '@tem-estudo/rules/link'
import { useId, useRef, type ReactNode } from 'react'
import type { CalculatorGuide } from '#/content/guides'
import { reads } from '#/content/reads'
import { fetchGroupPreview, previewMeta } from '#/content/preview'
import { useReceivedLink } from '#/state/link'
import { Share } from '#/ui/share'
import { COUNTING_NOTICE } from '#/ui/share.copy'
import {
  saveRequirements,
  PLACES_WITH_DATA,
  usePossibleGroup,
  useSavedRequirements,
  type BrowserCount,
} from '#/state/possible-group'
import { useProfile } from '#/state/profile'
import { countCalculatorUse } from '#/analytics/counting'
import { SiteButton } from '#/ui/button'
import {
  Folds,
  EstimateRange,
  RequirementRow,
  CheckChip,
  PinnedNumber,
  Options,
  Stepper,
} from '#/ui/possible-group'
import { costText } from '#/ui/possible-group.copy'
import { AnswerConfidence } from '#/ui/guide'
import { ProfileBox } from '#/ui/profile'
import { Select } from '@/ui/shadcn/select'
import { Column, Display, Sheet } from '#/ui/sheet'
import { Notice, Headline, Panel, Section } from '#/ui/section'

/** The small note under a control. */
const HINT = 'm-0 mt-2 text-label leading-nota font-normal text-tinta-2'

/** While the data arrives, the old number stays, faded. */
const LOADING =
  'opacity-55 motion-safe:transition-opacity motion-safe:delay-150 motion-safe:duration-200 motion-safe:ease-sai'

export const Route = createFileRoute('/grupo-possivel')({
  loader: async ({ context, location }) => {
    // The link preview only on the server, for the social network's bot; in
    // the browser, nothing of the state leaves the device. It stays in
    // `loaderData`, because only `head` uses it; the Guide goes through the
    // `queryClient`.
    const withLink = typeof window === 'undefined' && isLink(location.searchStr)
    const [, preview] = await Promise.all([
      context.queryClient.query(reads.calculatorGuide('possible-group')),
      withLink ? fetchGroupPreview({ data: location.searchStr }) : null,
    ])
    return { preview }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: 'Grupo possível · Tem estudo?' },
      {
        name: 'description',
        content:
          'Quantas pessoas no Brasil atendem ao que você procura: idade, cidade, escolaridade, renda e outros Requisitos, com o Censo 2022 e a PNS 2019.',
      },
      ...previewMeta(loaderData?.preview ?? null),
    ],
  }),
  component: PossibleGroupPage,
})

/** The "any" option's value and label. */
const ANY = 'qualquer'

/** Every change the visitor makes to the Requirements goes through here, and
 * counts the use. */
function saveAndCount(next: Requirements) {
  saveRequirements(next)
  countCalculatorUse('grupo-possivel')
}

/** A Requirement's value written as on the screen ("25 a 35 anos"). */
type RequirementValue = (k: VisitorRequirement | 'orientation') => string

function PossibleGroupPage() {
  const { data: guide } = useSuspenseQuery(
    reads.calculatorGuide('possible-group'),
  )
  const replaced = useReceivedLink('grupo-possivel') !== null
  const profile = useProfile()
  const saved = useSavedRequirements()
  const count = usePossibleGroup(profile, saved)
  const r = saved ?? DEFAULT_REQUIREMENTS
  const municipality = r.place?.municipality
    ? count.stateData?.municipalities.get(r.place.municipality)?.name
    : undefined
  const value: RequirementValue = (k) =>
    requirementValue(k, profile, r, municipality)
  const link: LinkState = {
    calculator: 'grupo-possivel',
    profile,
    requirements: saved,
  }

  return (
    <Sheet>
      <Column>
        <CountTop count={count} replaced={replaced} />
        <YourProfile profile={profile} value={value} />
        <YourRequirements
          profile={profile}
          requirements={r}
          count={count}
          value={value}
        />
        <TheCount
          count={count}
          profile={profile}
          requirements={r}
          municipality={municipality}
          value={value}
        />

        <Share
          query={linkQuery(link)}
          sentence={linkSentence(link, { municipality })}
          notice={COUNTING_NOTICE}
        />

        {guide && <FromTheGuide guide={guide} />}
      </Column>
    </Sheet>
  )
}

/** The title, the number pinned at the top, the invitation and the count's
 * notices. `replaced`: a received link replaced the saved Profile and
 * Requirements. */
function CountTop({
  count,
  replaced,
}: {
  count: BrowserCount
  replaced: boolean
}) {
  return (
    <>
      <Display>
        Quantas pessoas atendem ao que você{' '}
        <span className="marca-texto">procura</span>?
      </Display>

      <PinnedNumber estimate={count.estimate} loading={count.loading} />

      <p className="mx-0 mt-5.5 mb-md">
        Diga quem você procura e ligue os seus Requisitos. O número de cima muda
        junto, com dados do Censo 2022 e da PNS 2019.
      </p>
      <CountNotices
        replaced={replaced}
        failed={count.failed}
        retry={count.retry}
        caveats={count.estimate.caveats}
      />
    </>
  )
}

/** The "Seu Perfil" block: who the count starts from. */
function YourProfile({
  profile,
  value,
}: {
  profile: Profile | null
  value: RequirementValue
}) {
  return (
    <Section aria-labelledby="t-perfil">
      <Headline id="t-perfil">Seu Perfil</Headline>
      <p className={HINT}>
        A conta parte de quem você é e de quem você procura.
      </p>
      <ProfileBox profile={profile} buttonLabel="Usar na conta" />
      {(profile?.gender === 'homem' || profile?.gender === 'mulher') && (
        <p className={HINT}>
          A orientação entra pelo seu Perfil: a conta só conta quem{' '}
          {value('orientation')}, pela PNS 2019.
        </p>
      )}
    </Section>
  )
}

/** The "Seus Requisitos" block: one row per Requirement, in `REQUIREMENTS`
 * order, with its control and how much it cuts. */
function YourRequirements({
  profile,
  requirements,
  count,
  value,
}: {
  profile: Profile | null
  requirements: Requirements
  count: BrowserCount
  value: RequirementValue
}) {
  const { estimate } = count
  const childrenReasonId = useId()
  const props: ControlProps = {
    profile,
    requirements,
    change: (change) => saveAndCount({ ...requirements, ...change }),
    municipalities: count.stateData?.municipalities,
    childrenData: estimate.children,
    childrenReasonId,
  }
  return (
    <Section aria-labelledby="t-requisitos">
      <Headline id="t-requisitos">Seus Requisitos</Headline>
      <div className={count.loading ? LOADING : undefined}>
        {REQUIREMENTS.map((k) => {
          const Control = CONTROL[k]
          return (
            <RequirementRow
              key={k}
              requirement={k}
              value={value(k)}
              cost={estimate.costs.find((c) => c.requirement === k)}
              active={estimate.active.includes(k)}
              note={
                k === 'children' ? (
                  <ChildrenReason
                    childrenData={estimate.children}
                    id={childrenReasonId}
                  />
                ) : undefined
              }
            >
              <Control {...props} />
            </RequirementRow>
          )
        })}
      </div>
    </Section>
  )
}

/** What a Requirement's control reads and how it changes the Requirements. */
interface ControlProps {
  profile: Profile | null
  requirements: Requirements
  change: (change: Partial<Requirements>) => void
  /** The chosen state's municipalities, once they arrived. */
  municipalities: ReadonlyMap<string, { name: string }> | undefined
  childrenData: Estimate['children']
  /** The id of the reason the children filter does not apply, which the
   * checkbox cites. */
  childrenReasonId: string
}

/** The checked list with `value` checked or unchecked, in `all`'s order. */
function toggle<T extends string>(
  all: ReadonlyArray<T>,
  checked: ReadonlyArray<T>,
  value: T,
  isChecked: boolean,
): T[] {
  const before = new Set(checked)
  return all.filter((c) => (c === value ? isChecked : before.has(c)))
}

/** Each Requirement's control, which goes inside its row. */
const CONTROL: Record<VisitorRequirement, (props: ControlProps) => ReactNode> =
  {
    age: ({ profile, requirements, change }) => {
      const age = soughtAge(profile, requirements)
      return (
        <div className="flex flex-wrap gap-x-5.5 gap-y-3">
          <Stepper
            label="Idade de"
            value={age.min}
            min={MIN_SOUGHT_AGE}
            max={MAX_SOUGHT_AGE}
            unit={() => 'anos'}
            onChange={(min) =>
              change({ age: { min, max: Math.max(min, age.max) } })
            }
          />
          <Stepper
            label="até"
            value={age.max}
            min={MIN_SOUGHT_AGE}
            max={MAX_SOUGHT_AGE}
            unit={(v) => (v >= MAX_SOUGHT_AGE ? 'anos ou mais' : 'anos')}
            onChange={(max) =>
              change({ age: { min: Math.min(max, age.min), max } })
            }
          />
        </div>
      )
    },
    place: ({ requirements, municipalities, change }) => (
      <Place
        requirements={requirements}
        municipalities={municipalities}
        change={change}
      />
    ),
    partner: ({ requirements, change }) => (
      <CheckChip
        label="Só quem não mora com companheiro(a)"
        checked={requirements.noLiveInPartner}
        onChange={(noLiveInPartner) => change({ noLiveInPartner })}
      />
    ),
    education: ({ requirements, change }) => (
      <Options
        legend="Escolaridade mínima"
        type="radio"
        values={[ANY, ...MIN_EDUCATIONS]}
        labels={{ [ANY]: ANY, ...EDUCATION_LABEL }}
        checked={[requirements.education ?? ANY]}
        onChange={(v) => change({ education: v === ANY ? null : v })}
      />
    ),
    income: ({ requirements, change }) => (
      <Options
        legend="Renda mínima"
        type="radio"
        values={[ANY, ...MIN_INCOMES]}
        labels={{ [ANY]: ANY, ...INCOME_LABEL }}
        checked={[requirements.income ?? ANY]}
        onChange={(v) => change({ income: v === ANY ? null : v })}
        hint="Em salários mínimos de julho de 2022 (R$ 1.212)."
      />
    ),
    color: ({ requirements, change }) => (
      <Options
        legend="Cor ou raça"
        type="checkbox"
        values={COLORS}
        labels={COLOR_LABEL}
        checked={requirements.colors}
        onChange={(v, isChecked) =>
          change({ colors: toggle(COLORS, requirements.colors, v, isChecked) })
        }
        hint="Nenhuma marcada é qualquer uma."
      />
    ),
    religion: ({ requirements, change }) => (
      <Options
        legend="Religião"
        type="checkbox"
        values={RELIGIONS}
        labels={RELIGION_LABEL}
        checked={requirements.religions}
        onChange={(v, isChecked) =>
          change({
            religions: toggle(RELIGIONS, requirements.religions, v, isChecked),
          })
        }
        hint="Nenhuma marcada é qualquer uma."
      />
    ),
    children: ({ requirements, childrenData, childrenReasonId, change }) => (
      <CheckChip
        label="Só quem não tem filhos"
        checked={requirements.noChildren && childrenData !== 'no-data'}
        disabled={childrenData === 'no-data'}
        description={childrenData === 'applies' ? undefined : childrenReasonId}
        onChange={(noChildren) => change({ noChildren })}
      />
    ),
    parents: ({ requirements, change }) => (
      <CheckChip
        label="Só quem não mora com os pais"
        checked={requirements.notWithParents}
        onChange={(notWithParents) => change({ notWithParents })}
      />
    ),
    work: ({ requirements, change }) => (
      <Options
        legend="Trabalho"
        type="radio"
        values={[ANY, ...WORKS]}
        labels={{ [ANY]: ANY, ...WORK_LABEL }}
        checked={[requirements.work ?? ANY]}
        onChange={(v) => change({ work: v === ANY ? null : v })}
        hint="Na última semana de julho de 2022. Negócio próprio é ser empregador ou trabalhar por conta própria."
      />
    ),
    home: ({ requirements, change }) => (
      <CheckChip
        label="Só quem tem casa própria"
        checked={requirements.ownsHome}
        onChange={(ownsHome) => change({ ownsHome })}
      />
    ),
    height: ({ requirements: { height }, change }) => (
      <div className="flex flex-wrap gap-x-5.5 gap-y-3">
        <Stepper
          label="Altura de"
          value={height.min}
          min={MIN_HEIGHT}
          max={MAX_HEIGHT}
          step={5}
          unit={(v) => (v <= MIN_HEIGHT ? 'cm ou menos' : 'cm')}
          onChange={(min) =>
            change({ height: { min, max: Math.max(min, height.max) } })
          }
        />
        <Stepper
          label="até"
          value={height.max}
          min={MIN_HEIGHT}
          max={MAX_HEIGHT}
          step={5}
          unit={(v) => (v >= MAX_HEIGHT ? 'cm ou mais' : 'cm')}
          onChange={(max) =>
            change({ height: { min: Math.min(max, height.min), max } })
          }
        />
      </div>
    ),
    smoking: ({ requirements, change }) => (
      <CheckChip
        label="Só quem não fuma"
        checked={requirements.nonSmoker}
        onChange={(nonSmoker) => change({ nonSmoker })}
      />
    ),
    office: ({ requirements, change }) => (
      <CheckChip
        label="Só quem trabalha em escritório"
        checked={requirements.office}
        onChange={(office) => change({ office })}
      />
    ),
  }

/** The "A conta" block: the range, what weighs most, with the button to
 * release each Requirement, and the cut-by-cut and uncertainty folds. */
function TheCount({
  count: { estimate, loading },
  profile,
  requirements,
  municipality,
  value,
}: {
  count: BrowserCount
  profile: Profile | null
  requirements: Requirements
  municipality: string | undefined
  value: RequirementValue
}) {
  const weighsMost = useRef<HTMLHeadingElement>(null)
  const placeName = value('place')
  // The button goes away with the row it released; focus goes to the list's
  // title.
  const releaseAndReview = (k: VisitorRequirement) => {
    saveAndCount(release(requirements, k))
    weighsMost.current?.focus()
  }
  return (
    <Section id="a-conta" aria-labelledby="t-conta">
      <Headline id="t-conta">A conta</Headline>
      <div className={loading ? LOADING : undefined}>
        <EstimateRange estimate={estimate} />
        <p className="m-0 mt-1.5">
          {TARGET_NAME[estimate.target]} em{' '}
          {placeName === 'Brasil inteiro' ? 'todo o Brasil' : placeName} atendem
          a tudo o que você pediu. Estimativa central:{' '}
          {formatAmount(estimate.result.central)}.
        </p>
        <h3
          className="m-0 mt-md mb-2 font-label text-label text-tinta-2"
          ref={weighsMost}
          tabIndex={-1}
        >
          O que mais pesa
        </h3>
        <CountCosts
          costs={estimate.costs}
          value={value}
          onRelease={releaseAndReview}
        />
        <Folds
          estimate={estimate}
          profile={profile}
          requirements={requirements}
          municipality={municipality}
        />
      </div>
    </Section>
  )
}

/** The received link's notice, the one for data that did not arrive and the
 * count's strong caveats, at the top of the page. */
function CountNotices({
  replaced,
  failed,
  retry,
  caveats,
}: {
  replaced: boolean
  failed: boolean
  retry: () => void
  caveats: Estimate['caveats']
}) {
  return (
    <>
      {replaced && (
        <Notice role="status">
          Este link trocou o seu Perfil e os seus Requisitos salvos pelos de
          quem mandou.
        </Notice>
      )}
      {failed && (
        <Notice role="alert">
          Não deu para baixar os dados da conta.{' '}
          <SiteButton variant="light" onClick={retry}>
            Tentar de novo
          </SiteButton>
        </Notice>
      )}
      {caveats
        .filter((x) => x.strong)
        .map((caveat) => (
          <Notice key={caveat.id} className="font-bold" role="note">
            {caveat.text}
          </Notice>
        ))}
    </>
  )
}

/** Why the children filter does not apply, or applies only to women. */
function ChildrenReason({
  childrenData,
  id,
}: {
  childrenData: Estimate['children']
  id: string
}) {
  if (childrenData === 'applies') return null
  return (
    <p
      className="m-0 mt-2 text-label leading-nota font-bold text-tinta"
      id={id}
    >
      {childrenData === 'no-data'
        ? 'O Censo só pergunta filhos às mulheres. Procurando homens, não dá para filtrar.'
        : 'O Censo só pergunta filhos às mulheres: procurando homens e mulheres, o filtro vale só para elas.'}
    </p>
  )
}

/** "O que mais pesa": each active Requirement, from the one that shrinks the
 * group most to the least, with the button to release it. */
function CountCosts({
  costs,
  value,
  onRelease,
}: {
  costs: Estimate['costs']
  value: (k: VisitorRequirement) => string
  onRelease: (k: VisitorRequirement) => void
}) {
  if (costs.length === 0)
    return (
      <p className={HINT}>
        Nenhum Requisito ligado ainda. Cada um que você ligar aparece aqui, do
        que mais encolhe o grupo ao que menos.
      </p>
    )
  return (
    <>
      {/* As the Pool Report does (https://datingpoolreport.com/methodology,
       * #300): the "+…" of each row is measured with the others on, so two
       * rows together are not their sum. One Requirement has nothing to sum. */}
      {costs.length > 1 && (
        <p className="m-0 mb-2 text-label leading-nota font-normal text-tinta-2">
          Cada linha solta só aquele Requisito e deixa os outros ligados. Os
          efeitos não se somam, então soltar dois não dá a soma das duas linhas.
        </p>
      )}
      <CostRows costs={costs} value={value} onRelease={onRelease} />
    </>
  )
}

/** The rows of "O que mais pesa", each with its "soltar" button. */
function CostRows({
  costs,
  value,
  onRelease,
}: {
  costs: Estimate['costs']
  value: (k: VisitorRequirement) => string
  onRelease: (k: VisitorRequirement) => void
}) {
  return (
    <ul className="m-0 list-none p-0">
      {costs.map((c) => {
        const k = c.requirement as VisitorRequirement
        return (
          <li
            key={k}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-2.5"
          >
            <span className="font-bold">
              {REQUIREMENT_TITLE[k]}
              <small className="block text-label leading-body font-normal text-tinta-2">
                {value(k)}
              </small>
            </span>
            <span className="col-1 text-nota">{costText(c)}</span>
            <SiteButton
              variant="light"
              className="col-2 row-span-2 row-start-1"
              onClick={() => onRelease(k)}
              aria-label={`Soltar ${REQUIREMENT_TITLE[k].toLowerCase()}`}
            >
              soltar
            </SiteButton>
          </li>
        )
      })}
    </ul>
  )
}

/** The "Do Guia" block: the Question that hosts the calculator and the short
 * answer. */
function FromTheGuide({ guide }: { guide: CalculatorGuide }) {
  return (
    <Section aria-labelledby="t-do-guia">
      <Headline id="t-do-guia">Do Guia</Headline>
      <Panel className="[&>p]:m-0 [&>p]:mt-xs [&>p:first-child]:mb-2.5">
        <p className="font-title text-linha leading-label font-bold text-tinta">
          {guide.question}
        </p>
        <AnswerConfidence confidence={guide.confidence} />
        <p className="text-lead">{guide.answer}</p>
        <Link
          to="/$tema"
          params={{ tema: guide.topic }}
          hash={guide.slug}
          className="mt-1.5 inline-flex min-h-toque items-center font-bold"
        >
          Ler o Guia inteiro
        </Link>
      </Panel>
    </Section>
  )
}

/** State and, inside it, municipality, each in a `Select` list. */
function Place({
  requirements,
  municipalities,
  change,
}: {
  requirements: Requirements
  municipalities: ReadonlyMap<string, { name: string }> | undefined
  change: (change: Partial<Requirements>) => void
}) {
  const state = requirements.place?.state
  const states = [
    { value: null, label: 'Brasil inteiro' },
    ...STATES.filter((u) => PLACES_WITH_DATA.includes(u.abbr)).map((u) => ({
      value: u.abbr,
      label: u.name,
    })),
  ]
  const list = [
    {
      value: null,
      label: municipalities ? 'Todo o estado' : 'Carregando os municípios…',
    },
    ...(municipalities
      ? [...municipalities]
          .sort(([, a], [, b]) => a.name.localeCompare(b.name, 'pt-BR'))
          .map(([code, m]) => ({ value: code, label: m.name }))
      : []),
  ]
  return (
    <div className="grid gap-2.5">
      <Select
        label="Estado"
        items={states}
        value={state ?? null}
        onValueChange={(abbr) => {
          const chosen = STATES.find((u) => u.abbr === abbr)
          change({ place: chosen ? { state: chosen.abbr } : null })
        }}
      />
      {state && (
        <Select
          label="Município"
          items={list}
          value={requirements.place?.municipality ?? null}
          disabled={!municipalities}
          onValueChange={(municipality) =>
            change({ place: { state, ...(municipality && { municipality }) } })
          }
        />
      )}
    </div>
  )
}
