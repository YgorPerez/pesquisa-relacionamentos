// As peças da contagem de uso (#35): o "Ajudou?" do fim do Guia, a chave
// "Contar minhas visitas" e o rodapé do site, que a leva.
import { Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { contarEvento, gravarContagem, useEstadoDaContagem } from '#/analytics/contagem'
import { Botao } from './botao'

/** Os quatro motivos do "não", fechados (#21). Sem campo livre. */
export const MOTIVOS = [
  { id: 'nao-respondeu', texto: 'Não respondeu minha dúvida' },
  { id: 'nao-confio', texto: 'Não confio na resposta' },
  { id: 'dificil', texto: 'Difícil de entender' },
  { id: 'nao-vale', texto: 'Não vale para mim' },
] as const

type Passo = 'pergunta' | 'motivo' | 'respondido'

/** "Ajudou?" no fim do Guia: sim, ou não com um dos quatro motivos. */
export function Ajudou({ guia }: { guia: string }) {
  const [passo, setPasso] = useState<Passo>('pergunta')
  const estado = useEstadoDaContagem()
  const responder = (evento: string) => {
    contarEvento(evento)
    setPasso('respondido')
  }

  return (
    <section className="secao ajudou" aria-labelledby="t-ajudou">
      <h2 id="t-ajudou" className="headline">
        Ajudou?
      </h2>
      {passo === 'pergunta' && (
        <div className="ajudou-botoes">
          <Botao variante="leve" onClick={() => responder(`ajudou/sim/${guia}`)}>
            Sim
          </Botao>
          <Botao variante="leve" onClick={() => setPasso('motivo')}>
            Não
          </Botao>
        </div>
      )}
      {passo === 'motivo' && (
        <div role="group" aria-labelledby="t-motivo" className="ajudou-motivos">
          <p id="t-motivo" className="ajudou-pergunta">
            O que faltou?
          </p>
          {MOTIVOS.map((m) => (
            <Botao key={m.id} variante="leve" onClick={() => responder(`ajudou/nao/${m.id}/${guia}`)}>
              {m.texto}
            </Botao>
          ))}
        </div>
      )}
      <p role="status" className="ajudou-obrigado">
        {passo === 'respondido' &&
          (estado === 'conta'
            ? 'Obrigado. A resposta entra na contagem sem nada sobre você.'
            : 'Obrigado. Você pediu para não ser contado, então a resposta não sai do aparelho.')}
      </p>
    </section>
  )
}

/** A chave "Contar minhas visitas". Com GPC ou DNT ela fica desligada e
 * presa, e diz por quê. */
export function ChaveDaContagem() {
  const estado = useEstadoDaContagem()
  const id = useId()
  return (
    <div className="chave-contagem">
      <label className="chave">
        <input
          type="checkbox"
          role="switch"
          checked={estado === 'conta'}
          disabled={estado === null || estado === 'navegador'}
          aria-describedby={estado === 'navegador' ? id : undefined}
          onChange={(e) => gravarContagem(e.target.checked)}
        />
        <span className="chave-trilho" aria-hidden="true" />
        <span>Contar minhas visitas</span>
      </label>
      {estado === 'navegador' && (
        <span id={id} className="chave-nota">
          Desligada: seu navegador pede para não contar (GPC ou Do Not Track).
        </span>
      )}
    </div>
  )
}

/** O rodapé de todas as páginas: a página de privacidade e a chave. */
export function Rodape() {
  return (
    <footer className="rodape-site">
      <div className="rodape-site-dentro">
        <Link to="/privacidade">Privacidade</Link>
        <ChaveDaContagem />
      </div>
    </footer>
  )
}
