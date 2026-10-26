// "Copiar link" (#34, stories 62–63): the button, the line that says what the
// link reveals and the notice that the site counts usage without keeping the
// gender. The calculator passes the state's query; the Guide passes nothing,
// and the link goes out without a query.
import { useState, type ReactNode } from 'react'
import { SiteButton } from './button'
import { Headline, Section } from './section'
import { Input } from '@/ui/shadcn/input'

type CopyResult =
  | { readonly kind: 'none' }
  | { readonly kind: 'copied' }
  | { readonly kind: 'failed'; readonly link: string }

export function Share({
  query,
  sentence,
  notice,
  untitled = false,
  consent,
  children,
}: {
  /** What the visitor must agree to before something goes in the link (the
   * Possible group's sensitive Requirements): above the button. */
  consent?: ReactNode
  /** What else goes out with the link: the Possible group's image. */
  children?: ReactNode
  /** Without the "Compartilhar" title: the Guide has the #7 section order,
   * and this is not one of them. */
  untitled?: boolean
  /** The query without the `?`; without it, the link is just the page
   * address. */
  query?: string
  /** What the link reveals, in one line. */
  sentence: string
  /** The notice about the count, when the link carries state. */
  notice?: string
}) {
  const [copy, setCopy] = useState<CopyResult>({ kind: 'none' })

  const copyLink = async () => {
    const { origin, pathname } = window.location
    const link = `${origin}${pathname}${query ? `?${query}` : ''}`
    try {
      await navigator.clipboard.writeText(link)
      setCopy({ kind: 'copied' })
    } catch {
      // No permission for the clipboard: the link shows up to copy by hand.
      setCopy({ kind: 'failed', link })
    }
  }

  return (
    <Section
      {...(untitled
        ? { 'aria-label': 'Compartilhar' }
        : { 'aria-labelledby': 't-compartilhar' })}
    >
      {!untitled && <Headline id="t-compartilhar">Compartilhar</Headline>}
      {consent}
      <div className="flex flex-wrap items-center gap-sm">
        <SiteButton onClick={copyLink}>Copiar link</SiteButton>
        <p className="m-0 flex-[1_1_14rem] leading-nota">{sentence}</p>
      </div>
      {notice && (
        <p className="mt-xs mb-0 text-label leading-nota font-normal text-tinta-2">
          {notice}
        </p>
      )}
      <CopyOutcome copy={copy} />
      {children}
    </Section>
  )
}

/** How the copy went, told to the screen reader; if it failed, the link in a
 * field to copy by hand. */
function CopyOutcome({ copy }: { copy: CopyResult }) {
  return (
    <>
      <p
        role="status"
        className="mt-xs mb-0 text-label leading-nota font-normal text-tinta-2 empty:m-0"
      >
        {copy.kind === 'copied'
          ? 'Link copiado.'
          : copy.kind === 'failed'
            ? 'Não deu para copiar. O link está aqui embaixo:'
            : ''}
      </p>
      {copy.kind === 'failed' && (
        <Input
          small
          className="mt-xs w-full"
          readOnly
          value={copy.link}
          aria-label="Link para copiar"
          onFocus={(e) => e.currentTarget.select()}
          autoFocus
        />
      )}
    </>
  )
}
