---
reference: "Dunn MS, Cai ZG, Occhipinti S. *AI and language in healthcare: the role of doctor identity and linguistic alignment in perceptions of doctor quality*. Computers in Human Behavior Reports 24:101373, 2026. Dados e código: https://osf.io/qku69"
link: https://doi.org/10.1016/j.chbr.2026.101373
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Experimento online com 182 voluntários do Prolific no Reino Unido, cerca de 45 por versão, que leram uma única conversa inventada entre paciente e médico e deram notas de fora, sem conversar com ninguém; consulta médica, fora do namoro."
countries: [Reino Unido]
period: "não informado no texto lido"
sample:
  n: 182
  description: "187 falantes nativos de inglês que moram no Reino Unido, de 18 a 65 anos, recrutados no Prolific e pagos 0,75 libra, usando computador (não celular); idade média de 41 anos, 95 homens, 90 mulheres e 2 de outro gênero. Cinco foram excluídos por errar perguntas de compreensão, e as análises ficaram com 182. Não é um estudo de namoro."
  representative: false
design: experiment
conflict: "Financiado por uma bolsa da Hong Kong Polytechnic University (projeto P00451480); os autores declaram não ter conflitos de interesses."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 65 }
---

# Dunn et al. (2026): o médico que repete as palavras do paciente, humano ou IA

## O que mediu

O estudo trata de consulta médica por chat, não de paquera. Cada participante leu uma conversa inventada em que um paciente com sintomas de gripe pedia conselho a um médico, e um sorteio decidiu a versão. O médico era humano ("Dr. Peterson") ou uma IA ("MedicaBot", um chatbot de modelo de linguagem treinado com dados médicos), e repetia ou não os termos do paciente em cinco palavras: se o paciente dizia "flu" e "Covid", o médico que repetia dizia o mesmo, e o que não repetia dizia "influenza" e "SARS-CoV-2". Em metade das versões o paciente usava os termos formais, para que repetir não se confundisse com falar de modo informal. O conselho era o mesmo em todas as versões.

Depois de ler, cada participante deu notas de 1 a 7 ao médico em competência, simpatia (_warmth_), confiabilidade e responsabilidade pelo conselho, e respondeu a uma escala de atitude diante de robôs, usada na conta. Quem dá a nota observa a conversa de fora: não é o paciente e não conversou com ninguém.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Participantes | 187 falantes nativos de inglês que moram no Reino Unido, recrutados no Prolific; idade média de 41,05 anos, 95 homens, 90 mulheres e 2 de outro gênero | 2.1 Participants | "187 native speakers of English living in the United Kingdom (mean age = 41.05, 95 male, 90 female, 2 other) were recruited from the crowdsourcing platform Prolific Academic" |
| Exclusões | Cinco foram excluídos das análises por acertar menos de 1/3 das perguntas de compreensão | 2.1 Participants | "Five participants were removed from further analyses for correctly answering less than 1/3 of the comprehension questions." |
| As quatro versões | Cada participante leu uma de quatro versões de um chat: médico humano ou IA, que repetia ou não os termos do paciente | 2.2 Materials | "we created four versions of an online chat conversation about a patient talking with a medical practitioner" |
| Competência | Com o médico IA, repetir os termos do paciente deixou o médico mais competente aos olhos de quem leu (β = 0,34); com o médico humano, não apareceu diferença (β = −0,05; p = 0,583) | 3. Results | "separate analyses indicated that an effect of alignment was present with the AI doctor (β = 0.34, SE = 0.10, t = 3.33, p = .001) but not the human doctor (β = − 0.05, SE = 0.09, t = − 0.55, p = .583)" |
| Simpatia | Com o médico IA, repetir os termos deixou o médico mais simpático aos olhos de quem leu (β = 0,34); com o humano, não apareceu diferença (β = −0,06; p = 0,649) | 3. Results | "an effect of alignment with the AI doctor (β = 0.34, SE = 0.13, t = 2.68, p = .009) but not with the human doctor (β = − 0.06, SE = 0.13, t = − 0.46, p = .649)" |
| Confiabilidade | Com o médico IA, repetir os termos deixou o médico mais confiável aos olhos de quem leu (β = 0,25); com o humano, não apareceu diferença (β = −0,07; p = 0,448) | 3. Results | "an effect of alignment was present with the AI doctor (β = 0.25, SE = 0.11, t = 2.29, p = .025) but not the human doctor (β = − 0.07, SE = 0.09, t = − 0.76, p = .448)" |
| Responsabilidade pelo conselho | Na responsabilidade atribuída ao médico pelo conselho, repetir ou não os termos não fez diferença clara | 3. Results | "There were no significant effects involving alignment or P+." |
| Termos formais ou informais | Usar termos formais ou informais não fez diferença clara em nenhuma nota (todos os p > 0,05) | 3. Results | "None of the effects involving formality were significant (all ps > 0.05" |
| IA contra humano | Com o mesmo conselho, o médico IA foi visto como menos competente que o humano (média de 5,08 contra 5,85, numa escala de sete pontos) | 3. Results | "participants perceived the AI doctor (M = 5.08) as less competent than the human doctor (M = 5.85" |
| IA contra humano, nas outras notas | O médico IA também teve notas mais baixas que o humano em simpatia, confiabilidade e responsabilidade pelo conselho | 4. Discussion | "Participants consistently rated the AI doctor lower than the human doctor in terms of competency, warmth, trustworthiness, and perceived responsibility for the advice given." |

O β diz quanto a nota (de 1 a 7) muda com repetir os termos do paciente, dentro das conversas com o médico IA ou com o humano, levando em conta a atitude de cada participante diante de robôs. Nas contas principais, repetir foi codificado como 1 e não repetir como −1; o texto não diz as médias de cada uma das quatro versões, que aparecem só num gráfico. O p é a chance de uma diferença desse tamanho aparecer por acaso.

## Limitações

- Consulta médica, não namoro. Quem dá a nota leu uma conversa curta e inventada, de fora: ninguém teve seus termos repetidos.
- Cerca de 45 participantes por versão, recrutados no Prolific, que não representam ninguém. Uma única cena, de baixo risco (gripe), como os próprios autores dizem.
- A IA foi apresentada como "treinada com dados médicos para dar conselho de alta qualidade", o que pode ter mudado a expectativa de quem leu, como os autores reconhecem.
- A repetição foi só de cinco termos médicos, sempre todos ou nenhum. O estudo não mede estilo de escrita, ritmo ou tom.
- A atitude diante de robôs entrou na conta pela subescala que mais acompanhou as notas; as outras três ficaram de fora, por escolha dos autores.

## Como usamos

O relatório [Espelhar o estilo do outro por texto](../reports/2026-11-15-espelhar-o-estilo-por-texto.md) usa esta Ficha como experimento, fora do namoro, em que repetir as palavras do outro mudou a impressão de quem leu só quando quem repetia era uma IA.
