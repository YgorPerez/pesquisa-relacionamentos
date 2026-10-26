// The Profile on the page (DESIGN.md, "Perfil: destacar sem esconder"): the
// link below the short answer, the box with the form, the "vale para você"
// badge, the empty ring of "não há dado", the "Para o seu Perfil" line and
// the notice above the title. Nothing here hides content: it only marks.
// Yellow only for what applies to you; "não há dado" is an empty ring in ink,
// with no pink (The Three Inks Rule).
import {
  describeProfile,
  PROFILE_GENDERS,
  MAX_AGE,
  MIN_AGE,
  readProfile,
  PROFILE_SEEKS,
  type Profile,
} from '@tem-estudo/rules/profile'
import type { ProfileInGuide } from '@tem-estudo/rules/profile-in-guide'
import type { Verdict } from '@tem-estudo/rules/applies-to-you'
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import type { SafeHtml } from '#/content/safe-html'
import { saveProfile } from '#/state/profile'
import { cn } from '@/platform/cn'
import { SiteButton } from './button'
import { Html } from './guide'
import { Notice } from './section'
import { Input } from '@/ui/shadcn/input'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'

/** The link that leads to the box asks to open the form already filled in. */
const CHANGE = 'tem-estudo:change-profile'

const SMALL = 'text-etiqueta font-normal text-tinta-2'

/** Below the short answer. Without a Profile it invites; with one, it
 * summarizes and offers to change it. The underline is dashed. */
export function ProfileLink({ profile }: { profile: Profile | null }) {
  return (
    <a
      className="m-0 mb-xs inline-block min-h-toque px-0 pt-3 pb-1 font-label text-aviso leading-label font-bold underline decoration-dashed decoration-2 underline-offset-5"
      href="#perfil"
      onClick={() => profile && window.dispatchEvent(new Event(CHANGE))}
    >
      {profile ? (
        <>
          Seu Perfil: {describeProfile(profile)}{' '}
          <small className={SMALL}>· mudar</small>
        </>
      ) : (
        <>
          {/* A single text, with the space: the dashed underline follows the
              text, and split in two it restarted at the space. */}
          {'Diga seu Perfil e veja o que vale para você '}
          <small className={SMALL}>· opcional</small>
        </>
      )}
    </a>
  )
}

/** Above a Question's short answer, only when none of its findings has data
 * for the Profile. */
export function NoDataNotice({ profile }: { profile: Profile }) {
  return (
    <Notice className="m-0 mb-sm" role="note" data-slot="aviso-perfil">
      Nenhum estudo desta Pergunta separou pessoas com o seu Perfil (
      <b>{describeProfile(profile)}</b>). O que segue vem de outras amostras:
      vale como pista, não como resposta para você.
    </Notice>
  )
}

/** The yellow badge. For someone seeking both, it says which side has
 * data. */
export function YouBadge({
  only,
  className,
}: {
  only?: 'homens' | 'mulheres' | undefined
  className?: string
}) {
  return (
    <span
      className={cn(
        'mt-1.5 mr-2 mb-0 ml-0 inline-block rounded-mao-2 bg-amarelo-voce px-2 py-px font-label text-label text-tinta',
        className,
      )}
      data-slot="selo-voce"
    >
      {only ? `vale para você quando procura ${only}` : 'vale para você'}
    </span>
  )
}

/** The "Vale para:" note of a finding or Tip, which always stays. With a
 * Profile, it gets the badge (covered) or the empty ring and the sentence
 * that there is no data. */
export function AppliesToNote({
  text,
  verdict,
}: {
  text: string
  verdict: Verdict | null
}) {
  return (
    <>
      {verdict?.covered && <YouBadge only={verdict.only} />}
      <p
        className="m-0 mt-xs text-label leading-nota font-normal text-tinta-2"
        data-slot="vale"
      >
        {verdict && !verdict.covered && (
          <span
            className="mr-1.5 inline-block size-3 rounded-bolota border-(length:--traco-controle) border-tinta align-[-1px]"
            aria-hidden="true"
            data-slot="anel-vazio"
          />
        )}
        <b className="text-tinta">Vale para:</b> {text}
        {verdict && !verdict.covered && (
          <strong className="text-tinta">
            {' '}
            Não há dado deste estudo para o seu Perfil.
          </strong>
        )}
      </p>
    </>
  )
}

