---
question: O lugar onde nos conhecemos ==muda== a relação?
confidence: moderate
findings:
  - text: Um painel nacional acompanhou casais por seis anos. Com o mesmo perfil, os casais que se conheceram online a partir de 1995 terminaram no mesmo ritmo dos outros, 7,0% contra 7,3% ao ano. Esses casais se conheceram até 2009, antes dos apps de celular.
    fact_sheets: [rosenfeld-2017-marriage-choice-couplehood]
    myths:
      - claim: Relação que começa em app dura menos.
        why_not: Nos EUA, os casais que se conheceram online terminaram no mesmo ritmo dos outros, 7,0% contra 7,3% ao ano. Esses dados são de antes do Tinder; com dados de 2017, como o casal se conheceu também não mudou o risco de término.
        fact_sheets:
          [
            rosenfeld-2017-marriage-choice-couplehood,
            rosenfeld-2019-disintermediating-friends,
          ]
  - text: Sem nenhum controle, os casais online tinham 2,46 vezes a chance de terminar. Eles estavam juntos havia 4,4 anos em média, contra 19,1 dos outros; com o tempo de relação levado em conta, a diferença deixou de ser significativa.
    fact_sheets: [rosenfeld-2017-marriage-choice-couplehood]
  - text: Com os dados de 2017, que já pegam a época dos apps, como o casal se conheceu também não mudou o risco de término, depois de levar em conta a década em que se conheceram.
    fact_sheets: [rosenfeld-2019-disintermediating-friends]
  - text: Em 2009, quem tinha se conhecido online dava à relação a mesma nota que a média dos casais, 4,48 contra 4,47 numa escala de 1 a 5. Um ano depois, entre os casais formados na década anterior, 15,6% dos que se conheceram online tinham terminado, contra 17,8% dos outros, uma diferença sem significância.
    fact_sheets: [rosenfeld-2012-searching-for-a-mate]
  - text: Quem se conheceu num site de namoro casou mais rápido. Metade desses casais casou em 3 a 4 anos de relação; entre os que se conheceram fora da internet, levou mais de 10. Foram só 13 casamentos, e o autor diz que isso pode vir de quem já queria casar ter escolhido o site.
    fact_sheets: [rosenfeld-2017-marriage-choice-couplehood]
  - text: Num painel que acompanhou casais de 18 a 48 anos, os casais que começaram online casaram mais. Valeu para os homens de qualquer escolaridade e, com mais força, para as mulheres com ensino superior. A diferença diminuiu quando a autora levou em conta se o casal pensava parecido sobre casamento.
    fact_sheets: [potarca-2021-alemanha-pairfam]
    myths:
      - claim: Namoro que começa em app não vira coisa séria.
        why_not: Na Alemanha, casais que se conheceram online casaram tanto ou mais que os outros. Nos EUA, com dados de 2017, como o casal se conheceu não mudou o risco de término.
        fact_sheets:
          [
            potarca-2021-alemanha-pairfam,
            rosenfeld-2019-disintermediating-friends,
          ]
  - text: Numa pesquisa oficial, não houve diferença clara de satisfação com a relação entre quem conheceu o parceiro por app e quem o conheceu fora da internet. Eram só 104 casais de app.
    fact_sheets: [potarca-2020-suica-apps]
  - text: Em 50 países, quem conheceu o parceiro online deu nota um pouco menor à relação, 4,20 contra 4,28 numa escala de 1 a 5. O artigo publica um efeito maior, mas as médias dele e os dados públicos mostram uma diferença pequena.
    fact_sheets: [kowal-2025-50-paises]
  - text: No recorte brasileiro desse estudo, a satisfação de quem se conheceu online e de quem se conheceu fora da internet ficou quase igual, 4,48 contra 4,50. É uma conta nossa, sem os controles do artigo e com só 23 pessoas no grupo online.
    fact_sheets: [kowal-2025-50-paises]
    country: Brasil
    period: '2024'
  - text: Entre pessoas que casaram de 2005 a 2012, quem conheceu o cônjuge online se separou um pouco menos (5,96% contra 7,67%) e deu nota um pouco maior ao casamento (5,64 contra 5,48, de 1 a 7). A pesquisa foi encomendada por um site de namoro, a eHarmony.
    fact_sheets: [cacioppo-2013-satisfacao-por-local]
  - text: No mesmo estudo, a chance de separação não variou entre os lugares fora da internet. A satisfação variou pouco, de 5,31 para quem se conheceu num encontro às cegas a 5,67 para quem cresceu junto.
    fact_sheets: [cacioppo-2013-satisfacao-por-local]
    tips: [escola-e-eventos-sociais]
