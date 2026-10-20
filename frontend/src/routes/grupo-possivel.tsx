import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { Estimativa } from '@tem-estudo/regras/grupo-possivel'
import { formatarQuantidade } from '@tem-estudo/regras/numeros'
import type { Perfil } from '@tem-estudo/regras/perfil'
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
import type { GuiaDaCalculadora } from '#/conteudo/guias'
import { leituras } from '#/conteudo/leituras'
import { buscarPreviaDoGrupo, metaDaPrevia } from '#/conteudo/previa'
import { useLinkRecebido } from '#/estado/link'
import { Compartilhar } from '#/ui/compartilhar'
import { AVISO_DA_CONTAGEM } from '#/ui/compartilhar.textos'
import {
  gravarRequisitos,
  LUGARES_COM_DADOS,
  useGrupoPossivel,
  useRequisitosSalvos,
  type ContaNoNavegador,
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
import { Select } from '@/ui/shadcn/select'
import { Coluna, Display, Folha } from '#/ui/folha'
import { Aviso, Headline, Painel, Secao } from '#/ui/secao'

/** A nota miúda embaixo de um controle. */
const DICA = 'm-0 mt-2 text-label leading-nota font-normal text-tinta-2'

/** Enquanto os dados chegam, o número antigo fica, apagado. */
const CARREGANDO =
  'opacity-55 motion-safe:transition-opacity motion-safe:delay-150 motion-safe:duration-200 motion-safe:ease-sai'

export const Route = createFileRoute('/grupo-possivel')({
  loader: async ({ context, location }) => {
    // A prévia do link só no servidor, para o robô da rede social; no
    // navegador, nada do estado sai do aparelho. Ela fica no `loaderData`,
    // porque só o `head` a usa; o Guia vai pelo `queryClient`.
    const comLink = typeof window === 'undefined' && ehLink(location.searchStr)
    const [, previa] = await Promise.all([
      context.queryClient.query(leituras.guiaDaCalculadora('grupo-possivel')),
      comLink ? buscarPreviaDoGrupo({ data: location.searchStr }) : null,
    ])
    return { previa }
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

/** Toda mudança do visitante nos Requisitos passa aqui, e conta o uso. */
function gravarEContar(novos: Requisitos) {
  gravarRequisitos(novos)
  contarUsoDaCalculadora('grupo-possivel')
}

/** O valor de um Requisito escrito como na tela ("25 a 35 anos"). */
type ValorDoRequisito = (k: RequisitoDoVisitante | 'orientacao') => string

function PaginaDoGrupoPossivel() {
  const { data: guia } = useSuspenseQuery(
    leituras.guiaDaCalculadora('grupo-possivel'),
  )
  const trocou = useLinkRecebido('grupo-possivel') !== null
  const perfil = usePerfil()
  const salvos = useRequisitosSalvos()
  const conta = useGrupoPossivel(perfil, salvos)
  const r = salvos ?? REQUISITOS_PADRAO
  const municipio = r.lugar?.municipio
    ? conta.uf?.municipios.get(r.lugar.municipio)?.nome
    : undefined
  const valor: ValorDoRequisito = (k) =>
    valorDoRequisito(k, perfil, r, municipio)
  const link: EstadoDoLink = {
    calculadora: 'grupo-possivel',
    perfil,
    requisitos: salvos,
  }

  return (
    <Folha>
      <Coluna>
        <TopoDaConta conta={conta} trocou={trocou} />
        <SeuPerfil perfil={perfil} valor={valor} />
        <SeusRequisitos
          perfil={perfil}
          requisitos={r}
          conta={conta}
          valor={valor}
        />
        <AConta
          conta={conta}
          perfil={perfil}
          requisitos={r}
          municipio={municipio}
          valor={valor}
        />

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

/** O título, o número preso no topo, o convite e os avisos da conta.
 * `trocou`: um link recebido trocou o Perfil e os Requisitos salvos. */
function TopoDaConta({
  conta,
  trocou,
}: {
  conta: ContaNoNavegador
  trocou: boolean
}) {
  return (
    <>
      <Display>
        Quantas pessoas atendem ao que você{' '}
        <span className="marca-texto">procura</span>?
      </Display>

      <NumeroPreso
        estimativa={conta.estimativa}
        carregando={conta.carregando}
      />

      <p className="mx-0 mt-5.5 mb-md">
        Diga quem você procura e ligue os seus Requisitos. O número de cima muda
        junto, com dados do Censo 2022 e da PNS 2019.
      </p>
      <AvisosDaConta
        trocou={trocou}
        falhou={conta.falhou}
        tentar={conta.tentar}
        ressalvas={conta.estimativa.ressalvas}
      />
    </>
  )
}

/** O bloco "Seu Perfil": de quem a conta parte. */
function SeuPerfil({
  perfil,
  valor,
}: {
  perfil: Perfil | null
  valor: ValorDoRequisito
}) {
  return (
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
  )
}

/** O bloco "Seus Requisitos": uma linha por Requisito, na ordem de
 * `REQUISITOS`, com o controle dele e o quanto ele corta. */
function SeusRequisitos({
  perfil,
  requisitos,
  conta,
  valor,
}: {
  perfil: Perfil | null
  requisitos: Requisitos
  conta: ContaNoNavegador
  valor: ValorDoRequisito
}) {
  const { estimativa } = conta
  const idMotivoFilhos = useId()
  const props: PropsDoControle = {
    perfil,
    requisitos,
    mudar: (mudanca) => gravarEContar({ ...requisitos, ...mudanca }),
    municipios: conta.uf?.municipios,
    filhos: estimativa.filhos,
    idMotivoFilhos,
  }
  return (
    <Secao aria-labelledby="t-requisitos">
      <Headline id="t-requisitos">Seus Requisitos</Headline>
      <div className={conta.carregando ? CARREGANDO : undefined}>
        {REQUISITOS.map((k) => {
          const Controle = CONTROLE[k]
          return (
            <LinhaDoRequisito
              key={k}
              requisito={k}
              valor={valor(k)}
              custo={estimativa.custos.find((c) => c.requisito === k)}
              ligado={estimativa.ligados.includes(k)}
              nota={
                k === 'filhos' ? (
                  <MotivoDosFilhos
                    filhos={estimativa.filhos}
                    id={idMotivoFilhos}
                  />
                ) : undefined
              }
            >
              <Controle {...props} />
            </LinhaDoRequisito>
          )
        })}
      </div>
    </Secao>
  )
}

/** O que o controle de um Requisito lê e como ele muda os Requisitos. */
interface PropsDoControle {
  perfil: Perfil | null
  requisitos: Requisitos
  mudar: (mudanca: Partial<Requisitos>) => void
  /** Os municípios da UF escolhida, quando já chegaram. */
  municipios: ReadonlyMap<string, { nome: string }> | undefined
  filhos: Estimativa['filhos']
  /** O id do motivo de o filtro de filhos não valer, que a caixa cita. */
  idMotivoFilhos: string
}

/** A lista de marcados com `valor` marcado ou desmarcado, na ordem de `todos`. */
function alternar<T extends string>(
  todos: ReadonlyArray<T>,
  marcados: ReadonlyArray<T>,
  valor: T,
  marcado: boolean,
): T[] {
  const antes = new Set(marcados)
  return todos.filter((c) => (c === valor ? marcado : antes.has(c)))
}

/** O controle de cada Requisito, que vai dentro da linha dele. */
const CONTROLE: Record<
  RequisitoDoVisitante,
  (props: PropsDoControle) => ReactNode
> = {
  idade: ({ perfil, requisitos, mudar }) => {
    const idade = idadeProcurada(perfil, requisitos)
    return (
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
      </div>
    )
  },
  lugar: ({ requisitos, municipios, mudar }) => (
    <Lugar requisitos={requisitos} municipios={municipios} mudar={mudar} />
  ),
  companheiro: ({ requisitos, mudar }) => (
    <Marcar
      rotulo="Só quem não mora com companheiro(a)"
      marcado={requisitos.companheiro}
      aoMudar={(companheiro) => mudar({ companheiro })}
    />
  ),
  escolaridade: ({ requisitos, mudar }) => (
    <Opcoes
      legenda="Escolaridade mínima"
      tipo="radio"
      valores={[qualquer, ...ESCOLARIDADES_MINIMAS]}
      rotulos={{ qualquer, ...ROTULO_DA_ESCOLARIDADE }}
      marcados={[requisitos.escolaridade ?? qualquer]}
      aoMudar={(v) => mudar({ escolaridade: v === qualquer ? null : v })}
    />
  ),
  renda: ({ requisitos, mudar }) => (
    <Opcoes
      legenda="Renda mínima"
      tipo="radio"
      valores={[qualquer, ...RENDAS_MINIMAS]}
      rotulos={{ qualquer, ...ROTULO_DA_RENDA }}
      marcados={[requisitos.renda ?? qualquer]}
      aoMudar={(v) => mudar({ renda: v === qualquer ? null : v })}
      dica="Em salários mínimos de julho de 2022 (R$ 1.212)."
    />
  ),
  cor: ({ requisitos, mudar }) => (
    <Opcoes
      legenda="Cor ou raça"
      tipo="checkbox"
      valores={CORES}
      rotulos={ROTULO_DA_COR}
      marcados={requisitos.cores}
      aoMudar={(v, marcado) =>
        mudar({ cores: alternar(CORES, requisitos.cores, v, marcado) })
      }
      dica="Nenhuma marcada é qualquer uma."
    />
  ),
  religiao: ({ requisitos, mudar }) => (
    <Opcoes
      legenda="Religião"
      tipo="checkbox"
      valores={RELIGIOES}
      rotulos={ROTULO_DA_RELIGIAO}
      marcados={requisitos.religioes}
      aoMudar={(v, marcado) =>
        mudar({
          religioes: alternar(RELIGIOES, requisitos.religioes, v, marcado),
        })
      }
      dica="Nenhuma marcada é qualquer uma."
    />
  ),
  filhos: ({ requisitos, filhos, idMotivoFilhos, mudar }) => (
    <Marcar
      rotulo="Só quem não tem filhos"
      marcado={requisitos.semFilhos && filhos !== 'sem-dado'}
      desabilitado={filhos === 'sem-dado'}
      descricao={filhos === 'vale' ? undefined : idMotivoFilhos}
      aoMudar={(semFilhos) => mudar({ semFilhos })}
    />
  ),
  altura: ({ requisitos: { altura }, mudar }) => (
    <div className="flex flex-wrap gap-x-5.5 gap-y-3">
      <Passos
        rotulo="Altura de"
        valor={altura.min}
        min={ALTURA_MINIMA}
        max={ALTURA_MAXIMA}
        passo={5}
        unidade={(v) => (v <= ALTURA_MINIMA ? 'cm ou menos' : 'cm')}
        aoMudar={(min) =>
          mudar({ altura: { min, max: Math.max(min, altura.max) } })
        }
      />
      <Passos
        rotulo="até"
        valor={altura.max}
        min={ALTURA_MINIMA}
        max={ALTURA_MAXIMA}
        passo={5}
        unidade={(v) => (v >= ALTURA_MAXIMA ? 'cm ou mais' : 'cm')}
        aoMudar={(max) =>
          mudar({ altura: { min: Math.min(max, altura.min), max } })
        }
      />
    </div>
  ),
  fumo: ({ requisitos, mudar }) => (
    <Marcar
      rotulo="Só quem não fuma"
      marcado={requisitos.naoFuma}
      aoMudar={(naoFuma) => mudar({ naoFuma })}
    />
  ),
}

/** O bloco "A conta": a faixa, o que mais pesa, com o botão de soltar cada
 * Requisito, e as dobras do corte a corte e da incerteza. */
function AConta({
  conta: { estimativa, carregando },
  perfil,
  requisitos,
  municipio,
  valor,
}: {
  conta: ContaNoNavegador
  perfil: Perfil | null
  requisitos: Requisitos
  municipio: string | undefined
  valor: ValorDoRequisito
}) {
  const maisPesa = useRef<HTMLHeadingElement>(null)
  const lugarNome = valor('lugar')
  // O botão some com a linha que ele soltou; o foco vai para o título da lista.
  const soltarERever = (k: RequisitoDoVisitante) => {
    gravarEContar(soltar(requisitos, k))
    maisPesa.current?.focus()
  }
  return (
    <Secao id="a-conta" aria-labelledby="t-conta">
      <Headline id="t-conta">A conta</Headline>
      <div className={carregando ? CARREGANDO : undefined}>
        <Faixa estimativa={estimativa} />
        <p className="m-0 mt-1.5">
          {NOME_DO_ALVO[estimativa.alvo]} em{' '}
          {lugarNome === 'Brasil inteiro' ? 'todo o Brasil' : lugarNome} atendem
          a tudo o que você pediu. Estimativa central:{' '}
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
          requisitos={requisitos}
          municipio={municipio}
        />
      </div>
    </Secao>
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
    <p
      className="m-0 mt-2 text-label leading-nota font-bold text-tinta"
      id={id}
    >
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
function DoGuia({ guia }: { guia: GuiaDaCalculadora }) {
  return (
    <Secao aria-labelledby="t-do-guia">
      <Headline id="t-do-guia">Do Guia</Headline>
      <Painel className="[&>p]:m-0 [&>p]:mt-xs [&>p:first-child]:mb-2.5">
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
      </Painel>
    </Secao>
  )
}

/** UF e, dentro dela, município, cada um numa lista do `Select`. */
function Lugar({
  requisitos,
  municipios,
  mudar,
}: {
  requisitos: Requisitos
  municipios: ReadonlyMap<string, { nome: string }> | undefined
  mudar: (mudanca: Partial<Requisitos>) => void
}) {
  const uf = requisitos.lugar?.uf
  const ufs = [
    { value: null, label: 'Brasil inteiro' },
    ...UFS.filter((u) => LUGARES_COM_DADOS.includes(u.sigla)).map((u) => ({
      value: u.sigla,
      label: u.nome,
    })),
  ]
  const lista = [
    {
      value: null,
      label: municipios ? 'Todo o estado' : 'Carregando os municípios…',
    },
    ...(municipios
      ? [...municipios]
          .sort(([, a], [, b]) => a.nome.localeCompare(b.nome, 'pt-BR'))
          .map(([codigo, m]) => ({ value: codigo, label: m.nome }))
      : []),
  ]
  return (
    <div className="grid gap-2.5">
      <Select
        label="Estado"
        items={ufs}
        value={uf ?? null}
        onValueChange={(sigla) => {
          const escolhida = UFS.find((u) => u.sigla === sigla)
          mudar({ lugar: escolhida ? { uf: escolhida.sigla } : null })
        }}
      />
      {uf && (
        <Select
          label="Município"
          items={lista}
          value={requisitos.lugar?.municipio ?? null}
          disabled={!municipios}
          onValueChange={(municipio) =>
            mudar({ lugar: { uf, ...(municipio && { municipio }) } })
          }
        />
      )}
    </div>
  )
}
