// The big row of a Question (DESIGN.md, Navegação): the Question
// highlighted, the first sentence of the answer and the arrow, in a card
// with the halftone. The Guide's related ones, where the Fact sheet and the
// Tip are cited, and the home page calculators.
import { Link } from '@tanstack/react-router'

/** What the row shows of a Guide: enough of a `GuiaResumo`. */
type RowQuestion = {
  readonly topic: string
  readonly slug: string
  readonly question: string
  readonly firstSentence: string
}

const Arrow = () => (
  <svg
    width="30"
    height="20"
    viewBox="0 0 30 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 11c8-2 16-1 25-1M27 10l-7-7M27 10l-7 7" />
  </svg>
)

/** What the big row shows: the title and the sentence below, and the
 * arrow. */
function RowBody({ title, sentence }: { title: string; sentence: string }) {
  return (
    <>
      <span>
        <b className="mb-1 block font-title text-linha leading-tight font-bold tracking-title">
          {title}
        </b>
        <span className="block text-nota leading-nota text-tinta-2 group-hover:text-tinta">
          {sentence}
        </span>
      </span>
      <Arrow />
    </>
  )
}

const ROW =
  'reticula group grid min-h-toque grid-cols-[1fr_auto] items-center gap-3 rounded-mao-2 border-2 border-tinta bg-folha p-4 no-underline hover:bg-amarelo-voce'

/** A Question as a big row: the Question, the first sentence of the answer
 * and the arrow. `from` is the Question of the Guide being left, which the
 * other Guide shows in "Voltar para <Pergunta>". */
export function QuestionRow({
  guide,
  from,
}: {
  guide: RowQuestion
  from?: string
}) {
  return (
    <Link
      to="/$tema/$slug"
      params={{ tema: guide.topic, slug: guide.slug }}
      state={from ? { from: from } : undefined}
      className={ROW}
      data-slot="linha-pergunta"
    >
      <RowBody title={guide.question} sentence={guide.firstSentence} />
    </Link>
  )
}

/** The big row of a calculator, on the home page. */
export function CalculatorRow({
  href,
  title,
  summary,
}: {
  href: string
  title: string
  summary: string
}) {
  return (
    <a href={href} className={ROW} data-slot="linha-pergunta">
      <RowBody title={title} sentence={summary} />
    </a>
  )
}