related: [onde-os-casais-se-conhecem, app-ou-presencial, o-que-preve-o-divorcio]
visuals:
  - id: por-que-online-casa-mais
    kind: diagram
    title: Por que casais online casariam mais
    nodes:
      - id: querer-casar
        label: Já querer casar, e pensar parecido sobre isso
      - id: online
        label: Conhecer-se online
      - id: casar
        label: Casar
    arrows:
      - from: querer-casar
        to: online
        evidence: inference
        text: Quem já queria casar pode ter escolhido o site de namoro; o autor do estudo americano diz que não consegue descartar isso.
        fact_sheets: [rosenfeld-2017-marriage-choice-couplehood]
      - from: online
        to: casar
        evidence: association
        text: Na Alemanha, os casais que começaram online casaram mais; nos EUA, quem se conheceu em site de namoro casou mais rápido.
        fact_sheets:
          [
            potarca-2021-alemanha-pairfam,
            rosenfeld-2017-marriage-choice-couplehood,
          ]
      - from: querer-casar
        to: casar
        evidence: association
        text: Na Alemanha, a vantagem do online diminuiu quando a autora levou em conta se o casal pensava parecido sobre casamento.
        fact_sheets: [potarca-2021-alemanha-pairfam]
    note: nenhum estudo sorteou onde cada casal ia se conhecer
  - id: online-contra-fora
    kind: study-table
    title: Casais online comparados com os de fora da internet, estudo a estudo
    rows:
      - fact_sheet: rosenfeld-2017-marriage-choice-couplehood
        measure: Término por ano dos casais online de 1995 em diante (fora da internet, 7,3%)
        value: 7.0
        unit: '%'
      - fact_sheet: rosenfeld-2012-searching-for-a-mate
        measure: Término em um ano dos casais online da década antes de 2009 (fora, 17,8%)
        value: 15.6
        unit: '%'
      - fact_sheet: potarca-2021-alemanha-pairfam
        measure: Ritmo de casamento das mulheres com ensino superior que começaram online, comparado ao de quem começou fora
        value: 1.859
        unit: vezes
      - fact_sheet: kowal-2025-50-paises
        measure: Satisfação de quem se conheceu online, de 1 a 5 (fora, 4,28)
        value: 4.2
        unit: pontos
      - fact_sheet: cacioppo-2013-satisfacao-por-local
        measure: Separação de quem casou de 2005 a 2012 e se conheceu online, pesquisa da eHarmony (fora, 7,67%)
        value: 5.96
        unit: '%'
    note: os três primeiros acompanharam casais no tempo; os dois últimos, um momento só
  - id: satisfacao-por-lugar
    kind: bars
    title: Satisfação no casamento conforme onde o casal se conheceu, nos EUA
    unit: pontos
    max: 7
    bars:
      - label: Online, todos os meios
        value: 5.64
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Cresceram juntos
        value: 5.67
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Escola
        value: 5.59
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Local de culto
        value: 5.58
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Evento social
        value: 5.56
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Amigos
        value: 5.47
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Família
        value: 5.43
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Outro lugar
        value: 5.42
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Bar ou balada
        value: 5.39
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Trabalho
        value: 5.38
        fact_sheet: cacioppo-2013-satisfacao-por-local
      - label: Encontro às cegas
        value: 5.31
        fact_sheet: cacioppo-2013-satisfacao-por-local
    note: escala de 1 a 7; a separação não variou entre os lugares fora da internet
  - id: satisfacao-no-brasil
    kind: bars
    title: Satisfação com a relação no recorte brasileiro, de 1 a 5
    unit: pontos
    max: 5
    bars:
      - label: Conheceram-se online (23 pessoas)
        value: 4.48
        fact_sheet: kowal-2025-50-paises
      - label: Conheceram-se fora da internet
        value: 4.5
        fact_sheet: kowal-2025-50-paises
    note: média simples, sem os controles do artigo
