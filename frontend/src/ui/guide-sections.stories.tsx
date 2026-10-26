// The blocks only the Guide has (`guide-sections.tsx`), over the view of the
// fixture Guide (`e2e/library`), built the way the page builds it
// (`guide.example.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GUIDE, MYTH, TIP } from './guide.example'
import {
  Chapters,
  GuideContents,
  GuideSummary,
  MythCard,
  SourcesArrow,
  Takeaways,
  Unknowns,
} from './guide-sections'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** The Chapters under the title, numbered in the reasoning's order. */
export const TableOfContents: Story = {
  render: () => <GuideContents chapters={GUIDE.chapters} />,
}

/** "Em resumo": each Question with its Confidence and the first sentence of
 * its short answer. */
export const InShort: Story = {
  render: () => <GuideSummary questions={GUIDE.summary} />,
}

export const ArrowToFactSheets: Story = {
  render: () => <SourcesArrow />,
}

/** The Chapters: prose with Visuals, the answer where the reasoning reaches
 * each Question, the labelled, struck-out Myth, the Tip and the "no Brasil" mark. */
export const ChaptersOfTheGuide: Story = {
  render: () => (
    <Chapters chapters={GUIDE.chapters} youMarks={GUIDE.youMarks} />
  ),
}

/** A Myth: the "Mito" label and its line, read before the struck-out claim,
 * then why it does not hold. */
export const Myth: Story = {
  render: () => <MythCard myth={MYTH} />,
}

/** "O que levar": the Guide's strongest Tips. */
export const WhatToTakeAway: Story = {
  render: () => <Takeaways tips={[TIP]} />,
}

/** "O que não se sabe", in prose. */
export const WhatIsNotKnown: Story = {
  render: () =>
    GUIDE.unknownsHtml ? <Unknowns html={GUIDE.unknownsHtml} /> : <></>,
}
