// The shape of a definition, the same the chart gives its points
// (`visual-chart-plot.tsx`): filled circle, filled hexagon, hollow circle,
// hollow hexagon, in the order of the Visual's list.
const HEXAGON = 'M7 0.5L12.6 3.75V10.25L7 13.5L1.4 10.25V3.75Z'

export function DefinitionGlyph({ shape }: { shape: number }) {
  const hollow = shape >= 2
  const fill = hollow ? 'fill-folha' : 'fill-tinta'
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      className="inline-block align-[-2px]"
    >
      {shape % 2 === 0 ? (
        <circle
          cx="7"
          cy="7"
          r="5.5"
          className={`${fill} stroke-tinta`}
          strokeWidth="1.8"
        />
      ) : (
        <path
          d={HEXAGON}
          className={`${fill} stroke-tinta`}
          strokeWidth="1.8"
        />
      )}
    </svg>
  )
}
