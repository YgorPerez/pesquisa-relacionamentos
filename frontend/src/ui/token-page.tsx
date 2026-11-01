import type { ReactNode } from 'react'
import { Sheet, Column, Display, Lead } from './sheet'
import { Notice } from './section'

/** What a page reached by a mailed link shows around its form: the title, what
 * the link does here, what just happened, and the way back to the account. */
export function TokenPage({
  title,
  lead,
  message,
  back,
  children,
}: {
  title: string
  lead?: string
  message?: string
  back: string
  children?: ReactNode
}) {
  return (
    <Sheet>
      <Column>
        <Display>{title}</Display>
        {lead && <Lead className="wrap-anywhere">{lead}</Lead>}
        {message && (
          <Notice className="mt-md" role="status">
            {message}
          </Notice>
        )}
        {children}
        <p className="mt-lg">
          <a href="/conta">{back}</a>
        </p>
      </Column>
    </Sheet>
  )
}
