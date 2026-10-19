import { Link, useMatches } from '@tanstack/react-router'

interface ComTema {
  readonly tema?: string
  readonly temaTitulo?: string
}

/** A barra do topo: o nome do site à esquerda, que leva ao início, e na
 * página do Guia a etiqueta do Tema à direita, que leva ao Tema. */
export function Topo() {
  const tema = useMatches({
    select: (matches) =>
      matches
        .map((m) => m.loaderData as ComTema | undefined)
        .find((dados) => dados?.tema && dados.temaTitulo),
  })

  return (
    <header className="topo">
      <div className="topo-dentro">
        <Link to="/" className="topo-nome">
          Tem estudo?
        </Link>
        {tema?.tema && (
          <Link
            to="/$tema"
            params={{ tema: tema.tema }}
            className="etiqueta-tema"
          >
            <span>{tema.temaTitulo}</span>
          </Link>
        )}
      </div>
    </header>
  )
}
