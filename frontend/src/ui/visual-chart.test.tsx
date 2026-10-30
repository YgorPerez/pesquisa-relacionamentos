import { renderToString } from 'react-dom/server'
import { expect, it } from 'vite-plus/test'
import { VisualChart } from './visual-chart'

it('serves complete bar and dot geometry with exact values before JavaScript', () => {
  for (const kind of ['bars', 'dots'] as const) {
    const html = renderToString(
      <VisualChart
        visual={{
          kind,
          id: 'server-chart',
          title: 'Two studies',
          note: null,
          rows: [
            {
              id: 'a',
              label: 'Study A',
              value: 39,
              number: { text: '39%', own: null, sources: [] },
            },
            {
              id: 'b',
              label: 'Study B',
              value: 10.9,
              number: { text: '10,9%', own: null, sources: [] },
            },
          ],
        }}
      />,
    )
    expect(html).toContain('<svg')
    expect(html).toContain(kind === 'bars' ? '<rect' : '<circle')
    expect(html).toContain('39%')
    expect(html).toContain('10,9%')
    expect(html).toContain('Study A')
    expect(html).toContain('Study B')
  }
})
