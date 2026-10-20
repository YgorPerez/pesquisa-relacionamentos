// /prioridades (variante A da segunda rodada do #19): o visitante toca nas três
// características que mais importam, escolhe o desfecho e vê em que
// prateleira a evidência põe cada uma.
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ProfileGender } from '@tem-estudo/rules/profile'
import {
  OUTCOME_NAME,
  top3Alert,
  toggleInTop3,
  type PrioritiesState,
} from '@tem-estudo/rules/priorities'
import {
  linkSentence,
  readLink,
  prioritiesPreview,
  linkQuery,
  type LinkState,
} from '@tem-estudo/rules/link'
import { useMemo, useState } from 'react'
import { leituras } from '#/conteudo/leituras'
import { metaDaPrevia } from '#/conteudo/previa'
import type { PrioridadesVista } from '#/conteudo/vista-prioridades'
import { useLinkRecebido } from '#/estado/link'
import { usePerfil } from '#/estado/perfil'
import { Compartilhar } from '#/ui/compartilhar'
import { AVISO_DA_CONTAGEM } from '#/ui/compartilhar.textos'
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
import { Coluna, Display, Folha, Lead } from '#/ui/folha'
import { Aviso, Headline, Painel, Secao } from '#/ui/secao'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/shadcn/collapsible'

