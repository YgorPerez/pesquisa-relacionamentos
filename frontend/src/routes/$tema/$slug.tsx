import { createFileRoute, Link } from '@tanstack/react-router'
import { buscarGuia } from '#/conteudo/guias'
import {
  ConfiancaDaResposta,
  FichasCitadas,
  Html,
  LinhaDePergunta,
} from '#/ui/guia'
import {
  usePontoNoHistorico,
  useReferencias,
  VoltarParaGuia,
} from '#/ui/navegacao'
import { ForcaDaEvidencia } from '#/ui/selos'
import { Coluna, Display, Folha, Headline, Lead, Secao } from '#/ui/pagina'
import {
  AvisoSemDado,
  CaixaDoPerfil,
  LinkDoPerfil,
  NotaValePara,
  ParaOSeuPerfil,
} from '#/ui/perfil'
import { usePerfilNoGuia } from '#/estado/perfil-no-guia'
import { usePrioridades } from '#/estado/prioridades'
import type { PrioridadesVista } from '#/conteudo/vista-prioridades'
import { CartaoDePrioridades } from '#/ui/prioridades'
import { Ajudou } from '#/ui/contagem'
import { useContarFichasAbertas } from '#/analytics/contagem'
import { Compartilhar } from '#/ui/compartilhar'
import { useGrupoPossivel, useRequisitosSalvos } from '#/estado/grupo-possivel'
import { CartaoDoGrupoPossivel } from '#/ui/grupo-possivel'
import type { Perfil } from '@tem-estudo/regras/perfil'
import {
  REQUISITOS_PADRAO,
  valorDoRequisito,
} from '@tem-estudo/regras/requisitos'

export const Route = createFileRoute('/$tema/$slug')({
  loader: ({ params }) =>
    buscarGuia({ data: { tema: params.tema, slug: params.slug } }),
  head: ({ loaderData: guia }) => ({
    // A prévia do link repete o título e a descrição de busca; a imagem é a
    // fixa do site, da raiz.
    meta: guia
      ? [
          { title: `${guia.busca.titulo} · Tem estudo?` },
          { name: 'description', content: guia.busca.descricao },
          { property: 'og:type', content: 'article' },
          { property: 'og:title', content: guia.busca.titulo },
          { property: 'og:description', content: guia.busca.descricao },
        ]
      : [],
  }),
  notFoundComponent: GuiaNaoExiste,
  component: PaginaDoGuia,
})

const Marcador = () => (
  <svg
    className="flex-none"
    width="30"
    height="34"
    viewBox="0 0 30 34"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M24 3C10 6 4 16 8 30M8 30l-4-7M8 30l6-5" />
  </svg>
)

