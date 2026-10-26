// The Priorities vs. evidence pieces (#19, variant A of /prioridades and C
// of the B1 card): the top 3 chips, the outcome picker, the Joel 2020 bar,
// the four shelves and each trait's detail. Yellow only on what is the
// visitor's (the chosen ones); "não sabemos" is the empty ring in ink (The
// Three Inks Rule).
import { Link } from '@tanstack/react-router'
import type { ProfileGender } from '@tem-estudo/rules/profile'
import {
  OUTCOMES,
  LEVEL_NAME,
  OUTCOME_KEY,
  OUTCOME_NAME,
  TOP_SIZE,
  level,
  shelves,
  biasFor,
  shareWord,
  type Level,
  type Outcome,
} from '@tem-estudo/rules/priorities'
import type { PercentRange } from '@tem-estudo/content'
import type {
  SatisfactionSplit as Split,
  TraitView,
  PriorityFactSheet,
} from '#/content/priorities-view'
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cn } from '@/platform/cn'
import { Headline, Panel, Section } from './section'
import { FilledSteps, StrengthBadge, VerificationStatusBadge } from './badges'
import { Button } from '@/ui/shadcn/button'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'
import { Toggle } from '@/ui/shadcn/toggle'
import { barLabel, cardTop3Lead, partnerLegend } from './priorities.copy'

/** The three steps filled by weight, or the empty ring of "não sabemos". */
export function EvidenceWeight({
  level: n,
  width = 36,
}: {
  level: Level
  width?: number
}) {
  return n > 0 ? (
    <FilledSteps filled={n} width={width} />
  ) : (
    <span
      className="box-border inline-block flex-none rounded-bolota border-(length:--traco-controle) border-tinta bg-folha"
      style={{ width: width / 3, height: width / 3 }}
      aria-hidden="true"
    />
  )
}

/** The weight at label size, always with the word. */
export function WeightLabel({ level: n }: { level: Level }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-label text-label leading-body whitespace-nowrap data-[degrau=0]:font-normal data-[degrau=0]:text-tinta-2 data-[degrau=0]:italic"
      data-degrau={n}
    >
      <EvidenceWeight level={n} />
      {LEVEL_NAME[n]}
    </span>
  )
}

const STEP_LABEL =
  'm-0 mb-2 p-0 font-label text-label leading-title text-tinta-2'

const ordinal = (i: number) => `sua ${i + 1}ª`

const POSITION =
  'inline-grid size-6.5 flex-none place-items-center rounded-bolota border-(length:--traco-controle) border-tinta text-etiqueta leading-none font-bold'

function Position({ i }: { i: number }) {
  return (
    <>
      <span className={cn(POSITION, 'bg-folha')} aria-hidden="true">
        {i + 1}
      </span>
      <span className="sr-only">{ordinal(i)}: </span>
    </>
  )
}

const Arrow = () => (
  <svg
    width="26"
    height="16"
    viewBox="0 0 26 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 8.5C9 7.4 16 8.2 23 8M23 8l-6-5.5M23 8l-6 5.5" />
  </svg>
)

const Warning = () => (
  <svg
    className="mt-px flex-none"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12.4 2.6c5.4.2 9 4 8.9 9.2-.2 5.4-4.1 9-9.3 8.9-5.3-.1-9.1-3.9-8.9-9.2.2-5 4-8.8 9.6-8.9" />
    <path d="M12 7.2l-.2 6.4" strokeWidth="2.6" />
    <circle cx="11.8" cy="16.8" r=".6" fill="currentColor" strokeWidth="1.6" />
  </svg>
)

/** A cell's Fact sheet: name, Status and Strength, drawn and written. */
function CellSource({ factSheet }: { factSheet: PriorityFactSheet }) {
  return (
    <p className="mt-2 mb-0 flex flex-wrap items-center gap-x-sm gap-y-1">
      <Link
        to="/estudos/$slug"
        params={{ slug: factSheet.slug }}
        className="inline-flex min-h-toque items-center font-bold decoration-agua-tinta"
      >
        {factSheet.name}
      </Link>
      <VerificationStatusBadge status={factSheet.status} />
      <StrengthBadge strength={factSheet.strength} withLabel />
    </p>
  )
}

const SWATCH =
  'inline-block size-4 rounded-amostra border-(length:--traco-controle) border-tinta'
const LEGEND = 'inline-flex items-center gap-2'

/** The Joel 2020 bar: what explains satisfaction with the relationship. The
 * partner is a sliver, not a share: beyond the relationship it adds a range
 * that starts at zero. The short bar goes on the B1 card; the long one opens
 * with the sentence and says the list fits in the sliver. */
