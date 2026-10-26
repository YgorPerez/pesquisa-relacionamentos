// The pages' reads, kept in the router's QueryClient (`router.tsx`, ADR
// 0031). Each route's loader requests its own with `queryClient.query`, and
// the screen reads it with `useSuspenseQuery`: on the server, what the loader
// read goes along with the HTML (`@tanstack/react-router-ssr-query`), and the
// browser hydrates without requesting again.
//
// The library goes into the build (`vite/library.ts`): until the next deploy,
// nothing these functions return changes. That is why every read is
// `static`, never stale: going back to a page already read does not go to
// the network.
import { QueryClient, queryOptions } from '@tanstack/react-query'
import { getFactSheet, listFactSheets } from './fact-sheets'
import {
  getTip,
  getGuide,
  getCalculatorGuide,
  getPriorities,
  listTips,
  listTopics,
} from './guides'

/** One per router: the server creates one per request, and what a visitor
 * read does not leak to the next. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 'static' } },
  })
}

export const reads = {
  /** The Topics with their Questions, for the home page. */
  topics: () =>
    queryOptions({ queryKey: ['topics'], queryFn: () => listTopics() }),
  /** The Topic's page: its Guide (ADR 0042). */
  guide: (topic: string) =>
    queryOptions({
      queryKey: ['guide', topic],
      queryFn: () => getGuide({ data: topic }),
    }),
  /** The Question that hosts the calculator, for the "Do Guia" block. */
  calculatorGuide: (calculator: string) =>
    queryOptions({
      queryKey: ['calculator-guide', calculator],
      queryFn: () => getCalculatorGuide({ data: calculator }),
    }),
  factSheets: () =>
    queryOptions({
      queryKey: ['fact-sheets'],
      queryFn: () => listFactSheets(),
    }),
  factSheet: (slug: string) =>
    queryOptions({
      queryKey: ['fact-sheet', slug],
      queryFn: () => getFactSheet({ data: slug }),
    }),
  tips: () => queryOptions({ queryKey: ['tips'], queryFn: () => listTips() }),
  tip: (slug: string) =>
    queryOptions({
      queryKey: ['tip', slug],
      queryFn: () => getTip({ data: slug }),
    }),
  priorities: () =>
    queryOptions({
      queryKey: ['priorities'],
      queryFn: () => getPriorities(),
    }),
}
