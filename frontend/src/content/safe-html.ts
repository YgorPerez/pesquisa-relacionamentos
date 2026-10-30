// The filter for the HTML the server builds from the library's Markdown. The
// Fact sheets' Excerpts are copied from outside sources, and `ui/guide.tsx`'s
// `Html` puts the result on the page with no filter at all: so only what the
// library's Markdown generates gets through (the `marked` GFM, the `==…==` and
// `[@slug]` marks and the collapsible `<details>`). The rest goes: a tag off
// the list goes and leaves its text (`<script>`, `<style>`, `<iframe>` and the
// like go with their content), an attribute off the list goes, and a link
// only carries an `href` that is http(s), an anchor or a relative path.
import xss from 'xss'
import type * as Xss from 'xss'

// `xss` is CommonJS and sets `escapeAttrValue` and `friendlyAttrValue` in a
// loop, which Node's scan of its exports misses: a named import of them
// broke every page on the dev server, whose SSR imports it through Node. Its
// `module.exports` carries them all, though its typings call it only the
// `filterXSS` function.
const { escapeAttrValue, FilterXSS, friendlyAttrValue } =
  xss as unknown as typeof Xss

const TAGS: Record<string, ReadonlyArray<string>> = {
  p: [],
  br: [],
  hr: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  em: [],
  strong: [],
  del: [],
  code: [],
  pre: [],
  blockquote: [],
  ul: [],
  ol: ['start'],
  li: [],
  table: [],
  thead: [],
  tbody: [],
  tr: [],
  th: ['align'],
  td: ['align'],
  details: ['id', 'open'],
  summary: [],
  a: ['href', 'class', 'aria-label', 'data-verbete', 'data-fichas'],
  span: ['class'],
  mark: ['class'],
}

/** The classes the app itself puts in the Markdown (`guide-view.ts`). */
const CLASSES: Record<string, ReadonlySet<string>> = {
  a: new Set(['ref', 'verbete']),
  span: new Set(['nw', 'marca-texto']),
  mark: new Set(['numero-chave']),
}

const WITHOUT_CONTENT = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'noscript',
  'template',
  'textarea',
  'select',
  'svg',
  'math',
]

const attribute = (name: string, value: string) =>
  `${name}="${escapeAttrValue(value)}"`

/** An `href` that is http(s), an anchor or a relative path; `null` for the
 * rest (`javascript:`, `data:`, `mailto:`, `//another-site`). */
function safeHref(value: string): string | null {
  if (/^https?:\/\//i.test(value) || value.startsWith('#')) return value
  if (value.startsWith('//') || /^[^/?#]*:/.test(value)) return null
  return value
}

function filterAttribute(tag: string, name: string, raw: string) {
  const value = friendlyAttrValue(raw).trim()
  switch (name) {
    case 'href': {
      const href = safeHref(value)
      if (href === null) return ''
      const external = /^https?:\/\//i.test(href)
      return external
        ? `${attribute('href', href)} rel="noopener noreferrer"`
        : attribute('href', href)
    }
    case 'class': {
      const classes = value.split(/\s+/).filter((c) => CLASSES[tag]?.has(c))
      return classes.length > 0 ? attribute('class', classes.join(' ')) : ''
    }
    case 'id':
      return /^[a-z][a-z0-9-]*$/.test(value) ? attribute('id', value) : ''
    // A Verbete's link (`terms-view.ts`): its slug, and the slugs of the
    // Fact sheets its sentence cites.
    case 'data-verbete':
      return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
        ? attribute(name, value)
        : ''
    case 'data-fichas':
      return /^([a-z0-9]+(-[a-z0-9]+)*( |$))*$/.test(value)
        ? attribute(name, value)
        : ''
    case 'start':
      return /^\d+$/.test(value) ? attribute('start', value) : ''
    case 'align':
      return /^(left|center|right)$/.test(value)
        ? attribute('align', value)
        : ''
    case 'open':
      return 'open'
    default:
      return attribute(name, value)
  }
}

const filter = new FilterXSS({
  whiteList: Object.fromEntries(
    Object.entries(TAGS).map(([tag, attrs]) => [tag, [...attrs]]),
  ),
  stripIgnoreTag: true,
  stripIgnoreTagBody: WITHOUT_CONTENT,
  onTagAttr: (tag, name, value, allowed) =>
    allowed ? filterAttribute(tag, name, value) : '',
})

/** HTML that went through `safeHtml`. The brand only exists in the type:
 * `ui/guide.tsx`'s `Html`, the only place that injects HTML, accepts only it,
 * and no plain string gets there without going through the filter. */
export type SafeHtml = string & { readonly __filtered: unique symbol }

/** The HTML built from the library's Markdown, only with the tags and
 * attributes the library uses. A link that lost its `href` becomes text, so
 * it does not look like a link. */
export const safeHtml = (html: string): SafeHtml =>
  filter
    .process(html)
    .replace(/<a(?: class="[^"]*")?>([\s\S]*?)<\/a>/g, '$1') as SafeHtml