export function SatisfactionBar({
  split,
  short = false,
}: {
  split: Split
  short?: boolean
}) {
  const { baseline, followUp } = split.partnerAdded
  return (
    <div>
      {!short && (
        <p className="m-0 mb-3">
          <b>Antes da lista.</b> No estudo que juntou 43 bases de casais, o que
          mais explicou a satisfação foi como a pessoa vive a relação, não quem
          o parceiro é.
        </p>
      )}
      <div
        className="flex h-8.5 overflow-hidden rounded-mao-2 border-2 border-tinta"
        role="img"
        aria-label={barLabel(split)}
      >
        <span
          className="bg-tinta"
          style={{ width: `${split.relationship}%` }}
        />
        <span className="box-border w-2.5 shrink-0 border-x-2 border-tinta bg-folha" />
        <span
          className="fundo-reticula"
          style={{ width: `${split.unexplained}%` }}
        />
      </div>
      <dl className="m-0 mt-2.5 grid grid-cols-[auto_1fr] items-start gap-x-2.5 gap-y-1.5 text-label leading-folgada font-normal">
        <dt className={LEGEND}>
          <i className={cn(SWATCH, 'bg-tinta')} />
          <b>{split.relationship}%</b>
        </dt>
        <dd className="m-0">
          como vocês se tratam: compromisso, gratidão, conflito, sexo
        </dd>
        <dt className={LEGEND}>
          <i className={cn(SWATCH, 'bg-folha')} />
          <b>{shareWord(baseline)}</b>
        </dt>
        <dd className="m-0">
          {partnerLegend(baseline, followUp)}
          {short ? '' : ': a lista abaixo inteira cabe aqui'}
        </dd>
        <dt className={LEGEND}>
          <i className={cn(SWATCH, 'fundo-reticula')} />
          <b>{split.unexplained}%</b>
        </dt>
        <dd className="m-0">nenhum estudo explica</dd>
      </dl>
      <CellSource factSheet={split.factSheet} />
    </div>
  )
}

function pickStatus(count: number): string {
  if (count >= TOP_SIZE)
    return 'Pronto. Para trocar, toque numa das escolhidas e ela sai.'
  if (count === 0)
    return 'Nenhuma escolhida ainda. Dá para ver as prateleiras mesmo assim.'
  const missing = TOP_SIZE - count
  return missing > 1 ? `Faltam ${missing}.` : 'Falta 1.'
}

/** The ten chips: tapping gives the next number, tapping again removes it.
 * With three, the others become unavailable, with the swap hint. */
export function Top3Picker({
  traits,
  top3,
  onToggle,
}: {
  traits: ReadonlyArray<TraitView>
  top3: ReadonlyArray<string>
  onToggle: (id: string) => void
}) {
  const full = top3.length >= TOP_SIZE
  return (
    <section className="mt-lg" aria-labelledby="t-topo3">
      <h2 id="t-topo3" className={STEP_LABEL}>
        Seu topo 3
      </h2>
      <p className="m-0 mb-md text-lead">
        Das dez, quais são as três que mais importam para você num parceiro?
        Toque nelas na ordem.
      </p>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {traits.map((trait) => {
          const i = top3.indexOf(trait.id)
          const out = i < 0 && full
          return (
            <li key={trait.id}>
              <Toggle
                pressed={i >= 0}
                aria-disabled={out || undefined}
                aria-describedby={out ? 'estado-topo3' : undefined}
                onPressedChange={() => {
                  if (!out) onToggle(trait.id)
                }}
              >
                {i >= 0 && <Position i={i} />}
                {trait.name}
              </Toggle>
            </li>
          )
        })}
      </ul>
      <p
        id="estado-topo3"
        className="mt-2.5 mb-0 min-h-[1.5em] text-nota text-tinta-2"
        role="status"
      >
        {pickStatus(top3.length)}
      </p>
    </section>
  )
}

/** Attraction, satisfaction or duration, as radios that look like a Profile
 * option. */
