// O que o pacote entende de markdown: o frontmatter, o título `#`, as seções
// `##` e uma tabela simples. O resto do corpo segue como markdown, e quem
// desenha a página o converte.

export interface Dividido {
  readonly frontmatter: string | null
  readonly corpo: string
}

/** Separa o bloco `---` do topo do resto do arquivo. */
export function dividirFrontmatter(texto: string): Dividido {
  const normal = texto.replace(/\r\n/g, '\n')
  const achado = /^---\n([\s\S]*?)\n---\n?/.exec(normal)
  if (!achado) return { frontmatter: null, corpo: normal }
  return { frontmatter: achado[1] ?? '', corpo: normal.slice(achado[0].length) }
}

export interface Secao {
  readonly titulo: string
  /** O markdown entre este `##` e o próximo, sem as linhas em branco das pontas. */
  readonly markdown: string
}

export interface Corpo {
  readonly titulo: string | null
  /** O que vem entre o título e a primeira seção. */
  readonly abertura: string
  readonly secoes: ReadonlyArray<Secao>
}

/** Lê o título `#` e corta o corpo nas seções `##`. */
export function lerCorpo(corpo: string): Corpo {
  const linhas = corpo.split('\n')
  let titulo: string | null = null
  const abertura: string[] = []
  const secoes: Array<{ titulo: string; linhas: string[] }> = []
  for (const linha of linhas) {
    const h1 = /^#\s+(.+?)\s*$/.exec(linha)
    const h2 = /^##\s+(.+?)\s*$/.exec(linha)
    if (h1 && titulo === null && secoes.length === 0) titulo = h1[1] ?? null
    else if (h2) secoes.push({ titulo: h2[1] ?? '', linhas: [] })
    else if (secoes.length > 0) secoes[secoes.length - 1]?.linhas.push(linha)
    else abertura.push(linha)
  }
  return {
    titulo,
    abertura: abertura.join('\n').trim(),
    secoes: secoes.map((s) => ({ titulo: s.titulo, markdown: s.linhas.join('\n').trim() })),
  }
}

export interface Tabela {
  readonly cabecalho: ReadonlyArray<string>
  readonly linhas: ReadonlyArray<ReadonlyArray<string>>
  /** O markdown antes e depois da tabela. */
  readonly antes: string
  readonly depois: string
}

const celulas = (linha: string): string[] =>
  linha
    .trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'))

const ehSeparador = (linha: string) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(linha)

/** A primeira tabela do markdown, ou `null` se não houver. */
export function primeiraTabela(markdown: string): Tabela | null {
  const linhas = markdown.split('\n')
  const inicio = linhas.findIndex(
    (linha, i) => linha.trim().startsWith('|') && ehSeparador(linhas[i + 1] ?? ''),
  )
  if (inicio === -1) return null
  let fim = inicio + 2
  while (fim < linhas.length && (linhas[fim] ?? '').trim().startsWith('|')) fim++
  return {
    cabecalho: celulas(linhas[inicio] ?? ''),
    linhas: linhas.slice(inicio + 2, fim).map(celulas),
    antes: linhas.slice(0, inicio).join('\n').trim(),
    depois: linhas.slice(fim).join('\n').trim(),
  }
}
