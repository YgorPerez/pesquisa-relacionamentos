// The consent's copy (`share-consent.tsx`), which its test also reads.
// Outside the `.tsx`, which only exports components.
import {
  sensitiveList,
  type SensitiveRequirement,
} from '@tem-estudo/rules/requirements'

export const CONSENT_TITLE = 'Requisitos sensíveis ficam fora do link'

export const CONSENT_TEXT =
  'Peso, saúde mental, orientação sexual e religião são dados sensíveis pela LGPD. Eles só vão no link se você marcar abaixo, e quem receber o link vê esses Requisitos.'

/** The box, which names each sensitive Requirement on: "Incluir no link:
 * bissexual". */
export const consentLabel = (sensitive: ReadonlyArray<SensitiveRequirement>) =>
  `Incluir no link: ${sensitiveList(sensitive)}`

/** Where they stay, under the box. */
export const CONSENT_STORAGE =
  'Eles ficam salvos só neste aparelho, no navegador, até você desligar. O site não os guarda nem os conta nas visitas.'
