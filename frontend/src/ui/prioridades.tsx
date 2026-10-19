// As peças de Prioridades vs. evidência (#19, variante A de /prioridades e
// C do cartão do B1): os chips do topo 3, o seletor de desfecho, a barra da
// Joel 2020, as quatro prateleiras e o detalhe de cada característica.
// Amarelo só no que é do visitante (as escolhidas); "não sabemos" é o anel
// vazio em tinta (The Three Inks Rule).
import { Link } from '@tanstack/react-router'
import type { GeneroDoPerfil } from '@tem-estudo/regras/perfil'
import {
  DESFECHOS,
  NOME_DO_DEGRAU,
  NOME_DO_DESFECHO,
  TAMANHO_DO_TOPO,
  degrau,
  prateleiras,
  viesPara,
  type Degrau,
  type Desfecho,
} from '@tem-estudo/regras/prioridades'
import type {
  BarraDaSatisfacao as Barra,
  CaracteristicaVista,
  FichaDaPrioridade,
} from '#/conteudo/vista-prioridades'
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cn } from '@/platform/cn'
import { Headline, Secao } from './pagina'
import { DegrausCheios, ForcaDaEvidencia, StatusDeVerificacao } from './selos'
import { Button } from '@/ui/shadcn/button'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'
import { Toggle } from '@/ui/shadcn/toggle'

/** Os três degraus cheios conforme o peso, ou o anel vazio de "não sabemos". */
export function PesoDaEvidencia({
  degrau: n,
  largura = 36,
}: {
  degrau: Degrau
  largura?: number
}) {
  return n > 0 ? (
    <DegrausCheios cheios={n} largura={largura} />
  ) : (
    <span
      className="box-border inline-block flex-none rounded-bolota border-(length:--traco-controle) border-tinta bg-folha"
      style={{ width: largura / 3, height: largura / 3 }}
      aria-hidden="true"
    />
  )
}

/** O peso em tamanho de etiqueta, sempre com a palavra. */
export function EtiquetaDoPeso({ degrau: n }: { degrau: Degrau }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-label text-label leading-body whitespace-nowrap data-[degrau=0]:font-normal data-[degrau=0]:text-tinta-2 data-[degrau=0]:italic"
      data-degrau={n}
    >
      <PesoDaEvidencia degrau={n} />
      {NOME_DO_DEGRAU[n]}
    </span>
  )
}

const PASSO =
  'm-0 mb-2 p-0 font-label text-label leading-title text-tinta-2'

const ordinal = (i: number) => `sua ${i + 1}ª`

const POSICAO =
  'inline-grid size-6.5 flex-none place-items-center rounded-bolota border-(length:--traco-controle) border-tinta text-etiqueta leading-none font-bold'

function Posicao({ i }: { i: number }) {
  return (
    <>
      <span className={cn(POSICAO, 'bg-folha')} aria-hidden="true">
        {i + 1}
      </span>
      <span className="sr-only">{ordinal(i)}: </span>
    </>
  )
}

const Seta = () => (
  <svg
    width="26"
    height="16"
    viewBox="0 0 26 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 8.5C9 7.4 16 8.2 23 8M23 8l-6-5.5M23 8l-6 5.5" />
  </svg>
)

const Atencao = () => (
  <svg
    className="mt-px flex-none"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12.4 2.6c5.4.2 9 4 8.9 9.2-.2 5.4-4.1 9-9.3 8.9-5.3-.1-9.1-3.9-8.9-9.2.2-5 4-8.8 9.6-8.9" />
    <path d="M12 7.2l-.2 6.4" strokeWidth="2.6" />
    <circle cx="11.8" cy="16.8" r=".6" fill="currentColor" strokeWidth="1.6" />
  </svg>
)

/** A Ficha de uma célula: nome, Status e Força desenhados e escritos. */
function FonteDaCelula({ ficha }: { ficha: FichaDaPrioridade }) {
  return (
    <p className="mt-2 mb-0 flex flex-wrap items-center gap-x-sm gap-y-1">
      <Link
        to="/estudos/$slug"
        params={{ slug: ficha.slug }}
        className="inline-flex min-h-toque items-center font-bold decoration-agua-tinta"
      >
        {ficha.nome}
      </Link>
      <StatusDeVerificacao status={ficha.status} />
      <ForcaDaEvidencia forca={ficha.forca} rotulo />
    </p>
  )
}

