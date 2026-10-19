// /prioridades (variante A da segunda rodada do #19): o visitante toca nas três
// características que mais importam, escolhe o desfecho e vê em que
// prateleira a evidência põe cada uma.
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  NOME_DO_DESFECHO,
  alertaDoTopo3,
  alternarNoTopo3,
  type Desfecho,
} from '@tem-estudo/regras/prioridades'
import {
  fraseDoLink,
  lerLink,
  previaDePrioridades,
  queryDoLink,
  type EstadoDoLink,
} from '@tem-estudo/regras/link'
import { useMemo, useState } from 'react'
import { buscarPrioridades } from '#/conteudo/guias'
import { metaDaPrevia } from '#/conteudo/previa'
import type { PrioridadesVista } from '#/conteudo/vista-prioridades'
import { useLinkRecebido } from '#/estado/link'
import { usePerfil } from '#/estado/perfil'
import { AVISO_DA_CONTAGEM, Compartilhar } from '#/ui/compartilhar'
import { gravarPrioridades, usePrioridades } from '#/estado/prioridades'
import { contarUsoDaCalculadora } from '#/analytics/contagem'
import { ConfiancaDaResposta } from '#/ui/guia'
import {
  AlertaDoTopo3,
  BarraDaSatisfacao,
  EscolhaDoTopo3,
  Estante,
  SeletorDeDesfecho,
} from '#/ui/prioridades'
import {
  Aviso,
  Coluna,
  Display,
  Folha,
  Headline,
  Lead,
  Secao,
} from '#/ui/pagina'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/shadcn/collapsible'

export const Route = createFileRoute('/prioridades')({
  loader: async ({ location }) => {
    const vista = await buscarPrioridades()
    // A prévia do link, para o robô da rede social: o topo 3 e o alerta,
    // sem o Perfil. Só no servidor; no navegador ela não serve a ninguém.
    const estado =
      vista && typeof window === 'undefined'
        ? lerLink('prioridades', location.searchStr, idsDe(vista))
        : null
    const previa =
      estado?.calculadora === 'prioridades'
        ? previaDePrioridades(vista!.caracteristicas, estado.prioridades)
        : null
    return { vista, previa }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: 'Prioridades vs. evidência · Tem estudo?' },
      {
        name: 'description',
        content:
          'Toque nas três características que mais importam para você num parceiro e veja quanto a evidência põe em cada uma.',
      },
      ...metaDaPrevia(loaderData?.previa ?? null),
    ],
  }),
  component: PaginaDePrioridades,
})

const idsDe = (vista: PrioridadesVista) =>
  vista.caracteristicas.map((c) => c.id)

function PaginaDePrioridades() {
  const { vista } = Route.useLoaderData()
  return (
    <Folha>
      <Coluna>
        <Display>
          O que você <span className="marca-texto">valoriza</span> pesa mesmo?
        </Display>
        {vista ? (
          <Calculadora vista={vista} />
        ) : (
          <Aviso>
            Esta conta entra no ar quando os estudos que ela usa forem
            conferidos na fonte. Enquanto isso,{' '}
            <Link to="/estudos">veja os estudos do acervo</Link>.
          </Aviso>
        )}
      </Coluna>
    </Folha>
  )
}