---

Pouco ou nada, pelo que se mediu até hoje. Nos EUA, casais que se conheceram online terminaram no mesmo ritmo dos outros, ==7,0% contra 7,3% ao ano== [@rosenfeld-2017-marriage-choice-couplehood], e na Alemanha casaram tanto ou mais [@potarca-2021-alemanha-pairfam]. Um estudo de 50 países achou satisfação um pouco menor online [@kowal-2025-50-paises], e um encomendado por um site de namoro achou um pouco maior [@cacioppo-2013-satisfacao-por-local]. Para término e casamento, os estudos que acompanham casais por anos têm o desenho melhor; na satisfação, as diferenças achadas são pequenas nos dois sentidos. Não há estudo brasileiro sobre isso.

## Término e casamento

Digamos que deu certo e você conheceu alguém no app. A relação sai mais frágil por ter começado ali? Nos EUA, um painel acompanhou os mesmos casais por seis anos. Com o mesmo perfil, os que se conheceram online a partir de 1995 terminaram 7,0% ao ano, contra 7,3% dos outros, uma diferença que a estatística não distingue de zero [@rosenfeld-2017-marriage-choice-couplehood]. Com os dados de 2017, que já pegam os apps, como o casal se conheceu também não mudou o risco de término [@rosenfeld-2019-disintermediating-friends].

Um número do mesmo estudo assusta à primeira vista. Sem nenhum controle, os casais online tinham 2,46 vezes a chance de terminar [@rosenfeld-2017-marriage-choice-couplehood]. Só que eles estavam juntos havia 4,4 anos em média, contra 19,1 dos outros, e casal novo termina mais que casal antigo, de qualquer jeito que tenha se conhecido. Com o tempo de relação levado em conta, a diferença deixou de ser significativa [@rosenfeld-2017-marriage-choice-couplehood]. É o mesmo cuidado que vale para qualquer manchete do tipo "casais de app terminam mais".

No casamento, os casais online saem na frente. Na Alemanha, eles casaram mais, entre os homens de qualquer escolaridade e, com mais força, entre as mulheres com ensino superior [@potarca-2021-alemanha-pairfam]. Nos EUA, metade dos casais que se conheceram num site de namoro casou em 3 a 4 anos de relação; entre os de fora da internet, levou mais de 10 [@rosenfeld-2017-marriage-choice-couplehood].

A explicação mais provável não é o app. É quem o escolhe. O número americano vem de só 13 casamentos, e o autor diz que não consegue descartar que quem já queria casar tenha escolhido o site [@rosenfeld-2017-marriage-choice-couplehood]. Na Alemanha, a vantagem do online diminuiu quando a autora levou em conta se o casal pensava parecido sobre casamento: entre os homens com ensino superior, o efeito caiu de 58% para 42,1% [@potarca-2021-alemanha-pairfam].

{{visual:por-que-online-casa-mais}}

## Satisfação: onde os estudos discordam

