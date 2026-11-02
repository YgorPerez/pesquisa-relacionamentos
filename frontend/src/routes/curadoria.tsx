import { createFileRoute, useRouter } from '@tanstack/react-router'
import { readCuratorDesk } from '#/content/public-comments'
import { CuratorPage } from '#/ui/curator'

export const Route = createFileRoute('/curadoria')({
  validateSearch: (search: Record<string, unknown>): { antes?: number } =>
    Number.isSafeInteger(search['antes'])
      ? { antes: search['antes'] as number }
      : {},
  loaderDeps: ({ search }) => ({ before: search.antes }),
  loader: ({ deps }) => readCuratorDesk({ data: deps.before }),
  head: () => ({
    meta: [
      { title: 'Curadoria · Tem estudo?' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Curator,
})

function Curator() {
  const router = useRouter()
  return (
    <CuratorPage
      desk={Route.useLoaderData()}
      older={Route.useSearch().antes !== undefined}
      onChanged={() => void router.invalidate()}
    />
  )
}
