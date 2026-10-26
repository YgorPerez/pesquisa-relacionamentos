// The Possible group page's pieces (#19, variant A): the number pinned at the
// top, the Requirements' controls (none needs dragging: step buttons, number
// field, options and checkboxes) and the count with its folds.
import type {
  Cost,
  Estimate,
  RequirementId,
} from '@tem-estudo/rules/possible-group'
import {
  rangeParts,
  formatAmount,
  formatTimes,
} from '@tem-estudo/rules/numbers'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  REQUIREMENT_TITLE,
  TARGET_NAME,
  requirementValue,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import { Link } from '@tanstack/react-router'
import { useId, type ReactNode } from 'react'
import { NumberField } from '@base-ui/react/number-field'
import { cn } from '@/platform/cn'
import { Button } from '@/ui/shadcn/button'
import { Checkbox } from '@/ui/shadcn/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/shadcn/collapsible'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'
import {
  costText,
  independenceSources,
  samplingText,
  SENSITIVE_NOTE,
  SENSITIVE_STAYS,
} from './possible-group.copy'
import { Headline, Panel, Section } from './section'

/** While the data arrives, the old number stays, faded. */
const LOADING =
  'opacity-55 motion-safe:transition-opacity motion-safe:delay-150 motion-safe:duration-200 motion-safe:ease-sai'

/** The small note under a control or in the count. */
const HINT = 'm-0 mt-2 text-label leading-nota font-normal text-tinta-2'
/** A "Corte a corte" row: the cut on the left, how many remain on the right. */
const STEP_ROW =
  'flex justify-between gap-3 border-b-(length:--traco-etiqueta) fio-pontilhado border-tinta py-1.5'

/** The range with the numbers in the pink highlighter and, if so,
 * "instável". */
export function EstimateRange({ estimate }: { estimate: Estimate }) {
  const { min, max, unstable } = estimate.result
  const { before, numbers } = rangeParts(min, max)
  return (
    <p
      className="m-0 mt-0.5 font-headline text-headline leading-tight"
      data-slot="gp-faixa"
    >
      {before} <mark className="numero-chave">{numbers}</mark>
      {unstable && (
        <span className="ml-2.5 inline-block rounded-mao-2 border-(length:--traco-controle) fio-tracejado border-tinta px-2 py-0 align-[3px] font-label text-label leading-tight font-bold tracking-normal">
          instável
        </span>
      )}
    </p>
  )
}

/** "o que mais pesa: idade (×3,4)". */
function WeighsMost({ estimate }: { estimate: Estimate }) {
  const first = estimate.costs[0]
  if (!first) return <>nenhum Requisito corta o grupo</>
  return (
    <>
      o que mais pesa:{' '}
      <b>
        {REQUIREMENT_TITLE[
          first.requirement as keyof typeof REQUIREMENT_TITLE
        ].toLowerCase()}
      </b>{' '}
      ({formatTimes(first.times)})
    </>
  )
}

/** The Possible group pinned at the top while the page scrolls. */
export function PinnedNumber({
  estimate,
  loading,
}: {
  estimate: Estimate
  loading: boolean
}) {
  return (
    <section
      className="sticky top-0 z-2 -mx-xs rounded-mao border-2 border-tinta bg-folha px-3.5 pt-2.5 pb-2"
      aria-labelledby="gp-preso-titulo"
      aria-busy={loading}
      data-slot="gp-preso"
    >
      <h2
        id="gp-preso-titulo"
        className="m-0 font-label text-label text-tinta-2"
      >
        Grupo possível
      </h2>
      <div
        aria-live="polite"
        aria-atomic="true"
        className={loading ? LOADING : undefined}
      >
        <EstimateRange estimate={estimate} />
      </div>
      <p className="m-0 mt-xs flex flex-wrap items-center justify-between gap-x-3 gap-y-0 text-nota leading-label">
        <span>
          <WeighsMost estimate={estimate} />
        </span>
        <a
          href="#a-conta"
          className="inline-flex min-h-toque items-center font-bold"
        >
          ver a conta
        </a>
      </p>
    </section>
  )
}

