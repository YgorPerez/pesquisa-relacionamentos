import { createFileRoute, Link } from '@tanstack/react-router'
import type { Estimativa } from '@tem-estudo/regras/grupo-possivel'
import { formatarQuantidade } from '@tem-estudo/regras/numeros'
import {
  ALTURA_MAXIMA,
  ALTURA_MINIMA,
  CORES,
  ESCOLARIDADES_MINIMAS,
  idadeProcurada,
  IDADE_PROCURADA_MAXIMA,
  IDADE_PROCURADA_MINIMA,
  RELIGIOES,
  RENDAS_MINIMAS,
  REQUISITOS,
  REQUISITOS_PADRAO,
  ROTULO_DA_COR,
  ROTULO_DA_ESCOLARIDADE,
  ROTULO_DA_RELIGIAO,
  ROTULO_DA_RENDA,
  soltar,
  TITULO_DO_REQUISITO,
  UFS,
  valorDoRequisito,
  type RequisitoDoVisitante,
  type Requisitos,
} from '@tem-estudo/regras/requisitos'
import {
  ehLink,
  fraseDoLink,
  queryDoLink,
  type EstadoDoLink,
} from '@tem-estudo/regras/link'
import { useId, useRef, type ReactNode } from 'react'
import { buscarGuiaDaCalculadora } from '#/conteudo/guias'
import { buscarPreviaDoGrupo, metaDaPrevia } from '#/conteudo/previa'
import { useLinkRecebido } from '#/estado/link'
import { AVISO_DA_CONTAGEM, Compartilhar } from '#/ui/compartilhar'
import {
  gravarRequisitos,
  LUGARES_COM_DADOS,
  useGrupoPossivel,
  useRequisitosSalvos,
} from '#/estado/grupo-possivel'
import { usePerfil } from '#/estado/perfil'
import { contarUsoDaCalculadora } from '#/analytics/contagem'
import { Botao } from '#/ui/botao'
import {
  Dobras,
  Faixa,
  LinhaDoRequisito,
  Marcar,
  NumeroPreso,
  Opcoes,
  Passos,
} from '#/ui/grupo-possivel'
import { NOME_DO_ALVO, textoDoCusto } from '#/ui/grupo-possivel.textos'
import { ConfiancaDaResposta } from '#/ui/guia'
import { CaixaDoPerfil } from '#/ui/perfil'
import { cn } from '@/platform/cn'
import {
  Aviso,
  Coluna,
  Display,
  Folha,
  Headline,
  Secao,
} from '#/ui/pagina'

/** A nota miúda embaixo de um controle. */
const DICA = 'm-0 mt-2 text-label leading-nota font-normal text-tinta-2'

/** Enquanto os dados chegam, o número antigo fica, apagado. */
const CARREGANDO =
  'opacity-55 motion-safe:transition-opacity motion-safe:delay-150 motion-safe:duration-200 motion-safe:ease-sai'

export const Route = createFileRoute('/grupo-possivel')({
  loader: async ({ location }) => {
    // A prévia do link só no servidor, para o robô da rede social; no
    // navegador, nada do estado sai do aparelho.
    const comLink = typeof window === 'undefined' && ehLink(location.searchStr)
    const [guia, previa] = await Promise.all([
      buscarGuiaDaCalculadora({ data: 'grupo-possivel' }),
      comLink ? buscarPreviaDoGrupo({ data: location.searchStr }) : null,
    ])
    return { guia, previa }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: 'Grupo possível · Tem estudo?' },
      {
        name: 'description',
        content:
          'Quantas pessoas no Brasil atendem ao que você procura: idade, cidade, escolaridade, renda e outros Requisitos, com o Censo 2022 e a PNS 2019.',
      },
      ...metaDaPrevia(loaderData?.previa ?? null),
    ],
  }),
  component: PaginaDoGrupoPossivel,
})

const qualquer = 'qualquer'

