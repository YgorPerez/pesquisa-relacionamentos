// The sections only the Guide has: the arrow that points to the Fact sheets,
// the Tips, what the evidence says (with the divergence), the Guide's own
// sections and the struck-out Myths. The page (`routes/$tema/$slug.tsx`) assembles them in #7's order.
import type { Verdict } from '@tem-estudo/rules/applies-to-you'
import { Link } from '@tanstack/react-router'
import type { GuideView } from '#/content/guide-view'
import { Html } from './guide'
import { Headline, Panel, Section } from './section'
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

export function GuideTips({
  tips,
  verdicts,
}: {
  tips: GuideView['tips']
  verdicts: ReadonlyArray<Verdict> | undefined
}) {
  return (
    <Section aria-labelledby="t-dicas">
      <Headline id="t-dicas">Dicas</Headline>
      <ul className="m-0 list-none p-0" data-slot="dicas-do-guia">
        {tips.map((tip, i) => (
          <Panel as="li" key={tip.slug} className="not-first:mt-lg [&>p]:m-0">
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
                Inferência nossa: nenhum estudo testou isso direto. Saiu das
                Fichas citadas.
              </p>
            )}
            <AppliesToNote
              text={tip.appliesTo}
              verdict={verdicts?.[i] ?? null}
            />
          </Panel>
        ))}
      </ul>
    </Section>
  )
}

/** "O que a evidência diz": the findings with country and year, and the
 * divergence. */
export function Evidence({
  guide,
  verdicts,
}: {
  guide: GuideView
  verdicts: ReadonlyArray<Verdict> | undefined
}) {
  return (
    <Section aria-labelledby="t-evidencia">
      <Headline id="t-evidencia">O que a evidência diz</Headline>
      <ol className="m-0 list-none p-0" data-slot="achados-guia">
        {guide.findings.map((finding, i) => (
          <li
            key={finding.html}
            className="grid grid-cols-[minmax(58px,max-content)_1fr] gap-sm border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-4 first:border-t-0 first:pt-0.5 [&_[data-slot=vale]]:mt-xs [&_p]:m-0"
          >
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
                verdict={verdicts?.[i] ?? null}
              />
            </div>
          </li>
        ))}
      </ol>

      {guide.divergence && <Divergence divergence={guide.divergence} />}
    </Section>
  )
}

/** When the evidence diverges: one side per column and which has the
 * better design. */
function Divergence({
  divergence,
}: {
  divergence: NonNullable<GuideView['divergence']>
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

/** The Guide's own sections ("Efeitos psicológicos", "Então, vale a
 * pena?"), each with the title the Guide gives it, in file order. */
export function OwnSections({ sections }: { sections: GuideView['sections'] }) {
  return (
    <>
      {sections.map((section) => (
        <Section key={section.id} aria-labelledby={section.id}>
          <Headline id={section.id}>{section.title}</Headline>
          <Html className="prosa" html={section.html} />
        </Section>
      ))}
    </>
  )
}

export function Myths({ myths }: { myths: GuideView['myths'] }) {
  return (
    <Section aria-labelledby="t-mitos">
      <Headline id="t-mitos">O que circula por aí e não se sustenta</Headline>
      {myths.map((myth) => (
        <Panel
          as="article"
          key={myth.claim}
          className="py-4 not-first-of-type:mt-5.5"
          data-slot="mito"
        >
          <p className="m-0 font-title text-title leading-label">
            <s className="risco-do-mito">{myth.claim}</s>
          </p>
          <Html as="p" className="mt-3 mb-0" html={myth.whyNotHtml} />
        </Panel>
      ))}
    </Section>
  )
}
