// The usage-count pieces (#35): the "Ajudou?" at the end of each Question, the
// "Contar minhas visitas" switch and the site footer, which carries it.
import { Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import {
  countEvent,
  saveCounting,
  useCountingState,
} from '#/analytics/counting'
import {
  EVENTS,
  NO_REASONS,
  type AnalyticsEvent,
  type NoReason,
} from '#/analytics/events'
import { cn } from '@/platform/cn'
import { SiteButton } from './button'
import { Subhead, Subsection } from './section'
import { Switch } from '@/ui/shadcn/switch'

/** The copy of each of the four reasons for the "no" (#21). No free
 * field. */
const REASON_COPY: Readonly<Record<NoReason, string>> = {
  'did-not-answer': 'Não respondeu minha dúvida',
  'do-not-trust': 'Não confio na resposta',
  'hard-to-understand': 'Difícil de entender',
  'does-not-apply': 'Não vale para mim',
}

type Step = 'question' | 'reason' | 'answered'

/** "Ajudou?" at the end of a Question of the Guide: yes, or no with one of
 * the four reasons. `question` is the Question's slug, the key the
 * GoatCounter series has carried since each Question had its own page. */
export function WasItHelpful({ question }: { question: string }) {
  const [step, setStep] = useState<Step>('question')
  const state = useCountingState()
  const id = useId()
  const answer = (event: AnalyticsEvent) => {
    countEvent(event)
    setStep('answered')
  }

  return (
    <Subsection aria-labelledby={`${id}-ajudou`}>
      <Subhead id={`${id}-ajudou`}>Ajudou?</Subhead>
      {step === 'question' && (
        <div className="flex gap-2.5">
          <SiteButton
            variant="light"
            className="min-w-22"
            onClick={() => answer(EVENTS.helpedYes(question))}
          >
            Sim
          </SiteButton>
          <SiteButton
            variant="light"
            className="min-w-22"
            onClick={() => setStep('reason')}
          >
            Não
          </SiteButton>
        </div>
      )}
      {step === 'reason' && (
        <div
          role="group"
          aria-labelledby={`${id}-motivo`}
          className="flex flex-col items-start gap-2"
        >
          <p id={`${id}-motivo`} className="m-0 mb-0.5 font-bold">
            O que faltou?
          </p>
          {NO_REASONS.map((reason) => (
            <SiteButton
              key={reason}
              variant="light"
              onClick={() => answer(EVENTS.helpedNo(reason, question))}
            >
              {REASON_COPY[reason]}
            </SiteButton>
          ))}
        </div>
      )}
      <p role="status" className="m-0 text-tinta-2 empty:hidden">
        {step === 'answered' &&
          (state === 'counting'
            ? 'Obrigado. A resposta entra na contagem sem nada sobre você.'
            : 'Obrigado. Você pediu para não ser contado, então a resposta não sai do aparelho.')}
      </p>
    </Subsection>
  )
}

/** The "Contar minhas visitas" switch. With GPC or DNT it stays off and
 * locked, and says why. */
export function CountingSwitch({ className }: { className?: string }) {
  const state = useCountingState()
  const id = useId()
  const locked = state === null || state === 'browser'
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <label
        className={cn(
          'relative inline-flex min-h-toque items-center gap-2.5 font-bold text-tinta',
          locked ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <Switch
          checked={state === 'counting'}
          disabled={locked}
          aria-describedby={state === 'browser' ? id : undefined}
          onCheckedChange={(on) => saveCounting(on)}
        />
        <span className={locked ? 'text-tinta-2' : undefined}>
          Contar minhas visitas
        </span>
      </label>
      {state === 'browser' && (
        <span
          id={id}
          className="text-label leading-body font-normal text-tinta-2"
        >
          Desligada: seu navegador pede para não contar (GPC ou Do Not Track).
        </span>
      )}
    </div>
  )
}

/** The footer of every page: the privacy page and the switch. On desktop,
 * it continues the page's sheet over the halftone. */
export function Footer() {
  return (
    <footer className="mx-auto max-w-pagina border-t-2 border-tinta p-md text-nota text-tinta-2 folha:border-2 folha:border-t-0 folha:bg-papel folha:px-16">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5">
        <Link
          to="/privacidade"
          className="inline-flex min-h-toque items-center font-bold text-tinta"
        >
          Privacidade
        </Link>
        <CountingSwitch />
      </div>
    </footer>
  )
}
