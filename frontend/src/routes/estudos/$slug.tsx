import { createFileRoute, Link } from '@tanstack/react-router'
import { buscarFicha } from '#/conteudo/fichas'
import { LinhaDePergunta } from '#/ui/guia'
import {
  ForcaDaEvidencia,
  LegendaDasFichas,
  PALAVRA_DO_DESENHO,
  StatusDeVerificacao,
} from '#/ui/selos'

export const Route = createFileRoute('/estudos/$slug')({
  loader: ({ params }) => buscarFicha({ data: params.slug }),
  head: ({ loaderData: ficha }) => ({
    meta: ficha
      ? [
          { title: `${ficha.titulo} · Tem estudo?` },
          { name: 'description', content: ficha.descricao },
          // Ficha ⬜ fica fora da busca até ser conferida (#15).
          ...(ficha.indexar ? [] : [{ name: 'robots', content: 'noindex' }]),
        ]
      : [],
  }),
  notFoundComponent: FichaNaoExiste,
  component: PaginaDaFicha,
})

const numero = new Intl.NumberFormat('pt-BR')

const data = (iso: string) => {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function Html({ html, como = 'div', className }: { html: string; como?: 'div' | 'span'; className?: string }) {
  const Tag = como
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

function PaginaDaFicha() {
  const ficha = Route.useLoaderData()
  const naoVerificada = ficha.status === 'nao-verificado'

  return (
    <main className="folha">
      <div className="coluna">
        <Link to="/estudos" className="voltar">
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 7.4C14 6.6 8 7.2 2.6 7M7 2.4 2.4 7.1 7.2 11.6" />
          </svg>
          Todos os estudos
        </Link>

        {naoVerificada && (
          <p className="aviso" role="note">
            <strong>Ficha não verificada.</strong> Os números abaixo ainda não foram conferidos no
            texto original. Ela não sustenta nenhum Guia até ser refeita com a fonte aberta.
          </p>
        )}

        <h1 className="display display-ficha">{ficha.titulo}</h1>

        <div className="ficha-meta ficha-meta-grande">
          <StatusDeVerificacao status={ficha.status} />
          <ForcaDaEvidencia forca={ficha.forca} rotulo />
        </div>

        <dl className="ficha-dados">
          <div>
            <dt>Referência</dt>
            <dd>
              <Html como="span" html={ficha.referenciaHtml} />{' '}
              <a href={ficha.link} className="link-fonte" rel="noopener" target="_blank">
                Abrir o estudo<span className="visualmente-oculto"> (abre em outra aba)</span>
              </a>
            </dd>
          </div>
          <div>
            <dt>Verificação</dt>
            <dd>
              {ficha.verificadoEm
                ? `${ficha.status === 'ok' ? 'Lido no original' : 'Conferido em parte'} em ${data(ficha.verificadoEm)}.`
                : 'Ainda não conferida na fonte.'}
            </dd>
          </div>
          <div>
            <dt>Por que {ficha.forca}</dt>
            <dd>{ficha.forcaPorque}</dd>
          </div>
          <div>
            <dt>Amostra</dt>
            <dd>
              {ficha.n !== null && <strong>{numero.format(ficha.n)}. </strong>}
              <Html como="span" html={ficha.amostraHtml} />{' '}
              {ficha.representativa ? 'Representativa da população.' : 'Não é representativa da população.'}
            </dd>
          </div>
          <div>
            <dt>Desenho</dt>
            <dd>{PALAVRA_DO_DESENHO[ficha.desenho]}</dd>
          </div>
          <div>
            <dt>País e período</dt>
            <dd>
              {ficha.paises.length > 0 ? ficha.paises.join(', ') : 'País não informado'} ·{' '}
              {ficha.periodo}
            </dd>
          </div>
          <div>
            <dt>Financiamento e conflito de interesse</dt>
            <dd>{ficha.conflitoHtml ? <Html como="span" html={ficha.conflitoHtml} /> : 'Não declarado.'}</dd>
          </div>
          {ficha.licenca && (
            <div>
              <dt>Licença</dt>
              <dd>{ficha.licenca}</dd>
            </div>
          )}
        </dl>

        <section className="secao" aria-labelledby="o-que-mediu">
          <h2 id="o-que-mediu" className="headline">
            O que mediu
          </h2>
          <Html className="prosa" html={ficha.oQueMediuHtml} />
        </section>

        <section className="secao" aria-labelledby="achados">
          <h2 id="achados" className="headline">
            Achados
          </h2>
          <ol className="achados">
            {ficha.achados.map((achado, i) => (
              <li key={i} className="achado">
                <Html className="achado-valor" html={achado.valor} />
                <div>
                  <Html como="span" className="achado-medida" html={achado.medida} />
                  {achado.trecho ? (
                    <blockquote className="trecho">
                      <Html como="span" html={achado.trecho} />
                    </blockquote>
                  ) : (
                    <p className="trecho-ausente">Trecho do original ainda não conferido.</p>
                  )}
                  {achado.onde && achado.onde !== '—' && (
                    <p className="achado-onde">
                      Onde: <Html como="span" html={achado.onde} />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {ficha.notasDosAchadosHtml && <Html className="prosa" html={ficha.notasDosAchadosHtml} />}
        </section>

        {ficha.outrasSecoes.map((secao, i) => (
          <section key={secao.titulo} className="secao" aria-labelledby={`secao-${i}`}>
            <h2 id={`secao-${i}`} className="headline">
              {secao.titulo}
            </h2>
            <Html className="prosa" html={secao.html} />
          </section>
        ))}

        <section className="secao" aria-labelledby="limitacoes">
          <h2 id="limitacoes" className="headline">
            Limitações
          </h2>
          <Html className="prosa limites" html={ficha.limitacoesHtml} />
        </section>

        <section className="secao" aria-labelledby="citada-em">
          <h2 id="citada-em" className="headline">
            Citada em
          </h2>
          {ficha.citadaEm.guias.length === 0 && ficha.citadaEm.dicas.length === 0 ? (
            <p className="secundario">Nenhum Guia nem Dica publicada cita esta Ficha ainda.</p>
          ) : (
            <>
              {ficha.citadaEm.guias.length > 0 && (
                <>
                  <h3 className="title citada-subtitulo">Guias</h3>
                  <ul className="linhas-pergunta">
                    {ficha.citadaEm.guias.map((guia) => (
                      <li key={guia.slug}>
                        <LinhaDePergunta guia={guia} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {ficha.citadaEm.dicas.length > 0 && (
                <>
                  <h3 className="title citada-subtitulo">Dicas</h3>
                  <ul className="dicas-que-citam">
                    {ficha.citadaEm.dicas.map((dica) => (
                      <li key={dica.slug}>
                        <Link to="/dicas/$slug" params={{ slug: dica.slug }}>
                          {dica.texto}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </section>

        <section className="secao" aria-labelledby="como-ler">
          <h2 id="como-ler" className="headline">
            Como ler
          </h2>
          <LegendaDasFichas />
        </section>
      </div>
    </main>
  )
}

function FichaNaoExiste() {
  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">Essa Ficha não existe</h1>
        <p className="lead">
          O endereço pode ter mudado. <Link to="/estudos">Veja todos os estudos</Link>.
        </p>
      </div>
    </main>
  )
}
