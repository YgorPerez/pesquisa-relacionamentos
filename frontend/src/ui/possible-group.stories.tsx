// The Possible group pieces (`possible-group.tsx`) over a real count: the
// `loader` downloads Brazil's pack that Storybook's plugin serves
// (`.storybook/vite.config.ts`, fixture data, Acre only) and counts for a
// 28-year-old woman seeking men, with a college degree and who does not
// smoke.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { openPack } from '@tem-estudo/rules/possible-group-data'
import { estimateGroup, type Estimate } from '@tem-estudo/rules/possible-group'
import type { Profile } from '@tem-estudo/rules/profile'
import {
  DEFAULT_REQUIREMENTS,
  EDUCATION_LABEL,
  type Requirements,
} from '@tem-estudo/rules/requirements'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import possibleGroup from 'virtual:possible-group'
import {
  PossibleGroupCard,
  Folds,
  EstimateRange,
  RequirementRow,
  CheckChip,
  PinnedNumber,
  Options,
  SensitiveNote,
  Stepper,
} from './possible-group'

const PROFILE: Profile = { gender: 'mulher', seeks: 'homens', age: 28 }
const REQUIREMENTS: Requirements = {
  ...DEFAULT_REQUIREMENTS,
  education: 'superior',
  nonSmoker: true,
}

async function count(): Promise<{ estimate: Estimate }> {
  const response = await fetch(`${possibleGroup.base}/BR.json`)
  const brazil = openPack(await response.json())
  return {
    estimate: estimateGroup(
      { profile: PROFILE, requirements: REQUIREMENTS },
      { brazil },
    ),
  }
}

const meta = {
  parameters: { layout: 'padded' },
  loaders: [count],
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

type Loaded = Awaited<ReturnType<typeof count>>

/** The number pinned at the top of the page, with the range. */
export const NumberAtTheTop: Story = {
  render: (_args, { loaded }) => (
    <PinnedNumber estimate={(loaded as Loaded).estimate} loading={false} />
  ),
}

/** While the data arrives, the old number stays, faded. */
export const Loading: Story = {
  render: (_args, { loaded }) => (
    <PinnedNumber estimate={(loaded as Loaded).estimate} loading />
  ),
}

/** Whoever never said anything sees the example count, made at build
 * time. */
export const ExampleRange: Story = {
  render: () => <EstimateRange estimate={possibleGroup.example} />,
}

/** One Requirement row per control: steps, options and checkbox. */
export const RequirementRows: Story = {
  render: function Rows(_args, { loaded }) {
    const { estimate } = loaded as Loaded
    const [age, setAge] = useState(28)
    const [education, setEducation] = useState('superior')
    const [smokes, setSmokes] = useState(true)
    const cost = (k: string) => estimate.costs.find((c) => c.requirement === k)
    return (
      <>
        <RequirementRow
          requirement="age"
          value={`${age} anos`}
          cost={cost('age')}
          active={false}
        >
          <Stepper
            label="Idade de"
            value={age}
            min={18}
            max={80}
            unit={() => 'anos'}
            onChange={setAge}
          />
        </RequirementRow>
        <RequirementRow
          requirement="education"
          value={EDUCATION_LABEL.superior}
          cost={cost('education')}
          active
        >
          <Options
            legend="Escolaridade mínima"
            type="radio"
            values={['qualquer', 'medio', 'superior']}
            labels={{
              qualquer: 'qualquer',
              medio: EDUCATION_LABEL.medio,
              superior: EDUCATION_LABEL.superior,
            }}
            checked={[education]}
            onChange={setEducation}
          />
        </RequirementRow>
        <RequirementRow
          requirement="smoking"
          value="não fuma"
          cost={cost('smoking')}
          active
        >
          <CheckChip
            label="Só quem não fuma"
            checked={smokes}
            onChange={setSmokes}
          />
        </RequirementRow>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(
      screen.getByRole('button', { name: 'Idade de: mais 1' }),
    )
    await expect(screen.getByLabelText('Idade de')).toHaveValue('29')
  },
}

/** A sensitive Requirement's row, with the note on what it measures and
 * where it stays. */
export const SensitiveRow: Story = {
  render: function Row(_args, { loaded }) {
    const { estimate } = loaded as Loaded
    const [bisexual, setBisexual] = useState(true)
    return (
      <RequirementRow
        requirement="bisexual"
        value="bissexual"
        cost={estimate.costs.find((c) => c.requirement === 'bisexual')}
        active={bisexual}
        note={<SensitiveNote requirement="bisexual" />}
      >
        <CheckChip
          label="Só quem se declara bissexual"
          checked={bisexual}
          onChange={setBisexual}
        />
      </RequirementRow>
    )
  },
}

/** The folds under the count: the funnel and the naive count. */
export const CountFolds: Story = {
  render: (_args, { loaded }) => (
    <Folds
      estimate={(loaded as Loaded).estimate}
      profile={PROFILE}
      requirements={REQUIREMENTS}
      municipality={undefined}
    />
  ),
}

/** The card in the Guide that hosts the calculator, before and after use. */
export const UnusedCard: Story = {
  render: () => (
    <PossibleGroupCard
      estimate={possibleGroup.example}
      used={false}
      active={[]}
      loading={false}
    />
  ),
}

export const UsedCard: Story = {
  render: (_args, { loaded }) => (
    <PossibleGroupCard
      estimate={(loaded as Loaded).estimate}
      used
      active={['superior completo', 'não fuma']}
      loading={false}
    />
  ),
}
