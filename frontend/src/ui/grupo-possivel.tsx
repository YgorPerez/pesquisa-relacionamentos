// As peças da página do Grupo possível (#19, variante A): o número preso no
// topo, os controles dos Requisitos (todos sem arrastar: botões de passo,
// campo de número, opções e caixas de marcar) e a conta com as dobras.
import type { Custo, Estimativa, RequisitoId } from '@tem-estudo/regras/grupo-possivel'
import { formatarFaixa, formatarQuantidade, formatarVezes } from '@tem-estudo/regras/numeros'
import type { Perfil } from '@tem-estudo/regras/perfil'
import {
  TITULO_DO_REQUISITO,
  valorDoRequisito,
  type Requisitos,
} from '@tem-estudo/regras/requisitos'
import { Link } from '@tanstack/react-router'
import { useId, useState, type ReactNode } from 'react'
import { NOME_DO_ALVO, textoDoCusto } from './grupo-possivel.textos'

/** A faixa com os números no marca-texto rosa e, se for o caso, "instável". */
export function Faixa({ estimativa }: { estimativa: Estimativa }) {
  const { min, max, instavel } = estimativa.resultado
  const texto = formatarFaixa(min, max)
  const [, antes = '', numeros = texto] = /^(entre |cerca de )?(.*)$/.exec(texto) ?? []
  return (
    <p className="gp-faixa">
      {antes}
      <mark className="numero-chave">{numeros}</mark>
      {instavel && <span className="gp-instavel">instável</span>}
    </p>
  )
}

/** "o que mais pesa: idade (×3,4)". */
function MaisPesa({ estimativa }: { estimativa: Estimativa }) {
  const primeiro = estimativa.custos[0]
  if (!primeiro) return <>nenhum Requisito corta o grupo</>
  return (
    <>
      o que mais pesa: <b>{TITULO_DO_REQUISITO[primeiro.requisito as keyof typeof TITULO_DO_REQUISITO].toLowerCase()}</b>{' '}
      ({formatarVezes(primeiro.vezes)})
    </>
  )
}

/** O Grupo possível preso no topo enquanto a página rola. */
export function NumeroPreso({ estimativa, carregando }: { estimativa: Estimativa; carregando: boolean }) {
  return (
    <section className="gp-preso painel" aria-labelledby="gp-preso-titulo" aria-busy={carregando}>
      <h2 id="gp-preso-titulo" className="gp-rotulo">
        Grupo possível
      </h2>
      <div aria-live="polite" aria-atomic="true" className={carregando ? 'gp-carregando' : undefined}>
        <Faixa estimativa={estimativa} />
      </div>
      <p className="gp-linha2">
        <span>
          <MaisPesa estimativa={estimativa} />
        </span>
        <a href="#a-conta">ver a conta</a>
      </p>
    </section>
  )
}

/** Uma linha de Requisito: título, valor de agora, controle e custo. */
export function LinhaDoRequisito({
  requisito,
  valor,
  custo,
  ligado,
  children,
  nota,
}: {
  requisito: keyof typeof TITULO_DO_REQUISITO
  valor: string
  custo: Custo | undefined
  ligado: boolean
  children: ReactNode
  nota?: ReactNode
}) {
  return (
    <div className={ligado ? 'gp-req gp-req-ligado' : 'gp-req'} id={`req-${requisito}`}>
      <div className="gp-req-cab">
        <h3 className="gp-req-titulo">{TITULO_DO_REQUISITO[requisito]}</h3>
        <span className="gp-req-valor">{valor}</span>
      </div>
      {children}
      {nota}
      <p className="gp-req-custo">{custo ? textoDoCusto(custo) : ligado ? '' : 'não corta ninguém'}</p>
    </div>
  )
}

const Menos = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M3 9.2c4-.3 8-.1 12-.3" />
  </svg>
)
const Mais = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M3 9.2c4-.3 8-.1 12-.3M9.1 3c-.2 4 .1 8-.1 12" />
  </svg>
)

/** Um número com botões de passo e campo para digitar: troca o slider, que
 * pede arrastar. Cada toque muda o valor e a conta. */
