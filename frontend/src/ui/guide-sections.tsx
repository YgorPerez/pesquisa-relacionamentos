// The blocks only the Guide has (ADR 0042). The frame: the index of the
// Questions, the arrow that points to the Fact sheets, "O que levar" and the
// Limitations by Study. Inside a Question: what the evidence says, with each
// finding's Tips and struck-out Myths right after it, the loose Tips and
// Myths, and the narrative's own sections. The page (`routes/$tema/index.tsx`)
// assembles them.
import type { Verdict } from '@tem-estudo/rules/applies-to-you'
import { Link } from '@tanstack/react-router'
import type { GuideTip, GuideView, QuestionView } from '#/content/guide-view'
import { Html, ShortConfidence } from './guide'
import { Headline, Panel, Section, Subhead, Subsection } from './section'
import { AppliesToNote } from './profile'
import { StrengthBadge } from './badges'

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

/** The index at the top of the Guide: each Question, which leads to its
 * section, with the Confidence and the short answer. */
export function GuideIndex({ index }: { index: GuideView['index'] }) {
  return (
    <nav aria-labelledby="t-indice" id="indice">
      <h2 id="t-indice" className="sr-only">
        Perguntas deste Guia
      </h2>
      <ol className="m-0 list-none p-0" data-slot="perguntas">
        {index.map((question) => (
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
            <Html className="prosa mt-xs" html={question.answerHtml} />
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** A Tip: the text with its numbers, the Strength, the link to its page, the
 * inference notice and "Vale para". */
function TipCard({
  tip,
  verdict,
  as = 'li',
}: {
  tip: GuideTip
  verdict: Verdict | null
  as?: 'li' | 'div'
}) {
  return (
    <Panel as={as} className="[&>p]:m-0" data-slot="dica">
      <Html as="p" html={tip.html} />
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <StrengthBadge strength={tip.strength} withLabel />
        <Link
          to="/dicas/$slug"
          params={{ slug: tip.slug }}
          className="inline-flex min-h-toque items-center text-label leading-body font-bold"
        >
          sobre esta Dica
        </Link>
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

/** A struck-out Myth and why it does not hold. */
function MythCard({ myth }: { myth: QuestionView['myths'][number] }) {
  return (
    <Panel as="article" className="py-4" data-slot="mito">
      <p className="m-0 font-title text-title leading-label">
        <s className="risco-do-mito">{myth.claim}</s>
      </p>
      <Html as="p" className="mt-3 mb-0" html={myth.whyNotHtml} />
    </Panel>
  )
}

/** Verdicts of the Profile for a Question, by the index of the finding and
 * of the Tip; `undefined` without a Profile. */
interface Verdicts {
  readonly findings?: ReadonlyArray<Verdict>
  readonly tips?: ReadonlyArray<Verdict>
}

/** The Question's Tips that follow no finding. */
export function GuideTips({
  question,
  verdicts,
}: {
  question: QuestionView
  verdicts: Verdicts | undefined
}) {
  const id = `${question.slug}-dicas`
  return (
    <Subsection aria-labelledby={id}>
      <Subhead id={id}>Dicas</Subhead>
      <ul className="m-0 list-none p-0 [&>li]:not-first:mt-lg">
        {question.tips.map(
          (tip, i) =>
            tip.finding === null && (
              <TipCard
                key={tip.slug}
                tip={tip}
                verdict={verdicts?.tips?.[i] ?? null}
              />
            ),
        )}
      </ul>
    </Subsection>
  )
}

/** "O que a evidência diz": the findings with country and year, each one's
 * Tips and Myths right after it, and the divergence. */
export function Evidence({
  question,
  verdicts,
}: {
  question: QuestionView
  verdicts: Verdicts | undefined
}) {
  const id = `${question.slug}-evidencia`
  return (
    <Subsection aria-labelledby={id}>
      <Subhead id={id}>O que a evidência diz</Subhead>
      <ol className="m-0 list-none p-0" data-slot="achados-guia">
        {question.findings.map((finding, i) => (
          <li
            key={finding.html}
            className="border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-4 first:border-t-0 first:pt-0.5"
          >
            <div className="grid grid-cols-[minmax(58px,max-content)_1fr] gap-sm [&_[data-slot=vale]]:mt-xs [&_p]:m-0">
              <span
                className="h-max max-w-30 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-folha px-1.5 pt-1.75 pb-1.5 text-center font-title text-medio leading-cerrada font-bold wrap-anywhere"
                data-slot="onde"
              >
                {finding.country}
                <small className="mt-0.75 block font-label text-miudo leading-curta font-bold text-tinta-2">
                  {finding.period}
                </small>
              </span>
              <div>
                <Html as="p" html={finding.html} />
                <AppliesToNote
                  text={finding.appliesTo}
                  verdict={verdicts?.findings?.[i] ?? null}
                />
              </div>
            </div>
            <NextToTheFinding
              question={question}
              finding={i}
              verdicts={verdicts}
            />
          </li>
        ))}
      </ol>

      {question.divergence && <Divergence divergence={question.divergence} />}
    </Subsection>
  )
}

/** The Tips and Myths a finding carries, below it. */
function NextToTheFinding({
  question,
  finding,
  verdicts,
}: {
  question: QuestionView
  finding: number
  verdicts: Verdicts | undefined
}) {
  const tips = question.tips.flatMap((tip, i) =>
    tip.finding === finding ? [{ tip, i }] : [],
  )
  const myths = question.myths.filter((m) => m.finding === finding)
  if (tips.length === 0 && myths.length === 0) return null
  return (
    <div className="mt-sm flex flex-col gap-md">
      {tips.map(({ tip, i }) => (
        <TipCard
          key={tip.slug}
          as="div"
          tip={tip}
          verdict={verdicts?.tips?.[i] ?? null}
        />
      ))}
      {myths.map((myth) => (
        <MythCard key={myth.claim} myth={myth} />
      ))}
    </div>
  )
}

/** When the evidence diverges: one side per column and which has the
 * better design. */
function Divergence({
  divergence,
}: {
  divergence: NonNullable<QuestionView['divergence']>
}) {
  return (
    <div className="mt-md">
      <table
        aria-label="A evidência diverge"
        className="w-full table-fixed border-separate border-spacing-0 rounded-mao border-2 border-tinta bg-folha text-aviso leading-normal"
      >
        <thead>
          <tr>
            {divergence.sides.map((side) => (
              <th
                key={side.title}
                scope="col"
                className="border-b-(length:--traco-etiqueta) fio-pontilhado border-tinta px-3 pt-3 pb-3.5 text-left align-top font-title text-body leading-tight font-bold not-first:border-l-(length:--traco-etiqueta)"
              >
                {side.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {divergence.sides.map((side) => (
              <td
                key={side.title}
                className="px-3 pt-3 pb-3.5 text-left align-top not-first:border-l-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
              >
                <Html html={side.html} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-3 mb-0 text-aviso" data-slot="melhor-desenho">
        <b>Qual lado tem o melhor desenho: </b>
        <Html as="span" html={divergence.bestDesignHtml} />
      </p>
    </div>
  )
}

/** The narrative's own sections ("Efeitos psicológicos", "Então, vale a
 * pena?"), each with the title the Question gives it, in file order. */
export function OwnSections({
  sections,
}: {
  sections: QuestionView['sections']
}) {
  return (
    <>
      {sections.map((section) => (
        <Subsection key={section.id} aria-labelledby={section.id}>
          <Subhead id={section.id}>{section.title}</Subhead>
          <Html className="prosa" html={section.html} />
        </Subsection>
      ))}
    </>
  )
}

/** The Question's Myths that follow no finding. */
export function Myths({ question }: { question: QuestionView }) {
  const id = `${question.slug}-mitos`
  return (
    <Subsection aria-labelledby={id}>
      <Subhead id={id}>O que circula por aí e não se sustenta</Subhead>
      <div className="flex flex-col gap-5.5">
        {question.myths.map(
          (myth) =>
            myth.finding === null && <MythCard key={myth.claim} myth={myth} />,
        )}
      </div>
    </Subsection>
  )
}

/** "O que levar": the Guide's strongest Tips, after the last Question. */
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
          <TipCard key={tip.slug} tip={tip} verdict={verdicts?.[i] ?? null} />
        ))}
      </ul>
    </Section>
  )
}

/** The Guide's Limitations, one group per Study (its title leads to the
 * Fact sheet's number in the list) or per Question. */
export function Limitations({ groups }: { groups: GuideView['limitations'] }) {
  return (
    <Section id="limitacoes" aria-labelledby="t-limitacoes">
      <Headline id="t-limitacoes">Limitações e o que não se sabe</Headline>
      {groups.map((group) => (
        <div
          key={group.factSheet?.anchor ?? group.title ?? 'geral'}
          className="not-first:mt-md"
          data-slot="limitacoes-grupo"
        >
          {group.title && (
            <Subhead>
              {group.title}
              {group.factSheet && (
                <>
                  {' '}
                  <a
                    className="ref"
                    href={`#${group.factSheet.anchor}`}
                    aria-label={`Ficha ${group.factSheet.n}: ${group.title}`}
                  >
                    {group.factSheet.n}
                  </a>
                </>
              )}
            </Subhead>
          )}
          <Html className="prosa limites" html={group.html} />
        </div>
      ))}
    </Section>
  )
}
