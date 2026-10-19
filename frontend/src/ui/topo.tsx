import { Link } from '@tanstack/react-router'

/** A barra do topo: o nome do site à esquerda, que leva ao início. A
 * etiqueta do Tema entra à direita quando houver Guias. */
export function Topo() {
  return (
    <header className="topo">
      <div className="topo-dentro">
        <Link to="/" className="topo-nome">
          Tem estudo?
        </Link>
      </div>
    </header>
  )
}
