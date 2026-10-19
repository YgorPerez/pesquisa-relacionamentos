// As peças da contagem de uso (#35): o "Ajudou?" do fim do Guia, a chave
// "Contar minhas visitas" e o rodapé do site, que a leva.
import { Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { contarEvento, gravarContagem, useEstadoDaContagem } from '#/analytics/contagem'
import { EVENTOS, MOTIVOS_DO_NAO, type Evento, type MotivoDoNao } from '#/analytics/eventos'
import { Botao } from './botao'

/** O texto de cada um dos quatro motivos do "não" (#21). Sem campo livre. */
const TEXTO_DO_MOTIVO: Readonly<Record<MotivoDoNao, string>> = {
  'nao-respondeu': 'Não respondeu minha dúvida',
  'nao-confio': 'Não confio na resposta',
  dificil: 'Difícil de entender',
  'nao-vale': 'Não vale para mim',
}

type Passo = 'pergunta' | 'motivo' | 'respondido'

/** "Ajudou?" no fim do Guia: sim, ou não com um dos quatro motivos. */
export function Ajudou({ guia }: { guia: string }) {
  const [passo, setPasso] = useState<Passo>('pergunta')
  const estado = useEstadoDaContagem()
  const responder = (evento: Evento) => {
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
          <Botao variante="leve" onClick={() => responder(EVENTOS.ajudouSim(guia))}>
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
          {MOTIVOS_DO_NAO.map((motivo) => (
            <Botao key={motivo} variante="leve" onClick={() => responder(EVENTOS.ajudouNao(motivo, guia))}>
              {TEXTO_DO_MOTIVO[motivo]}
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
