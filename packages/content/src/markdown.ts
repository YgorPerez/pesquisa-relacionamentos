// What the package understands of markdown: the frontmatter, the `#` title,
// the `##` sections and a simple table. The rest of the body stays markdown,
// and whoever draws the page converts it.

export interface SplitFile {
  readonly frontmatter: string | null
  readonly body: string
}

/** Splits the `---` block at the top from the rest of the file. */
export function splitFrontmatter(text: string): SplitFile {
  const normalized = text.replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized)
  if (!match) return { frontmatter: null, body: normalized }
  return {
    frontmatter: match[1] ?? '',
    body: normalized.slice(match[0].length),
  }
}

export interface Section {
  readonly title: string
  /** The markdown between this `##` and the next, without blank lines at the
   * ends. */
  readonly markdown: string
}

export interface Body {
  readonly title: string | null
  /** What comes between the title and the first section. */
  readonly opening: string
  readonly sections: ReadonlyArray<Section>
}

/** Reads the `#` title and cuts the body at the `##` sections. */
export function readBody(body: string): Body {
  const lines = body.split('\n')
  let title: string | null = null
  const opening: string[] = []
  const sections: Array<{ title: string; lines: string[] }> = []
  for (const line of lines) {
    const h1 = /^#\s+(.+?)\s*$/.exec(line)
    const h2 = /^##\s+(.+?)\s*$/.exec(line)
    if (h1 && title === null && sections.length === 0) title = h1[1] ?? null
    else if (h2) sections.push({ title: h2[1] ?? '', lines: [] })
    else if (sections.length > 0)
      sections[sections.length - 1]?.lines.push(line)
    else opening.push(line)
  }
  return {
    title,
    opening: opening.join('\n').trim(),
    sections: sections.map((s) => ({
      title: s.title,
      markdown: s.lines.join('\n').trim(),
    })),
  }
}

export interface Table {
  readonly header: ReadonlyArray<string>
  readonly rows: ReadonlyArray<ReadonlyArray<string>>
  /** The markdown before and after the table. */
  readonly before: string
  readonly after: string
}

const cells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'))

const isSeparator = (line: string) =>
  /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line)

/** The first table in the markdown, or `null` if there is none. */
export function firstTable(markdown: string): Table | null {
  const lines = markdown.split('\n')
  const start = lines.findIndex(
    (line, i) => line.trim().startsWith('|') && isSeparator(lines[i + 1] ?? ''),
  )
  if (start === -1) return null
  let end = start + 2
  while (end < lines.length && (lines[end] ?? '').trim().startsWith('|')) end++
  return {
    header: cells(lines[start] ?? ''),
    rows: lines.slice(start + 2, end).map(cells),
    before: lines.slice(0, start).join('\n').trim(),
    after: lines.slice(end).join('\n').trim(),
  }
}