function PaginaDoGrupoPossivel() {
  const { guia } = Route.useLoaderData()
  const trocou = useLinkRecebido('grupo-possivel') !== null
  const perfil = usePerfil()
  const salvos = useRequisitosSalvos()
  const { estimativa, carregando, falhou, tentar, uf } = useGrupoPossivel(
    perfil,
    salvos,
  )
  const r = salvos ?? REQUISITOS_PADRAO
  /** Toda mudança do visitante nos Requisitos passa aqui, e conta o uso. */
  const gravarEContar = (novos: Requisitos) => {
    gravarRequisitos(novos)
    contarUsoDaCalculadora('grupo-possivel')
  }
  const mudar = (mudanca: Partial<Requisitos>) =>
    gravarEContar({ ...r, ...mudanca })
  const idade = idadeProcurada(perfil, r)
  const municipio = r.lugar?.municipio
    ? uf?.municipios.get(r.lugar.municipio)?.nome
    : undefined
  const valor = (k: RequisitoDoVisitante | 'orientacao') =>
    valorDoRequisito(k, perfil, r, municipio)
  const custo = (k: RequisitoDoVisitante) =>
    estimativa.custos.find((c) => c.requisito === k)
  const ligado = (k: RequisitoDoVisitante) => estimativa.ligados.includes(k)
  const { filhos } = estimativa
  const idMotivoFilhos = useId()
  const maisPesa = useRef<HTMLHeadingElement>(null)
  const lugarNome = valor('lugar')
  const link: EstadoDoLink = {
    calculadora: 'grupo-possivel',
    perfil,
    requisitos: salvos,
  }

  const linha = (
    k: RequisitoDoVisitante,
    controle: ReactNode,
    nota?: ReactNode,
  ) => (
    <LinhaDoRequisito
      key={k}
      requisito={k}
      valor={valor(k)}
      custo={custo(k)}
      ligado={ligado(k)}
      nota={nota}
    >
      {controle}
    </LinhaDoRequisito>
  )

  const controles: Record<RequisitoDoVisitante, ReactNode> = {
    idade: linha(
      'idade',
      <div className="flex flex-wrap gap-x-5.5 gap-y-3">
        <Passos
          rotulo="Idade de"
          valor={idade.min}
          min={IDADE_PROCURADA_MINIMA}
          max={IDADE_PROCURADA_MAXIMA}
          unidade={() => 'anos'}
          aoMudar={(min) =>
            mudar({ idade: { min, max: Math.max(min, idade.max) } })
          }
        />
        <Passos
          rotulo="até"
          valor={idade.max}
          min={IDADE_PROCURADA_MINIMA}
          max={IDADE_PROCURADA_MAXIMA}
          unidade={(v) =>
            v >= IDADE_PROCURADA_MAXIMA ? 'anos ou mais' : 'anos'
          }
          aoMudar={(max) =>
            mudar({ idade: { min: Math.min(max, idade.min), max } })
          }
        />
      </div>,
    ),
    lugar: linha(
      'lugar',
      <Lugar requisitos={r} municipios={uf?.municipios} mudar={mudar} />,
    ),
    companheiro: linha(
      'companheiro',
      <Marcar
        rotulo="Só quem não mora com companheiro(a)"
        marcado={r.companheiro}
        aoMudar={(companheiro) => mudar({ companheiro })}
      />,
    ),
    escolaridade: linha(
      'escolaridade',
      <Opcoes
        legenda="Escolaridade mínima"
        tipo="radio"
        valores={[qualquer, ...ESCOLARIDADES_MINIMAS]}
        rotulos={{ qualquer, ...ROTULO_DA_ESCOLARIDADE }}
        marcados={[r.escolaridade ?? qualquer]}
        aoMudar={(v) => mudar({ escolaridade: v === qualquer ? null : v })}
      />,
    ),
    renda: linha(
      'renda',
      <Opcoes
        legenda="Renda mínima"
        tipo="radio"
        valores={[qualquer, ...RENDAS_MINIMAS]}
        rotulos={{ qualquer, ...ROTULO_DA_RENDA }}
        marcados={[r.renda ?? qualquer]}
        aoMudar={(v) => mudar({ renda: v === qualquer ? null : v })}
        dica="Em salários mínimos de julho de 2022 (R$ 1.212)."
      />,
    ),
    cor: linha(
      'cor',
      <Opcoes
        legenda="Cor ou raça"
        tipo="checkbox"
        valores={CORES}
        rotulos={ROTULO_DA_COR}
        marcados={r.cores}
        aoMudar={(v, marcado) =>
          mudar({
            cores: CORES.filter((c) =>
              c === v ? marcado : r.cores.includes(c),
            ),
          })
        }
        dica="Nenhuma marcada é qualquer uma."
      />,
    ),
    religiao: linha(
      'religiao',
      <Opcoes
        legenda="Religião"
        tipo="checkbox"
        valores={RELIGIOES}
        rotulos={ROTULO_DA_RELIGIAO}
        marcados={r.religioes}
        aoMudar={(v, marcado) =>
          mudar({
            religioes: RELIGIOES.filter((c) =>
              c === v ? marcado : r.religioes.includes(c),
            ),
          })
        }
        dica="Nenhuma marcada é qualquer uma."
      />,
    ),
    filhos: linha(
      'filhos',
      <Marcar
        rotulo="Só quem não tem filhos"
        marcado={r.semFilhos && filhos !== 'sem-dado'}
        desabilitado={filhos === 'sem-dado'}
        descricao={filhos === 'vale' ? undefined : idMotivoFilhos}
        aoMudar={(semFilhos) => mudar({ semFilhos })}
      />,
      <MotivoDosFilhos filhos={filhos} id={idMotivoFilhos} />,
    ),
    altura: linha(
      'altura',
      <div className="flex flex-wrap gap-x-5.5 gap-y-3">
        <Passos
          rotulo="Altura de"
          valor={r.altura.min}
          min={ALTURA_MINIMA}
          max={ALTURA_MAXIMA}
          passo={5}
          unidade={(v) => (v <= ALTURA_MINIMA ? 'cm ou menos' : 'cm')}
          aoMudar={(min) =>
            mudar({ altura: { min, max: Math.max(min, r.altura.max) } })
          }
        />
        <Passos
          rotulo="até"
          valor={r.altura.max}
          min={ALTURA_MINIMA}
          max={ALTURA_MAXIMA}
          passo={5}
          unidade={(v) => (v >= ALTURA_MAXIMA ? 'cm ou mais' : 'cm')}
          aoMudar={(max) =>
            mudar({ altura: { min: Math.min(max, r.altura.min), max } })
          }
        />
      </div>,
    ),
    fumo: linha(
      'fumo',
      <Marcar
        rotulo="Só quem não fuma"
        marcado={r.naoFuma}
        aoMudar={(naoFuma) => mudar({ naoFuma })}
      />,
    ),
  }

  const soltarERever = (k: RequisitoDoVisitante) => {
    gravarEContar(soltar(r, k))
    maisPesa.current?.focus()
  }

  return (
    <Folha>
      <Coluna>
        <Display>
          Quantas pessoas atendem ao que você{' '}
          <span className="marca-texto">procura</span>?
        </Display>

        <NumeroPreso estimativa={estimativa} carregando={carregando} />

        <p className="mx-0 mt-5.5 mb-md">
          Diga quem você procura e ligue os seus Requisitos. O número de cima
          muda junto, com dados do Censo 2022 e da PNS 2019.
        </p>
        <AvisosDaConta
          trocou={trocou}
          falhou={falhou}
          tentar={tentar}
          ressalvas={estimativa.ressalvas}
        />

        <Secao aria-labelledby="t-perfil">
          <Headline id="t-perfil">Seu Perfil</Headline>
          <p className={DICA}>
            A conta parte de quem você é e de quem você procura.
          </p>
          <CaixaDoPerfil
            perfil={perfil}
            comDado={null}
            totalDeAchados={0}
            rotuloDoBotao="Usar na conta"
          />
          {(perfil?.genero === 'homem' || perfil?.genero === 'mulher') && (
            <p className={DICA}>
              A orientação entra pelo seu Perfil: a conta só conta quem{' '}
              {valor('orientacao')}, pela PNS 2019.
            </p>
          )}
        </Secao>

        <Secao aria-labelledby="t-requisitos">
          <Headline id="t-requisitos">Seus Requisitos</Headline>
          <div className={carregando ? CARREGANDO : undefined}>
            {REQUISITOS.map((k) => controles[k])}
          </div>
        </Secao>

        <Secao id="a-conta" aria-labelledby="t-conta">
          <Headline id="t-conta">A conta</Headline>
          <div className={carregando ? CARREGANDO : undefined}>
            <Faixa estimativa={estimativa} />
            <p className="m-0 mt-1.5">
              {NOME_DO_ALVO[estimativa.alvo]} em{' '}
              {lugarNome === 'Brasil inteiro' ? 'todo o Brasil' : lugarNome}{' '}
              atendem a tudo o que você pediu. Estimativa central:{' '}
              {formatarQuantidade(estimativa.resultado.central)}.
            </p>
            <h3
              className="m-0 mt-md mb-2 font-label text-label text-tinta-2"
              ref={maisPesa}
              tabIndex={-1}
            >
              O que mais pesa
            </h3>
            <CustosDaConta
              custos={estimativa.custos}
              valor={valor}
              aoSoltar={soltarERever}
            />
            <Dobras
              estimativa={estimativa}
              perfil={perfil}
              requisitos={r}
              municipio={municipio}
            />
          </div>
        </Secao>

        <Compartilhar
          query={queryDoLink(link)}
          frase={fraseDoLink(link, { municipio })}
          aviso={AVISO_DA_CONTAGEM}
        />

        {guia && <DoGuia guia={guia} />}
      </Coluna>
    </Folha>
  )
}