function Calculadora({ vista }: { vista: PrioridadesVista }) {
  const { caracteristicas } = vista
  const ids = useMemo(() => idsDe(vista), [vista])
  const recebido = useLinkRecebido('prioridades', ids)
  const trocou = recebido !== null
  const trocouGenero =
    recebido?.calculadora === 'prioridades' && recebido.genero !== null
  const estado = usePrioridades(ids)
  const perfil = usePerfil()
  const genero = perfil?.genero
  const [aberta, setAberta] = useState<string | null>(null)
  const { topo3, desfecho } = estado
  const link: EstadoDoLink = {
    calculadora: 'prioridades',
    genero: genero ?? null,
    prioridades: estado,
  }
  const nomes = Object.fromEntries(caracteristicas.map((c) => [c.id, c.nome]))

  const mexer = (novo: typeof estado) => {
    gravarPrioridades(novo)
    contarUsoDaCalculadora('prioridades')
  }
  const tocar = (id: string) =>
    mexer({ ...estado, topo3: alternarNoTopo3(topo3, id) })
  const escolherDesfecho = (d: Desfecho) => mexer({ ...estado, desfecho: d })

  return (
    <>
      <Lead>
        Das dez, quais são as três que mais importam para você num parceiro?
        Toque nelas na ordem.
      </Lead>
      {trocou && (
        <Aviso role="status">
          {trocouGenero
            ? 'Este link trocou o seu topo 3 e o gênero do seu Perfil pelos de quem mandou.'
            : 'Este link trocou o seu topo 3 salvo pelo de quem mandou.'}
        </Aviso>
      )}

      <EscolhaDoTopo3
        caracteristicas={caracteristicas}
        topo3={topo3}
        aoTocar={tocar}
      />

      <div
        className="sticky top-0 z-5 -mx-md mt-lg mb-0 border-b-2 border-tinta bg-papel px-md py-2.5 folha:-mx-16 folha:px-16"
        data-slot="desfecho-preso"
      >
        <SeletorDeDesfecho desfecho={desfecho} aoEscolher={escolherDesfecho} />
      </div>

      {desfecho === 'satisfacao' && (
        <Collapsible
          id="antes-da-lista"
          defaultOpen
          className="mt-md"
        >
          <CollapsibleTrigger>
            <svg
              className="flex-none transition-transform duration-250 ease-sai group-data-panel-open:rotate-90 motion-reduce:transition-none"
              width="14"
              height="16"
              viewBox="0 0 14 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 2.5l6.5 5.6L4 13.6" />
            </svg>
            Antes: o parceiro explica pouco da satisfação
          </CollapsibleTrigger>
          <CollapsibleContent>
            <BarraDaSatisfacao barra={vista.barra} />
          </CollapsibleContent>
        </Collapsible>
      )}

      <AlertaDoTopo3 frase={alertaDoTopo3(caracteristicas, topo3, desfecho)} />

      <section aria-labelledby="t-estante">
        <h2 id="t-estante" className="sr-only">
          Onde a evidência põe cada uma, para{' '}
          {NOME_DO_DESFECHO[desfecho].toLowerCase()}
        </h2>
        <Estante
          caracteristicas={caracteristicas}
          desfecho={desfecho}
          topo3={topo3}
          aberta={aberta}
          aoAbrir={setAberta}
          genero={genero}
        />
        <p className="mx-0 mt-sm mb-lg text-nota text-tinta-2">
          Toque numa característica para ver o estudo.
        </p>
      </section>

      <Aviso role="note">
        Nenhum destes estudos é brasileiro: vêm dos EUA, da Europa e da
        Austrália, e um cobre 43 países. Quase todos são de casais homem-mulher.
      </Aviso>

      <Compartilhar
        query={queryDoLink(link)}
        frase={fraseDoLink(link, { nomes })}
        aviso={AVISO_DA_CONTAGEM}
      />

      {vista.doGuia && (
        <Secao aria-labelledby="t-do-guia">
          <Headline id="t-do-guia">Do Guia</Headline>
          <div className="reticula rounded-mao border-2 border-tinta bg-folha px-md pt-md pb-4 [&>p]:m-0 [&>p]:mt-xs [&>p:first-child]:mt-0 [&>p:first-child]:mb-sm">
            <p className="font-title text-title leading-body font-bold tracking-normal text-tinta">
              {vista.doGuia.pergunta}
            </p>
            <ConfiancaDaResposta confianca={vista.doGuia.confianca} />
            <p className="text-lead">{vista.doGuia.resposta}</p>
            <p>
              <Link
                to="/$tema/$slug"
                params={{ tema: vista.doGuia.tema, slug: vista.doGuia.slug }}
                className="inline-flex min-h-toque items-center font-bold"
              >
                Ler o Guia inteiro
              </Link>
            </p>
          </div>
        </Secao>
      )}
    </>
  )
}
