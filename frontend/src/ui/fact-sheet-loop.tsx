// The loop and the short arrow that circle what the reader came to (#28): a
// Glossário entry from a Verbete (#358). Alone so each page imports just
// this.
import { useLayoutEffect, useRef } from 'react'
import { loopPath, scrollBehavior } from './loop'

/** Mounted inside the circled block: it measures its real size, redraws the
 * loop, scrolls to it and focuses it. */
export function FactSheetLoop() {
  const svg = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const drawing = svg.current
    const factSheet = drawing?.parentElement
    if (!drawing || !factSheet) return
    const width = factSheet.offsetWidth + 20
    const height = factSheet.offsetHeight + 20
    drawing.setAttribute('viewBox', `0 0 ${width} ${height}`)
    drawing.querySelector('path')?.setAttribute('d', loopPath(width, height))
    factSheet.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
    factSheet.focus({ preventScroll: true })
  }, [])

  return (
    <>
      <svg ref={svg} className="laco" aria-hidden="true">
        <path pathLength={1} />
      </svg>
      <svg
        className="seta-laco"
        width="34"
        height="34"
        viewBox="0 0 34 34"
        aria-hidden="true"
      >
        <path pathLength={1} d="M3 3c4 12 10 20 22 26M25 29l-9 1M25 29l-2-9" />
      </svg>
    </>
  )
}
