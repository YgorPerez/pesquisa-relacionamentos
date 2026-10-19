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
import { fraseDoLink, lerLink, previaDePrioridades, queryDoLink, type EstadoDoLink } from '@tem-estudo/regras/link'
import { useCallback, useMemo, useState } from 'react'
import { buscarPrioridades } from '#/conteudo/guias'
import { metaDaPrevia } from '#/conteudo/previa'
import type { PrioridadesVista } from '#/conteudo/vista-prioridades'
import { useLinkRecebido } from '#/estado/link'
import { gravarPerfil, usePerfil } from '#/estado/perfil'
import { AVISO_DA_CONTAGEM, Compartilhar } from '#/ui/compartilhar'
import { gravarPrioridades, usePrioridades } from '#/estado/prioridades'
import { contarUmaVezPorVisita } from '#/analytics/contagem'
import { ConfiancaDaResposta } from '#/ui/guia'
import {
  AlertaDoTopo3,
  BarraDaSatisfacao,
  EscolhaDoTopo3,
  Estante,
  SeletorDeDesfecho,
} from '#/ui/prioridades'

export const Route = createFileRoute('/prioridades')({
  loader: async ({ location }) => {
    const vista = await buscarPrioridades()
    // A prévia do link, para o robô da rede social: o topo 3 e o alerta,
    // sem o Perfil. Só no servidor; no navegador ela não serve a ninguém.
    const estado = vista && typeof window === 'undefined' ? lerLink('prioridades', location.searchStr, idsDe(vista)) : null
    const previa = estado?.calculadora === 'prioridades' ? previaDePrioridades(vista!.caracteristicas, estado.prioridades) : null
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

const idsDe = (vista: PrioridadesVista) => vista.caracteristicas.map((c) => c.id)

function PaginaDePrioridades() {
  const { vista } = Route.useLoaderData()
  return (
    <main className="folha">
      <div className="coluna">
        <h1 className="display">
          O que você <span className="marca-texto">valoriza</span> pesa mesmo?
        </h1>
        {vista ? (
          <Calculadora vista={vista} />
        ) : (
          <p className="aviso">
            Esta conta entra no ar quando os estudos que ela usa forem conferidos na fonte. Enquanto isso,{' '}
            <Link to="/estudos">veja os estudos do acervo</Link>.
          </p>
        )}
      </div>
    </main>
  )
}

function Calculadora({ vista }: { vista: PrioridadesVista }) {
  const { caracteristicas } = vista
  const ids = useMemo(() => idsDe(vista), [vista])
  const aplicarLink = useCallback(
    (query: string) => {
      const link = lerLink('prioridades', query, ids)
      if (link?.calculadora !== 'prioridades') return false
      gravarPerfil(link.perfil)
      gravarPrioridades(link.prioridades)
      return true
    },
    [ids],
  )
  const trocou = useLinkRecebido(aplicarLink)
  const estado = usePrioridades(ids)
  const perfil = usePerfil()
  const genero = perfil?.genero
  const [aberta, setAberta] = useState<string | null>(null)
  const { topo3, desfecho } = estado
  const link: EstadoDoLink = { calculadora: 'prioridades', perfil, prioridades: estado }
  const nomes = Object.fromEntries(caracteristicas.map((c) => [c.id, c.nome]))

  const mexer = (novo: typeof estado) => {
    gravarPrioridades(novo)
    contarUmaVezPorVisita('calculadora/prioridades')
  }
  const tocar = (id: string) => mexer({ ...estado, topo3: alternarNoTopo3(topo3, id) })
  const escolherDesfecho = (d: Desfecho) => mexer({ ...estado, desfecho: d })

  return (
    <>
      <p className="lead">
        Das dez, quais são as três que mais importam para você num parceiro? Toque nelas na ordem.
      </p>
      {trocou && (
        <p className="aviso" role="status">
          Este link trocou o seu Perfil e o seu topo 3 salvos pelos de quem mandou.
        </p>
      )}

      <EscolhaDoTopo3 caracteristicas={caracteristicas} topo3={topo3} aoTocar={tocar} />

      <div className="desfecho-preso">
        <SeletorDeDesfecho desfecho={desfecho} aoEscolher={escolherDesfecho} />
      </div>

      {desfecho === 'satisfacao' && (
        <details className="dobra" id="antes-da-lista" open>
          <summary>
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 2.5l6.5 5.6L4 13.6" />
            </svg>
            Antes: o parceiro explica pouco da satisfação
          </summary>
          <BarraDaSatisfacao barra={vista.barra} />
        </details>
      )}

      <AlertaDoTopo3 frase={alertaDoTopo3(caracteristicas, topo3, desfecho)} />

      <section aria-labelledby="t-estante">
        <h2 id="t-estante" className="visualmente-oculto">
          Onde a evidência põe cada uma, para {NOME_DO_DESFECHO[desfecho].toLowerCase()}
        </h2>
        <Estante
          caracteristicas={caracteristicas}
          desfecho={desfecho}
          topo3={topo3}
          aberta={aberta}
          aoAbrir={setAberta}
          genero={genero}
        />
        <p className="dica-estante">Toque numa característica para ver o estudo.</p>
      </section>

      <p className="aviso" role="note">
        Nenhum destes estudos é brasileiro: vêm dos EUA, da Europa e da Austrália, e um cobre 43 países. Quase
        todos são de casais homem-mulher.
      </p>

      <Compartilhar query={queryDoLink(link)} frase={fraseDoLink(link, { nomes })} aviso={AVISO_DA_CONTAGEM} />

      {vista.doGuia && (
        <section className="secao do-guia" aria-labelledby="t-do-guia">
          <h2 id="t-do-guia" className="headline">
            Do Guia
          </h2>
          <div className="painel com-reticula">
            <p className="rotulo-calculadora">{vista.doGuia.pergunta}</p>
            <ConfiancaDaResposta confianca={vista.doGuia.confianca} />
            <p className="resposta">{vista.doGuia.resposta}</p>
            <p>
              <Link
                to="/$tema/$slug"
                params={{ tema: vista.doGuia.tema, slug: vista.doGuia.slug }}
                className="link-forte"
              >
                Ler o Guia inteiro
              </Link>
            </p>
          </div>
        </section>
      )}
    </>
  )
}