function PaginaDoGuia() {
  const guia = Route.useLoaderData()
  const { circulada, voltarAoTexto } = useReferencias(guia.slug)
  usePontoNoHistorico()
  useContarFichasAbertas(guia.slug)
  const { perfil, noGuia } = usePerfilNoGuia(guia)

  return (
    <Folha>
      <Coluna>
        <VoltarParaGuia />
        {perfil && noGuia?.comDado === 0 && <AvisoSemDado perfil={perfil} />}
        <Display dangerouslySetInnerHTML={{ __html: guia.perguntaHtml }} />

        <section
          className="reticula rounded-mao border-2 border-tinta bg-folha px-md pt-md pb-4 mb-2 [&>p]:m-0 [&>p]:mt-xs"
          aria-labelledby="t-resposta"
        >
          <h2 id="t-resposta" className="sr-only">
            Resposta curta
          </h2>
          <ConfiancaDaResposta confianca={guia.confianca} />
          <Html className="prosa text-lead" html={guia.respostaHtml} />
          {noGuia && (
            <ParaOSeuPerfil chave={noGuia.chave} achados={guia.achados} />
          )}
        </section>

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
          >quer conferir? as Fichas estão lá no fim</a>
        </div>

        <LinkDoPerfil perfil={perfil} />

        {guia.dicas.length > 0 && (
          <Secao aria-labelledby="t-dicas">
            <Headline id="t-dicas">
              Dicas
            </Headline>
            <ul className="m-0 list-none p-0" data-slot="dicas-do-guia">
              {guia.dicas.map((dica, i) => (
                <li
                  key={dica.slug}
                  className="reticula rounded-mao border-2 border-tinta bg-folha px-md pt-md pb-4 not-first:mt-lg [&>p]:m-0"
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
                      Inferência nossa: nenhum estudo testou isso direto. Saiu
                      das Fichas citadas.
                    </p>
                  )}
                  <NotaValePara
                    texto={dica.valePara}
                    veredito={noGuia?.dicas[i] ?? null}
                  />
                </li>
              ))}
            </ul>
          </Secao>
        )}

        {guia.prioridades && <CartaoDoB1 prioridades={guia.prioridades} />}
        {guia.grupoPossivel && <CartaoDoB5 perfil={perfil} />}

        <Secao aria-labelledby="t-evidencia">
          <Headline id="t-evidencia">
            O que a evidência diz
          </Headline>
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
                    veredito={noGuia?.achados[i] ?? null}
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

        <Secao id="perfil" aria-labelledby="t-perfil">
          <Headline id="t-perfil">
            Varia conforme o Perfil?
          </Headline>
          <Html className="prosa" html={guia.perfilHtml} />
          <CaixaDoPerfil
            perfil={perfil}
            comDado={noGuia?.comDado ?? null}
            totalDeAchados={guia.achados.length}
          />
        </Secao>

        {guia.mitos.length > 0 && (
          <Secao aria-labelledby="t-mitos">
            <Headline id="t-mitos">
              O que circula por aí e não se sustenta
            </Headline>
            {guia.mitos.map((mito) => (
              <article
                key={mito.afirmacao}
                className="reticula rounded-mao border-2 border-tinta bg-folha px-md py-4 not-first-of-type:mt-5.5"
                data-slot="mito"
              >
                <p className="m-0 font-title text-title leading-label">
                  <s className="risco-do-mito">{mito.afirmacao}</s>
                </p>
                <Html
                  como="p"
                  className="mt-3 mb-0"
                  html={mito.porQueNaoHtml}
                />
              </article>
            ))}
          </Secao>
        )}

        <Secao aria-labelledby="t-limitacoes">
          <Headline id="t-limitacoes">
            Limitações e o que não se sabe
          </Headline>
          <Html className="prosa limites" html={guia.limitacoesHtml} />
        </Secao>

        <Secao id="fichas" aria-labelledby="t-fichas">
          <Headline id="t-fichas">
            Fichas citadas
          </Headline>
          <p className="-mt-1 mr-0 mb-3.5 ml-6 flex max-w-88 items-end gap-1 text-nota leading-folgada text-agua-tinta italic">
            <Marcador />
            cada número do texto leva à Ficha com o mesmo número aqui
          </p>
          <FichasCitadas
            fichas={guia.fichas}
            circulada={circulada}
            voltarAoTexto={voltarAoTexto}
          />
        </Secao>

        <Ajudou key={guia.slug} guia={guia.slug} />

        {guia.relacionadas.length > 0 && (
          <Secao aria-labelledby="t-relacionadas">
            <Headline id="t-relacionadas">
              Perguntas relacionadas
            </Headline>
            <ul className="isolate m-0 list-none p-0">
              {guia.relacionadas.map((outro) => (
                <li key={outro.slug} className="not-first:mt-md">
                  <LinhaDePergunta guia={outro} de={guia.pergunta} />
                </li>
              ))}
            </ul>
          </Secao>
        )}

        <Compartilhar
          semTitulo
          frase="O link leva só o endereço do Guia, sem o seu Perfil."
        />
      </Coluna>
    </Folha>
  )
}

/** O cartão de Prioridades, com o topo 3 que o visitante deixou na página. */
function CartaoDoB1({ prioridades }: { prioridades: PrioridadesVista }) {
  const { topo3 } = usePrioridades(prioridades.caracteristicas.map((c) => c.id))
  return (
    <CartaoDePrioridades
      barra={prioridades.barra}
      caracteristicas={prioridades.caracteristicas}
      topo3={topo3}
    />
  )
}

/** O cartão do Grupo possível, com a conta que o visitante deixou na página. */
function CartaoDoB5({ perfil }: { perfil: Perfil | null }) {
  const salvos = useRequisitosSalvos()
  const { estimativa, carregando, uf } = useGrupoPossivel(perfil, salvos)
  const r = salvos ?? REQUISITOS_PADRAO
  const municipio = r.lugar?.municipio
    ? uf?.municipios.get(r.lugar.municipio)?.nome
    : undefined
  return (
    <CartaoDoGrupoPossivel
      estimativa={estimativa}
      usado={perfil !== null || salvos !== null}
      ligados={estimativa.ligados.map((k) =>
        valorDoRequisito(k, perfil, r, municipio),
      )}
      carregando={carregando}
    />
  )
}

function GuiaNaoExiste() {
  return (
    <Folha>
      <Coluna>
        <Display>Esse Guia não existe</Display>
        <Lead>
          O endereço pode ter mudado.{' '}
          <Link to="/">Veja os Temas na página inicial</Link>.
        </Lead>
      </Coluna>
    </Folha>
  )
}
