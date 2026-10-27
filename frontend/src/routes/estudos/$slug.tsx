import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { reads } from '#/content/reads'
import { Html } from '#/ui/guide'
import { QuestionRow } from '#/ui/question-row'
import { BackLink } from '#/ui/navigation'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Notice, Headline, Section } from '#/ui/section'
import {
  StrengthBadge,
  FactSheetLegend,
  VerificationStatusBadge,
  FactSheetMeta,
} from '#/ui/badges'
import { DESIGN_NAME, STRENGTH_WORD } from '#/ui/badges.copy'
import { SelectionPopover } from '#/ui/selection-popover'
import { quotable } from '#/ui/selection-quote'

export const Route = createFileRoute('/estudos/$slug')({
  // The `loaderData` carries only what the `head` uses; the Fact sheet goes
  // through the `queryClient`.
  loader: async ({ context, params }) => {
    const factSheet = await context.queryClient.query(
      reads.factSheet(params.slug),
    )
    return { search: factSheet.search, indexable: factSheet.indexable }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.search.title} · Tem estudo?` },
          { name: 'description', content: loaderData.search.description },
          // A ⬜ Fact sheet stays out of search until it is checked (#15).
          ...(loaderData.indexable
            ? []
            : [{ name: 'robots', content: 'noindex' }]),
        ]
      : [],
  }),
  notFoundComponent: FactSheetNotFound,
  component: FactSheetPage,
})

const numberFormat = new Intl.NumberFormat('pt-BR')

const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

/** One row of the Fact sheet's data, with the dotted rule above. */
function DataRow({
  title,
  children,
}: {
  title: ReactNode
  children: ReactNode
}) {
  return (
    <div className="border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-3 first:border-t-0 first:pt-0">
      <dt className="font-label text-label leading-body text-tinta-2">
        {title}
      </dt>
      <dd className="m-0 mt-0.5 wrap-anywhere">{children}</dd>
    </div>
  )
}

/** The address's Fact sheet, which the loader already put in the
 * `queryClient`: each section of the page reads it from there, without
 * requesting it again. */
function useFactSheet() {
  return useSuspenseQuery(reads.factSheet(Route.useParams().slug)).data
}

function FactSheetPage() {
  const factSheet = useFactSheet()
  const unverified = factSheet.status === 'unverified'

  return (
    <Sheet>
      <Column>
        <BackLink to="/estudos">Todos os estudos</BackLink>

        {unverified && (
          <Notice role="note">
            <strong>Ficha não verificada.</strong> Os números abaixo ainda não
            foram conferidos no texto original. Ela não sustenta nenhum Guia até
            ser refeita com a fonte aberta.
          </Notice>
        )}

        <Display small {...quotable(null, true)}>
          {factSheet.title}
        </Display>

        <FactSheetMeta large>
          <VerificationStatusBadge status={factSheet.status} />
          <StrengthBadge strength={factSheet.strength} withLabel />
        </FactSheetMeta>

        <FactSheetData />

        <WhatItMeasured />

        <Findings />

        {factSheet.otherSections.map((section, i) => (
          <Section key={section.title} aria-labelledby={`secao-${i}`}>
            <Headline id={`secao-${i}`}>{section.title}</Headline>
            <Html className="prosa" html={section.html} quote={`secao-${i}`} />
          </Section>
        ))}

        <Section aria-labelledby="limitacoes">
          <Headline id="limitacoes">Limitações</Headline>
          <Html
            className="prosa limites"
            html={factSheet.limitationsHtml}
            quote="limitacoes"
          />
        </Section>

        <CitedBy />

        <Section aria-labelledby="como-ler">
          <Headline id="como-ler">Como ler</Headline>
          <FactSheetLegend />
        </Section>
      </Column>
      <SelectionPopover />
    </Sheet>
  )
}

/** The Fact sheet's data, one per row: where it came from, how it was
 * checked, the sample, the design and who paid. */
function FactSheetData() {
  const factSheet = useFactSheet()
  return (
    <dl className="m-0" data-slot="ficha-dados">
      <DataRow title="Referência">
        <Html as="span" html={factSheet.referenceHtml} />{' '}
        <a
          href={factSheet.link}
          className="flex min-h-toque w-fit items-center font-bold text-agua-tinta decoration-agua-tinta hover:bg-agua-fonte hover:text-tinta"
          rel="noopener"
          target="_blank"
        >
          Abrir o estudo
          <span className="sr-only"> (abre em outra aba)</span>
        </a>
      </DataRow>
      <DataRow title="Verificação">
        {factSheet.verifiedOn
          ? `${factSheet.status === 'verified' ? 'Lido no original' : 'Conferido em parte'} em ${formatDate(factSheet.verifiedOn)}.`
          : 'Ainda não conferida na fonte.'}
      </DataRow>
      <DataRow title={`Por que ${STRENGTH_WORD[factSheet.strength]}`}>
        <span {...quotable(null)}>{factSheet.strengthReason}</span>
      </DataRow>
      <DataRow title="Amostra">
        {factSheet.n !== null && (
          <strong>{numberFormat.format(factSheet.n)}. </strong>
        )}
        <Html as="span" html={factSheet.sampleHtml} quote={null} />{' '}
        {factSheet.representative
          ? 'Representativa da população.'
          : 'Não é representativa da população.'}
      </DataRow>
      <DataRow title="Desenho">{DESIGN_NAME[factSheet.design]}</DataRow>
      <DataRow title="País e período">
        {factSheet.countries.length > 0
          ? factSheet.countries.join(', ')
          : 'País não informado'}{' '}
        · {factSheet.period}
      </DataRow>
      <DataRow title="Financiamento e conflito de interesse">
        {factSheet.conflictHtml ? (
          <Html as="span" html={factSheet.conflictHtml} quote={null} />
        ) : (
          'Não declarado.'
        )}
      </DataRow>
      {factSheet.license && (
        <DataRow title="Licença">{factSheet.license}</DataRow>
      )}
    </dl>
  )
}

/** "O que mediu", in prose. */
function WhatItMeasured() {
  const { whatItMeasuredHtml } = useFactSheet()
  return (
    <Section aria-labelledby="o-que-mediu">
      <Headline id="o-que-mediu">O que mediu</Headline>
      <Html className="prosa" html={whatItMeasuredHtml} quote="o-que-mediu" />
    </Section>
  )
}

/** The Findings, each with the number, the measure and the original's
 * Excerpt, and their notes below. */
function Findings() {
  const { findings, findingsNotesHtml: notesHtml } = useFactSheet()
  return (
    <Section aria-labelledby="achados">
      <Headline id="achados">Achados</Headline>
      <ol className="m-0 mb-md list-none p-0" data-slot="achados">
        {findings.map((finding) => (
          <li
            key={`${finding.measure}|${finding.value}|${finding.locator}`}
            className="grid grid-cols-[minmax(64px,max-content)_1fr] gap-sm border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-4 first:border-t-0 first:pt-0.5 estreito:grid-cols-1 estreito:gap-0.5"
          >
            <Html
              className="max-w-38 font-title text-title leading-title font-bold tracking-normal wrap-anywhere estreito:max-w-none"
              html={finding.value}
              quote="achados"
            />
            <div>
              <Html
                as="span"
                className="block"
                html={finding.measure}
                quote="achados"
              />
              {finding.excerpt ? (
                <blockquote className="m-0 mt-xs border-l-2 border-agua-tinta pl-3 italic">
                  <Html as="span" html={finding.excerpt} />
                </blockquote>
              ) : (
                <p className="m-0 mt-xs text-nota text-tinta-2">
                  Trecho do original ainda não conferido.
                </p>
              )}
              {finding.locator && finding.locator !== '—' && (
                <p className="m-0 mt-xs text-nota text-tinta-2">
                  Onde: <Html as="span" html={finding.locator} />
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {notesHtml && <Html className="prosa" html={notesHtml} quote="achados" />}
    </Section>
  )
}

/** The Guides and the published Tips that cite the Fact sheet. */
function CitedBy() {
  const { citedIn } = useFactSheet()
  return (
    <Section aria-labelledby="citada-em">
      <Headline id="citada-em">Citada em</Headline>
      {citedIn.questions.length === 0 && citedIn.tips.length === 0 ? (
        <p className="text-tinta-2">
          Nenhum Guia nem Dica publicada cita esta Ficha ainda.
        </p>
      ) : (
        <>
          {citedIn.questions.length > 0 && (
            <>
              <h3 className="mx-0 mt-md mb-sm font-title text-title">Guias</h3>
              <ul className="isolate m-0 list-none p-0">
                {citedIn.questions.map((question) => (
                  <li key={question.slug} className="not-first:mt-md">
                    <QuestionRow question={question} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {citedIn.tips.length > 0 && (
            <>
              <h3 className="mx-0 mt-md mb-sm font-title text-title">Dicas</h3>
              <ul className="m-0 list-none p-0">
                {citedIn.tips.map((tip) => (
                  <li
                    key={tip.slug}
                    className="not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
                  >
                    <Link
                      to="/dicas/$slug"
                      params={{ slug: tip.slug }}
                      className="flex min-h-toque items-center py-2 font-bold decoration-agua-tinta underline-offset-4"
                    >
                      {tip.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Section>
  )
}

function FactSheetNotFound() {
  return (
    <Sheet>
      <Column>
        <Display>Essa Ficha não existe</Display>
        <Lead>
          O endereço pode ter mudado.{' '}
          <Link to="/estudos">Veja todos os estudos</Link>.
        </Lead>
      </Column>
    </Sheet>
  )
}
