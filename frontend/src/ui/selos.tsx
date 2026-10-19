// Status de verificação e Força da evidência, sempre desenhados e escritos
// (DESIGN.md: "Don't mostrar Confiança, Status ou Força só por cor").
import type { Forca, Status } from '@tem-estudo/conteudo'

const PALAVRA_DO_STATUS: Record<Status, string> = {
  ok: 'lido no original',
  parcial: 'parcial',
  'nao-verificado': 'não verificado',
}

const DEGRAUS_DA_FORCA: Record<Forca, number> = {
  fraca: 1,
  moderada: 2,
  forte: 3,
}

/** Caixa com visto (lido), caixa hachurada (parcial), caixa vazia (não verificado). */
function IconeDoStatus({ status }: { status: Status }) {
  return (
    <svg
      className="icone-status"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3.5h14v13H3z" transform="rotate(-1 10 10)" />
      {status === 'ok' && (
        <path
          d="M6 10.5l3 3 6-8"
          stroke="var(--cor-agua-tinta)"
          strokeWidth="2.4"
        />
      )}
      {status === 'parcial' && (
        <path
          d="M4.5 16L16 4.5M4 10.5L10.5 4M9.5 16L16 9.5"
          strokeWidth="1.4"
        />
      )}
    </svg>
  )
}

export function StatusDeVerificacao({ status }: { status: Status }) {
  return (
    <span className="selo-meta" data-status={status}>
      <IconeDoStatus status={status} />
      {PALAVRA_DO_STATUS[status]}
    </span>
  )
}

const DEGRAUS = [
  'M2.6 6.4 19.8 5.5l.7 11.4-17.5.6z',
  'M23.6 5.3l17.4.7-.5 11-17.4-.4z',
  'M44.6 5.8l18.2-.7.5 11.3-18.3.8z',
]

/** Os três degraus desenhados à mão, cheios conforme o nível. */
export function Degraus({
  nivel,
  largura = 36,
}: {
  nivel: Forca
  largura?: number
}) {
  return <DegrausCheios cheios={DEGRAUS_DA_FORCA[nivel]} largura={largura} />
}

/** Os mesmos degraus com 1 a 3 cheios: o peso que a evidência dá em Prioridades. */
export function DegrausCheios({
  cheios,
  largura = 36,
}: {
  cheios: number
  largura?: number
}) {
  return (
    <svg
      className="degraus"
      width={largura}
      height={(largura * 22) / 66}
      viewBox="0 0 66 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {DEGRAUS.map((d, i) => (
        <path key={d} d={d} fill={i < cheios ? 'currentColor' : 'none'} />
      ))}
    </svg>
  )
}

export function ForcaDaEvidencia({
  forca,
  rotulo = false,
}: {
  forca: Forca
  rotulo?: boolean
}) {
  return (
    <span className="selo-meta" data-forca={forca}>
      <Degraus nivel={forca} />
      {rotulo ? `evidência ${forca}` : forca}
    </span>
  )
}

/** A legenda do fim das listas de Fichas. */
export function LegendaDasFichas() {
  return (
    <dl className="legenda">
      <div>
        <dt>
          <StatusDeVerificacao status="ok" />
        </dt>
        <dd>os números foram conferidos no texto completo do estudo.</dd>
      </div>
      <div>
        <dt>
          <StatusDeVerificacao status="parcial" />
        </dt>
        <dd>
          conferido no resumo ou na página oficial, não no texto completo.
        </dd>
      </div>
      <div>
        <dt>
          <StatusDeVerificacao status="nao-verificado" />
        </dt>
        <dd>ainda não conferido na fonte. Não sustenta nenhum Guia.</dd>
      </div>
      <div>
        <dt>
          <ForcaDaEvidencia forca="forte" />
        </dt>
        <dd>amostra grande e representativa, replicado ou meta-análise.</dd>
      </div>
      <div>
        <dt>
          <ForcaDaEvidencia forca="moderada" />
        </dt>
        <dd>
          bom desenho, mas uma amostra só, um retrato num momento ou um viés
          conhecido.
        </dd>
      </div>
      <div>
        <dt>
          <ForcaDaEvidencia forca="fraca" />
        </dt>
        <dd>
          amostra pequena, não representativa, comercial ou com conflito de
          interesse.
        </dd>
      </div>
    </dl>
  )
}
