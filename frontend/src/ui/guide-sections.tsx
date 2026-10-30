// The blocks only the Guide has (ADR 0042): the Chapters' table of contents
// under the title, "Em resumo", the arrow that points to the Fact sheets, the
// Chapters themselves (prose with Visuals, the answer of each Question where
// the reasoning reaches it, Tips and struck-out Myths), "O que levar" and
// "O que não se sabe". The page (`routes/$tema/index.tsx`) assembles them.
import { appliesToYou, type Verdict } from '@tem-estudo/rules/applies-to-you'
import { useEffect, useRef, type ReactNode } from 'react'
import type {
  ChapterView,
  GuideTip,
  GuideView,
  MythView,
  QuestionView,
} from '#/content/guide-view'
import type { ChartTable, ChartView } from '#/content/chart-view'
import { useChosenCountry } from '#/state/country'
import { useProfile } from '#/state/profile'
import { VisualChart } from './visual-chart'
import { VisualChartTable } from './visual-chart-table'
import { useProfileInGuide } from '#/state/profile-in-guide'
import { cn } from '@/platform/cn'
import { Html, ShortConfidence } from './guide'
import { Headline, Panel, Section, SmallLink, Tag } from './section'
import { AppliesToNote, ForYourProfile } from './profile'
import { StrengthBadge } from './badges'
import { MYTH_LABEL, MYTH_LINE } from './guide-sections.copy'
import { quotable } from './selection-quote'

/** Margin note 1 of 2: the arrow that points to the Fact sheets. */
export function SourcesArrow() {
  return (
    <div className="mt-2 mr-0 mb-0 ml-auto flex max-w-96 items-start justify-end gap-1.5 text-agua-tinta">
      <svg
        width="44"
        height="40"
        viewBox="0 0 44 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="-mt-1.5 flex-none"
      >
        <path d="M6 4c4 16 14 26 32 30M38 34l-9 2M38 34l-3-8" />
      </svg>
      <a
        href="#fichas"
        className="inline-flex min-h-toque items-center font-nota-de-margem text-nota-de-margem no-underline hover:underline"
      >
        quer conferir? as Fichas estão lá no fim
      </a>
    </div>
  )
}

/** A Chapter's number in the hand-drawn ring, the same in the table of
 * contents and before the Chapter's title. `current` fills it with ink: the
 * Chapter the reader is in, in the reading bar's list. */
function ChapterNumber({
  n,
  current = false,
}: {
  n: number
  current?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-grid size-7.5 flex-none place-items-center rounded-bolota border-(length:--traco-controle) border-tinta font-label text-nota leading-none font-bold',
        current && 'bg-tinta text-papel',
      )}
      aria-hidden="true"
    >
      {n}
    </span>
  )
}

/** The Chapters' links, each with its number: under the title and in the
 * reading bar (`reading-progress.tsx`), where `current` marks the Chapter
 * being read and `onPick` closes the list. */
export function ChapterLinks({
  chapters,
  current,
  onPick,
}: {
  chapters: ReadonlyArray<Pick<ChapterView, 'id' | 'title'>>
  current?: number
  onPick?: () => void
}) {
  return (
    <ol className="m-0 list-none p-0" data-slot="capitulos">
      {chapters.map((chapter, i) => (
        <li
          key={chapter.id}
          className="border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta last:border-b-(length:--traco-etiqueta)"
        >
          <a
            href={`#${chapter.id}`}
            aria-current={i === current ? 'location' : undefined}
            onClick={onPick}
            className="flex min-h-toque items-center gap-sm py-1.5 font-bold no-underline hover:bg-amarelo-voce"
          >
            <ChapterNumber n={i + 1} current={i === current} />
            <span className="underline decoration-2 underline-offset-5">
              {chapter.title}
            </span>
          </a>
        </li>
      ))}
    </ol>
  )
}

/** The Chapters under the title: the reasoning's steps, in order, each
 * leading to its Chapter. */
export function GuideContents({
  chapters,
}: {
  chapters: ReadonlyArray<Pick<ChapterView, 'id' | 'title'>>
}) {
  return (
    <nav aria-labelledby="t-capitulos" id="capitulos" className="mt-md">
      <h2 id="t-capitulos" className="sr-only">
        Capítulos
      </h2>
      <ChapterLinks chapters={chapters} />
    </nav>
  )
}

/** "Em resumo": each Question with its Confidence and the first sentence of
 * its short answer; the Question leads to where the Guide answers it. */