export function Passos({
  rotulo,
  valor,
  min,
  max,
  passo = 1,
  unidade,
  aoMudar,
}: {
  rotulo: string
  valor: number
  min: number
  max: number
  passo?: number
  /** "anos", "cm"; recebe o valor para dizer "80 ou mais". */
  unidade: (valor: number) => string
  aoMudar: (valor: number) => void
}) {
  const id = useId()
  const [texto, setTexto] = useState(String(valor))
  // Um valor novo de fora (os botões, outra aba) reescreve o campo. Trocado
  // durante o render, como o React manda ajustar o estado quando a prop muda.
  const [valorVisto, setValorVisto] = useState(valor)
  if (valorVisto !== valor) {
    setValorVisto(valor)
    setTexto(String(valor))
  }
  const mudar = (novo: number) => aoMudar(Math.min(max, Math.max(min, novo)))

  return (
    <div className="gp-passos">
      <label htmlFor={id} className="gp-passos-rotulo">
        {rotulo}
      </label>
      <div className="gp-passos-controle">
        <button
          type="button"
          className="gp-passo"
          onClick={() => mudar(valor - passo)}
          disabled={valor <= min}
          aria-label={`${rotulo}: menos ${passo}`}
          aria-controls={id}
        >
          <Menos />
        </button>
        <input
          id={id}
          className="campo gp-numero"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={passo}
          value={texto}
          aria-describedby={`${id}-unidade`}
          onChange={(e) => {
            setTexto(e.target.value)
            // Vazio ou incompleto dá `NaN`, que não é inteiro: só o número
            // inteiro dentro da faixa muda o Requisito.
            const n = e.target.valueAsNumber
            if (Number.isInteger(n) && n >= min && n <= max) aoMudar(n)
          }}
          onBlur={() => setTexto(String(valor))}
        />
        <button
          type="button"
          className="gp-passo"
          onClick={() => mudar(valor + passo)}
          disabled={valor >= max}
          aria-label={`${rotulo}: mais ${passo}`}
          aria-controls={id}
        >
          <Mais />
        </button>
        <span id={`${id}-unidade`} className="gp-unidade">
          {unidade(valor)}
        </span>
      </div>
    </div>
  )
}

/** Opções em chips (o rádio ou a caixa fica invisível por cima). */
export function Opcoes<T extends string>({
  legenda,
  tipo,
  valores,
  rotulos,
  marcados,
  aoMudar,
  dica,
}: {
  legenda: string
  tipo: 'radio' | 'checkbox'
  valores: ReadonlyArray<T>
  rotulos: Readonly<Record<T, string>>
  marcados: ReadonlyArray<T>
  aoMudar: (valor: T, marcado: boolean) => void
  dica?: string
}) {
  const nome = useId()
  const marcado = new Set(marcados)
  return (
    <fieldset className="gp-opcoes">
      <legend className="visualmente-oculto">{legenda}</legend>
      <div className="opcoes">
        {valores.map((valor) => (
          <label key={valor} className="opcao">
            <input
              type={tipo}
              name={nome}
              value={valor}
              checked={marcado.has(valor)}
              onChange={(e) => aoMudar(valor, e.target.checked)}
            />
            <span>{rotulos[valor]}</span>
          </label>
        ))}
      </div>
      {dica && <p className="gp-dica">{dica}</p>}
    </fieldset>
  )
}

/** Uma caixa de marcar em forma de chip ("Só quem não fuma"). */
export function Marcar({
  rotulo,
  marcado,
  aoMudar,
  desabilitado,
  descricao,
}: {
  rotulo: string
  marcado: boolean
  aoMudar: (marcado: boolean) => void
  desabilitado?: boolean
  descricao?: string
}) {
  return (
    <label className={desabilitado ? 'opcao gp-marcar gp-desabilitado' : 'opcao gp-marcar'}>
      <input
        type="checkbox"
        checked={marcado}
        disabled={desabilitado}
        aria-describedby={descricao}
        onChange={(e) => aoMudar(e.target.checked)}
      />
      <span>
        <Visto marcado={marcado} />
        {rotulo}
      </span>
    </label>
  )
}

const Visto = ({ marcado }: { marcado: boolean }) => (
  <svg className="gp-visto" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 3.4c4.6-.4 9.2-.2 13.8-.3.3 4.5.2 9 .3 13.5-4.6.3-9.2.2-13.8.3-.2-4.5-.1-9-.3-13.5Z" />
    {marcado && <path d="M5.6 10.4l3 3.1 6-7.6" strokeWidth="2.2" />}
  </svg>
)

