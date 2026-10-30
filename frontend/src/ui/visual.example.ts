// The example Visuals for the stories, built by the real view
// (`content/visuals-view.ts`) over the e2e fixture, which Storybook loads
// through `virtual:library`: the Guide of `onde-conhecer-pessoas` has one
// of each kind. Its bars, time line and Study table are the chart
// library's (`visual-chart.example.ts`, `guide.example.ts`).
import { topicBySlug } from '@tem-estudo/content/queries'
import library from 'virtual:library'
import { GUIDE } from './guide.example'
import {
  visualView,
  type DiagramView,
  type HtmlVisual,
  type VisualView,
} from '#/content/visuals-view'

const SLUG = 'onde-conhecer-pessoas'

const guide = topicBySlug(library, SLUG)
if (!guide?.visuals.length)
  throw new Error(`the fixture's ${SLUG} has no Visuals`)
/** The Guide's numbered Fact sheets, which the Visual's rings use. */
const { factSheets } = GUIDE

const view = (visual: HtmlVisual): VisualView =>
  visualView(visual, (slug) => factSheets.find((f) => f.slug === slug), SLUG)

function ofKind<K extends VisualView['kind']>(
  kind: K,
): Extract<VisualView, { kind: K }> {
  const visual = guide?.visuals.find((v): v is HtmlVisual => v.kind === kind)
  if (!visual) throw new Error(`the fixture has no ${kind} Visual`)
  return view(visual) as Extract<VisualView, { kind: K }>
}

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
