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
import { DegrausCheios, ForcaDaEvidencia, StatusDeVerificacao } from './selos'

/** Os três degraus cheios conforme o peso, ou o anel vazio de "não sabemos". */
export function PesoDaEvidencia({ degrau: n, largura = 36 }: { degrau: Degrau; largura?: number }) {
  return n > 0 ? (
    <DegrausCheios cheios={n} largura={largura} />
  ) : (
    <span className="anel-do-peso" style={{ width: largura / 3, height: largura / 3 }} aria-hidden="true" />
  )
}

/** O peso em tamanho de etiqueta, sempre com a palavra. */
export function EtiquetaDoPeso({ degrau: n }: { degrau: Degrau }) {
  return (
    <span className="etiqueta-peso" data-degrau={n}>
      <PesoDaEvidencia degrau={n} />
      {NOME_DO_DEGRAU[n]}
    </span>
  )
}

const ordinal = (i: number) => `sua ${i + 1}ª`

function Posicao({ i }: { i: number }) {
  return (
    <>
      <span className="posicao" aria-hidden="true">
        {i + 1}
      </span>
      <span className="visualmente-oculto">{ordinal(i)}: </span>
    </>
  )
}

const Seta = () => (
  <svg width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 8.5C9 7.4 16 8.2 23 8M23 8l-6-5.5M23 8l-6 5.5" />
  </svg>
)

const Atencao = () => (
  <svg className="alerta-icone" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12.4 2.6c5.4.2 9 4 8.9 9.2-.2 5.4-4.1 9-9.3 8.9-5.3-.1-9.1-3.9-8.9-9.2.2-5 4-8.8 9.6-8.9" />
    <path d="M12 7.2l-.2 6.4" strokeWidth="2.6" />
    <circle cx="11.8" cy="16.8" r=".6" fill="currentColor" strokeWidth="1.6" />
  </svg>
)

/** A Ficha de uma célula: nome, Status e Força desenhados e escritos. */
export function FonteDaCelula({ ficha }: { ficha: FichaDaPrioridade }) {
  return (
    <p className="fonte-da-celula">
      <Link to="/estudos/$slug" params={{ slug: ficha.slug }} className="fonte-nome">
        {ficha.nome}
      </Link>
      <StatusDeVerificacao status={ficha.status} />
      <ForcaDaEvidencia forca={ficha.forca} rotulo />
    </p>
  )
}

/** A barra da Joel 2020: o que explica a satisfação com a relação. A curta
 * vai no cartão do B1; a longa abre com a frase e diz que a lista cabe nos 5%. */
export function BarraDaSatisfacao({ barra, curta = false }: { barra: Barra; curta?: boolean }) {
  return (
    <div className="barra-satisfacao">
      {!curta && (
        <p>
          <b>Antes da lista.</b> No estudo que juntou 43 bases de casais, o que mais explicou a satisfação foi
          como a pessoa vive a relação, não quem o parceiro é.
        </p>
      )}
      <div
        className="barra"
        role="img"
        aria-label={`Satisfação: ${barra.relacao}% explicado pela relação, ${barra.parceiro}% pelo parceiro, ${barra.semExplicacao}% sem explicação`}
      >
        <span className="fatia-relacao" style={{ width: `${barra.relacao}%` }} />
        <span className="fatia-parceiro" style={{ width: `${barra.parceiro}%` }} />
        <span className="fatia-sem" style={{ width: `${barra.semExplicacao}%` }} />
      </div>
      <dl className="barra-legenda">
        <dt>
          <i className="fatia-relacao" />
          <b>{barra.relacao}%</b>
        </dt>
        <dd>como vocês se tratam: compromisso, gratidão, conflito, sexo</dd>
        <dt>
          <i className="fatia-parceiro" />
          <b>{barra.parceiro}%</b>
        </dt>
        <dd>tudo o que se sabe do parceiro{curta ? '' : ': a lista abaixo inteira cabe aqui'}</dd>
        <dt>
          <i className="fatia-sem" />
          <b>{barra.semExplicacao}%</b>
        </dt>
        <dd>nenhum estudo explica</dd>
      </dl>
      <FonteDaCelula ficha={barra.ficha} />
    </div>
  )
}