export function OutcomePicker({
  outcome,
  onChoose,
}: {
  outcome: Outcome
  onChoose: (outcome: Outcome) => void
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend id="t-desfecho" className={cn(STEP_LABEL, 'mb-1.5')}>
        Pesa para quê?
      </legend>
      <RadioGroup
        aria-labelledby="t-desfecho"
        value={outcome}
        onValueChange={(d) => onChoose(d as Outcome)}
      >
        {OUTCOMES.map((d) => (
          <RadioGroupItem key={d} value={d}>
            {OUTCOME_NAME[d]}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

/** The top 3 alert, as a sentence. The region always stays on the page so
 * the screen reader hears it when it appears. */
export function Top3Warning({ sentence }: { sentence: string | null }) {
  return (
    <div aria-live="polite">
      {sentence && (
        <p
          className="m-0 mt-md flex gap-2.5 rounded-mao-2 border-2 fio-tracejado border-tinta bg-folha pt-3 pr-3.5 pb-3 pl-3 text-aviso leading-normal"
          data-slot="alerta"
        >
          <Warning />
          <span>{sentence}</span>
        </p>
      )}
    </div>
  )
}

const DETAIL_SMALL = 'text-label leading-detalhe font-normal text-tinta-2'

/** Plain text, measure, Fact sheet with Status, Strength and sample, and the
 * bias. */
function TraitDetail({
  trait,
  outcome,
  gender,
  id,
}: {
  trait: TraitView
  outcome: Outcome
  gender: ProfileGender | undefined
  id: string
}) {
  const cell = trait[OUTCOME_KEY[outcome]]
  const bias = biasFor(trait, gender)
  // The bias names its own Fact sheet when it is not the cell's.
  const biasSource =
    bias && trait.bias?.factSheet.slug !== cell.factSheet?.slug
      ? trait.bias?.factSheet
      : undefined
  return (
    <div
      id={id}
      className="mt-sm rounded-mao border-2 border-tinta bg-folha px-3.5 py-3 text-aviso leading-detalhe [&_p]:m-0 [&_p]:mb-1.5"
      role="region"
      aria-label={`${trait.name}, ${OUTCOME_NAME[outcome].toLowerCase()}`}
    >
      <p className="font-title text-body leading-detalhe font-bold">
        {trait.name} · {OUTCOME_NAME[outcome].toLowerCase()}
      </p>
      <p>{cell.text}</p>
      {cell.measure && <p className={DETAIL_SMALL}>Medida: {cell.measure}</p>}
      {cell.factSheet && (
        <>
          <CellSource factSheet={cell.factSheet} />
          <p className={DETAIL_SMALL}>Amostra: {cell.factSheet.sample}</p>
        </>
      )}
      {bias && <p className="text-tinta-2 italic">{bias}</p>}
      {biasSource && <CellSource factSheet={biasSource} />}
    </div>
  )
}

/** The book on the shelf: faded, or yellow, numbered and with the halftone if
 * it is one of the chosen ones. Open, it gets the outer outline. */
const BOOK =
  'inline-flex min-h-toque cursor-pointer items-center gap-2 rounded-mao border-(length:--traco-etiqueta) border-tinta-2 bg-folha px-3.5 py-2 text-left font-label text-nota leading-tight font-normal text-tinta-2 sem-realce-no-toque hover:not-data-escolhida:border-tinta hover:not-data-escolhida:text-tinta aria-expanded:outline-(length:--traco-aberto) aria-expanded:outline-offset-3 aria-expanded:outline-tinta data-escolhida:reticula data-escolhida:border-(length:--traco-controle) data-escolhida:border-tinta data-escolhida:bg-amarelo-voce data-escolhida:py-2.25 data-escolhida:text-medio data-escolhida:font-bold data-escolhida:text-tinta'

/** The outcome's four shelves. The chosen ones are yellow and numbered; the
 * others, faded. Tapping opens the detail below the shelf. */
export function Bookcase({
  traits,
  outcome,
  top3,
  open,
  onOpen,
  gender,
}: {
  traits: ReadonlyArray<TraitView>
  outcome: Outcome
  top3: ReadonlyArray<string>
  open: string | null
  onOpen: (id: string | null) => void
  gender: ProfileGender | undefined
}) {
  const byId = new Map(traits.map((c) => [c.id, c]))
  return (
    <div className="mt-1.5">
      {shelves(traits, outcome, top3).map((shelf) => (
        <Shelf
          key={shelf.level}
          shelf={shelf}
          byId={byId}
          outcome={outcome}
          top3={top3}
          open={open}
          onOpen={onOpen}
          gender={gender}
        />
      ))}
    </div>
  )
}

/** A shelf: the weight and the name, its books and, if one of them is open,
 * the detail below. */
function Shelf({
  shelf,
  byId,
  outcome,
  top3,
  open,
  onOpen,
  gender,
}: {
  shelf: ReturnType<typeof shelves>[number]
  byId: ReadonlyMap<string, TraitView>
  outcome: Outcome
  top3: ReadonlyArray<string>
  open: string | null
  onOpen: (id: string | null) => void
  gender: ProfileGender | undefined
}) {
  const detail = `detalhe-${shelf.level}`
  const openHere =
    open !== null && shelf.ids.includes(open) ? byId.get(open) : undefined
  return (
    <section
      className="group/prateleira pt-6.5"
      data-degrau={shelf.level}
      aria-labelledby={`prat-${shelf.level}`}
    >
      <h3
        id={`prat-${shelf.level}`}
        className="m-0 mb-3 flex items-center gap-2.5 font-title text-nivel leading-headline font-bold tracking-title group-data-[degrau=0]/prateleira:font-semibold group-data-[degrau=0]/prateleira:text-tinta-2 group-data-[degrau=0]/prateleira:italic"
      >
        <EvidenceWeight level={shelf.level} width={42} />
        {shelf.name}
      </h3>
      <Books
        ids={shelf.ids}
        byId={byId}
        top3={top3}
        open={open}
        onOpen={onOpen}
        detail={detail}
      />
      <div
        className="reticula mt-1.5 h-2.75 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-folha group-data-[degrau=0]/prateleira:fio-tracejado group-data-[degrau=0]/prateleira:after:hidden"
        aria-hidden="true"
      />
      {openHere && (
        <TraitDetail
          trait={openHere}
          outcome={outcome}
          gender={gender}
          id={detail}
        />
      )}
    </section>
  )
}

/** A shelf's books, or "nenhuma". The top 3 one comes numbered; tapping opens
 * the detail, and tapping the open one closes it. */
function Books({
  ids,
  byId,
  top3,
  open,
  onOpen,
  detail,
}: {
  ids: ReadonlyArray<string>
  byId: ReadonlyMap<string, TraitView>
  top3: ReadonlyArray<string>
  open: string | null
  onOpen: (id: string | null) => void
  /** The id of the detail the open book controls. */
  detail: string
}) {
  if (ids.length === 0)
    return (
      <p className="m-0 px-1 py-2 text-nota text-tinta-2 italic">nenhuma</p>
    )
  return (
    <ul className="m-0 flex list-none flex-wrap items-end gap-2 px-1 py-0">
      {ids.map((id) => {
        const i = top3.indexOf(id)
        return (
          <li key={id}>
            <ButtonPrimitive
              className={BOOK}
              data-escolhida={i >= 0 || undefined}
              aria-expanded={open === id}
              aria-controls={open === id ? detail : undefined}
              onClick={() => onOpen(open === id ? null : id)}
            >
              {i >= 0 && <Position i={i} />}
              {byId.get(id)?.name}
            </ButtonPrimitive>
          </li>
        )
      })}
    </ul>
  )
}

/** The top 3 on the card, in the chosen order, with each one's weight in
 * satisfaction. */
function CardTop3({
  chosen,
  partnerAtBaseline,
}: {
  chosen: ReadonlyArray<TraitView>
  /** What the partner adds to satisfaction at the start of the studies. */
  partnerAtBaseline: PercentRange
}) {
  return (
    <>
      <p className="font-label text-label leading-body text-tinta-2">
        {cardTop3Lead(partnerAtBaseline)}
      </p>
      <ol className="m-0 mt-2.5 list-none p-0" data-slot="topo3-no-cartao">
        {chosen.map((trait, i) => (
          <li
            key={trait.id}
            className="grid grid-cols-[34px_1fr_auto] items-center gap-2.5 border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-2 font-bold first:border-t-0"
          >
            <span
              className={cn(POSITION, 'bg-amarelo-voce')}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span>{trait.name}</span>
            <span className="sr-only">, em satisfação: </span>
            <WeightLabel level={level(trait, 'satisfacao')} />
          </li>
        ))}
      </ol>
    </>
  )
}

/** The B1 Guide card: Joel's short bar and, with a top 3, each one's weight
 * in satisfaction. */
export function PrioritiesCard({
  split,
  traits,
  top3,
}: {
  split: Split
  traits: ReadonlyArray<TraitView>
  top3: ReadonlyArray<string>
}) {
  const chosen = top3.flatMap((id) => traits.filter((c) => c.id === id))
  return (
    <Section aria-labelledby="t-cartao-prioridades">
      <Headline id="t-cartao-prioridades">
        Onde ficam as suas prioridades?
      </Headline>
      <Panel className="[&>p]:m-0 [&>p]:mt-xs">
        <SatisfactionBar split={split} short />
        {chosen.length > 0 && (
          <CardTop3
            chosen={chosen}
            partnerAtBaseline={split.partnerAdded.baseline}
          />
        )}
        <p>
          <Button
            nativeButton={false}
            render={<Link to="/prioridades" />}
            shape="arrow"
          >
            {chosen.length > 0
              ? 'Ver a lista inteira'
              : 'Escolher as suas três e comparar'}
            <Arrow />
          </Button>
        </p>
      </Panel>
    </Section>
  )
}