Na satisfação com a relação, os resultados apontam para lados opostos. Em 50 países, quem se conheceu online deu nota um pouco menor, 4,20 contra 4,28 numa escala de 1 a 5 [@kowal-2025-50-paises]. Nos EUA, numa pesquisa encomendada pela eHarmony, quem casou de 2005 a 2012 e se conheceu online deu nota um pouco maior, 5,64 contra 5,48 de 1 a 7, e se separou um pouco menos [@cacioppo-2013-satisfacao-por-local]. Em 2009, a nota dos casais online era igual à média, 4,48 contra 4,47 [@rosenfeld-2012-searching-for-a-mate], e na Suíça não houve diferença clara entre quem conheceu o parceiro por app e quem o conheceu fora da internet [@potarca-2020-suica-apps].

Os resultados convivem por três motivos. As diferenças são pequenas: no estudo de 50 países, 0,08 ponto numa escala de 1 a 5, embora o artigo publique um efeito maior que as próprias médias não sustentam [@kowal-2025-50-paises]. Os estudos de satisfação olham um momento só e só veem quem continua junto; quem se separou insatisfeito sai da conta [@potarca-2020-suica-apps]. E cada um compara populações diferentes, de casais casados nos EUA a painéis online em 50 países. Os estudos que acompanham os mesmos casais por anos, nos EUA e na Alemanha, têm o desenho melhor, e eles medem término e casamento, onde o online não sai pior.

{{visual:online-contra-fora}}

## E os lugares fora da internet?

Entre os lugares fora da internet, a separação não variou na pesquisa da eHarmony [@cacioppo-2013-satisfacao-por-local]. A satisfação variou pouco: de 5,31 para quem se conheceu num encontro às cegas a 5,67 para quem cresceu junto, de 1 a 7 [@cacioppo-2013-satisfacao-por-local]. Os casais da escola, do local de culto e de eventos sociais ficaram no alto; os de bar, do trabalho e do encontro às cegas, embaixo. Os próprios autores chamam os efeitos de pequenos e dizem que não valem para todo mundo [@cacioppo-2013-satisfacao-por-local].

{{visual:satisfacao-por-lugar}}

## E no Brasil?

Não achamos estudo brasileiro que compare término de casais que se conheceram online e fora dela. O registro civil não pergunta como o casal se conheceu, então nem os divórcios permitem a comparação [@ibge-2024-registro-civil]. No recorte brasileiro do estudo de 50 países, a satisfação ficou quase igual: 4,48 de quem se conheceu online contra 4,50 dos outros, numa conta nossa sem os controles do artigo e com só 23 pessoas no grupo online [@kowal-2025-50-paises]. É pouco para dizer que o padrão geral não vale aqui.

{{visual:satisfacao-no-brasil}}

O único estudo brasileiro sobre namoro e internet que achamos responde outra pergunta. Ele comparou relações mantidas só pela internet, sem encontro presencial, com relações presenciais, e não diz nada sobre casais que se conheceram num app e depois se encontraram [@haack-2017-relacionamentos-mediados-internet].

## Varia conforme o Perfil?

Varia um pouco com o gênero, a escolaridade e a idade.

- **Gênero e escolaridade.** Na Alemanha, conhecer-se online esteve ligado a casar mais entre os homens de qualquer escolaridade. Entre as mulheres, a diferença foi grande para as que têm ensino superior e bem menor para as que não têm [@potarca-2021-alemanha-pairfam].
- **Idade.** No estudo de 50 países, a diferença de satisfação apareceu sobretudo depois dos 33 anos, mais ou menos [@kowal-2025-50-paises].
- **Namoro sem morar junto.** Na Suíça, entre os casais que não moravam juntos, quem se conheceu por app estava menos satisfeito do que quem se conheceu por site [@potarca-2020-suica-apps].
- **Casais do mesmo sexo.** Os estudos de casamento olharam só casais homem-mulher [@rosenfeld-2017-marriage-choice-couplehood] [@potarca-2021-alemanha-pairfam].
