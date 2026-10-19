// "Copiar link" (#34, stories 62–63): o botão, a linha que diz o que o link
// revela e o aviso de que o site conta o uso sem guardar o gênero. A
// calculadora passa a query do estado; o Guia não passa nada, e o link sai
// sem query.
import { useState } from 'react'
import { Botao } from './botao'

type Copia = { readonly tipo: 'nada' } | { readonly tipo: 'copiado' } | { readonly tipo: 'falhou'; readonly link: string }

export function Compartilhar({
  query,
  frase,
  aviso,
  semTitulo = false,
}: {
  /** Sem o título "Compartilhar": o Guia tem a ordem de seções do #7, e esta não é uma delas. */
  semTitulo?: boolean
  /** A query sem o `?`; sem ela, o link é só o endereço da página. */
  query?: string
  /** O que o link revela, numa linha. */
  frase: string
  /** O aviso sobre a contagem, quando o link leva estado. */
  aviso?: string
}) {
  const [copia, setCopia] = useState<Copia>({ tipo: 'nada' })

  const copiar = async () => {
    const { origin, pathname } = window.location
    const link = `${origin}${pathname}${query ? `?${query}` : ''}`
    try {
      await navigator.clipboard.writeText(link)
      setCopia({ tipo: 'copiado' })
    } catch {
      // Sem permissão para a área de transferência: o link aparece para copiar à mão.
      setCopia({ tipo: 'falhou', link })
    }
  }

  return (
    <section
      className="secao compartilhar"
      {...(semTitulo ? { 'aria-label': 'Compartilhar' } : { 'aria-labelledby': 't-compartilhar' })}
    >
      {!semTitulo && (
        <h2 id="t-compartilhar" className="headline">
          Compartilhar
        </h2>
      )}
      <div className="compartilhar-linha">
        <Botao onClick={copiar}>Copiar link</Botao>
        <p className="compartilhar-frase">{frase}</p>
      </div>
      {aviso && <p className="compartilhar-aviso">{aviso}</p>}
      <p role="status" className="compartilhar-status">
        {copia.tipo === 'copiado' ? 'Link copiado.' : copia.tipo === 'falhou' ? 'Não deu para copiar. O link está aqui embaixo:' : ''}
      </p>
      {copia.tipo === 'falhou' && (
        <input
          className="campo compartilhar-campo"
          readOnly
          value={copia.link}
          aria-label="Link para copiar"
          onFocus={(e) => e.currentTarget.select()}
          autoFocus
        />
      )}
    </section>
  )
}

export const AVISO_DA_CONTAGEM = 'O site conta as visitas do link sem guardar o gênero nem quem se procura.'