/** O corte a corte e a incerteza, recolhidos. */
export function Dobras({
  estimativa,
  perfil,
  requisitos,
  municipio,
}: {
  estimativa: Estimativa
  perfil: Perfil | null
  requisitos: Requisitos
  municipio: string | undefined
}) {
  const { base, funil, ingenua, ressalvas, ligados, resultado } = estimativa
  const diferenca = resultado.central > 0 ? (ingenua - resultado.central) / resultado.central : 0
  const valor = (k: RequisitoId) => valorDoRequisito(k, perfil, requisitos, municipio)
  return (
    <>
      <details className="gp-dobra" id="gp-corte-a-corte">
        <summary>Corte a corte</summary>
        <ol className="gp-funil">
          <li>
            <span>{NOME_DO_ALVO[estimativa.alvo]} de 18 anos ou mais no Brasil</span>
            <b>{formatarQuantidade(base.central)}</b>
          </li>
          {funil.map((etapa) => (
            <li key={etapa.requisito}>
              <span>{valor(etapa.requisito)}</span>
              <b>{formatarQuantidade(etapa.central)}</b>
            </li>
          ))}
        </ol>
        <p className="gp-dica">A ordem dos cortes não muda o resultado final.</p>
      </details>
      <details className="gp-dobra" id="gp-incerteza">
        <summary>De onde vem a incerteza</summary>
        {ligados.length > 1 && (
          <p className="gp-ingenua">
            Se só multiplicássemos a porcentagem que cada Requisito deixa sozinho no Brasil, daria{' '}
            <b>{formatarQuantidade(ingenua)}</b> ({diferenca >= 0 ? '+' : '−'}
            {Math.abs(Math.round(diferenca * 100))}%). Os Requisitos andam juntos; por isso o site cruza os dados.
          </p>
        )}
        <p className="gp-dica">
          A faixa junta o erro de amostra do Censo ({Math.round(resultado.registros).toLocaleString('pt-BR')} registros) com o
          intervalo da PNS.
        </p>
        <ul className="gp-ressalvas">
          {ressalvas
            .filter((r) => !r.forte)
            .map((r) => (
              <li key={r.id}>{r.texto}</li>
            ))}
        </ul>
      </details>
    </>
  )
}

const Seta = () => (
  <svg width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 8.5C9 7.4 16 8.2 23 8M23 8l-6-5.5M23 8l-6 5.5" />
  </svg>
)

/** "370 mil adultos", "1,2 milhão de adultos": só o número vai no rosa. */
function AdultosNoBrasil({ quantidade }: { quantidade: number }) {
  const numero = formatarQuantidade(quantidade)
  return (
    <>
      <mark className="numero-chave">{numero}</mark>
      {numero.includes('milh') ? ' de adultos' : ' adultos'}
    </>
  )
}

/** O cartão do Guia B5 (#19, variante A). Sem uso, o número do Brasil inteiro
 * e o convite; com Perfil ou Requisitos, a conta de agora em resumo. */
export function CartaoDoGrupoPossivel({
  estimativa,
  usado,
  ligados,
  carregando,
}: {
  estimativa: Estimativa
  /** O visitante já disse o Perfil ou mexeu nos Requisitos. */
  usado: boolean
  /** Os Requisitos ligados, escritos como na frase ("25 a 35 anos"). */
  ligados: ReadonlyArray<string>
  carregando: boolean
}) {
  return (
    <section className="secao cartao-calculadora" aria-labelledby="t-cartao-gp">
      <h2 id="t-cartao-gp" className="headline">
        {usado ? 'Seu Grupo possível' : 'Faça a conta'}
      </h2>
      <div className="painel com-reticula">
        {usado ? (
          <div aria-busy={carregando} className={carregando ? 'gp-carregando' : undefined}>
            <Faixa estimativa={estimativa} />
            <p className="cartao-gp-sub">{NOME_DO_ALVO[estimativa.alvo]} que atendem a tudo o que você pediu</p>
            <p className="cartao-gp-ligados">
              Seus Requisitos:{' '}
              {ligados.length > 0
                ? ligados.map((valor, i) => (
                    <span key={valor}>
                      {i > 0 && ', '}
                      <b>{valor}</b>
                    </span>
                  ))
                : 'nenhum'}
              .
            </p>
            <p className="cartao-gp-pesa">
              <MaisPesa estimativa={estimativa} />
            </p>
          </div>
        ) : (
          <>
            <p className="rotulo-calculadora">Grupo possível</p>
            <p className="cartao-gp-frase">
              No Brasil, <AdultosNoBrasil quantidade={estimativa.resultado.central} /> não moram com companheiro(a).
              Quantos deles atendem ao que você procura?
            </p>
          </>
        )}
        <p className="acoes-calculadora">
          <Link to="/grupo-possivel" className="botao com-reticula botao-link">
            {usado ? 'Ajustar os Requisitos' : 'Fazer a conta'}
            <Seta />
          </Link>
        </p>
      </div>
    </section>
  )
}
