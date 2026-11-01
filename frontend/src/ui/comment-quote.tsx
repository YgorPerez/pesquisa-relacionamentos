import type { ReactNode } from 'react'
import { cn } from '@/platform/cn'

/** The passage a comment is about: note-sized, with an ink rule on its left. */
export function CommentQuote({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <blockquote
      className={cn(
        'm-0 border-l-2 border-tinta pl-xs text-nota text-tinta-2',
        className,
      )}
    >
      {children}
    </blockquote>
  )
}