const FOR_YOUR_PROFILE =
  'm-0 mt-3 border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta pt-2.5 text-aviso leading-normal'

/** "Para o seu Perfil: …", below the short answer, after the dotted line. */
export function ForYourProfile({
  keyNumber,
  findings,
}: {
  keyNumber: ProfileInGuide['key']
  findings: ReadonlyArray<{ readonly html: SafeHtml }>
}) {
  if (!keyNumber) return null
  if (keyNumber.applies)
    return (
      <p className={FOR_YOUR_PROFILE} data-slot="para-o-seu-perfil">
        <YouBadge className="mt-0" /> o número em destaque vem de um estudo com
        pessoas do seu Perfil.
      </p>
    )
  const other =
    keyNumber.finding === null ? undefined : findings[keyNumber.finding]
  return (
    <p className={FOR_YOUR_PROFILE} data-slot="para-o-seu-perfil">
      <b>Para o seu Perfil:</b>{' '}
      {other ? (
        <>
          o número em destaque vem de outra amostra. O que tem dado para você:{' '}
          <Html as="span" html={other.html} />
        </>
      ) : (
        'nenhum número desta Pergunta vem de uma amostra como a sua.'
      )}
    </p>
  )
}

function findingCount(withData: number, total: number): string {
  if (total === 1)
    return withData
      ? 'O único achado tem dado para o seu Perfil.'
      : 'O único achado não tem dado para o seu Perfil.'
  if (withData === 0)
    return `Nenhum dos ${total} achados tem dado para o seu Perfil.`
  if (withData === total)
    return `Os ${total} achados têm dado para o seu Perfil.`
  return `${withData} de ${total} achados ${withData === 1 ? 'tem' : 'têm'} dado para o seu Perfil.`
}

const GENDER_LABEL = {
  homem: 'homem',
  mulher: 'mulher',
  outro: 'outro',
} as const
const SEEKS_LABEL = {
  homens: 'homens',
  mulheres: 'mulheres',
  ambos: 'ambos',
} as const

const FIELD = 'm-0 mb-sm border-0 p-0'
const LABEL = 'mb-2 block p-0 font-bold'
const NOTE = 'text-label leading-body font-normal text-tinta-2'

