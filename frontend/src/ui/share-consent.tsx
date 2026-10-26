// The consent for the sensitive Requirements (weight, mental health,
// orientation, religion), in the Possible group's "Compartilhar", above
// "Copiar link". LGPD art. 11, I asks for a consent that is specific (it
// names each Requirement) and highlighted (a box of its own, apart from the
// rest), given by a positive act: the box starts unchecked
// (`reports/2026-10-18-lgpd-estado-link.md`). The page shows it only while
// a sensitive Requirement is on.
import {
  sensitiveList,
  type SensitiveRequirement,
} from '@tem-estudo/rules/requirements'
import { useId } from 'react'
import { CheckChip } from './possible-group'

export function SensitiveConsent({
  sensitive,
  checked,
  onChange,
}: {
  /** The sensitive Requirements on, which the consent names. */
  sensitive: ReadonlyArray<SensitiveRequirement>
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = useId()
  return (
    <div
      role="group"
      aria-labelledby={`${id}-t`}
      className="mb-md rounded-mao-2 border-2 fio-tracejado border-tinta bg-folha px-md py-sm"
    >
      <h3
        id={`${id}-t`}
        className="m-0 font-title text-linha leading-label font-bold"
      >
        Requisitos sensíveis ficam fora do link
      </h3>
      <p className="mt-xs mb-sm leading-nota" id={`${id}-d`}>
        Peso, saúde mental, orientação sexual e religião são dados sensíveis
        pela LGPD. Eles só vão no link se você marcar abaixo, e quem receber o
        link vê esses Requisitos.
      </p>
      <CheckChip
        label={`Incluir no link: ${sensitiveList(sensitive)}`}
        checked={checked}
        description={`${id}-d`}
        onChange={onChange}
      />
      <p className="mt-sm mb-0 text-label leading-nota font-normal text-tinta-2">
        Eles ficam salvos só neste aparelho, no navegador, até você desligar. O
        site não os guarda nem os conta nas visitas.
      </p>
    </div>
  )
}
