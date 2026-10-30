// What counts by itself as a page shows or as the page takes a click, mounted
// once by a route. What goes out and when it may is in `counting.ts`.
import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { countFactSheetOpened, countVisit } from './counting'

/** Counts each page the router shows, by the path without query. At the
 * root. Only a path change counts: turning the switch back on does not send
 * the current page, and the count resumes on the next one. */
export function useCountVisits() {
  const path = useRouterState({
    select: (s) => s.resolvedLocation?.pathname,
  })
  useEffect(() => {
    if (path) countVisit(path)
  }, [path])
}

/** In the Guide: tapping a Fact sheet (the title in the list, a link in the
 * text, one in a reference ring's popover or in a chart's card) counts
 * `fact-sheet/<topic>/<fact sheet>`. The ring itself only opens the popover,
 * and does not count. One listener for the page. */
export function useCountOpenedFactSheets(topic: string) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.(
        'main a[href^="/estudos/"], [data-slot="ficha-referencia"] a[href^="/estudos/"], [data-slot="detalhe-do-grafico"] a[href^="/estudos/"]',
      )
      const factSheet = link
        ?.getAttribute('href')
        ?.match(/^\/estudos\/([a-z0-9-]+)$/)?.[1]
      if (factSheet) countFactSheetOpened(topic, factSheet)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [topic])
}
