import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { cn } from '@/platform/cn'

// The DESIGN.md fold: a title that opens and closes what comes below. The
// `dotted` one opens with the dotted rule and the little arrow that turns
// (Priorities, "Antes: o parceiro explica pouco"); the `solid` one opens with
// the thick rule and the title in `title` (the Possible group count). What
// came from shadcn's `base-nova` had no drawing; the one here is the site's.
// The `bar` one has no rule of its own: it is the Guide's reading bar, whose
// rule is the progress line under it (`reading-progress.tsx`).

type Variant = 'dotted' | 'solid' | 'bar'

const ROOT: Record<Variant, string> = {
  dotted: 'border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta',
  solid: 'border-t-2 border-tinta',
  bar: '',
}

const TITLE: Record<Variant, string> = {
  dotted: 'min-h-12 gap-2.5 py-2 font-bold',
  solid: 'min-h-toque py-0 font-title text-grande font-bold',
  bar: 'min-h-toque gap-2 py-0 font-label text-label',
}

function Collapsible({
  className,
  variant = 'dotted',
  ...props
}: CollapsiblePrimitive.Root.Props & { variant?: Variant }) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      className={cn(ROOT[variant], className)}
      {...props}
    />
  )
}

/** The fold's title, which is the button. The little arrow inside it turns
 * when the fold opens (`group-data-panel-open:rotate-90`). */
function CollapsibleTrigger({
  className,
  variant = 'dotted',
  ...props
}: CollapsiblePrimitive.Trigger.Props & { variant?: Variant }) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        'group flex w-full cursor-pointer items-center border-0 bg-transparent px-0 text-left',
        TITLE[variant],
        className,
      )}
      {...props}
    />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