/** A Requirement row: title, current value, control and cost. */
export function RequirementRow({
  requirement,
  value,
  cost,
  active,
  children,
  note,
}: {
  requirement: keyof typeof REQUIREMENT_TITLE
  value: string
  cost: Cost | undefined
  active: boolean
  children: ReactNode
  note?: ReactNode
}) {
  return (
    <div
      role="group"
      aria-labelledby={`req-${requirement}-titulo`}
      className="border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta pt-md pb-sm first:border-t-0 first:pt-1"
      id={`req-${requirement}`}
    >
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3
          id={`req-${requirement}-titulo`}
          className="m-0 font-title text-title leading-body font-bold"
        >
          {REQUIREMENT_TITLE[requirement]}
        </h3>
        <span
          className={cn(
            'text-aviso font-bold',
            active && 'rounded-mao-2 bg-amarelo-voce px-1',
          )}
          data-slot="gp-req-valor"
        >
          {value}
        </span>
      </div>
      {children}
      {note}
      <p
        className="m-0 mt-2.5 min-h-[1.4em] text-nota text-tinta-2"
        data-slot="gp-req-custo"
      >
        {cost ? costText(cost) : active ? '' : 'não corta ninguém'}
      </p>
    </div>
  )
}

/** The note of a sensitive Requirement, under its control: what it measures
 * and where it stays. Nothing for the others. */
export function SensitiveNote({
  requirement,
}: {
  requirement: keyof typeof REQUIREMENT_TITLE
}) {
  const note = SENSITIVE_NOTE[requirement]
  if (!note) return null
  return (
    <p className={HINT}>
      {note} {SENSITIVE_STAYS}
    </p>
  )
}

const Minus = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M3 9.2c4-.3 8-.1 12-.3" />
  </svg>
)
const Plus = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M3 9.2c4-.3 8-.1 12-.3M9.1 3c-.2 4 .1 8-.1 12" />
  </svg>
)

/** A number with step buttons and a field to type in: it replaces the
 * slider, which asks for dragging. Each tap changes the value and the count.
 * Base UI's `NumberField` takes care of the steps, the keyboard arrows and the
 * field; only a whole number inside the range reaches the Requirement. */
export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** "anos", "cm"; receives the value to say "80 ou mais". */
  unit: (value: number) => string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <NumberField.Root
      id={id}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={(n) => {
        // Empty or incomplete does not change the Requirement: only a whole
        // number in the range.
        if (n !== null && Number.isInteger(n) && n >= min && n <= max)
          onChange(n)
      }}
    >
      <label htmlFor={id} className="mb-1.5 block text-nota font-bold">
        {label}
      </label>
      <NumberField.Group className="flex items-center gap-1.5">
        <NumberField.Decrement
          className={STEP_BUTTON}
          disabled={value <= min}
          aria-label={`${label}: menos ${step}`}
        >
          <Minus />
        </NumberField.Decrement>
        <NumberField.Input
          className="min-h-toque w-[4.2rem] rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel px-2.5 py-1.5 text-center font-body text-grande font-bold text-tinta"
          inputMode="numeric"
          aria-describedby={`${id}-unidade`}
        />
        <NumberField.Increment
          className={STEP_BUTTON}
          disabled={value >= max}
          aria-label={`${label}: mais ${step}`}
        >
          <Plus />
        </NumberField.Increment>
        <span id={`${id}-unidade`} className="text-nota text-tinta-2">
          {unit(value)}
        </span>
      </NumberField.Group>
    </NumberField.Root>
  )
}

/** The step button: the 44px square, yellow while pressed. */
const STEP_BUTTON =
  'inline-grid size-toque cursor-pointer place-items-center rounded-mao border-(length:--traco-controle) border-tinta bg-folha p-0 active:not-disabled:bg-amarelo-voce disabled:cursor-default disabled:opacity-40'

/** Options as chips: the whole option is the radio or the checkbox. */
export function Options<T extends string>({
  legend,
  type,
  values,
  labels,
  checked,
  onChange,
  hint,
}: {
  legend: string
  type: 'radio' | 'checkbox'
  values: ReadonlyArray<T>
  labels: Readonly<Record<T, string>>
  checked: ReadonlyArray<T>
  onChange: (value: T, checked: boolean) => void
  hint?: string
}) {
  const id = useId()
  const isChecked = new Set(checked)
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend id={id} className="sr-only">
        {legend}
      </legend>
      {type === 'radio' ? (
        <RadioGroup
          aria-labelledby={id}
          value={checked[0] ?? null}
          onValueChange={(value) => onChange(value as T, true)}
        >
          {values.map((value) => (
            <RadioGroupItem key={value} value={value}>
              {labels[value]}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="relative">
              <Checkbox
                checked={isChecked.has(value)}
                onCheckedChange={(yes) => onChange(value, yes)}
              >
                {labels[value]}
              </Checkbox>
            </span>
          ))}
        </div>
      )}
      {hint && <p className={HINT}>{hint}</p>}
    </fieldset>
  )
}

