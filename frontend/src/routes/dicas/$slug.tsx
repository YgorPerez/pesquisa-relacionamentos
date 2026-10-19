import { createFileRoute, Link } from '@tanstack/react-router'
import { buscarDica } from '#/conteudo/guias'
import { FichasCitadas } from '#/ui/guia'
import { LinhaDePergunta } from '#/ui/linha-da-pergunta'
import { ForcaDaEvidencia } from '#/ui/selos'
import { LinkDeVoltar } from '#/ui/navegacao'
import {
  Coluna,
  Display,
  Folha,
  Headline,
  Lead,
  Painel,
  Secao,
} from '#/ui/pagina'

export const Route = createFileRoute('/dicas/$slug')({
  loader: ({ params }) => buscarDica({ data: params.slug }),
  head: ({ loaderData: dica }) => ({
    meta: dica
      ? [
          { title: `${dica.busca.titulo} · Tem estudo?` },
          { name: 'description', content: dica.busca.descricao },
        ]
      : [],
  }),
  notFoundComponent: DicaNaoExiste,
  component: PaginaDaDica,
})

function PaginaDaDica() {
  const dica = Route.useLoaderData()

  return (
    <Folha>
      <Coluna>
        <LinkDeVoltar to="/dicas">Todas as Dicas</LinkDeVoltar>

        <Display ficha>{dica.texto}</Display>

        <Painel
          como="section"
          className="[&>p]:m-0"
          aria-label="Quanto a evidência pesa"
        >
          <div className="mt-0 flex flex-wrap items-center gap-x-4 gap-y-1">
            <ForcaDaEvidencia forca={dica.forca} rotulo />
          </div>
          {dica.inferencia && (
            <p className="mt-1 mb-0 text-nota text-tinta-2 italic">
              Inferência nossa: nenhum estudo testou isso direto. Saiu das
              Fichas citadas.
            </p>
          )}
          <p className="mt-xs mb-0 text-label leading-nota font-normal text-tinta-2">
            <b className="text-tinta">Vale para:</b> {dica.valePara}
          </p>
        </Painel>

        <Secao aria-labelledby="t-guias">
          <Headline id="t-guias">Aparece nos Guias</Headline>
          {dica.guias.length === 0 ? (
            <p className="text-tinta-2">Nenhum Guia traz esta Dica ainda.</p>
          ) : (
            <ul className="isolate m-0 list-none p-0">
              {dica.guias.map((guia) => (
                <li key={guia.slug} className="not-first:mt-md">
                  <LinhaDePergunta guia={guia} />
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao aria-labelledby="t-fichas">
          <Headline id="t-fichas">Fichas citadas</Headline>
          <FichasCitadas fichas={dica.fichas} />
        </Secao>
      </Coluna>
    </Folha>
  )
}

function DicaNaoExiste() {
  return (
    <Folha>
      <Coluna>
        <Display>Essa Dica não está no ar</Display>
        <Lead>
          O endereço pode ter mudado, ou a Dica ainda espera os estudos serem
          conferidos. <Link to="/dicas">Veja as Dicas publicadas</Link>.
        </Lead>
      </Coluna>
    </Folha>
  )
}
