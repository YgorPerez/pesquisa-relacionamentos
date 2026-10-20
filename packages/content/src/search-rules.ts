// As regras do build sobre busca e links (#15): avisos de título e
// descrição longos, `antes` que não pode valer e o último sitemap publicado.
import type { Acervo } from './library.ts'
import {
  buscaDaDica,
  buscaDaFicha,
  buscaDoGuia,
  buscaDoTema,
  caminhosAntigos,
  caminhosDoSite,
  LIMITES,
  type Busca,
} from './search.ts'
import { fichaIndexavel } from './paths.ts'
import type { Seo } from './schema.ts'
import { problema, type Problema } from './problems.ts'

function avisosDoItem(
  arquivo: string,
  busca: Busca,
  seo: Seo | undefined,
  campoDoTitulo: string,
): Problema[] {
  const avisos: Problema[] = []
  if (busca.titulo.length > LIMITES.titulo)
    avisos.push(
      problema(
        arquivo,
        `o título de busca tem ${busca.titulo.length} caracteres e o limite é ${LIMITES.titulo}; escreva um mais curto em seo.titulo`,
        seo?.titulo ? 'seo.titulo' : campoDoTitulo,
      ),
    )
  if (busca.descricao.length > LIMITES.descricao)
    avisos.push(
      problema(
        arquivo,
        `a descrição de busca tem ${busca.descricao.length} caracteres e o limite é ${LIMITES.descricao}`,
        'seo.descricao',
      ),
    )
  return avisos
}

/** Título ou descrição que o Google cortaria, só nas páginas indexadas. A
 * descrição derivada já sai cortada; só a do `seo` passa do limite. */
export function avisosDeBusca(acervo: Acervo): Problema[] {
  return [
    ...acervo.temas.flatMap((t) =>
      avisosDoItem(t.arquivo, buscaDoTema(t), t.seo, 'titulo'),
    ),
    ...acervo.guias.flatMap((g) =>
      avisosDoItem(g.arquivo, buscaDoGuia(g), g.seo, 'pergunta'),
    ),
    ...acervo.dicas
      .filter((d) => d.publicada)
      .flatMap((d) => avisosDoItem(d.arquivo, buscaDaDica(d), d.seo, 'texto')),
    ...acervo.fichas
      .filter(fichaIndexavel)
      .flatMap((f) =>
        avisosDoItem(f.arquivo, buscaDaFicha(f), f.seo, 'título'),
      ),
  ]
}

/** O `antes` só lista caminhos que sumiram, e cada um tem um dono só. */
export function errosDoAntes(acervo: Acervo): Problema[] {
  const erros: Problema[] = []
  const site = caminhosDoSite(acervo)
  const dono = new Map<string, string>()
  for (const { antigo, arquivo } of caminhosAntigos(acervo)) {
    if (site.has(antigo)) {
      erros.push(
        problema(
          arquivo,
          `o caminho ${antigo} ainda é uma página do site; o "antes" lista só caminhos que sumiram`,
          'antes',
        ),
      )
      continue
    }
    const outro = dono.get(antigo)
    if (outro === undefined) dono.set(antigo, arquivo)
    else if (outro !== arquivo)
      erros.push(
        problema(
          arquivo,
          `o caminho ${antigo} já está no "antes" de ${outro}`,
          'antes',
        ),
      )
  }
  return erros
}

const SITEMAP_PUBLICADO = 'sitemap.xml publicado'

const semBarraFinal = (caminho: string) =>
  caminho.length > 1 ? caminho.replace(/\/+$/, '') : caminho

/** Todo caminho do último sitemap publicado continua sendo uma página ou
 * está no `antes` de algum arquivo: nenhum link quebra sem querer. */
export function conferirSitemapAnterior(
  acervo: Acervo,
  xml: string,
): Problema[] {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(
    (m) => m[1] ?? '',
  )
  if (locs.length === 0)
    return [
      problema(
        SITEMAP_PUBLICADO,
        'não achei nenhum <loc>; confira o arquivo baixado',
      ),
    ]
  const site = caminhosDoSite(acervo)
  const antigos = new Set(caminhosAntigos(acervo).map((c) => c.antigo))
  return locs
    .map((loc) => {
      try {
        return semBarraFinal(decodeURI(new URL(loc).pathname))
      } catch {
        return loc
      }
    })
    .filter((caminho) => !site.has(caminho) && !antigos.has(caminho))
    .map((caminho) =>
      problema(
        SITEMAP_PUBLICADO,
        `${caminho} sumiu do site; declare o caminho antigo no "antes" do arquivo que o substituiu`,
      ),
    )
}