/** A checkbox shaped like a chip ("Só quem não fuma"). */
export function CheckChip({
  label,
  checked,
  onChange,
  disabled,
  description,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  description?: string
}) {
  return (
    <span
      className={cn(
        'relative inline-flex',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <Checkbox
        withCheck
        checked={checked}
        disabled={disabled}
        aria-describedby={description}
        onCheckedChange={(yes) => onChange(yes)}
      >
        <Tick checked={checked} />
        {label}
      </Checkbox>
    </span>
  )
}

const Tick = ({ checked }: { checked: boolean }) => (
  <svg
    className="flex-none"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3.4c4.6-.4 9.2-.2 13.8-.3.3 4.5.2 9 .3 13.5-4.6.3-9.2.2-13.8.3-.2-4.5-.1-9-.3-13.5Z" />
    {checked && <path d="M5.6 10.4l3 3.1 6-7.6" strokeWidth="2.2" />}
  </svg>
)

/** The cut by cut and the uncertainty, folded. */
export function Folds({
  estimate,
  profile,
  requirements,
  municipality,
}: {
  estimate: Estimate
  profile: Profile | null
  requirements: Requirements
  municipality: string | undefined
}) {
  return (
    <>
      <CutByCut
        estimate={estimate}
        value={(k) => requirementValue(k, profile, requirements, municipality)}
      />
      <WhereUncertaintyComesFrom estimate={estimate} />
    </>
  )
}

/** "Corte a corte": adult Brazil and what remains after each Requirement. */
function CutByCut({
  estimate: { target, base, funnel },
  value,
}: {
  estimate: Estimate
  /** The Requirement written as on the screen ("25 a 35 anos"). */
  value: (k: RequirementId) => string
}) {
  return (
    <Collapsible id="gp-corte-a-corte" variant="solid" className="mt-sm">
      <CollapsibleTrigger variant="solid">Corte a corte</CollapsibleTrigger>
      <CollapsibleContent hiddenUntilFound>
        <ol className="m-0 list-none p-0" data-slot="gp-funil">
          <li className={STEP_ROW}>
            <span>{TARGET_NAME[target]} de 18 anos ou mais no Brasil</span>
            <b>{formatAmount(base.central)}</b>
          </li>
          {funnel.map((step) => (
            <li key={step.requirement} className={STEP_ROW}>
              <span>{value(step.requirement)}</span>
              <b>{formatAmount(step.central)}</b>
            </li>
          ))}
        </ol>
        <p className={HINT}>A ordem dos cortes não muda o resultado final.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** "De onde vem a incerteza": how far off the naive count would be, the
 * sampling error and the caveats that do not go at the top. */
function WhereUncertaintyComesFrom({ estimate }: { estimate: Estimate }) {
  const { naive, caveats, active, result } = estimate
  const difference =
    result.central > 0 ? (naive - result.central) / result.central : 0
  return (
    <Collapsible id="gp-incerteza" variant="solid" className="mt-sm">
      <CollapsibleTrigger variant="solid">
        De onde vem a incerteza
      </CollapsibleTrigger>
      <CollapsibleContent hiddenUntilFound>
        {active.length > 1 && (
          <p className="m-0 mb-2.5 text-aviso">
            Se só multiplicássemos a porcentagem que cada Requisito deixa
            sozinho no Brasil, daria <b>{formatAmount(naive)}</b> (
            {difference >= 0 ? '+' : '−'}
            {Math.abs(Math.round(difference * 100))}%). Os Requisitos andam
            juntos; por isso o site cruza os dados.
          </p>
        )}
        <p className={HINT}>{samplingText(active, result.records)}</p>
        <IndependenceRange estimate={estimate} />
        <ul className="mx-0 mt-2.5 mb-sm pl-marcador-curto text-nota leading-normal">
          {caveats
            .filter((r) => !r.strong)
            .map((r) => (
              <li key={r.id} className="not-first:mt-1.5">
                {r.text}
              </li>
            ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** The second range (#301): the least and the most the group could be
 * without the independence between the Census Requirements and the shares
 * from the PNS and the PNAD. It can go from 0 to several times the number,
 * so it stays in the fold, apart from the range at the top. */
function IndependenceRange({
  estimate: { independence, active },
}: {
  estimate: Estimate
}) {
  if (!independence) return null
  const { before, numbers } = rangeParts(independence.min, independence.max)
  // Rounded to the same number, the assumption changes nothing worth saying.
  if (before !== 'entre') return null
  const range = `${before} ${numbers}`
  const sources = independenceSources(active)
  return (
    <>
      <p className={HINT} data-slot="gp-independencia">
        {sources.text} As {sources.surveys > 2 ? 'três' : 'duas'} pesquisas não
        entrevistaram as mesmas pessoas, então a conta supõe que, no mesmo sexo
        e idade,{' '}
        {sources.surveys > 2
          ? 'nenhum lado depende dos outros'
          : 'um lado não depende do outro'}
        . Se depender, o grupo pode ficar em qualquer ponto <b>{range}</b>: o
        menor e o maior número que os dados permitem.
      </p>
      <p className={HINT}>
        A faixa de cima junta intervalos de confiança de 95%, mas não é ela
        mesma um intervalo de 95% exato. Esta segunda não é intervalo de
        confiança.
      </p>
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

/** "370 mil adultos", "1,2 milhão de adultos": only the number goes in
 * pink. */
function AdultsInBrazil({ amount }: { amount: number }) {
  const number = formatAmount(amount)
  return (
    <>
      <mark className="numero-chave">{number}</mark>
      {number.includes('milh') ? ' de adultos' : ' adultos'}
    </>
  )
}

/** The card of someone who already used the count: the range, the active
 * Requirements and what weighs most. */
function CountInCard({
  estimate,
  active,
  loading,
}: {
  estimate: Estimate
  active: ReadonlyArray<string>
  loading: boolean
}) {
  return (
    <div aria-busy={loading} className={loading ? LOADING : undefined}>
      <EstimateRange estimate={estimate} />
      <p className="m-0 mt-1 text-nota leading-normal text-tinta-2">
        {TARGET_NAME[estimate.target]} que atendem a tudo o que você pediu
      </p>
      <p
        className="m-0 mt-2 text-nota leading-normal text-tinta-2 [&_b]:text-tinta"
        data-slot="cartao-gp-ligados"
      >
        Seus Requisitos:{' '}
        {active.length > 0
          ? active.map((value, i) => (
              <span key={value}>
                {i > 0 && ', '}
                <b>{value}</b>
              </span>
            ))
          : 'nenhum'}
        .
      </p>
      <p
        className="m-0 mt-2 text-nota leading-normal text-tinta-2 [&_b]:text-tinta"
        data-slot="cartao-gp-pesa"
      >
        <WeighsMost estimate={estimate} />
      </p>
    </div>
  )
}

/** The card of someone who has not used the count yet: the whole of Brazil's
 * number and the invitation. */
function InvitationInCard({ amount }: { amount: number }) {
  return (
    <>
      <p className="font-label text-label leading-body text-tinta-2">
        Grupo possível
      </p>
      <p
        className="font-title text-frase-do-cartao leading-nota font-semibold tracking-title"
        data-slot="cartao-gp-frase"
      >
        No Brasil, <AdultsInBrazil amount={amount} /> não moram com
        companheiro(a). Quantos deles atendem ao que você procura?
      </p>
    </>
  )
}

/** The B5 Guide card (#19, variant A). Unused, the whole of Brazil's number
 * and the invitation; with a Profile or Requirements, the current count in
 * short. */
export function PossibleGroupCard({
  estimate,
  used,
  active,
  loading,
}: {
  estimate: Estimate
  /** The visitor already gave the Profile or touched the Requirements. */
  used: boolean
  /** The active Requirements, written as in the sentence ("25 a 35 anos"). */
  active: ReadonlyArray<string>
  loading: boolean
}) {
  return (
    <Section aria-labelledby="t-cartao-gp">
      <Headline id="t-cartao-gp">
        {used ? 'Seu Grupo possível' : 'Faça a conta'}
      </Headline>
      <Panel className="[&>p]:m-0 [&>p]:mt-xs">
        {used ? (
          <CountInCard estimate={estimate} active={active} loading={loading} />
        ) : (
          <InvitationInCard amount={estimate.result.central} />
        )}
        <p>
          <Button
            nativeButton={false}
            render={<Link to="/grupo-possivel" />}
            shape="arrow"
          >
            {used ? 'Ajustar os Requisitos' : 'Fazer a conta'}
            <Arrow />
          </Button>
        </p>
      </Panel>
    </Section>
  )
}