/** O aviso do link recebido, o de dados que não chegaram e as ressalvas
 * fortes da conta, no topo da página. */
function AvisosDaConta({
  trocou,
  falhou,
  tentar,
  ressalvas,
}: {
  trocou: boolean
  falhou: boolean
  tentar: () => void
  ressalvas: Estimativa['ressalvas']
}) {
  return (
    <>
      {trocou && (
        <Aviso role="status">
          Este link trocou o seu Perfil e os seus Requisitos salvos pelos de
          quem mandou.
        </Aviso>
      )}
      {falhou && (
        <Aviso role="alert">
          Não deu para baixar os dados da conta.{' '}
          <Botao variante="leve" onClick={tentar}>
            Tentar de novo
          </Botao>
        </Aviso>
      )}
      {ressalvas
        .filter((x) => x.forte)
        .map((aviso) => (
          <Aviso key={aviso.id} className="font-bold" role="note">
            {aviso.texto}
          </Aviso>
        ))}
    </>
  )
}

/** Por que o filtro de filhos não vale, ou vale só para as mulheres. */
function MotivoDosFilhos({
  filhos,
  id,
}: {
  filhos: Estimativa['filhos']
  id: string
}) {
  if (filhos === 'vale') return null
  return (
    <p className="m-0 mt-2 text-label leading-nota font-bold text-tinta" id={id}>
      {filhos === 'sem-dado'
        ? 'O Censo só pergunta filhos às mulheres. Procurando homens, não dá para filtrar.'
        : 'O Censo só pergunta filhos às mulheres: procurando homens e mulheres, o filtro vale só para elas.'}
    </p>
  )
}