const AMOSTRA =
  'inline-block size-4 rounded-amostra border-(length:--traco-controle) border-tinta'
const LEGENDA = 'inline-flex items-center gap-2'

/** A barra da Joel 2020: o que explica a satisfação com a relação. A curta
 * vai no cartão do B1; a longa abre com a frase e diz que a lista cabe nos 5%. */
export function BarraDaSatisfacao({
  barra,
  curta = false,
}: {
  barra: Barra
  curta?: boolean
}) {
  return (
    <div>
      {!curta && (
        <p className="m-0 mb-3">
          <b>Antes da lista.</b> No estudo que juntou 43 bases de casais, o que
          mais explicou a satisfação foi como a pessoa vive a relação, não quem
          o parceiro é.
        </p>
      )}
      <div
        className="flex h-8.5 overflow-hidden rounded-mao-2 border-2 border-tinta"
        role="img"
        aria-label={`Satisfação: ${barra.relacao}% explicado pela relação, ${barra.parceiro}% pelo parceiro, ${barra.semExplicacao}% sem explicação`}
      >
        <span
          className="bg-tinta"
          style={{ width: `${barra.relacao}%` }}
        />
        <span
          className="box-border min-w-2.5 border-x-2 border-tinta bg-folha"
          style={{ width: `${barra.parceiro}%` }}
        />
        <span
          className="fundo-reticula"
          style={{ width: `${barra.semExplicacao}%` }}
        />
      </div>
      <dl className="m-0 mt-2.5 grid grid-cols-[auto_1fr] items-start gap-x-2.5 gap-y-1.5 text-label leading-folgada font-normal">
        <dt className={LEGENDA}>
          <i className={cn(AMOSTRA, 'bg-tinta')} />
          <b>{barra.relacao}%</b>
        </dt>
        <dd className="m-0">como vocês se tratam: compromisso, gratidão, conflito, sexo</dd>
        <dt className={LEGENDA}>
          <i className={cn(AMOSTRA, 'bg-folha')} />
          <b>{barra.parceiro}%</b>
        </dt>
        <dd className="m-0">
          tudo o que se sabe do parceiro
          {curta ? '' : ': a lista abaixo inteira cabe aqui'}
        </dd>
        <dt className={LEGENDA}>
          <i className={cn(AMOSTRA, 'fundo-reticula')} />
          <b>{barra.semExplicacao}%</b>
        </dt>
        <dd className="m-0">nenhum estudo explica</dd>
      </dl>
      <FonteDaCelula ficha={barra.ficha} />
    </div>
  )
}

function estadoDaEscolha(quantas: number): string {
  if (quantas >= TAMANHO_DO_TOPO)
    return 'Pronto. Para trocar, toque numa das escolhidas e ela sai.'
  if (quantas === 0)
    return 'Nenhuma escolhida ainda. Dá para ver as prateleiras mesmo assim.'
  const falta = TAMANHO_DO_TOPO - quantas
  return falta > 1 ? `Faltam ${falta}.` : 'Falta 1.'
}

/** Os dez chips: tocar dá o próximo número, tocar de novo tira. Com três, os
 * outros ficam indisponíveis, com a dica de troca. */
export function EscolhaDoTopo3({
  caracteristicas,
  topo3,
  aoTocar,
}: {
  caracteristicas: ReadonlyArray<CaracteristicaVista>
  topo3: ReadonlyArray<string>
  aoTocar: (id: string) => void
}) {
  const cheio = topo3.length >= TAMANHO_DO_TOPO
  return (
    <section className="mt-lg" aria-labelledby="t-topo3">
      <h2 id="t-topo3" className={PASSO}>
        Seu topo 3
      </h2>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {caracteristicas.map((car) => {
          const i = topo3.indexOf(car.id)
          const fora = i < 0 && cheio
          return (
            <li key={car.id}>
              <Toggle
                pressed={i >= 0}
                aria-disabled={fora || undefined}
                aria-describedby={fora ? 'estado-topo3' : undefined}
                onPressedChange={() => {
                  if (!fora) aoTocar(car.id)
                }}
              >
                {i >= 0 && <Posicao i={i} />}
                {car.nome}
              </Toggle>
            </li>
          )
        })}
      </ul>
      <p
        id="estado-topo3"
        className="mt-2.5 mb-0 min-h-[1.5em] text-nota text-tinta-2"
        role="status"
      >
        {estadoDaEscolha(topo3.length)}
      </p>
    </section>
  )
}

