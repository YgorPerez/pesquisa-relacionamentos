// The blocks only the Guide has (`guide-sections.tsx`), over the view of the
// fixture Guide (`e2e/library`), built the way the page builds it
// (`guide.example.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GUIDE, QUESTION, QUESTION_WITH_SECTIONS } from './guide.example'
import {
  Evidence,
  GuideIndex,
  GuideTips,
  Limitations,
  Myths,
  OwnSections,
  SourcesArrow,
  Takeaways,
} from './guide-sections'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** The index at the top: each Question with its Confidence and the first
 * sentence of its short answer. */
export const Index: Story = {
  render: () => <GuideIndex index={GUIDE.index} />,
}

export const ArrowToFactSheets: Story = {
  render: () => <SourcesArrow />,
}

/** The Tips of a Question that follow no finding. */
export const Tips: Story = {
  render: () => <GuideTips question={QUESTION} verdicts={undefined} />,
}

/** The findings with country and year, and the divergence table. */
export const WhatTheEvidenceSays: Story = {
  render: () => <Evidence question={QUESTION} verdicts={undefined} />,
}

/** A finding with its Tip and Myth right after it. */
export const TipAndMythNextToTheFinding: Story = {
  render: () => (
    <Evidence
      question={{
        ...QUESTION,
        tips: QUESTION.tips.map((t) => ({ ...t, finding: 0 })),
        myths: QUESTION.myths.map((m) => ({ ...m, finding: 0 })),
      }}
      verdicts={undefined}
    />
  ),
}

/** A section the Question titles itself, with a numbered reference. */
export const QuestionOwnSections: Story = {
  render: () => <OwnSections sections={QUESTION_WITH_SECTIONS.sections} />,
}

export const StruckOutMyths: Story = {
  render: () => <Myths question={QUESTION} />,
}

/** "O que levar": the Guide's strongest Tips. */
export const WhatToTakeAway: Story = {
  render: () => <Takeaways tips={QUESTION.tips} />,
}

/** The Limitations, one group per Question while they still live in the
 * Question files. */
export const LimitationsByStudy: Story = {
  render: () => <Limitations groups={GUIDE.limitations} />,
}