function estadoDaEscolha(quantas: number): string {
  if (quantas >= TAMANHO_DO_TOPO) return 'Pronto. Para trocar, toque numa das escolhidas e ela sai.'
  if (quantas === 0) return 'Nenhuma escolhida ainda. Dá para ver as prateleiras mesmo assim.'
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
    <section className="escolha-topo3" aria-labelledby="t-topo3">
      <h2 id="t-topo3" className="passo">
        Seu topo 3
      </h2>
      <ul className="chips">
        {caracteristicas.map((car) => {
          const i = topo3.indexOf(car.id)
          const fora = i < 0 && cheio
          return (
            <li key={car.id}>
              <button
                type="button"
                className="chip"
                aria-pressed={i >= 0}
                aria-disabled={fora || undefined}
                aria-describedby={fora ? 'estado-topo3' : undefined}
                onClick={() => {
                  if (!fora) aoTocar(car.id)
                }}
              >
                {i >= 0 && <Posicao i={i} />}
                {car.nome}
              </button>
            </li>
          )
        })}
      </ul>
      <p id="estado-topo3" className="estado-topo3" role="status">
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
    <fieldset className="seletor-desfecho">
      <legend className="passo">Pesa para quê?</legend>
      <div className="opcoes">
        {DESFECHOS.map((d) => (
          <label key={d} className="opcao">
            <input
              type="radio"
              name="desfecho"
              value={d}
              checked={desfecho === d}
              onChange={() => aoEscolher(d)}
            />
            <span>{NOME_DO_DESFECHO[d]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** O alerta do topo 3, em frase. A região fica sempre na página para o leitor
 * de tela ouvir quando ele aparece. */
export function AlertaDoTopo3({ frase }: { frase: string | null }) {
  return (
    <div className="alerta-topo3" aria-live="polite">
      {frase && (
        <p className="alerta">
          <Atencao />
          <span>{frase}</span>
        </p>
      )}
    </div>
  )
}

/** Texto simples, medida, Ficha com Status, Força e amostra, e o viés. */
export function DetalheDaCaracteristica({
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
    <div id={id} className="detalhe-caracteristica" role="region" aria-label={`${car.nome}, ${NOME_DO_DESFECHO[desfecho].toLowerCase()}`}>
      <p className="detalhe-titulo">
        {car.nome} · {NOME_DO_DESFECHO[desfecho].toLowerCase()}
      </p>
      <p>{celula.texto}</p>
      {celula.medida && <p className="detalhe-medida">Medida: {celula.medida}</p>}
      {celula.ficha && (
        <>
          <FonteDaCelula ficha={celula.ficha} />
          <p className="detalhe-amostra">Amostra: {celula.ficha.amostra}</p>
        </>
      )}
      {vies && <p className="detalhe-vies">{vies}</p>}
    </div>
  )
}

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
    <div className="estante">
      {prateleiras(caracteristicas, desfecho, topo3).map((prat) => {
        const detalhe = `detalhe-${prat.degrau}`
        const abertaAqui = aberta !== null && prat.ids.includes(aberta) ? porId.get(aberta) : undefined
        return (
          <section key={prat.degrau} className="prateleira" data-degrau={prat.degrau} aria-labelledby={`prat-${prat.degrau}`}>
            <h3 id={`prat-${prat.degrau}`} className="prateleira-titulo">
              <PesoDaEvidencia degrau={prat.degrau} largura={42} />
              {prat.nome}
            </h3>
            {prat.ids.length > 0 ? (
              <ul className="livros">
                {prat.ids.map((id) => {
                  const i = topo3.indexOf(id)
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        className="livro"
                        data-escolhida={i >= 0 || undefined}
                        aria-expanded={aberta === id}
                        aria-controls={aberta === id ? detalhe : undefined}
                        onClick={() => aoAbrir(aberta === id ? null : id)}
                      >
                        {i >= 0 && <Posicao i={i} />}
                        {porId.get(id)?.nome}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="prateleira-vazia">nenhuma</p>
            )}
            <div className="tabua" aria-hidden="true" />
            {abertaAqui && <DetalheDaCaracteristica car={abertaAqui} desfecho={desfecho} genero={genero} id={detalhe} />}
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
  const escolhidas = topo3.flatMap((id) => caracteristicas.filter((c) => c.id === id))
  return (
    <section className="secao cartao-calculadora" aria-labelledby="t-cartao-prioridades">
      <h2 id="t-cartao-prioridades" className="headline">
        Onde ficam as suas prioridades?
      </h2>
      <div className="painel com-reticula">
        <BarraDaSatisfacao barra={barra} curta />
        {escolhidas.length > 0 && (
          <>
            <p className="rotulo-calculadora">Seu topo 3 cabe na fatia de {barra.parceiro}%:</p>
            <ol className="topo3-no-cartao">
              {escolhidas.map((car, i) => (
                <li key={car.id}>
                  <span className="posicao" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="topo3-nome">{car.nome}</span>
                  <span className="visualmente-oculto">, em satisfação: </span>
                  <EtiquetaDoPeso degrau={degrau(car, 'satisfacao')} />
                </li>
              ))}
            </ol>
          </>
        )}
        <p className="acoes-calculadora">
          <Link to="/prioridades" className="botao com-reticula botao-link">
            {escolhidas.length > 0 ? 'Ver a lista inteira' : 'Escolher as suas três e comparar'}
            <Seta />
          </Link>
        </p>
      </div>
    </section>
  )
}