/** "O que mais pesa": cada Requisito ligado, do que mais encolhe o grupo ao
 * que menos, com o botão de soltá-lo. */
function CustosDaConta({
  custos,
  valor,
  aoSoltar,
}: {
  custos: Estimativa['custos']
  valor: (k: RequisitoDoVisitante) => string
  aoSoltar: (k: RequisitoDoVisitante) => void
}) {
  if (custos.length === 0)
    return (
      <p className={DICA}>
        Nenhum Requisito ligado ainda. Cada um que você ligar aparece aqui, do
        que mais encolhe o grupo ao que menos.
      </p>
    )
  return (
    <ul className="m-0 list-none p-0">
      {custos.map((c) => {
        const k = c.requisito as RequisitoDoVisitante
        return (
          <li
            key={k}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-2.5"
          >
            <span className="font-bold">
              {TITULO_DO_REQUISITO[k]}
              <small className="block text-label leading-body font-normal text-tinta-2">
                {valor(k)}
              </small>
            </span>
            <span className="col-1 text-nota">{textoDoCusto(c)}</span>
            <Botao
              variante="leve"
              className="col-2 row-span-2 row-start-1"
              onClick={() => aoSoltar(k)}
              aria-label={`Soltar ${TITULO_DO_REQUISITO[k].toLowerCase()}`}
            >
              soltar
            </Botao>
          </li>
        )
      })}
    </ul>
  )
}