export const Route = createFileRoute('/prioridades')({
  loader: async ({ context, location }) => {
    const vista = await context.queryClient.query(leituras.prioridades())
    // A prévia do link, para o robô da rede social: o topo 3 e o alerta,
    // sem o Perfil. Só no servidor; no navegador ela não serve a ninguém.
    // Ela fica no `loaderData`, que só o `head` lê; a vista vai pelo
    // `queryClient`.
    const estado =
      vista && typeof window === 'undefined'
        ? readLink('prioridades', location.searchStr, idsDe(vista))
        : null
    const previa =
      estado?.calculator === 'prioridades'
        ? prioritiesPreview(vista!.caracteristicas, estado.priorities)
        : null
    return { previa }
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
  const { data: vista } = useSuspenseQuery(leituras.prioridades())
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

/** Toda mudança do visitante nas Prioridades passa aqui, e conta o uso. */
function gravarEContar(novo: PrioritiesState) {
  gravarPrioridades(novo)
  contarUsoDaCalculadora('prioridades')
}

function Calculadora({ vista }: { vista: PrioridadesVista }) {
  const { caracteristicas } = vista
  const ids = useMemo(() => idsDe(vista), [vista])
  const recebido = useLinkRecebido('prioridades', ids)
  const estado = usePrioridades(ids)
  const genero = usePerfil()?.genero
  const { topo3, desfecho } = estado

  return (
    <>
      <Lead>
        Das dez, quais são as três que mais importam para você num parceiro?
        Toque nelas na ordem.
      </Lead>
      <AvisoDoLink recebido={recebido} />

      <EscolhaDoTopo3
        caracteristicas={caracteristicas}
        topo3={topo3}
        aoTocar={(id) =>
          gravarEContar({ ...estado, topo3: toggleInTop3(topo3, id) })
        }
      />

      <div
        className="sticky top-0 z-5 -mx-md mt-lg mb-0 border-b-2 border-tinta bg-papel px-md py-2.5 folha:-mx-16 folha:px-16"
        data-slot="desfecho-preso"
      >
        <SeletorDeDesfecho
          desfecho={desfecho}
          aoEscolher={(d) => gravarEContar({ ...estado, desfecho: d })}
        />
      </div>

      {desfecho === 'satisfacao' && <AntesDaLista barra={vista.barra} />}

      <AlertaDoTopo3 frase={top3Alert(caracteristicas, topo3, desfecho)} />

      <OndeAEvidenciaPoe
        caracteristicas={caracteristicas}
        estado={estado}
        genero={genero}
      />

      <Aviso role="note">
        Nenhum destes estudos é brasileiro: vêm dos EUA, da Europa e da
        Austrália, e um cobre 43 países. Quase todos são de casais homem-mulher.
      </Aviso>

      <CompartilharAsPrioridades
        caracteristicas={caracteristicas}
        estado={estado}
        genero={genero}
      />

      {vista.doGuia && <DoGuia guia={vista.doGuia} />}
    </>
  )
}

/** O aviso de que um link recebido trocou o topo 3 salvo (e, se ele trouxe,
 * o gênero do Perfil). Sem link, nada. */
function AvisoDoLink({ recebido }: { recebido: LinkState | null }) {
  if (!recebido) return null
  const trocouGenero =
    recebido.calculator === 'prioridades' && recebido.gender !== null
  return (
    <Aviso role="status">
      {trocouGenero
        ? 'Este link trocou o seu topo 3 e o gênero do seu Perfil pelos de quem mandou.'
        : 'Este link trocou o seu topo 3 salvo pelo de quem mandou.'}
    </Aviso>
  )
}

/** "Antes: o parceiro explica pouco da satisfação", aberto, com a barra. */
function AntesDaLista({ barra }: { barra: PrioridadesVista['barra'] }) {
  return (
    <Collapsible id="antes-da-lista" defaultOpen className="mt-md">
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
        <BarraDaSatisfacao barra={barra} />
      </CollapsibleContent>
    </Collapsible>
  )
}

/** A estante: em que prateleira a evidência põe cada característica, para o
 * desfecho escolhido. Uma característica por vez fica aberta. */
function OndeAEvidenciaPoe({
  caracteristicas,
  estado: { topo3, desfecho },
  genero,
}: {
  caracteristicas: PrioridadesVista['caracteristicas']
  estado: PrioritiesState
  genero: ProfileGender | undefined
}) {
  const [aberta, setAberta] = useState<string | null>(null)
  return (
    <section aria-labelledby="t-estante">
      <h2 id="t-estante" className="sr-only">
        Onde a evidência põe cada uma, para{' '}
        {OUTCOME_NAME[desfecho].toLowerCase()}
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
  )
}

/** O "Copiar link" das Prioridades: o topo 3, o desfecho e o gênero. */
function CompartilharAsPrioridades({
  caracteristicas,
  estado,
  genero,
}: {
  caracteristicas: PrioridadesVista['caracteristicas']
  estado: PrioritiesState
  genero: ProfileGender | undefined
}) {
  const link: LinkState = {
    calculator: 'prioridades',
    gender: genero ?? null,
    priorities: estado,
  }
  const nomes = Object.fromEntries(caracteristicas.map((c) => [c.id, c.nome]))
  return (
    <Compartilhar
      query={linkQuery(link)}
      frase={linkSentence(link, { names: nomes })}
      aviso={AVISO_DA_CONTAGEM}
    />
  )
}

/** O bloco "Do Guia": a Pergunta que hospeda a calculadora e a resposta curta. */
function DoGuia({ guia }: { guia: NonNullable<PrioridadesVista['doGuia']> }) {
  return (
    <Secao aria-labelledby="t-do-guia">
      <Headline id="t-do-guia">Do Guia</Headline>
      <Painel className="[&>p]:m-0 [&>p]:mt-xs [&>p:first-child]:mt-0 [&>p:first-child]:mb-sm">
        <p className="font-title text-title leading-body font-bold tracking-normal text-tinta">
          {guia.pergunta}
        </p>
        <ConfiancaDaResposta confianca={guia.confianca} />
        <p className="text-lead">{guia.resposta}</p>
        <p>
          <Link
            to="/$tema/$slug"
            params={{ tema: guia.tema, slug: guia.slug }}
            className="inline-flex min-h-toque items-center font-bold"
          >
            Ler o Guia inteiro
          </Link>
        </p>
      </Painel>
    </Secao>
  )
}