function Options<T extends string>({
  legend,
  values,
  labels,
  checked,
  onCheck,
}: {
  legend: string
  values: ReadonlyArray<T>
  labels: Record<T, string>
  checked: T | undefined
  onCheck: (value: T) => void
}) {
  const id = useId()
  return (
    <fieldset className={FIELD}>
      <legend id={id} className={LABEL}>
        {legend}
      </legend>
      <RadioGroup
        aria-labelledby={id}
        value={checked ?? null}
        onValueChange={(value) => onCheck(value as T)}
      >
        {values.map((value) => (
          <RadioGroupItem key={value} value={value}>
            {labels[value]}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

/** What the person checked and typed in the form, before saving. */
interface Draft {
  gender?: string
  seeks?: string
  age: string
}

/** The "Seu Perfil: … · mudar" link up top opens the form here. The event
 * reads the current `onRequest` (with the current Profile), without
 * re-subscribing on every change. */
function useOnRequestToChange(onRequest: () => void) {
  const request = useEffectEvent(onRequest)
  useEffect(() => {
    const listen = () => request()
    window.addEventListener(CHANGE, listen)
    return () => window.removeEventListener(CHANGE, listen)
  }, [])
}

/** Editing the Profile in the box: the draft, the error, opening to change,
 * saving and deleting, and where focus goes at each step. */
function useProfileEditing(profile: Profile | null) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>({ age: '' })
  const [error, setError] = useState<string | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const summary = useRef<HTMLParagraphElement>(null)

  const open = (current: Profile | null) => {
    setDraft({
      gender: current?.gender,
      seeks: current?.seeks,
      age: current?.age?.toString() ?? '',
    })
    setError(null)
    setEditing(true)
  }

  useOnRequestToChange(() => open(profile))

  // When opening to change, focus goes to the checked option, or the first.
  useEffect(() => {
    if (editing)
      box.current
        ?.querySelector<HTMLElement>(
          '[role="radio"][aria-checked="true"], [role="radio"]',
        )
        ?.focus()
  }, [editing])

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = readProfile(draft)
    if (!next) {
      setError('Escolha ao menos uma opção ou diga a sua idade.')
      return
    }
    saveProfile(next)
    setEditing(false)
    requestAnimationFrame(() => summary.current?.focus())
  }

  const remove = () => {
    saveProfile(null)
    setEditing(false)
    setDraft({ age: '' })
  }

  return {
    editing,
    box,
    summary,
    open,
    form: { draft, setDraft, error, save, remove },
  }
}

/** The box in "Varia conforme o Perfil?": the form (optional, nothing is
 * required) or the summary with "mudar", and the count of findings with
 * data. */
export function ProfileBox({
  profile,
  withData,
  findingTotal,
  buttonLabel = 'Ver o que vale para mim',
}: {
  profile: Profile | null
  withData: number | null
  findingTotal: number
  /** The text of the button that saves; the calculator uses its own. */
  buttonLabel?: string
}) {
  const { editing, box, summary, open, form } = useProfileEditing(profile)
  const formOpen = !profile || editing
  return (
    <div
      className="reticula mt-md rounded-mao-2 border-2 border-tinta bg-folha p-4"
      ref={box}
    >
      {formOpen ? (
        <ProfileForm
          {...form}
          hasProfile={profile !== null}
          buttonLabel={buttonLabel}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <p ref={summary} tabIndex={-1} className="m-0">
            Seu Perfil:{' '}
            <b className="bg-amarelo-voce px-0.75 box-decoration-clone">
              {describeProfile(profile)}
            </b>
          </p>
          <SiteButton variant="light" onClick={() => open(profile)}>
            mudar
          </SiteButton>
        </div>
      )}
      {profile && withData !== null && (
        <ProfileCount
          withData={withData}
          findingTotal={findingTotal}
          className="mt-sm border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta pt-2.5"
        />
      )}
    </div>
  )
}

/** How many findings have data for the Profile: in the Profile box, and in a
 * Question's "Varia conforme o Perfil?". */
export function ProfileCount({
  withData,
  findingTotal,
  className,
}: {
  withData: number
  findingTotal: number
  className?: string
}) {
  return (
    <p
      className={cn('m-0 text-aviso font-bold', className)}
      aria-live="polite"
      data-slot="perfil-contagem"
    >
      {findingCount(withData, findingTotal)}
    </p>
  )
}

/** The Profile form: gender, who they seek and age, the button that saves
 * and, with a saved Profile, the one that deletes it. */
function ProfileForm({
  draft,
  setDraft,
  error,
  save,
  remove,
  hasProfile,
  buttonLabel,
}: ReturnType<typeof useProfileEditing>['form'] & {
  hasProfile: boolean
  buttonLabel: string
}) {
  return (
    <form onSubmit={save} aria-label="Seu Perfil">
      <Options
        legend="Você é"
        values={PROFILE_GENDERS}
        labels={GENDER_LABEL}
        checked={draft.gender as Profile['gender']}
        onCheck={(gender) => setDraft((d) => ({ ...d, gender }))}
      />
      <Options
        legend="Você procura"
        values={PROFILE_SEEKS}
        labels={SEEKS_LABEL}
        checked={draft.seeks as Profile['seeks']}
        onCheck={(seeks) => setDraft((d) => ({ ...d, seeks }))}
      />
      <AgeField
        value={draft.age}
        onChange={(age) => setDraft((d) => ({ ...d, age }))}
      />
      {error && (
        <p className="m-0 mb-sm font-bold" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2.5">
        <SiteButton type="submit">{buttonLabel}</SiteButton>
        {hasProfile && (
          <SiteButton variant="light" onClick={remove}>
            Apagar o Perfil
          </SiteButton>
        )}
      </div>
      <p className={cn('m-0 mt-sm', NOTE)}>
        Fica só neste navegador. Nada some da página.
      </p>
    </form>
  )
}

/** "Sua idade": the number field, with the minimum written beside it. */
function AgeField({
  value,
  onChange,
}: {
  value: string
  onChange: (age: string) => void
}) {
  const id = useId()
  return (
    <div className={FIELD}>
      <label htmlFor={`${id}-idade`} className={LABEL}>
        Sua idade
      </label>
      <div className="flex flex-wrap items-center gap-2.5">
        <Input
          id={`${id}-idade`}
          type="number"
          inputMode="numeric"
          min={MIN_AGE}
          max={MAX_AGE}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={`${id}-idade-dica`}
        />
        <span id={`${id}-idade-dica`} className={NOTE}>
          a partir de {MIN_AGE}
        </span>
      </div>
    </div>
  )
}
