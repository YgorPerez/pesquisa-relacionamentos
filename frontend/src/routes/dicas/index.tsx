import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { reads } from '#/content/reads'
import { StrengthBadge, FactSheetMeta } from '#/ui/badges'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Notice, Headline, Section } from '#/ui/section'

export const Route = createFileRoute('/dicas/')({
  loader: async ({ context }) => {
    await context.queryClient.query(reads.tips())
  },
  head: () => ({
    meta: [
      { title: 'Dicas · Tem estudo?' },
      {
        name: 'description',
        content:
          'O que fazer com o que os estudos dizem, cada Dica com a Força da evidência e as Fichas que a sustentam.',
      },
    ],
  }),
  component: TipsPage,
})

function TipsPage() {
  const { data: tips } = useSuspenseQuery(reads.tips())

  return (
    <Sheet>
      <Column>
        <Display>
          O que <span className="marca-texto">fazer</span> com a evidência
        </Display>
        <Lead>
          Cada Dica diz quanto a evidência pesa e leva aos estudos de onde saiu.
          Quando nenhum estudo testou a Dica direto, ela vem marcada como
          inferência nossa.
        </Lead>

        <Section aria-labelledby="lista-dicas">
          <Headline id="lista-dicas">
            {tips.length === 1 ? '1 Dica' : `${tips.length} Dicas`}
          </Headline>
          {tips.length === 0 ? (
            <Notice>
              Nenhuma Dica no ar ainda. Elas entram quando os estudos que as
              sustentam forem conferidos na fonte.
            </Notice>
          ) : (
            <ol className="m-0 list-none p-0" data-slot="dicas">
              {tips.map((tip) => (
                <li
                  key={tip.slug}
                  className="py-sm not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
                >
                  <Link
                    to="/dicas/$slug"
                    params={{ slug: tip.slug }}
                    className="inline-flex min-h-toque items-center font-bold decoration-agua-tinta hover:bg-agua-fonte"
                  >
                    {tip.text}
                  </Link>
                  <FactSheetMeta>
                    <StrengthBadge strength={tip.strength} />
                    {tip.inference && (
                      <span className="text-tinta-2 italic">
                        Inferência nossa
                      </span>
                    )}
                  </FactSheetMeta>
                </li>
              ))}
            </ol>
          )}
        </Section>
      </Column>
    </Sheet>
  )
}
