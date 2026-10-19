import { createFileRoute, Link } from '@tanstack/react-router'
import { buscarGuia } from '#/conteudo/guias'
import { ConfiancaDaResposta, FichasCitadas, Html, LinhaDePergunta } from '#/ui/guia'
import { usePontoNoHistorico, useReferencias, VoltarParaGuia } from '#/ui/navegacao'
import { ForcaDaEvidencia } from '#/ui/selos'
import { AvisoSemDado, CaixaDoPerfil, LinkDoPerfil, NotaValePara, ParaOSeuPerfil } from '#/ui/perfil'
import { usePerfilNoGuia } from '#/estado/perfil-no-guia'
import { usePrioridades } from '#/estado/prioridades'
import type { PrioridadesVista } from '#/conteudo/vista-prioridades'
import { CartaoDePrioridades } from '#/ui/prioridades'
import { Ajudou } from '#/ui/contagem'
import { useContarFichasAbertas } from '#/analytics/contagem'

export const Route = createFileRoute('/$tema/$slug')({
  loader: ({ params }) => buscarGuia({ data: { tema: params.tema, slug: params.slug } }),
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
  <svg className="seta-nota" width="30" height="34" viewBox="0 0 30 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <main className="folha">
      <div className="coluna">
        <VoltarParaGuia />
        {perfil && noGuia?.comDado === 0 && <AvisoSemDado perfil={perfil} />}
        <h1 className="display" dangerouslySetInnerHTML={{ __html: guia.perguntaHtml }} />

        <section className="painel com-reticula resposta-curta" aria-labelledby="t-resposta">
          <h2 id="t-resposta" className="visualmente-oculto">
            Resposta curta
          </h2>
          <ConfiancaDaResposta confianca={guia.confianca} />
          <Html className="resposta prosa" html={guia.respostaHtml} />
          {noGuia && <ParaOSeuPerfil chave={noGuia.chave} achados={guia.achados} />}
        </section>

        <div className="seta-fontes">
          <svg width="44" height="40" viewBox="0 0 44 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 4c4 16 14 26 32 30M38 34l-9 2M38 34l-3-8" />
          </svg>
          <a href="#fichas">quer conferir? as Fichas estão lá no fim</a>
        </div>

        <LinkDoPerfil perfil={perfil} />

        {guia.dicas.length > 0 && (
          <section className="secao" aria-labelledby="t-dicas">
            <h2 id="t-dicas" className="headline">
              Dicas
            </h2>
            <ul className="dicas-do-guia">
              {guia.dicas.map((dica, i) => (
                <li key={dica.slug} className="painel com-reticula dica">
                  <Html como="p" html={dica.html} />
                  <div className="dica-meta">
                    <ForcaDaEvidencia forca={dica.forca} rotulo />
                    <Link to="/dicas/$slug" params={{ slug: dica.slug }} className="link-leve">
                      sobre esta Dica
                    </Link>
                  </div>
                  {dica.inferencia && (
                    <p className="inferencia">
                      Inferência nossa: nenhum estudo testou isso direto. Saiu das Fichas citadas.
                    </p>
                  )}
                  <NotaValePara texto={dica.valePara} veredito={noGuia?.dicas[i] ?? null} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {guia.prioridades && <CartaoDoB1 prioridades={guia.prioridades} />}

        <section className="secao" aria-labelledby="t-evidencia">
          <h2 id="t-evidencia" className="headline">
            O que a evidência diz
          </h2>
          <ol className="achados-guia">
            {guia.achados.map((achado, i) => (
              <li key={i} className="achado-guia">
                <span className="onde">
                  {achado.pais}
                  <small>{achado.periodo}</small>
                </span>
                <div>
                  <Html como="p" html={achado.html} />
                  <NotaValePara texto={achado.valePara} veredito={noGuia?.achados[i] ?? null} />
                </div>
              </li>
            ))}
          </ol>

          {guia.divergencia && (
            <div className="divergencia">
              <table aria-label="A evidência diverge">
                <thead>
                  <tr>
                    {guia.divergencia.lados.map((lado) => (
                      <th key={lado.titulo} scope="col">
                        {lado.titulo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {guia.divergencia.lados.map((lado) => (
                      <td key={lado.titulo} dangerouslySetInnerHTML={{ __html: lado.html }} />
                    ))}
                  </tr>
                </tbody>
              </table>
              <p className="melhor-desenho">
                <b>Qual lado tem o melhor desenho: </b>
                <Html como="span" html={guia.divergencia.melhorDesenhoHtml} />
              </p>
            </div>
          )}
        </section>

        <section className="secao" id="perfil" aria-labelledby="t-perfil">
          <h2 id="t-perfil" className="headline">
            Varia conforme o Perfil?
          </h2>
          <Html className="prosa" html={guia.perfilHtml} />
          <CaixaDoPerfil
            perfil={perfil}
            comDado={noGuia?.comDado ?? null}
            totalDeAchados={guia.achados.length}
          />
        </section>

        {guia.mitos.length > 0 && (
          <section className="secao" aria-labelledby="t-mitos">
            <h2 id="t-mitos" className="headline">
              O que circula por aí e não se sustenta
            </h2>
            {guia.mitos.map((mito) => (
              <article key={mito.afirmacao} className="mito com-reticula">
                <p className="mito-frase">
                  <s>{mito.afirmacao}</s>
                </p>
                <Html como="p" className="mito-porque" html={mito.porQueNaoHtml} />
              </article>
            ))}
          </section>
        )}

        <section className="secao" aria-labelledby="t-limitacoes">
          <h2 id="t-limitacoes" className="headline">
            Limitações e o que não se sabe
          </h2>
          <Html className="prosa limites" html={guia.limitacoesHtml} />
        </section>

        <section className="secao" id="fichas" aria-labelledby="t-fichas">
          <h2 id="t-fichas" className="headline">
            Fichas citadas
          </h2>
          <p className="nota-texto">
            <Marcador />
            cada número do texto leva à Ficha com o mesmo número aqui
          </p>
          <FichasCitadas fichas={guia.fichas} circulada={circulada} voltarAoTexto={voltarAoTexto} />
        </section>

        <Ajudou key={guia.slug} guia={guia.slug} />

        {guia.relacionadas.length > 0 && (
          <section className="secao" aria-labelledby="t-relacionadas">
            <h2 id="t-relacionadas" className="headline">
              Perguntas relacionadas
            </h2>
            <ul className="linhas-pergunta">
              {guia.relacionadas.map((outro) => (
                <li key={outro.slug}>
                  <LinhaDePergunta guia={outro} de={guia.pergunta} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}

/** O cartão de Prioridades, com o topo 3 que o visitante deixou na página. */
function CartaoDoB1({ prioridades }: { prioridades: PrioridadesVista }) {
  const { topo3 } = usePrioridades(prioridades.caracteristicas.map((c) => c.id))
  return <CartaoDePrioridades barra={prioridades.barra} caracteristicas={prioridades.caracteristicas} topo3={topo3} />
}

function GuiaNaoExiste() {
  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">Esse Guia não existe</h1>
        <p className="lead">
          O endereço pode ter mudado. <Link to="/">Veja os Temas na página inicial</Link>.
        </p>
      </div>
    </main>
  )
}