export function GuideSummary({
  questions,
}: {
  questions: GuideView['summary']
}) {
  return (
    <Section id="em-resumo" aria-labelledby="t-em-resumo">
      <Headline id="t-em-resumo">Em resumo</Headline>
      <ol className="m-0 list-none p-0" data-slot="perguntas">
        {questions.map((question) => (
          <li
            key={question.slug}
            className="not-first:mt-md not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta not-first:pt-md"
          >
            <a
              href={`#${question.slug}`}
              className="font-title text-title decoration-2 underline-offset-5 hover:bg-amarelo-voce"
            >
              {question.question}
            </a>
            <ShortConfidence
              confidence={question.confidence}
              className="mt-1 flex"
            />
            <p className="mt-xs mb-0" {...quotable('em-resumo')}>
              {question.firstSentence}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/** A Tip: the text with its numbers, the Strength, the link to its page, the
 * inference notice and "Vale para". */
function TipCard({
  tip,
  verdict,
  anchor,
  as = 'li',
}: {
  tip: GuideTip
  verdict: Verdict | null
  /** The `id` of the section it sits in, for the selection's link. */
  anchor: string
  as?: 'li' | 'div'
}) {
  return (
    <Panel as={as} className="[&>p]:m-0" data-slot="dica">
      <Html as="p" html={tip.html} quote={anchor} />
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <StrengthBadge strength={tip.strength} withLabel />
        <SmallLink to="/dicas/$slug" params={{ slug: tip.slug }}>
          sobre esta Dica
        </SmallLink>
      </div>
      {tip.inference && (
        <p className="mt-1 mb-0 text-nota text-tinta-2 italic">
          Inferência nossa: nenhum estudo testou isso direto. Saiu das Fichas
          citadas.
        </p>
      )}
      <AppliesToNote text={tip.appliesTo} verdict={verdict} />
    </Panel>
  )
}

/** A struck-out Myth and why it does not hold. The label comes first, so a
 * reader who misses the strike (a screen reader does not announce `<s>`)
 * knows the claim is a Myth before reading it. */
export function MythCard({
  myth,
  anchor,
}: {
  myth: MythView
  /** The `id` of the Chapter it sits in, for the selection's link; without
   * it, not quoted. */
  anchor?: string
}) {
  const quote = anchor === undefined ? {} : quotable(anchor)
  return (
    <Panel as="article" className="py-4" data-slot="mito">
      <p
        className="m-0 mb-2 flex flex-wrap items-baseline gap-x-2 text-nota leading-nota text-tinta-2"
        data-slot="mito-rotulo"
      >
        <Tag tone="myth">{MYTH_LABEL}</Tag>
        <span>{MYTH_LINE}</span>
      </p>
      <p className="m-0 font-title text-title leading-label" {...quote}>
        <s className="risco-do-mito">{myth.claim}</s>
      </p>
      <Html
        as="p"
        className="mt-3 mb-0"
        html={myth.whyNotHtml}
        quote={anchor}
      />
    </Panel>
  )
}

/** Where the reasoning reaches a Question: the Question, its short answer
 * and Confidence, on a sheet with a dotted outline (no halftone: it is a
 * note in the text, not a panel), and the "Para o seu Perfil" line. The anchor is the Question's slug, where its old address lands. */
function Answer({
  question,
  after,
}: {
  question: QuestionView
  after: ReactNode
}) {
  const { inGuide } = useProfileInGuide(question)
  const title = `${question.slug}-pergunta`
  return (
    <>
      <section
        id={question.slug}
        aria-labelledby={title}
        className="my-lg scroll-mt-md rounded-mao-2 border-(length:--traco-etiqueta) fio-pontilhado border-tinta bg-folha px-md py-md"
        data-slot="resposta"
      >
        <h3
          id={title}
          className="m-0 font-title text-title text-balance"
          data-slot="pergunta"
          {...quotable(question.slug, true)}
        >
          {question.question}
        </h3>
        <ShortConfidence
          confidence={question.confidence}
          className="mt-1 flex"
        />
        <Html
          className="prosa mt-sm"
          html={question.answerHtml}
          quote={question.slug}
        />
        {inGuide && (
          <ForYourProfile
            keyNumber={inGuide.key}
            findings={question.findings}
          />
        )}
      </section>
      {after}
    </>
  )
}

/** The "vale para você" marks inside the prose: the server leaves each one
 * hidden, with the finding it names, and here it shows when the saved
 * Profile is in the finding's sample. The prose is the server's HTML, so the
 * mark is switched on the element itself; React never rewrites that HTML,
 * whose string does not change. */
function useYouMarks(marks: GuideView['youMarks']) {
  const profile = useProfile()
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    for (const mark of box.current?.querySelectorAll<HTMLElement>(
      '[data-voce]',
    ) ?? []) {
      const coverage = marks[mark.dataset['voce'] ?? '']
      mark.hidden = !(
        profile &&
        coverage &&
        appliesToYou(profile, coverage)?.covered
      )
    }
  }, [profile, marks])
  return box
}

/** A chart with the Guide's chosen country and the saved Profile. */
function ChartBlock({ chart }: { chart: ChartView }) {
  const country = useChosenCountry(
    chart.points.flatMap((p) => (p.country ? [p.country.slug] : [])),
  )
  return <VisualChart chart={chart} country={country} profile={useProfile()} />
}

/** A Study table of mixed units, with the same country and Profile. */
function TableBlock({ table }: { table: ChartTable }) {
  const country = useChosenCountry(
    table.rows.flatMap((r) => (r.point.country ? [r.point.country.slug] : [])),
  )
  return (
    <VisualChartTable table={table} country={country} profile={useProfile()} />
  )
}

/** One piece of a Chapter: its prose, a chart, an answer (with what follows
 * it), a Tip or a Myth. */
function Block({
  block,
  chapter,
  afterAnswer,
}: {
  block: ChapterView['blocks'][number]
  /** The Chapter's `id`, the anchor of its text. */
  chapter: string
  afterAnswer: (question: QuestionView) => ReactNode
}) {
  const profile = useProfile()
  switch (block.kind) {
    case 'chart':
      return <ChartBlock chart={block.visual} />
    case 'table':
      return <TableBlock table={block.table} />
    case 'text':
      return <Html className="prosa" html={block.html} quote={chapter} />
    case 'question':
      return (
        <Answer question={block.question} after={afterAnswer(block.question)} />
      )
    case 'tip':
      return (
        <div className="my-lg">
          <TipCard
            as="div"
            tip={block.tip}
            verdict={profile ? appliesToYou(profile, block.tip.coverage) : null}
            anchor={chapter}
          />
        </div>
      )
    case 'myth':
      return (
        <div className="my-lg">
          <MythCard myth={block.myth} anchor={chapter} />
        </div>
      )
  }
}

/** The `data-slot` of a Chapter's section, which "De onde vem isso?" looks
 * for around a sentence with no citation (`selection-sentences.ts`). */
export const CHAPTER_SLOT = 'capitulo'

/** One Chapter: its number and title, then its blocks in body order. */
function Chapter({
  chapter,
  n,
  afterAnswer,
}: {
  chapter: ChapterView
  n: number
  afterAnswer: (question: QuestionView) => ReactNode
}) {
  const title = `t-${chapter.id}`
  return (
    <Section
      id={chapter.id}
      aria-labelledby={title}
      className="scroll-mt-md"
      data-slot={CHAPTER_SLOT}
    >
      <Headline id={title} className="flex items-baseline gap-sm">
        <ChapterNumber n={n} />
        <span {...quotable(chapter.id, true)}>{chapter.title}</span>
      </Headline>
      {chapter.blocks.map((block) => (
        <Block
          key={block.key}
          block={block}
          chapter={chapter.id}
          afterAnswer={afterAnswer}
        />
      ))}
    </Section>
  )
}

/** The Chapters, in order. `afterAnswer` draws what follows a Question's
 * answer: the calculator card it hosts. */
export function Chapters({
  chapters,
  youMarks,
  afterAnswer = () => null,
}: {
  chapters: GuideView['chapters']
  youMarks: GuideView['youMarks']
  afterAnswer?: (question: QuestionView) => ReactNode
}) {
  const box = useYouMarks(youMarks)
  return (
    <div ref={box} data-slot="capitulos-texto">
      {chapters.map((chapter, i) => (
        <Chapter
          key={chapter.id}
          chapter={chapter}
          n={i + 1}
          afterAnswer={afterAnswer}
        />
      ))}
    </div>
  )
}

/** "O que levar": the Guide's strongest Tips, after the last Chapter. */
export function Takeaways({
  tips,
  verdicts,
}: {
  tips: GuideView['takeaways']
  verdicts?: ReadonlyArray<Verdict | null>
}) {
  return (
    <Section id="o-que-levar" aria-labelledby="t-o-que-levar">
      <Headline id="t-o-que-levar">O que levar</Headline>
      <ul className="m-0 list-none p-0 [&>li]:not-first:mt-lg">
        {tips.map((tip, i) => (
          <TipCard
            key={tip.slug}
            tip={tip}
            verdict={verdicts?.[i] ?? null}
            anchor="o-que-levar"
          />
        ))}
      </ul>
    </Section>
  )
}

/** "O que não se sabe": the gaps that weigh on the conclusion, in prose.
 * Each Study's own limitations live on its Fact sheet's page. */
export function Unknowns({
  html,
}: {
  html: NonNullable<GuideView['unknownsHtml']>
}) {
  return (
    <Section id="o-que-nao-se-sabe" aria-labelledby="t-o-que-nao-se-sabe">
      <Headline id="t-o-que-nao-se-sabe">O que não se sabe</Headline>
      <Html className="prosa" html={html} quote="o-que-nao-se-sabe" />
    </Section>
  )
}
