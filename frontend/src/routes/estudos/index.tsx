import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { reads } from '#/content/reads'
import {
  StrengthBadge,
  FactSheetLegend,
  VerificationStatusBadge,
  FactSheetMeta,
} from '#/ui/badges'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Notice, Headline, Section } from '#/ui/section'

export const Route = createFileRoute('/estudos/')({
  loader: async ({ context }) => {
    await context.queryClient.query(reads.factSheets())
  },
  head: () => ({
    meta: [
      { title: 'Estudos · Tem estudo?' },
      {
        name: 'description',
        content:
          'Todas as Fichas do acervo: o que cada estudo mediu, os números e até onde a gente conferiu na fonte.',
      },
    ],
  }),
  component: FactSheetsPage,
})

const count = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

function FactSheetsPage() {
  const { data: factSheets } = useSuspenseQuery(reads.factSheets())
  const checked = factSheets.filter((f) => f.status !== 'unverified').length

  return (
    <Sheet>
      <Column>
        <Display>
          Os <span className="marca-texto">estudos</span> por trás das respostas
        </Display>
        <Lead>
          Cada Ficha resume um estudo: o que mediu, os números com o trecho do
          original e o que ele não consegue dizer. Ao lado de cada uma, até onde
          a gente conferiu e quanto a evidência pesa.
        </Lead>

        <Section aria-labelledby="lista">
          <Headline id="lista">
            {count(factSheets.length, 'Ficha', 'Fichas')}
          </Headline>
          {checked === 0 && (
            <Notice>
              Nenhuma Ficha foi conferida no original ainda. Todas estão sendo
              refeitas com a fonte aberta ao lado, e até lá nenhuma sustenta um
              Guia.
            </Notice>
          )}
          <ol className="m-0 list-none p-0" data-slot="fichas">
            {factSheets.map((factSheet) => (
              <li
                key={factSheet.slug}
                className="py-sm not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
              >
                <Link
                  to="/estudos/$slug"
                  params={{ slug: factSheet.slug }}
                  className="inline-flex min-h-toque items-center font-bold decoration-agua-tinta hover:bg-agua-fonte"
                >
                  {factSheet.title}
                </Link>
                <FactSheetMeta>
                  <VerificationStatusBadge status={factSheet.status} />
                  <StrengthBadge strength={factSheet.strength} />
                  <span className="text-tinta-2">{factSheet.context}</span>
                </FactSheetMeta>
              </li>
            ))}
          </ol>
        </Section>

        <Section aria-labelledby="como-ler">
          <Headline id="como-ler">Como ler</Headline>
          <FactSheetLegend />
        </Section>
      </Column>
    </Sheet>
  )
}
