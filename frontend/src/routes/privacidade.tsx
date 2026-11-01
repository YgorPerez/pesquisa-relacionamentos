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
          'O que fica no seu aparelho, o que a conta guarda, como excluí-la, o que vai num link, o que o servidor anota e o que a contagem de visitas guarda.',
      },
    ],
  }),
  component: Privacy,
})

/** The privacy page (story 73), in plain language. The retention times are
 * the deploy's (`docs/deploy.md`) and ADR 0001's; what an account keeps and what
 * deleting it does are ADRs 0045 to 0048's. */
function Privacy() {
  return (
    <Sheet>
      <Column>
        <Display>Privacidade</Display>
        <Lead>
          Você pode ler tudo sem conta. O que você diz sobre você fica no seu
          aparelho, a menos que aceite sincronizar. A conta é opcional e serve
          para publicar comentários e levar seus dados a outros aparelhos.
        </Lead>

        <OnTheDevice />
        <WithAnAccount />
        <InAPublicComment />
        <InAReport />
        <WhenSyncing />
        <Backups />
        <DeletingTheAccount />
        <InTheLink />
        <InAComment />
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
        ou não ficam guardados no seu navegador. A conta do Grupo possível
        também roda no seu aparelho. Nada disso vai para o servidor no uso
        normal, a menos que você aceite sincronizar (abaixo).
      </p>
      <p>
        Os Grifos que você faz num texto, com a Nota de cada um, também ficam no
        navegador. Eles nunca vão para a contagem e só vão para o servidor se
        você sincronizar. A página <Link to="/trechos">Seus trechos</Link>{' '}
        mostra todos. “Tirar grifo” apaga o Grifo e a Nota.
      </p>
      <p>
        Cada Comentário que você envia também fica guardado no navegador, para
        você achar de novo: o trecho, o link, o tipo, o que você escreveu, a
        data, o número que ele ganhou no repositório do curador, a chave que
        permite editá-lo e o status. Seus trechos mostra todos. “Tirar da lista”
        apaga o Comentário deste aparelho, mas ele continua com o curador. O
        navegador também guarda quando consultou os status e quais você já viu.
      </p>
      <p>
        Até onde você leu cada Guia também fica só no navegador. É com isso que
        a página inicial mostra “Continuar lendo” e marca como lido o Guia que
        você terminou. O × de cada item apaga a leitura daquele Guia.
      </p>
      <p>
        O navegador também anota quando você mudou o Perfil, os Requisitos e as
        Prioridades, para saber qual versão é a mais recente se um dia você
        sincronizar. Sincronizando, ele guarda o número da conta e uma cópia do
        que troca com ela.
      </p>
      <p>
        Para apagar, limpe os dados deste site nas configurações do navegador.
        Sair da conta ou excluí-la não faz isso. Outra pessoa que use o mesmo
        navegador vê o que ficou salvo.
      </p>
    </Section>
  )
}

function WithAnAccount() {
  return (
    <Section className="prosa" aria-labelledby="p-conta">
      <Headline id="p-conta">Se você entrar com Google</Headline>
      <p>
        O Google confirma quem você é e nos passa um código que identifica a sua
        conta lá. Guardamos só esse código, o apelido que você escolher e quando
        você declarou ter 18 anos ou mais e aceitou as regras. Não guardamos seu
        nome, e-mail ou foto do Google, então não temos como falar com você. A
        idade é uma declaração sua, e o site não a confere. O Google fica
        sabendo que você entrou aqui.
      </p>
      <p>
        Um cookie reconhece sua sessão por até 30 dias, e o JavaScript não
        consegue lê-lo. Dois outros cookies duram pouco: um protege o login por
        até 10 minutos, e outro avisa, por até 1 minuto, que a conta acabou de
        ser excluída. Sair da conta encerra a sessão deste aparelho. Não apaga a
        conta nem o que ficou no aparelho.
      </p>
      <p>
        A conta fica num banco de dados no nosso servidor. Quem administra o
        servidor pode ler tudo o que está nele: a conta, os comentários, as
        denúncias e os dados sincronizados.
      </p>
    </Section>
  )
}

