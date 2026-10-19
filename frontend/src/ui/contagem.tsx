// As peças da contagem de uso (#35): o "Ajudou?" do fim do Guia, a chave
// "Contar minhas visitas" e o rodapé do site, que a leva.
import { Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import {
  contarEvento,
  gravarContagem,
  useEstadoDaContagem,
} from '#/analytics/contagem'
import {
  EVENTOS,
  MOTIVOS_DO_NAO,
  type Evento,
  type MotivoDoNao,
} from '#/analytics/eventos'
import { cn } from '@/platform/cn'
import { Botao } from './botao'
import { Headline, Secao } from './pagina'
import { Switch } from './shadcn/switch'

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
    <Secao aria-labelledby="t-ajudou">
      <Headline id="t-ajudou">Ajudou?</Headline>
      {passo === 'pergunta' && (
        <div className="flex gap-2.5">
          <Botao
            variante="leve"
            className="min-w-22"
            onClick={() => responder(EVENTOS.ajudouSim(guia))}
          >
            Sim
          </Botao>
          <Botao
            variante="leve"
            className="min-w-22"
            onClick={() => setPasso('motivo')}
          >
            Não
          </Botao>
        </div>
      )}
      {passo === 'motivo' && (
        <div
          role="group"
          aria-labelledby="t-motivo"
          className="flex flex-col items-start gap-2"
        >
          <p id="t-motivo" className="m-0 mb-0.5 font-bold">
            O que faltou?
          </p>
          {MOTIVOS_DO_NAO.map((motivo) => (
            <Botao
              key={motivo}
              variante="leve"
              onClick={() => responder(EVENTOS.ajudouNao(motivo, guia))}
            >
              {TEXTO_DO_MOTIVO[motivo]}
            </Botao>
          ))}
        </div>
      )}
      <p role="status" className="m-0 text-tinta-2 empty:hidden">
        {passo === 'respondido' &&
          (estado === 'conta'
            ? 'Obrigado. A resposta entra na contagem sem nada sobre você.'
            : 'Obrigado. Você pediu para não ser contado, então a resposta não sai do aparelho.')}
      </p>
    </Secao>
  )
}

/** A chave "Contar minhas visitas". Com GPC ou DNT ela fica desligada e
 * presa, e diz por quê. */
export function ChaveDaContagem({ className }: { className?: string }) {
  const estado = useEstadoDaContagem()
  const id = useId()
  const presa = estado === null || estado === 'navegador'
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <label
        className={cn(
          'relative inline-flex min-h-toque items-center gap-2.5 font-bold text-tinta',
          presa ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <Switch
          checked={estado === 'conta'}
          disabled={presa}
          aria-describedby={estado === 'navegador' ? id : undefined}
          onCheckedChange={(ligada) => gravarContagem(ligada)}
        />
        <span className={presa ? 'text-tinta-2' : undefined}>
          Contar minhas visitas
        </span>
      </label>
      {estado === 'navegador' && (
        <span
          id={id}
          className="text-label leading-body font-normal text-tinta-2"
        >
          Desligada: seu navegador pede para não contar (GPC ou Do Not Track).
        </span>
      )}
    </div>
  )
}

/** O rodapé de todas as páginas: a página de privacidade e a chave. No
 * desktop, ele continua a folha da página sobre a retícula. */
export function Rodape() {
  return (
    <footer className="mx-auto max-w-pagina border-t-2 border-tinta p-md text-nota text-tinta-2 folha:border-2 folha:border-t-0 folha:bg-papel folha:px-16">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5">
        <Link
          to="/privacidade"
          className="inline-flex min-h-toque items-center font-bold text-tinta"
        >
          Privacidade
        </Link>
        <ChaveDaContagem />
      </div>
    </footer>
  )
}
