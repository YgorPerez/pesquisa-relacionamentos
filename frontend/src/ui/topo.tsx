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
    <header className="border-b-2 border-tinta bg-papel">
      <div className="mx-auto flex max-w-pagina items-center justify-between gap-3 px-md py-xs">
        <Link to="/" className="inline-flex min-h-toque items-center font-headline text-nivel leading-none font-bold tracking-headline no-underline">
          Tem estudo?
        </Link>
        {tema?.tema && (
          <Link
            to="/$tema"
            params={{ tema: tema.tema }}
            className="group inline-flex min-h-toque items-center font-label text-etiqueta leading-curta font-bold no-underline"
          >
            <span className="rounded-mao-2 border-(length:--traco-etiqueta) border-tinta bg-folha px-2.5 py-1.25 group-hover:underline group-hover:decoration-(length:--traco-etiqueta) group-hover:underline-offset-4">{tema.temaTitulo}</span>
          </Link>
        )}
      </div>
    </header>
  )
}