function InAPublicComment() {
  return (
    <Section className="prosa" aria-labelledby="p-publico">
      <Headline id="p-publico">Se você publicar um comentário</Headline>
      <p>
        O comentário público vai ao ar na hora, sem revisão, e qualquer pessoa
        lê o texto, o trecho citado, a data e o seu apelido, sem precisar de
        conta. Buscadores também podem ler. O banco o guarda ligado à sua conta.
        Não escreva nele dados seus ou de outras pessoas.
      </p>
      <p>
        Uma edição aparece na hora, com a marca “editado”. A versão anterior
        fica guardada, e o curador pode lê-la. Apagar um comentário tira ele, as
        versões anteriores, as denúncias e as respostas, inclusive as de outros
        leitores. O curador vê os comentários com o apelido, nunca o código do
        Google, e pode removê-los.
      </p>
      <p>
        Cada conta pode fazer 10 envios por hora, contando as edições. Para
        isso, o banco anota a conta e a hora de cada envio. As anotações com
        mais de uma hora são apagadas no envio seguinte de qualquer leitor.
      </p>
    </Section>
  )
}

function InAReport() {
  return (
    <Section className="prosa" aria-labelledby="p-denuncia">
      <Headline id="p-denuncia">Se você denunciar um comentário</Headline>
      <p>
        A denúncia guarda qual comentário, a sua conta e a hora. Ela fica ligada
        à sua conta até o comentário sair do site ou você excluir a conta, mesmo
        que o curador mantenha o comentário no ar. É assim que uma conta só
        conta uma vez. A página do curador mostra quantas denúncias há, nunca de
        quem.
      </p>
      <p>
        A primeira denúncia abre uma issue no repositório privado do curador,
        com o número do comentário e os links, sem o texto e sem dizer quem
        denunciou. Denúncias de 3 contas ocultam o comentário até o curador
        decidir.
      </p>
    </Section>
  )
}

function WhenSyncing() {
  return (
    <Section className="prosa" aria-labelledby="p-sincronizar">
      <Headline id="p-sincronizar">Se você sincronizar</Headline>
      <p>
        Entrar não envia nada do aparelho. A sincronização pede sua autorização,
        e cada outro aparelho só entra quando você manda juntar. Se você
        recusar, nada vai.
      </p>
      <p>
        Vão para a conta o Perfil, os Requisitos, as Prioridades, os Grifos, as
        Notas e os Comentários privados enviados, com a chave de edição de cada
        um. Não vão a leitura dos Guias nem a escolha de ser contado. O que um
        link recebido trocou fica só no aparelho, até você editar.
      </p>
      <p>
        Esses dados não têm criptografia de ponta a ponta. Quem administra o
        servidor pode lê-los e ligá-los à sua conta, Notas íntimas inclusive.
      </p>
      <p>
        Tirar um Grifo ou um Comentário da lista apaga o conteúdo da conta e
        deixa só o registro de que ele saiu, para ele não voltar de outro
        aparelho. “Parar neste aparelho” não apaga nada: nem o que está na
        conta, nem o que está no aparelho.
      </p>
    </Section>
  )
}

function Backups() {
  return (
    <Section className="prosa" aria-labelledby="p-copias">
      <Headline id="p-copias">Cópias de segurança</Headline>
      <p>
        Uma vez por dia, o banco inteiro vai criptografado para um armazenamento
        privado fora do servidor. A chave fica guardada à parte. Quem a tem pode
        ler a cópia.
      </p>
      <p>
        Uma conta excluída continua nas cópias feitas antes da exclusão até elas
        serem apagadas. Hoje não há prazo definido para isso: uma cópia fica até
        alguém apagá-la. Se o banco precisar ser restaurado de uma cópia antiga,
        uma conta excluída depois dela pode voltar.
      </p>
    </Section>
  )
}