/** O bloco "Do Guia": a Pergunta que hospeda a calculadora e a resposta curta. */
function DoGuia({
  guia,
}: {
  guia: NonNullable<ReturnType<typeof Route.useLoaderData>['guia']>
}) {
  return (
    <Secao aria-labelledby="t-do-guia">
      <Headline id="t-do-guia">Do Guia</Headline>
      <div className="reticula rounded-mao border-2 border-tinta bg-folha px-md pt-md pb-4 [&>p]:m-0 [&>p]:mt-xs [&>p:first-child]:mb-2.5">
        <p className="font-title text-linha leading-label font-bold text-tinta">
          {guia.pergunta}
        </p>
        <ConfiancaDaResposta confianca={guia.confianca} />
        <p className="text-lead">{guia.resposta}</p>
        <Link
          to="/$tema/$slug"
          params={{ tema: guia.tema, slug: guia.slug }}
          className="mt-1.5 inline-flex min-h-toque items-center font-bold"
        >
          Ler o Guia inteiro
        </Link>
      </div>
    </Secao>
  )
}

/** UF e, dentro dela, município: duas listas nativas, que no celular abrem o seletor do sistema. */
function Lugar({
  requisitos,
  municipios,
  mudar,
}: {
  requisitos: Requisitos
  municipios: ReadonlyMap<string, { nome: string }> | undefined
  mudar: (mudanca: Partial<Requisitos>) => void
}) {
  const id = useId()
  const uf = requisitos.lugar?.uf
  const lista = municipios
    ? [...municipios].sort(([, a], [, b]) =>
        a.nome.localeCompare(b.nome, 'pt-BR'),
      )
    : []
  return (
    <div className="grid gap-x-0 gap-y-1">
      <label htmlFor={`${id}-uf`} className="mb-1.5 block text-nota font-bold">
        Estado
      </label>
      <select
        id={`${id}-uf`}
        className="min-h-toque w-full max-w-88 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel px-2.5 py-1.5 font-body text-medio font-bold text-tinta"
        value={uf ?? ''}
        onChange={(e) => {
          const escolhida = UFS.find((u) => u.sigla === e.target.value)
          mudar({ lugar: escolhida ? { uf: escolhida.sigla } : null })
        }}
      >
        <option value="">Brasil inteiro</option>
        {UFS.filter((u) => LUGARES_COM_DADOS.includes(u.sigla)).map((u) => (
          <option key={u.sigla} value={u.sigla}>
            {u.nome}
          </option>
        ))}
      </select>
      {uf && (
        <>
          <label
            htmlFor={`${id}-municipio`}
            className={cn('mb-1.5 block text-nota font-bold', 'mt-2.5')}
          >
            Município
          </label>
          <select
            id={`${id}-municipio`}
            className="min-h-toque w-full max-w-88 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel px-2.5 py-1.5 font-body text-medio font-bold text-tinta"
            value={requisitos.lugar?.municipio ?? ''}
            disabled={!municipios}
            onChange={(e) =>
              mudar({
                lugar: {
                  uf,
                  ...(e.target.value && { municipio: e.target.value }),
                },
              })
            }
          >
            <option value="">
              {municipios ? 'Todo o estado' : 'Carregando os municípios…'}
            </option>
            {lista.map(([codigo, m]) => (
              <option key={codigo} value={codigo}>
                {m.nome}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}
