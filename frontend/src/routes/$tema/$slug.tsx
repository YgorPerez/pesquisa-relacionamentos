import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { leituras } from '#/conteudo/leituras'
import { ConfiancaDaResposta, FichasCitadas, Html } from '#/ui/guia'
import { LinhaDePergunta } from '#/ui/linha-da-pergunta'
import {
  usePontoNoHistorico,
  useReferencias,
  VoltarParaGuia,
} from '#/ui/navegacao'
import { Coluna, Display, Folha, Lead } from '#/ui/folha'
import { Headline, Painel, Secao } from '#/ui/secao'
import {
  AvisoSemDado,
  CaixaDoPerfil,
  LinkDoPerfil,
  ParaOSeuPerfil,
} from '#/ui/perfil'
import { usePerfilNoGuia } from '#/estado/perfil-no-guia'
import { usePrioridades } from '#/estado/prioridades'
import type { PrioridadesVista } from '#/conteudo/vista-prioridades'
import { CartaoDePrioridades } from '#/ui/prioridades'
import {
  DicasDoGuia,
  Evidencia,
  Mitos,
  SetaDasFontes,
} from '#/ui/secoes-do-guia'
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
  // O `loaderData` leva só o que o `head` e a etiqueta do Tema no topo
  // (`ui/topo.tsx`) usam; o Guia vai pelo `queryClient`.
  loader: async ({ context, params }) => {
    const { busca, tema, temaTitulo } = await context.queryClient.query(
      leituras.guia(params.tema, params.slug),
    )
    return { busca, tema, temaTitulo }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] }
    const { busca } = loaderData
    // A prévia do link repete o título e a descrição de busca; a imagem é a
    // fixa do site, da raiz.
    return {
      meta: [
        { title: `${busca.titulo} · Tem estudo?` },
        { name: 'description', content: busca.descricao },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: busca.titulo },
        { property: 'og:description', content: busca.descricao },
      ],
    }
  },
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

/** O Guia do endereço, que o loader já pôs no `queryClient`: cada seção da
 * página o lê de lá, sem pedir de novo. */
function useGuia() {
  const { tema, slug } = Route.useParams()
  return useSuspenseQuery(leituras.guia(tema, slug)).data
}

function PaginaDoGuia() {
  const guia = useGuia()
  const { circulada, voltarAoTexto } = useReferencias(guia.slug)
  usePontoNoHistorico()
  useContarFichasAbertas(guia.slug)
  const { perfil, noGuia } = usePerfilNoGuia(guia)

  return (
    <Folha>
      <Coluna>
        <VoltarParaGuia />
        {perfil && noGuia?.comDado === 0 && <AvisoSemDado perfil={perfil} />}
        <Display>
          <Html como="span" html={guia.perguntaHtml} />
        </Display>

        <RespostaCurta noGuia={noGuia} />

        <SetaDasFontes />

        <LinkDoPerfil perfil={perfil} />

        {guia.dicas.length > 0 && (
          <DicasDoGuia dicas={guia.dicas} vereditos={noGuia?.dicas} />
        )}

        {guia.prioridades && <CartaoDoB1 prioridades={guia.prioridades} />}
        {guia.grupoPossivel && <CartaoDoB5 perfil={perfil} />}

        <Evidencia guia={guia} vereditos={noGuia?.achados} />

        <VariaConformeOPerfil perfil={perfil} comDado={noGuia?.comDado} />

        {guia.mitos.length > 0 && <Mitos mitos={guia.mitos} />}

        <Secao aria-labelledby="t-limitacoes">
          <Headline id="t-limitacoes">Limitações e o que não se sabe</Headline>
          <Html className="prosa limites" html={guia.limitacoesHtml} />
        </Secao>

        <FichasDoGuia circulada={circulada} voltarAoTexto={voltarAoTexto} />

        <Ajudou key={guia.slug} guia={guia.slug} />

        {guia.relacionadas.length > 0 && <PerguntasRelacionadas />}

        <Compartilhar
          semTitulo
          frase="O link leva só o endereço do Guia, sem o seu Perfil."
        />
      </Coluna>
    </Folha>
  )
}

/** A resposta curta, com a Confiança e, com Perfil, a linha "Para o seu
 * Perfil". */
function RespostaCurta({
  noGuia,
}: {
  noGuia: ReturnType<typeof usePerfilNoGuia>['noGuia']
}) {
  const guia = useGuia()
  return (
    <Painel
      como="section"
      className="mb-2 [&>p]:m-0 [&>p]:mt-xs"
      aria-labelledby="t-resposta"
    >
      <h2 id="t-resposta" className="sr-only">
        Resposta curta
      </h2>
      <ConfiancaDaResposta confianca={guia.confianca} />
      <Html className="prosa text-lead" html={guia.respostaHtml} />
      {noGuia && <ParaOSeuPerfil chave={noGuia.chave} achados={guia.achados} />}
    </Painel>
  )
}

/** "Varia conforme o Perfil?": o texto do Guia e a caixa do Perfil, com
 * quantos achados têm dado para ele (`comDado`, só com Perfil). */
function VariaConformeOPerfil({
  perfil,
  comDado,
}: {
  perfil: Perfil | null
  comDado: number | undefined
}) {
  const guia = useGuia()
  return (
    <Secao id="perfil" aria-labelledby="t-perfil">
      <Headline id="t-perfil">Varia conforme o Perfil?</Headline>
      <Html className="prosa" html={guia.perfilHtml} />
      <CaixaDoPerfil
        perfil={perfil}
        comDado={comDado ?? null}
        totalDeAchados={guia.achados.length}
      />
    </Secao>
  )
}

/** "Fichas citadas": a lista numerada, com a ida e a volta entre o número
 * no texto e a Ficha. */
function FichasDoGuia({
  circulada,
  voltarAoTexto,
}: Pick<ReturnType<typeof useReferencias>, 'circulada' | 'voltarAoTexto'>) {
  const guia = useGuia()
  return (
    <Secao id="fichas" aria-labelledby="t-fichas">
      <Headline id="t-fichas">Fichas citadas</Headline>
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
  )
}

/** As outras Perguntas do Tema, cada uma na linha dela. */
function PerguntasRelacionadas() {
  const guia = useGuia()
  return (
    <Secao aria-labelledby="t-relacionadas">
      <Headline id="t-relacionadas">Perguntas relacionadas</Headline>
      <ul className="isolate m-0 list-none p-0">
        {guia.relacionadas.map((outro) => (
          <li key={outro.slug} className="not-first:mt-md">
            <LinhaDePergunta guia={outro} de={guia.pergunta} />
          </li>
        ))}
      </ul>
    </Secao>
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
