// The Visuals the server draws as HTML (#182), over the fixture Question's
// data (`visual.example.ts`), as they sit in the Question's body. `prosa`
// puts them in the body's Markdown, as on the page. The bar comparison is
// the chart library's (`visual-chart.stories.tsx`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { VisualDiagram } from './visual-diagram'
import { VisualFrame } from './visual-frame'
import { VisualStudyTable } from './visual-study-table'
import { VisualTimeline } from './visual-timeline'
import {
  DIAGRAM,
  DIAGRAM_EVERY_STROKE,
  STUDY_TABLE,
  TIMELINE,
} from './visual.example'

const meta = {
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="prosa max-w-texto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Timeline: Story = {
  render: () => <VisualTimeline visual={TIMELINE} />,
}

export const StudyTable: Story = {
  render: () => <VisualStudyTable visual={STUDY_TABLE} />,
}

/** Two associations (dashed) and our inference (dotted, with "?"). */
export const Diagram: Story = {
  render: () => <VisualDiagram visual={DIAGRAM} />,
}

/** The three strokes side by side: solid, dashed, dotted. */
export const DiagramEveryStroke: Story = {
  render: () => <VisualDiagram visual={DIAGRAM_EVERY_STROKE} />,
}

/** The frame alone: title, margin note and sources line. */
export const Frame: Story = {
  render: () => (
    <VisualFrame
      domId="visual-moldura"
      title={DIAGRAM.title}
      note="a nota de margem aponta para o desenho"
      ownLines={[]}
      sources={DIAGRAM.sources}
    >
      <p>O desenho do Visual entra aqui.</p>
    </VisualFrame>
  ),
}
