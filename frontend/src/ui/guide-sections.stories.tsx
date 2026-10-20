// The sections only the Guide has (`guide-sections.tsx`), over the view of a
// fixture Guide (`e2e/library`), built the way the page builds it
// (`guide.example.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GUIDE as guide } from './guide.example'
import { GuideTips, Evidence, Myths, SourcesArrow } from './guide-sections'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const ArrowToFactSheets: Story = {
  render: () => <SourcesArrow />,
}

export const Tips: Story = {
  render: () => <GuideTips tips={guide.tips} verdicts={undefined} />,
}

/** The findings with country and year, and the divergence table. */
export const WhatTheEvidenceSays: Story = {
  render: () => <Evidence guide={guide} verdicts={undefined} />,
}

export const StruckOutMyths: Story = {
  render: () => <Myths myths={guide.myths} />,
}