/** Atração, satisfação ou duração, em rádios com cara de opção do Perfil. */
export function SeletorDeDesfecho({
  desfecho,
  aoEscolher,
}: {
  desfecho: Desfecho
  aoEscolher: (desfecho: Desfecho) => void
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend id="t-desfecho" className={cn(PASSO, 'mb-1.5')}>
        Pesa para quê?
      </legend>
      <RadioGroup
        aria-labelledby="t-desfecho"
        value={desfecho}
        onValueChange={(d) => aoEscolher(d as Desfecho)}
      >
        {DESFECHOS.map((d) => (
          <RadioGroupItem key={d} value={d}>
            {NOME_DO_DESFECHO[d]}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

/** O alerta do topo 3, em frase. A região fica sempre na página para o leitor
 * de tela ouvir quando ele aparece. */
export function AlertaDoTopo3({ frase }: { frase: string | null }) {
  return (
    <div aria-live="polite">
      {frase && (
        <p
          className="m-0 mt-md flex gap-2.5 rounded-mao-2 border-2 fio-tracejado border-tinta bg-folha pt-3 pr-3.5 pb-3 pl-3 text-aviso leading-normal"
          data-slot="alerta"
        >
          <Atencao />
          <span>{frase}</span>
        </p>
      )}
    </div>
  )
}

const DETALHE_MIUDO = 'text-label leading-detalhe font-normal text-tinta-2'

/** Texto simples, medida, Ficha com Status, Força e amostra, e o viés. */
function DetalheDaCaracteristica({
  car,
  desfecho,
  genero,
  id,
}: {
  car: CaracteristicaVista
  desfecho: Desfecho
  genero: GeneroDoPerfil | undefined
  id: string
}) {
  const celula = car[desfecho]
  const vies = viesPara(car, genero)
  return (
    <div
      id={id}
      className="mt-sm rounded-mao border-2 border-tinta bg-folha px-3.5 py-3 text-aviso leading-detalhe [&_p]:m-0 [&_p]:mb-1.5"
      role="region"
      aria-label={`${car.nome}, ${NOME_DO_DESFECHO[desfecho].toLowerCase()}`}
    >
      <p className="font-title text-body leading-detalhe font-bold">
        {car.nome} · {NOME_DO_DESFECHO[desfecho].toLowerCase()}
      </p>
      <p>{celula.texto}</p>
      {celula.medida && (
        <p className={DETALHE_MIUDO}>Medida: {celula.medida}</p>
      )}
      {celula.ficha && (
        <>
          <FonteDaCelula ficha={celula.ficha} />
          <p className={DETALHE_MIUDO}>Amostra: {celula.ficha.amostra}</p>
        </>
      )}
      {vies && <p className="text-tinta-2 italic">{vies}</p>}
    </div>
  )
}

/** O livro na estante: apagado, ou amarelo, numerado e com a retícula se é
 * uma das escolhidas. Aberto, ganha o contorno de fora. */
const LIVRO =
  'inline-flex min-h-toque cursor-pointer items-center gap-2 rounded-mao border-(length:--traco-etiqueta) border-tinta-2 bg-folha px-3.5 py-2 text-left font-label text-nota leading-tight font-normal text-tinta-2 sem-realce-no-toque hover:not-data-escolhida:border-tinta hover:not-data-escolhida:text-tinta aria-expanded:outline-(length:--traco-aberto) aria-expanded:outline-offset-3 aria-expanded:outline-tinta data-escolhida:reticula data-escolhida:border-(length:--traco-controle) data-escolhida:border-tinta data-escolhida:bg-amarelo-voce data-escolhida:py-2.25 data-escolhida:text-medio data-escolhida:font-bold data-escolhida:text-tinta'

/** As quatro prateleiras do desfecho. As escolhidas ficam em amarelo e
 * numeradas; as outras, apagadas. Tocar abre o detalhe embaixo da prateleira. */
export function Estante({
  caracteristicas,
  desfecho,
  topo3,
  aberta,
  aoAbrir,
  genero,
}: {
  caracteristicas: ReadonlyArray<CaracteristicaVista>
  desfecho: Desfecho
  topo3: ReadonlyArray<string>
  aberta: string | null
  aoAbrir: (id: string | null) => void
  genero: GeneroDoPerfil | undefined
}) {
  const porId = new Map(caracteristicas.map((c) => [c.id, c]))
  return (
    <div className="mt-1.5">
      {prateleiras(caracteristicas, desfecho, topo3).map((prat) => {
        const detalhe = `detalhe-${prat.degrau}`
        const abertaAqui =
          aberta !== null && prat.ids.includes(aberta)
            ? porId.get(aberta)
            : undefined
        return (
          <section
            key={prat.degrau}
            className="group/prateleira pt-6.5"
            data-degrau={prat.degrau}
            aria-labelledby={`prat-${prat.degrau}`}
          >
            <h3
              id={`prat-${prat.degrau}`}
              className="m-0 mb-3 flex items-center gap-2.5 font-title text-nivel leading-headline font-bold tracking-title group-data-[degrau=0]/prateleira:font-semibold group-data-[degrau=0]/prateleira:text-tinta-2 group-data-[degrau=0]/prateleira:italic"
            >
              <PesoDaEvidencia degrau={prat.degrau} largura={42} />
              {prat.nome}
            </h3>
            {prat.ids.length > 0 ? (
              <ul className="m-0 flex list-none flex-wrap items-end gap-2 px-1 py-0">
                {prat.ids.map((id) => {
                  const i = topo3.indexOf(id)
                  return (
                    <li key={id}>
                      <ButtonPrimitive
                        className={LIVRO}
                        data-escolhida={i >= 0 || undefined}
                        aria-expanded={aberta === id}
                        aria-controls={aberta === id ? detalhe : undefined}
                        onClick={() => aoAbrir(aberta === id ? null : id)}
                      >
                        {i >= 0 && <Posicao i={i} />}
                        {porId.get(id)?.nome}
                      </ButtonPrimitive>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="m-0 px-1 py-2 text-nota text-tinta-2 italic">nenhuma</p>
            )}
            <div
              className="reticula mt-1.5 h-2.75 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-folha group-data-[degrau=0]/prateleira:fio-tracejado group-data-[degrau=0]/prateleira:after:hidden"
              aria-hidden="true"
            />
            {abertaAqui && (
              <DetalheDaCaracteristica
                car={abertaAqui}
                desfecho={desfecho}
                genero={genero}
                id={detalhe}
              />
            )}
          </section>
        )
      })}
    </div>
  )
}

/** O cartão do Guia B1: a barra curta da Joel e, com topo 3, o peso de cada
 * um em satisfação. */
export function CartaoDePrioridades({
  barra,
  caracteristicas,
  topo3,
}: {
  barra: Barra
  caracteristicas: ReadonlyArray<CaracteristicaVista>
  topo3: ReadonlyArray<string>
}) {
  const escolhidas = topo3.flatMap((id) =>
    caracteristicas.filter((c) => c.id === id),
  )
  return (
    <Secao aria-labelledby="t-cartao-prioridades">
      <Headline id="t-cartao-prioridades">
        Onde ficam as suas prioridades?
      </Headline>
      <div className="reticula rounded-mao border-2 border-tinta bg-folha px-md pt-md pb-4 [&>p]:m-0 [&>p]:mt-xs">
        <BarraDaSatisfacao barra={barra} curta />
        {escolhidas.length > 0 && (
          <>
            <p className="font-label text-label leading-body text-tinta-2">
              Seu topo 3 cabe na fatia de {barra.parceiro}%:
            </p>
            <ol className="m-0 mt-2.5 list-none p-0" data-slot="topo3-no-cartao">
              {escolhidas.map((car, i) => (
                <li
                  key={car.id}
                  className="grid grid-cols-[34px_1fr_auto] items-center gap-2.5 border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-2 font-bold first:border-t-0"
                >
                  <span
                    className={cn(POSICAO, 'bg-amarelo-voce')}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>{car.nome}</span>
                  <span className="sr-only">, em satisfação: </span>
                  <EtiquetaDoPeso degrau={degrau(car, 'satisfacao')} />
                </li>
              ))}
            </ol>
          </>
        )}
        <p>
          <Button
            nativeButton={false}
            render={<Link to="/prioridades" />}
            forma="seta"
          >
            {escolhidas.length > 0
              ? 'Ver a lista inteira'
              : 'Escolher as suas três e comparar'}
            <Seta />
          </Button>
        </p>
      </div>
    </Secao>
  )
}
