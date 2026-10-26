import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { reads } from '#/content/reads'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'

// A Question's old page. Since ADR 0042 the Question is answered inside its
// Topic's Guide: the server answers the old address with a 301 to
// `/<tema>#<question>` (`platform/redirects.ts`), and this route does the same
// for a link followed inside the app. An unknown Question is a 404.
export const Route = createFileRoute('/$tema/$slug')({
  loader: async ({ context, params }) => {
    const guide = await context.queryClient.query(reads.guide(params.tema))
    if (!guide.summary.some((q) => q.slug === params.slug)) throw notFound()
    throw redirect({
      to: '/$tema',
      params: { tema: params.tema },
      hash: params.slug,
      statusCode: 301,
      replace: true,
    })
  },
  notFoundComponent: QuestionNotFound,
})

function QuestionNotFound() {
  return (
    <Sheet>
      <Column>
        <Display>Essa Pergunta não existe</Display>
        <Lead>
          O endereço pode ter mudado.{' '}
          <Link to="/">Veja os Temas na página inicial</Link>.
        </Lead>
      </Column>
    </Sheet>
  )
}
