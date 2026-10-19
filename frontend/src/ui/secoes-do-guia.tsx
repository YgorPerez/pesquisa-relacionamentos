// As seções do Guia que só ele tem: a seta que manda às Fichas, as Dicas, o
// que a evidência diz (com a divergência) e os Mitos riscados. A página
// (`routes/$tema/$slug.tsx`) as monta na ordem do #7.
import type { Veredito } from '@tem-estudo/regras/vale-para-voce'
import { Link } from '@tanstack/react-router'
import type { GuiaVista } from '#/conteudo/vista-guia'
import { Html } from './guia'
import { Headline, Painel, Secao } from './secao'
import { NotaValePara } from './perfil'
import { ForcaDaEvidencia } from './selos'

type Guia = GuiaVista

/** Nota de margem 1 de 2: a seta que manda às Fichas. */
export function SetaDasFontes() {
  return (
    <div className="mt-2 mr-0 mb-0 ml-auto flex max-w-96 items-start justify-end gap-1.5 text-agua-tinta">
      <svg
        width="44"
        height="40"
        viewBox="0 0 44 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="-mt-1.5 flex-none"
      >
        <path d="M6 4c4 16 14 26 32 30M38 34l-9 2M38 34l-3-8" />
      </svg>
      <a
        href="#fichas"
        className="inline-flex min-h-toque items-center font-nota-de-margem text-nota-de-margem no-underline hover:underline"
      >
        quer conferir? as Fichas estão lá no fim
      </a>
    </div>
  )
}

export function DicasDoGuia({
  dicas,
  vereditos,
}: {
  dicas: Guia['dicas']
  vereditos: ReadonlyArray<Veredito> | undefined
}) {
  return (
    <Secao aria-labelledby="t-dicas">
      <Headline id="t-dicas">Dicas</Headline>
      <ul className="m-0 list-none p-0" data-slot="dicas-do-guia">
        {dicas.map((dica, i) => (
          <Painel
            como="li"
            key={dica.slug}
            className="not-first:mt-lg [&>p]:m-0"
          >
            <Html como="p" html={dica.html} />
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <ForcaDaEvidencia forca={dica.forca} rotulo />
              <Link
                to="/dicas/$slug"
                params={{ slug: dica.slug }}
                className="inline-flex min-h-toque items-center text-label leading-body font-bold"
              >
                sobre esta Dica
              </Link>
            </div>
            {dica.inferencia && (
              <p className="mt-1 mb-0 text-nota text-tinta-2 italic">
                Inferência nossa: nenhum estudo testou isso direto. Saiu das
                Fichas citadas.
              </p>
            )}
            <NotaValePara
              texto={dica.valePara}
              veredito={vereditos?.[i] ?? null}
            />
          </Painel>
        ))}
      </ul>
    </Secao>
  )
}

/** "O que a evidência diz": os achados com país e ano, e a divergência. */
export function Evidencia({
  guia,
  vereditos,
}: {
  guia: Guia
  vereditos: ReadonlyArray<Veredito> | undefined
}) {
  return (
    <Secao aria-labelledby="t-evidencia">
      <Headline id="t-evidencia">O que a evidência diz</Headline>
      <ol className="m-0 list-none p-0" data-slot="achados-guia">
        {guia.achados.map((achado, i) => (
          <li
            key={achado.html}
            className="grid grid-cols-[minmax(58px,max-content)_1fr] gap-sm border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-4 first:border-t-0 first:pt-0.5 [&_[data-slot=vale]]:mt-xs [&_p]:m-0"
          >
            <span
              className="h-max max-w-30 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-folha px-1.5 pt-1.75 pb-1.5 text-center font-title text-medio leading-cerrada font-bold wrap-anywhere"
              data-slot="onde"
            >
              {achado.pais}
              <small className="mt-0.75 block font-label text-miudo leading-curta font-bold text-tinta-2">
                {achado.periodo}
              </small>
            </span>
            <div>
              <Html como="p" html={achado.html} />
              <NotaValePara
                texto={achado.valePara}
                veredito={vereditos?.[i] ?? null}
              />
            </div>
          </li>
        ))}
      </ol>

      {guia.divergencia && (
        <div className="mt-md">
          <table
            aria-label="A evidência diverge"
            className="w-full table-fixed border-separate border-spacing-0 rounded-mao border-2 border-tinta bg-folha text-aviso leading-normal"
          >
            <thead>
              <tr>
                {guia.divergencia.lados.map((lado) => (
                  <th
                    key={lado.titulo}
                    scope="col"
                    className="border-b-(length:--traco-etiqueta) fio-pontilhado border-tinta px-3 pt-3 pb-3.5 text-left align-top font-title text-body leading-tight font-bold not-first:border-l-(length:--traco-etiqueta)"
                  >
                    {lado.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {guia.divergencia.lados.map((lado) => (
                  <td
                    key={lado.titulo}
                    className="px-3 pt-3 pb-3.5 text-left align-top not-first:border-l-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
                    dangerouslySetInnerHTML={{ __html: lado.html }}
                  />
                ))}
              </tr>
            </tbody>
          </table>
          <p className="mt-3 mb-0 text-aviso" data-slot="melhor-desenho">
            <b>Qual lado tem o melhor desenho: </b>
            <Html como="span" html={guia.divergencia.melhorDesenhoHtml} />
          </p>
        </div>
      )}
    </Secao>
  )
}

export function Mitos({ mitos }: { mitos: Guia['mitos'] }) {
  return (
    <Secao aria-labelledby="t-mitos">
      <Headline id="t-mitos">O que circula por aí e não se sustenta</Headline>
      {mitos.map((mito) => (
        <Painel
          como="article"
          key={mito.afirmacao}
          className="py-4 not-first-of-type:mt-5.5"
          data-slot="mito"
        >
          <p className="m-0 font-title text-title leading-label">
            <s className="risco-do-mito">{mito.afirmacao}</s>
          </p>
          <Html como="p" className="mt-3 mb-0" html={mito.porQueNaoHtml} />
        </Painel>
      ))}
    </Secao>
  )
}
