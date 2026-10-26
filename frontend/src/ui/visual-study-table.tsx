// The table of Studies: one row per Study, with where, when, how many and
// how it was done, next to its number. Two columns, so it fits a 360px phone
// without scrolling sideways; a real table, so it reads as one.
import type { StudyTableView } from '#/content/visuals-view'
import { SourceRefs, VisualFrame } from './visual-frame'
import { VISUAL_COPY } from './visual.copy'

/** `border-b-0` and the padding undo the `.prosa` table rule
 * (`drawings.css`), which the body's Markdown puts around the Visual. */
const CELL =
  'border-t-(length:--traco-etiqueta) border-b-0 fio-pontilhado border-tinta py-2.5 align-top'

export function VisualStudyTable({ visual }: { visual: StudyTableView }) {
  return (
    <VisualFrame domId={visual.domId} title={visual.title} note={visual.note}>
      <table
        aria-labelledby={`${visual.domId}-titulo`}
        className="m-0 table w-full table-fixed border-collapse text-nota leading-nota"
      >
        <thead>
          <tr>
            <th
              scope="col"
              className="w-2/3 border-b-0 pb-1.5 text-left font-label text-label"
            >
              {VISUAL_COPY.study}
            </th>
            <th
              scope="col"
              className="border-b-0 pb-1.5 text-right font-label text-label"
            >
              {VISUAL_COPY.result}
            </th>
          </tr>
        </thead>
        <tbody>
          {visual.rows.map((row) => (
            <tr key={row.study.anchor + row.measure}>
              <th scope="row" className={`${CELL} pr-sm text-left font-normal`}>
                <span className="block font-bold">
                  <SourceRefs sources={[row.study]} after={row.study.title} />
                </span>
                <span className="block text-tinta-2">{row.context}</span>
                <span className="block italic">{row.measure}</span>
              </th>
              <td
                className={`${CELL} text-right font-title text-grande leading-tight font-bold`}
              >
                {row.number.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </VisualFrame>
  )
}
