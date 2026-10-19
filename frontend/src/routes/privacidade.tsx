import { createFileRoute } from '@tanstack/react-router'
import { ChaveDaContagem } from '#/ui/contagem'

export const Route = createFileRoute('/privacidade')({
  head: () => ({
    meta: [
      { title: 'Privacidade · Tem estudo?' },
      {
        name: 'description',
        content:
          'O que fica no seu aparelho, o que vai num link, o que o servidor anota e o que a contagem de visitas guarda, e por quanto tempo.',
      },
    ],
  }),
  component: Privacidade,
})

/** A página de privacidade (story 73), em linguagem simples. Os prazos são
 * os do deploy (`docs/deploy.md`) e da ADR 0001. */
function Privacidade() {
  return (
    <main className="folha privacidade">
      <div className="coluna">
        <h1 className="display">Privacidade</h1>
        <p className="lead">
          O site não tem conta nem login. O que você diz sobre você fica no seu aparelho, e a gente
          conta as visitas sem saber quem você é.
        </p>

        <section className="secao prosa" aria-labelledby="p-aparelho">
          <h2 id="p-aparelho" className="headline">
            O que fica no seu aparelho
          </h2>
          <p>
            O Perfil (seu gênero, quem você procura e sua idade), os Requisitos do Grupo possível, o
            seu topo 3 em Prioridades e a escolha de ser contado ou não ficam guardados no seu
            navegador. Nada disso vai para o servidor no uso normal: a conta do Grupo possível
            também roda no seu aparelho.
          </p>
          <p>
            Para apagar, limpe os dados deste site nas configurações do navegador. Outra pessoa que
            use o mesmo navegador vê o que ficou salvo.
          </p>
        </section>

        <section className="secao prosa" aria-labelledby="p-link">
          <h2 id="p-link" className="headline">
            O que vai no link
          </h2>
          <p>
            Só quando você toca em “Copiar link” numa calculadora. O link leva o que a conta usa: o
            Perfil e os Requisitos, ou o topo 3 e o desfecho. Ao lado do botão, uma linha diz
            exatamente o que ele mostra. Quem abre o link vê esses dados, e o que estava salvo no
            aparelho dessa pessoa é trocado pelo que veio no link.
          </p>
          <p>
            O servidor recebe esses dados para montar a página, mas não os anota. A prévia que
            aparece numa rede social mostra o resultado e quem se procura, nunca o seu gênero ou a
            sua idade. O link de um Guia não leva nada seu, e a escolha de não ser contado nunca vai
            num link.
          </p>
        </section>

        <section className="secao prosa" aria-labelledby="p-servidor">
          <h2 id="p-servidor" className="headline">
            O que o servidor anota
          </h2>
          <p>
            Como todo site, o servidor anota cada pedido: o endereço IP, a hora, a página sem nada
            depois do “?”, a resposta e quanto tempo levou. Esse registro fica 14 dias e depois é
            apagado. Ele não anota de que site você veio.
          </p>
          <p>
            Quando um pedido dá erro, o registro de erros copia o endereço inteiro, que pode ter os
            dados de um link. Esse registro é apagado depois de 3 dias. O programa do site anota só
            a página, a resposta e o tempo, sem IP, e escreve por cima das linhas mais antigas.
          </p>
        </section>

        <section className="secao prosa" aria-labelledby="p-contagem">
          <h2 id="p-contagem" className="headline">
            O que a contagem de visitas guarda
          </h2>
          <p>
            A contagem usa o GoatCounter, que roda no nosso próprio servidor, em stats.temestudo.com.
            Nenhuma empresa de fora recebe esses dados. Ela guarda:
          </p>
          <ul>
            <li>a página aberta, sem nada depois do “?”;</li>
            <li>o site de onde você veio, sem o resto do endereço;</li>
            <li>a largura da tela;</li>
            <li>o país, tirado do IP na hora. O IP não é guardado.</li>
          </ul>
          <p>
            Ela conta também a resposta do “Ajudou?”, qual Ficha foi aberta a partir de qual Guia e
            se uma calculadora foi usada, uma vez por visita e sem os valores. Nunca recebe o seu
            gênero, quem você procura, a sua idade nem se você preencheu o Perfil. Região, navegador
            e sistema ficam desligados.
          </p>
          <p>
            O GoatCounter não liga as páginas de uma mesma visita: cada página aberta conta uma vez,
            sem código nenhum que acompanhe você de uma página a outra. Tudo o que tem mais de 31
            dias é apagado. A base é o legítimo interesse (LGPD, art. 7º, IX): saber se os Guias
            ajudam.
          </p>
        </section>

        <section className="secao prosa" aria-labelledby="p-nao-contar">
          <h2 id="p-nao-contar" className="headline">
            Não ser contado
          </h2>
          <p>
            Se o seu navegador pede para não ser rastreado (Global Privacy Control ou Do Not Track),
            a contagem nem carrega. Você também pode desligar aqui ou no rodapé de qualquer página. A
            escolha fica no seu aparelho, e abrir um link não a desfaz.
          </p>
          <ChaveDaContagem />
        </section>
      </div>
    </main>
  )
}
