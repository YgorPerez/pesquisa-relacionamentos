import { cn } from '@/platform/cn'

/** The little arrow of the DESIGN.md fold, which turns when the fold opens.
 * `className` says what opens it: `group-data-panel-open:rotate-90` in a
 * Base UI `Collapsible`, `group-open:rotate-90` in a `<details>`. */
export const FoldArrow = ({ className }: { className: string }) => (
  <svg
    className={cn(
      'flex-none transition-transform duration-250 ease-sai motion-reduce:transition-none',
      className,
    )}
    width="14"
    height="16"
    viewBox="0 0 14 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 2.5l6.5 5.6L4 13.6" />
  </svg>
)
