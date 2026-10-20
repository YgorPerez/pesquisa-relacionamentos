import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { leituras } from '#/conteudo/leituras'
import { Html } from '#/ui/guia'
import { LinhaDePergunta } from '#/ui/linha-da-pergunta'
import { LinkDeVoltar } from '#/ui/navegacao'
import { Coluna, Display, Folha, Lead } from '#/ui/folha'
import { Aviso, Headline, Secao } from '#/ui/secao'
import {
  ForcaDaEvidencia,
  LegendaDasFichas,
  StatusDeVerificacao,
  MetaDaFicha,
} from '#/ui/selos'
import { PALAVRA_DO_DESENHO } from '#/ui/selos.textos'

export const Route = createFileRoute('/estudos/$slug')({
  // O `loaderData` leva só o que o `head` usa; a Ficha vai pelo `queryClient`.
  loader: async ({ context, params }) => {
    const { busca, indexar } = await context.queryClient.query(
      leituras.ficha(params.slug),
    )
    return { busca, indexar }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.busca.title} · Tem estudo?` },
          { name: 'description', content: loaderData.busca.description },
          // Ficha ⬜ fica fora da busca até ser conferida (#15).
          ...(loaderData.indexar
            ? []
            : [{ name: 'robots', content: 'noindex' }]),
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

/** Uma linha dos dados da Ficha, com o fio pontilhado em cima. */
function Dado({
  titulo,
  children,
}: {
  titulo: ReactNode
  children: ReactNode
}) {
  return (
    <div className="border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-3 first:border-t-0 first:pt-0">
      <dt className="font-label text-label leading-body text-tinta-2">
        {titulo}
      </dt>
      <dd className="m-0 mt-0.5 wrap-anywhere">{children}</dd>
    </div>
  )
}

/** A Ficha do endereço, que o loader já pôs no `queryClient`: cada seção da
 * página a lê de lá, sem pedir de novo. */
function useFicha() {
  return useSuspenseQuery(leituras.ficha(Route.useParams().slug)).data
}

function PaginaDaFicha() {
  const ficha = useFicha()
  const naoVerificada = ficha.status === 'nao-verificado'

  return (
    <Folha>
      <Coluna>
        <LinkDeVoltar to="/estudos">Todos os estudos</LinkDeVoltar>

        {naoVerificada && (
          <Aviso role="note">
            <strong>Ficha não verificada.</strong> Os números abaixo ainda não
            foram conferidos no texto original. Ela não sustenta nenhum Guia até
            ser refeita com a fonte aberta.
          </Aviso>
        )}

        <Display ficha>{ficha.titulo}</Display>

        <MetaDaFicha grande>
          <StatusDeVerificacao status={ficha.status} />
          <ForcaDaEvidencia forca={ficha.forca} rotulo />
        </MetaDaFicha>

        <DadosDaFicha />

        <Secao aria-labelledby="o-que-mediu">
          <Headline id="o-que-mediu">O que mediu</Headline>
          <Html className="prosa" html={ficha.oQueMediuHtml} />
        </Secao>

        <Achados />

        {ficha.outrasSecoes.map((secao, i) => (
          <Secao key={secao.titulo} aria-labelledby={`secao-${i}`}>
            <Headline id={`secao-${i}`}>{secao.titulo}</Headline>
            <Html className="prosa" html={secao.html} />
          </Secao>
        ))}

        <Secao aria-labelledby="limitacoes">
          <Headline id="limitacoes">Limitações</Headline>
          <Html className="prosa limites" html={ficha.limitacoesHtml} />
        </Secao>

        <QuemCita />

        <Secao aria-labelledby="como-ler">
          <Headline id="como-ler">Como ler</Headline>
          <LegendaDasFichas />
        </Secao>
      </Coluna>
    </Folha>
  )
}

/** Os dados da Ficha, um por linha: de onde veio, como foi conferida, a
 * amostra, o desenho e quem pagou. */
function DadosDaFicha() {
  const ficha = useFicha()
  return (
    <dl className="m-0" data-slot="ficha-dados">
      <Dado titulo="Referência">
        <Html como="span" html={ficha.referenciaHtml} />{' '}
        <a
          href={ficha.link}
          className="flex min-h-toque w-fit items-center font-bold text-agua-tinta decoration-agua-tinta hover:bg-agua-fonte hover:text-tinta"
          rel="noopener"
          target="_blank"
        >
          Abrir o estudo
          <span className="sr-only"> (abre em outra aba)</span>
        </a>
      </Dado>
      <Dado titulo="Verificação">
        {ficha.verificadoEm
          ? `${ficha.status === 'ok' ? 'Lido no original' : 'Conferido em parte'} em ${data(ficha.verificadoEm)}.`
          : 'Ainda não conferida na fonte.'}
      </Dado>
      <Dado titulo={`Por que ${ficha.forca}`}>{ficha.forcaPorque}</Dado>
      <Dado titulo="Amostra">
        {ficha.n !== null && <strong>{numero.format(ficha.n)}. </strong>}
        <Html como="span" html={ficha.amostraHtml} />{' '}
        {ficha.representativa
          ? 'Representativa da população.'
          : 'Não é representativa da população.'}
      </Dado>
      <Dado titulo="Desenho">{PALAVRA_DO_DESENHO[ficha.desenho]}</Dado>
      <Dado titulo="País e período">
        {ficha.paises.length > 0
          ? ficha.paises.join(', ')
          : 'País não informado'}{' '}
        · {ficha.periodo}
      </Dado>
      <Dado titulo="Financiamento e conflito de interesse">
        {ficha.conflitoHtml ? (
          <Html como="span" html={ficha.conflitoHtml} />
        ) : (
          'Não declarado.'
        )}
      </Dado>
      {ficha.licenca && <Dado titulo="Licença">{ficha.licenca}</Dado>}
    </dl>
  )
}

/** Os Achados, cada um com o número, a medida e o Trecho do original, e as
 * notas deles embaixo. */
function Achados() {
  const { achados, notasDosAchadosHtml: notasHtml } = useFicha()
  return (
    <Secao aria-labelledby="achados">
      <Headline id="achados">Achados</Headline>
      <ol className="m-0 mb-md list-none p-0" data-slot="achados">
        {achados.map((achado) => (
          <li
            key={`${achado.medida}|${achado.valor}|${achado.onde}`}
            className="grid grid-cols-[minmax(64px,max-content)_1fr] gap-sm border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-4 first:border-t-0 first:pt-0.5 estreito:grid-cols-1 estreito:gap-0.5"
          >
            <Html
              className="max-w-38 font-title text-title leading-title font-bold tracking-normal wrap-anywhere estreito:max-w-none"
              html={achado.valor}
            />
            <div>
              <Html como="span" className="block" html={achado.medida} />
              {achado.trecho ? (
                <blockquote className="m-0 mt-xs border-l-2 border-agua-tinta pl-3 italic">
                  <Html como="span" html={achado.trecho} />
                </blockquote>
              ) : (
                <p className="m-0 mt-xs text-nota text-tinta-2">
                  Trecho do original ainda não conferido.
                </p>
              )}
              {achado.onde && achado.onde !== '—' && (
                <p className="m-0 mt-xs text-nota text-tinta-2">
                  Onde: <Html como="span" html={achado.onde} />
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {notasHtml && <Html className="prosa" html={notasHtml} />}
    </Secao>
  )
}

/** Os Guias e as Dicas publicadas que citam a Ficha. */
function QuemCita() {
  const { citadaEm } = useFicha()
  return (
    <Secao aria-labelledby="citada-em">
      <Headline id="citada-em">Citada em</Headline>
      {citadaEm.guias.length === 0 && citadaEm.dicas.length === 0 ? (
        <p className="text-tinta-2">
          Nenhum Guia nem Dica publicada cita esta Ficha ainda.
        </p>
      ) : (
        <>
          {citadaEm.guias.length > 0 && (
            <>
              <h3 className="mx-0 mt-md mb-sm font-title text-title">Guias</h3>
              <ul className="isolate m-0 list-none p-0">
                {citadaEm.guias.map((guia) => (
                  <li key={guia.slug} className="not-first:mt-md">
                    <LinhaDePergunta guia={guia} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {citadaEm.dicas.length > 0 && (
            <>
              <h3 className="mx-0 mt-md mb-sm font-title text-title">Dicas</h3>
              <ul className="m-0 list-none p-0">
                {citadaEm.dicas.map((dica) => (
                  <li
                    key={dica.slug}
                    className="not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
                  >
                    <Link
                      to="/dicas/$slug"
                      params={{ slug: dica.slug }}
                      className="flex min-h-toque items-center py-2 font-bold decoration-agua-tinta underline-offset-4"
                    >
                      {dica.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Secao>
  )
}

function FichaNaoExiste() {
  return (
    <Folha>
      <Coluna>
        <Display>Essa Ficha não existe</Display>
        <Lead>
          O endereço pode ter mudado.{' '}
          <Link to="/estudos">Veja todos os estudos</Link>.
        </Lead>
      </Coluna>
    </Folha>
  )
}
