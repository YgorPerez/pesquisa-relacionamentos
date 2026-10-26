// The example Visuals for the stories, built by the real view
// (`content/visuals-view.ts`) over the e2e fixture, which Storybook loads
// through `virtual:library`: `app-ou-presencial` has one of each
// kind.
import type { Visual } from '@tem-estudo/content'
import { guideBySlug, topicBySlug } from '@tem-estudo/content/queries'
import library from 'virtual:library'
import { guideView } from '#/content/guide-view'
import {
  visualView,
  type BarsView,
  type DiagramView,
  type StudyTableView,
  type TimelineView,
  type VisualView,
} from '#/content/visuals-view'

const SLUG = 'app-ou-presencial'

const guide = guideBySlug(library, SLUG)
if (!guide?.visuals) throw new Error(`the fixture's ${SLUG} has no Visuals`)
const topic = topicBySlug(library, guide.topic)
if (!topic) throw new Error(`the fixture has no ${guide.topic} Topic`)
/** The Guide's numbered Fact sheets, which the Visual's rings use. */
const { factSheets } = guideView(topic, library)

const view = (visual: Visual): VisualView =>
  visualView(
    visual,
    library,
    (slug) => factSheets.find((f) => f.slug === slug),
    SLUG,
  )

function ofKind<K extends VisualView['kind']>(
  kind: K,
): Extract<VisualView, { kind: K }> {
  const visual = guide?.visuals?.find((v) => v.kind === kind)
  if (!visual) throw new Error(`the fixture has no ${kind} Visual`)
  return view(visual) as Extract<VisualView, { kind: K }>
}

export const BARS: BarsView = ofKind('bars')
export const TIMELINE: TimelineView = ofKind('timeline')
export const STUDY_TABLE: StudyTableView = ofKind('study-table')
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
