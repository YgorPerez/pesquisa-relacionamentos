// The example Visuals for the stories, built by the real view
// (`content/visuals-view.ts`) over the e2e fixture, which Storybook loads
// through `virtual:library`: the Guide of `onde-conhecer-pessoas` has one
// of each kind. Its Study table is `chart-view.ts`'s (`guide.example.ts`).
import { topicBySlug } from '@tem-estudo/content/queries'
import library from 'virtual:library'
import { GUIDE } from './guide.example'
import {
  visualView,
  type BarsView,
  type DiagramView,
  type HandDrawnVisual,
  type TimelineView,
  type VisualView,
} from '#/content/visuals-view'

const SLUG = 'onde-conhecer-pessoas'

const guide = topicBySlug(library, SLUG)
if (!guide?.visuals.length)
  throw new Error(`the fixture's ${SLUG} has no Visuals`)
/** The Guide's numbered Fact sheets, which the Visual's rings use. */
const { factSheets } = GUIDE

const view = (visual: HandDrawnVisual): VisualView =>
  visualView(visual, (slug) => factSheets.find((f) => f.slug === slug), SLUG)

function ofKind<K extends VisualView['kind']>(
  kind: K,
): Extract<VisualView, { kind: K }> {
  const visual = guide?.visuals.find(
    (v): v is HandDrawnVisual => v.kind === kind,
  )
  if (!visual) throw new Error(`the fixture has no ${kind} Visual`)
  return view(visual) as Extract<VisualView, { kind: K }>
}

export const BARS: BarsView = ofKind('bars')
export const TIMELINE: TimelineView = ofKind('timeline')
export const DIAGRAM: DiagramView = ofKind('diagram')

/** The diagram with one arrow of each stroke: the fixture has no
 * experiment, so the solid one is only drawn here. */
export const DIAGRAM_EVERY_STROKE: DiagramView = {
  ...DIAGRAM,
  domId: `${DIAGRAM.domId}-tracos`,
  arrows: [
    { ...DIAGRAM.arrows[0]!, evidence: 'cause' },
    ...DIAGRAM.arrows.slice(1),
  ],
}