function DeletingTheAccount() {
  return (
    <Section className="prosa" aria-labelledby="p-excluir">
      <Headline id="p-excluir">Excluir a conta</Headline>
      <p>
        Em <Link to="/conta">Sua conta</Link>, depois de entrar. Não dá para
        desfazer. A exclusão encerra a sessão em todos os aparelhos e apaga do
        banco a conta, o código do Google, o apelido, os dados sincronizados,
        seus comentários públicos com as versões anteriores, suas denúncias e as
        anotações de envio. As respostas de outros leitores aos seus comentários
        saem junto, como quando você apaga um comentário.
      </p>
      <p>
        Você pode escolher manter seus comentários públicos. Eles ficam no ar
        como “leitor removido”, com as respostas, as versões anteriores e o
        trecho citado, e nada os liga mais a você. Depois disso você não
        consegue editá-los nem apagá-los. Se você escreveu seu nome ou algo que
        diga quem é num deles, isso continua lá, então confira antes.
      </p>
      <p>
        Um comentário oculto por denúncias continua oculto depois que quem
        denunciou exclui a conta, até o curador decidir. Se a sua era a única
        denúncia de um comentário no ar, ele sai da fila do curador.
      </p>
      <p>
        O que está nos seus aparelhos fica neles. Este aparelho deixa de
        sincronizar, e os outros só voltam a enviar dados a uma conta se você
        juntar de novo. Entrar depois com o mesmo Google cria uma conta nova,
        sem nada da antiga.
      </p>
      <p>
        Alguns registros não têm ligação com a conta e seguem o próprio caminho:
        os Comentários privados já enviados continuam com o curador, as issues
        de denúncia continuam no repositório dele, e os registros do servidor e
        a contagem de visitas expiram nos prazos abaixo. As{' '}
        <a href="#p-copias">cópias de segurança</a> também seguem o prazo delas.
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

/** "Comentar" (#337, ADR 0043): what goes, where, and that it is
 * anonymous. */
function InAComment() {
  return (
    <Section className="prosa" aria-labelledby="p-comentario">
      <Headline id="p-comentario">O que vai num Comentário privado</Headline>
      <p>
        Para consultar o status dos seus Comentários ainda recebidos, o
        navegador envia só os números ao servidor, uma vez por visita e no
        máximo a cada seis horas. O servidor consulta o GitHub e guarda a
        resposta na memória por dez minutos. Nem os números nem os status entram
        no log. A resposta traz só Recebido, Corrigido ou Não vamos mudar, nunca
        o texto da issue.
      </p>
      <p>
        Só quando você seleciona um trecho, toca em “Comentar” e envia. Vão o
        tipo que você escolheu, o que você escreveu, o trecho selecionado, o
        link para ele e o título da página. Mais nada: nem nome, nem e-mail, nem
        o seu IP, nem o seu navegador, nem o Perfil.
      </p>
      <p>
        O Comentário vira uma issue num repositório privado do GitHub, que só o
        curador lê, e nunca aparece no site. Ele não pede login e não leva a sua
        conta, mesmo que você tenha entrado. Por isso ele é anônimo, e também
        não tem como a gente responder. Não escreva nele nada que diga quem você
        é. Se você sincronizar, uma cópia dele vai para a sua conta (acima).
      </p>
      <p>
        Na volta, o servidor manda só o número da issue e uma chave sorteada,
        que o seu navegador guarda junto com uma cópia do Comentário (acima, em
        “O que fica no seu aparelho”). A chave fica só no seu aparelho: a issue
        guarda uma impressão dela da qual não dá para tirar a chave.
      </p>
      <p>
        Enquanto o Comentário está Recebido, você pode editá-lo deste aparelho.
        Vão o número da issue, a chave, o tipo e o novo texto. O servidor só
        troca o tipo e o texto da issue se a chave bater; o trecho e o link
        ficam. O GitHub guarda o texto anterior no histórico da issue, que só o
        curador vê. Quem apagar os dados do site perde a chave, e o Comentário
        não pode mais ser editado.
      </p>
      <p>
        Para barrar spam, o servidor conta quantos Comentários e edições saem de
        cada IP na última hora. Essa conta fica só na memória do servidor, nunca
        vai para um arquivo nem para a issue, e some quando ele reinicia. O
        envio entra no registro do servidor como qualquer pedido (abaixo), sem o
        texto. A contagem de visitas conta que um Comentário foi enviado, sem o
        texto nem a página.
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
