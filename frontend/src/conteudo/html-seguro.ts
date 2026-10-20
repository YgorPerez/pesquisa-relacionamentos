// O filtro do HTML que o servidor monta do Markdown do acervo. Os Trechos
// das Fichas são copiados de fontes de fora, e o `Html` de `ui/guia.tsx`
// põe o resultado na página sem filtro nenhum: por isso só passa o que o
// Markdown do acervo gera (o GFM do `marked`, as marcas `==…==` e `[@slug]`
// e o `<details>` dobrável). O resto some: tag de fora da lista sai e deixa
// o texto (`<script>`, `<style>`, `<iframe>` e afins saem com o conteúdo),
// atributo de fora da lista sai, e um link só leva `href` de http(s), de
// âncora ou de caminho relativo.
import { escapeAttrValue, FilterXSS, friendlyAttrValue } from 'xss'

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
  a: ['href', 'class', 'aria-label'],
  span: ['class'],
  mark: ['class'],
}

/** As classes que o próprio app põe no Markdown (`vista-guia.ts`). */
const CLASSES: Record<string, ReadonlySet<string>> = {
  a: new Set(['ref']),
  span: new Set(['nw', 'marca-texto']),
  mark: new Set(['numero-chave']),
}

const SEM_CONTEUDO = [
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

const atributo = (nome: string, valor: string) =>
  `${nome}="${escapeAttrValue(valor)}"`

/** `href` de http(s), âncora ou caminho relativo; `null` para o resto
 * (`javascript:`, `data:`, `mailto:`, `//outro-site`). */
function hrefSeguro(valor: string): string | null {
  if (/^https?:\/\//i.test(valor) || valor.startsWith('#')) return valor
  if (valor.startsWith('//') || /^[^/?#]*:/.test(valor)) return null
  return valor
}

function filtrarAtributo(tag: string, nome: string, bruto: string) {
  const valor = friendlyAttrValue(bruto).trim()
  switch (nome) {
    case 'href': {
      const href = hrefSeguro(valor)
      if (href === null) return ''
      const externo = /^https?:\/\//i.test(href)
      return externo
        ? `${atributo('href', href)} rel="noopener noreferrer"`
        : atributo('href', href)
    }
    case 'class': {
      const classes = valor.split(/\s+/).filter((c) => CLASSES[tag]?.has(c))
      return classes.length > 0 ? atributo('class', classes.join(' ')) : ''
    }
    case 'id':
      return /^[a-z][a-z0-9-]*$/.test(valor) ? atributo('id', valor) : ''
    case 'start':
      return /^\d+$/.test(valor) ? atributo('start', valor) : ''
    case 'align':
      return /^(left|center|right)$/.test(valor) ? atributo('align', valor) : ''
    case 'open':
      return 'open'
    default:
      return atributo(nome, valor)
  }
}

const filtro = new FilterXSS({
  whiteList: Object.fromEntries(
    Object.entries(TAGS).map(([tag, attrs]) => [tag, [...attrs]]),
  ),
  stripIgnoreTag: true,
  stripIgnoreTagBody: SEM_CONTEUDO,
  onTagAttr: (tag, nome, valor, permitido) =>
    permitido ? filtrarAtributo(tag, nome, valor) : '',
})

/** O HTML que passou por `htmlSeguro`. A marca só existe no tipo: o `Html` de
 * `ui/guia.tsx`, o único lugar que injeta HTML, aceita só ela, e uma string
 * qualquer não chega lá sem passar pelo filtro. */
export type HtmlSeguro = string & { readonly __filtrado: unique symbol }

/** O HTML montado do Markdown do acervo, só com as tags e os atributos que
 * o acervo usa. Link que perdeu o `href` vira texto, para não parecer link. */
export const htmlSeguro = (html: string): HtmlSeguro =>
  filtro
    .process(html)
    .replace(/<a(?: class="[^"]*")?>([\s\S]*?)<\/a>/g, '$1') as HtmlSeguro
