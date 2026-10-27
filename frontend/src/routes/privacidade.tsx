import { createFileRoute, Link } from '@tanstack/react-router'
import { CountingSwitch } from '#/ui/counting'
import { Column, Display, Sheet, Lead } from '#/ui/sheet'
import { Headline, Section } from '#/ui/section'

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
  component: Privacy,
})

/** The privacy page (story 73), in plain language. The retention times are
 * the deploy's (`docs/deploy.md`) and ADR 0001's. */
function Privacy() {
  return (
    <Sheet>
      <Column>
        <Display>Privacidade</Display>
        <Lead>
          O site não tem conta nem login. O que você diz sobre você fica no seu
          aparelho, e a gente conta as visitas sem saber quem você é.
        </Lead>

        <OnTheDevice />
        <InTheLink />
        <OnTheServer />
        <InTheCount />
        <NotBeingCounted />
      </Column>
    </Sheet>
  )
}

function OnTheDevice() {
  return (
    <Section className="prosa" aria-labelledby="p-aparelho">
      <Headline id="p-aparelho">O que fica no seu aparelho</Headline>
      <p>
        O Perfil (seu gênero, quem você procura e sua idade), os Requisitos do
        Grupo possível, o seu topo 3 em Prioridades e a escolha de ser contado
        ou não ficam guardados no seu navegador. Nada disso vai para o servidor
        no uso normal: a conta do Grupo possível também roda no seu aparelho.
      </p>
      <p>
        Os Grifos que você faz num texto, com a Nota de cada um, também ficam só
        no navegador: não vão para o servidor nem para a contagem. A página{' '}
        <Link to="/grifos">Grifos</Link> mostra todos. “Tirar grifo” apaga o
        Grifo e a Nota.
      </p>
      <p>
        Até onde você leu cada Guia também fica só no navegador. É com isso que
        a página inicial mostra “Continuar lendo” e marca como lido o Guia que
        você terminou. O × de cada item apaga a leitura daquele Guia.
      </p>
      <p>
        Para apagar, limpe os dados deste site nas configurações do navegador.
        Outra pessoa que use o mesmo navegador vê o que ficou salvo.
      </p>
    </Section>
  )
}

function InTheLink() {
  return (
    <Section className="prosa" aria-labelledby="p-link">
      <Headline id="p-link">O que vai no link</Headline>
      <p>
        Só quando você toca em “Copiar link” numa calculadora. O link leva o que
        a conta usa: o Perfil e os Requisitos, ou o topo 3 e o desfecho. Ao lado
        do botão, uma linha diz exatamente o que ele mostra. Quem abre o link vê
        esses dados, e o que estava salvo no aparelho dessa pessoa é trocado
        pelo que veio no link.
      </p>
      <p>
        O servidor recebe esses dados para montar a página, mas não os anota. A
        prévia que aparece numa rede social mostra o resultado e quem se
        procura, nunca o seu gênero ou a sua idade. O link de um Guia não leva
        nada seu, e a escolha de não ser contado nunca vai num link.
      </p>
    </Section>
  )
}

function OnTheServer() {
  return (
    <Section className="prosa" aria-labelledby="p-servidor">
      <Headline id="p-servidor">O que o servidor anota</Headline>
      <p>
        Como todo site, o servidor anota cada pedido: o endereço IP, a hora, a
        página sem nada depois do “?”, a resposta e quanto tempo levou. Esse
        registro fica 14 dias e depois é apagado. Ele não anota de que site você
        veio.
      </p>
      <p>
        Quando um pedido dá erro, o registro de erros copia o endereço inteiro,
        que pode ter os dados de um link. Esse registro é apagado depois de 3
        dias. O programa do site anota só a página, a resposta e o tempo, sem
        IP, e escreve por cima das linhas mais antigas.
      </p>
    </Section>
  )
}

function InTheCount() {
  return (
    <Section className="prosa" aria-labelledby="p-contagem">
      <Headline id="p-contagem">O que a contagem de visitas guarda</Headline>
      <p>
        A contagem usa o GoatCounter, que roda no nosso próprio servidor, em
        stats.temestudo.cloud. Nenhuma empresa de fora recebe esses dados. Ela
        guarda:
      </p>
      <ul>
        <li>a página aberta, sem nada depois do “?”;</li>
        <li>o site de onde você veio, sem o resto do endereço;</li>
        <li>a largura da tela;</li>
        <li>o país, tirado do IP na hora. O IP não é guardado.</li>
      </ul>
      <p>
        Ela conta também a resposta do “Ajudou?”, qual Ficha foi aberta a partir
        de qual Guia e se uma calculadora foi usada, uma vez por visita e sem os
        valores. Quando você toca num Guia em “Continuar lendo”, conta qual Guia
        foi, mas não onde você tinha parado. Quando você abre a página de um
        site vizinho, conta só qual site foi. Quando uma busca não acha nada,
        conta que isso aconteceu, nunca o que você buscou. Nunca recebe o seu
        gênero, quem você procura, a sua idade nem se você preencheu o Perfil.
        Região, navegador e sistema ficam desligados.
      </p>
      <p>
        O GoatCounter não liga as páginas de uma mesma visita: cada página
        aberta conta uma vez, sem código nenhum que acompanhe você de uma página
        a outra. Tudo o que tem mais de 31 dias é apagado. A base é o legítimo
        interesse (LGPD, art. 7º, IX): saber se os Guias ajudam.
      </p>
    </Section>
  )
}

/** With the switch that turns the count off on this device. */
function NotBeingCounted() {
  return (
    <Section className="prosa" aria-labelledby="p-nao-contar">
      <Headline id="p-nao-contar">Não ser contado</Headline>
      <p>
        Se o seu navegador pede para não ser rastreado (Global Privacy Control
        ou Do Not Track), a contagem nem carrega. Você também pode desligar aqui
        ou no rodapé de qualquer página. A escolha fica no seu aparelho, e abrir
        um link não a desfaz.
      </p>
      <CountingSwitch className="mt-sm" />
    </Section>
  )
}
