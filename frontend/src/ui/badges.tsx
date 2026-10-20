// Verification status and Strength of evidence, always drawn and written
// (DESIGN.md: "Don't mostrar Confiança, Status ou Força só por cor").
import type { Strength, VerificationStatus } from '@tem-estudo/content'
import type { ReactNode } from 'react'
import { cn } from '@/platform/cn'

const STATUS_WORD: Record<VerificationStatus, string> = {
  ok: 'lido no original',
  parcial: 'parcial',
  'nao-verificado': 'não verificado',
}

const STEPS_BY_STRENGTH: Record<Strength, number> = {
  fraca: 1,
  moderada: 2,
  forte: 3,
}

/** A box with a check (read), a hatched box (partial), an empty box
 * (unverified). */
function StatusIcon({ status }: { status: VerificationStatus }) {
  return (
    <svg
      className="flex-none text-tinta"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3.5h14v13H3z" transform="rotate(-1 10 10)" />
      {status === 'ok' && (
        <path
          d="M6 10.5l3 3 6-8"
          className="stroke-agua-tinta"
          strokeWidth="2.4"
        />
      )}
      {status === 'parcial' && (
        <path
          d="M4.5 16L16 4.5M4 10.5L10.5 4M9.5 16L16 9.5"
          strokeWidth="1.4"
        />
      )}
    </svg>
  )
}

export function VerificationStatusBadge({
  status,
}: {
  status: VerificationStatus
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-label text-label"
      data-status={status}
    >
      <StatusIcon status={status} />
      {STATUS_WORD[status]}
    </span>
  )
}

const STEP_PATHS = [
  'M2.6 6.4 19.8 5.5l.7 11.4-17.5.6z',
  'M23.6 5.3l17.4.7-.5 11-17.4-.4z',
  'M44.6 5.8l18.2-.7.5 11.3-18.3.8z',
]

/** The three hand-drawn steps, filled by the level. */
export function Steps({
  level,
  width = 36,
}: {
  level: Strength
  width?: number
}) {
  return <FilledSteps filled={STEPS_BY_STRENGTH[level]} width={width} />
}

/** The same steps with 1 to 3 filled: the weight the evidence gives in
 * Priorities. */
export function FilledSteps({
  filled,
  width = 36,
}: {
  filled: number
  width?: number
}) {
  return (
    <svg
      className="flex-none text-tinta"
      width={width}
      height={(width * 22) / 66}
      viewBox="0 0 66 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {STEP_PATHS.map((d, i) => (
        <path key={d} d={d} fill={i < filled ? 'currentColor' : 'none'} />
      ))}
    </svg>
  )
}

export function StrengthBadge({
  strength,
  withLabel = false,
}: {
  strength: Strength
  withLabel?: boolean
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-label text-label"
      data-forca={strength}
    >
      <Steps level={strength} />
      {withLabel ? `evidência ${strength}` : strength}
    </span>
  )
}

/** The legend at the end of the Fact sheet lists. */
export function FactSheetLegend() {
  return (
    <dl className="m-0 text-nota text-tinta-2">
      <div className="grid gap-0.5 py-2">
        <dt className="text-tinta">
          <VerificationStatusBadge status="ok" />
        </dt>
        <dd className="m-0">
          os números foram conferidos no texto completo do estudo.
        </dd>
      </div>
      <div className="grid gap-0.5 py-2">
        <dt className="text-tinta">
          <VerificationStatusBadge status="parcial" />
        </dt>
        <dd className="m-0">
          conferido no resumo ou na página oficial, não no texto completo.
        </dd>
      </div>
      <div className="grid gap-0.5 py-2">
        <dt className="text-tinta">
          <VerificationStatusBadge status="nao-verificado" />
        </dt>
        <dd className="m-0">
          ainda não conferido na fonte. Não sustenta nenhum Guia.
        </dd>
      </div>
      <div className="grid gap-0.5 py-2">
        <dt className="text-tinta">
          <StrengthBadge strength="forte" />
        </dt>
        <dd className="m-0">
          amostra grande e representativa, replicado ou meta-análise.
        </dd>
      </div>
      <div className="grid gap-0.5 py-2">
        <dt className="text-tinta">
          <StrengthBadge strength="moderada" />
        </dt>
        <dd className="m-0">
          bom desenho, mas uma amostra só, um retrato num momento ou um viés
          conhecido.
        </dd>
      </div>
      <div className="grid gap-0.5 py-2">
        <dt className="text-tinta">
          <StrengthBadge strength="fraca" />
        </dt>
        <dd className="m-0">
          amostra pequena, não representativa, comercial ou com conflito de
          interesse.
        </dd>
      </div>
    </dl>
  )
}

/** A Fact sheet's metadata row: Status, Strength and the context. The
 * `grande` one sits under the title of the Fact sheet page. */
export function FactSheetMeta({
  large = false,
  children,
}: {
  large?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center text-label leading-label font-normal',
        large ? 'm-0 mb-lg gap-x-md gap-y-2.5' : 'mt-xs gap-x-sm gap-y-1.5',
      )}
      data-slot={large ? 'ficha-meta-grande' : 'ficha-meta'}
    >
      {children}
    </div>
  )
}
