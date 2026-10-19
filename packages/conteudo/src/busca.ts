// O que vai para os buscadores e o que mantém os links de pé (#15): título e
// descrição de cada página, sitemap, robots e os 301 do `antes`. Só tipos de
// fora e as listas: o servidor do app importa daqui sem levar `node:fs` nem o
// Effect. As regras que viram erro ou aviso do build ficam em
// `regras-de-busca.ts`.
import type { Acervo } from './acervo.ts'
import {
  caminhoDaDica,
  caminhoDaFicha,
  caminhoDoGuia,
  caminhoDoTema,
  fichaIndexavel,
} from './caminhos.ts'
import type { Ficha } from './ficha.ts'
import type { Dica, Guia, Tema } from './itens.ts'
import { CALCULADORAS, ROTAS_RESERVADAS } from './listas.ts'

/** O endereço do site, para o sitemap, o canonical e o Open Graph. */
export const ORIGEM = 'https://temestudo.com'

/** Até onde o Google mostra o título e a descrição sem cortar. */
export const LIMITES = { titulo: 60, descricao: 155 } as const

export interface Busca {
  readonly titulo: string
  readonly descricao: string
}

/** Markdown do conteúdo em texto puro: sem referências `[@slug]`, sem
 * `==marca==`, sem link nem ênfase. */
export function textoPuro(markdown: string): string {
  return markdown
    .replace(/\s*\[@[a-z0-9-]+\]/g, '')
    .replace(/==([^=\n]+)==/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Corta numa palavra, com reticências, para caber no limite. */
export function cortar(
  texto: string,
  limite: number = LIMITES.descricao,
): string {
  return texto.length <= limite
    ? texto
    : `${texto.slice(0, limite - 1).replace(/\s+\S*$/, '')}…`
}

const comSeo = (
  seo: { titulo?: string; descricao?: string } | undefined,
  derivado: Busca,
): Busca => ({
  titulo: seo?.titulo ?? derivado.titulo,
  descricao: seo?.descricao ?? derivado.descricao,
})

/** Guia: a Pergunta e a resposta curta. */
export const buscaDoGuia = (
  guia: Pick<Guia, 'pergunta' | 'respostaCurta' | 'seo'>,
): Busca =>
  comSeo(guia.seo, {
    titulo: textoPuro(guia.pergunta),
    descricao: cortar(textoPuro(guia.respostaCurta)),
  })

/** Tema: o título e o parágrafo de contexto. */
export const buscaDoTema = (
  tema: Pick<Tema, 'titulo' | 'contexto' | 'seo'>,
): Busca =>
  comSeo(tema.seo, {
    titulo: textoPuro(tema.titulo),
    descricao: cortar(textoPuro(tema.contexto)),
  })

/** Ficha: "Autor ano: tema" e o primeiro achado. */
export function buscaDaFicha(
  ficha: Pick<Ficha, 'titulo' | 'achados' | 'referencia' | 'seo'>,
): Busca {
  const primeiro = ficha.achados[0]
  return comSeo(ficha.seo, {
    titulo: textoPuro(ficha.titulo.replace(/\s*\((\d{4}[a-z]?)\)/, ' $1')),
    descricao: cortar(
      textoPuro(
        primeiro ? `${primeiro.medida}: ${primeiro.valor}.` : ficha.referencia,
      ),
    ),
  })
}

/** Dica: o texto, no título e na descrição. */
export function buscaDaDica(dica: Pick<Dica, 'texto' | 'seo'>): Busca {
  const texto = textoPuro(dica.texto)
  return comSeo(dica.seo, { titulo: texto, descricao: cortar(texto) })
}

/** Os caminhos que vão para o sitemap: início, Temas e Guias, as Dicas
 * publicadas, as Fichas ✅/🟡 e as calculadoras. A Ficha ⬜ fica fora. */
export function caminhosDoSitemap(acervo: Acervo): string[] {
  return [
    '/',
    ...acervo.temas.flatMap((tema) => [
      caminhoDoTema(tema),
      ...acervo.guias.filter((g) => g.tema === tema.slug).map(caminhoDoGuia),
    ]),
    '/dicas',
    ...acervo.dicas.filter((d) => d.publicada).map(caminhoDaDica),
    '/estudos',
    ...acervo.fichas.filter(fichaIndexavel).map(caminhoDaFicha),
    ...CALCULADORAS.map((c) => `/${c}`),
  ]
}

/** Todo caminho que responde com uma página, indexada ou não: o sitemap, as
 * Fichas ⬜ e as rotas fixas do app. */
export function caminhosDoSite(acervo: Acervo): Set<string> {
  return new Set([
    ...caminhosDoSitemap(acervo),
    ...acervo.fichas.map(caminhoDaFicha),
    ...ROTAS_RESERVADAS.map((r) => `/${r}`),
  ])
}

export function sitemapXml(acervo: Acervo): string {
  const urls = caminhosDoSitemap(acervo).map(
    (c) => `  <url><loc>${ORIGEM}${c}</loc></url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

/** Tudo liberado: o que fica fora da busca leva `noindex` na página, que o
 * buscador só lê se puder abrir a página. */
export const robotsTxt = (): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGEM}/sitemap.xml\n`

/** Um caminho antigo declarado no `antes` de um arquivo. */
export interface CaminhoAntigo {
  readonly antigo: string
  readonly novo: string
  readonly arquivo: string
}

/** Os caminhos antigos de cada arquivo, na ordem do acervo. O `antes` da
 * Ficha, da Dica e do Tema lista slugs; o do Guia, slugs do mesmo Tema ou
 * `tema/slug` quando o Guia mudou de Tema. O Tema renomeado leva junto os
 * Guias dele, com os slugs antigos de cada um. */
export function caminhosAntigos(acervo: Acervo): CaminhoAntigo[] {
  const lista: CaminhoAntigo[] = []
  for (const ficha of acervo.fichas)
    for (const slug of ficha.antes ?? [])
      lista.push({
        antigo: `/estudos/${slug}`,
        novo: caminhoDaFicha(ficha),
        arquivo: ficha.arquivo,
      })
  for (const dica of acervo.dicas)
    for (const slug of dica.antes ?? [])
      lista.push({
        antigo: `/dicas/${slug}`,
        novo: caminhoDaDica(dica),
        arquivo: dica.arquivo,
      })
  for (const tema of acervo.temas)
    for (const slug of tema.antes ?? [])
      lista.push({
        antigo: `/${slug}`,
        novo: caminhoDoTema(tema),
        arquivo: tema.arquivo,
      })
  for (const guia of acervo.guias) {
    const novo = caminhoDoGuia(guia)
    const antes = guia.antes ?? []
    const temas = [
      guia.tema,
      ...(acervo.temas.find((t) => t.slug === guia.tema)?.antes ?? []),
    ]
    const slugs = [guia.slug, ...antes.filter((a) => !a.includes('/'))]
    for (const slug of slugs)
      for (const tema of temas) {
        const antigo = `/${tema}/${slug}`
        if (antigo !== novo) lista.push({ antigo, novo, arquivo: guia.arquivo })
      }
    for (const caminho of antes.filter((a) => a.includes('/')))
      lista.push({ antigo: `/${caminho}`, novo, arquivo: guia.arquivo })
  }
  return lista
}

/** Caminho antigo → caminho de hoje, para o 301. */
export function redirecionamentos(acervo: Acervo): Record<string, string> {
  const mapa: Record<string, string> = {}
  for (const { antigo, novo } of caminhosAntigos(acervo)) mapa[antigo] ??= novo
  return mapa
}
