// The words of a reference ring's popover (#467).

/** The way to the Fact sheet's own page. */
export const OPEN_FACT_SHEET = 'abrir Ficha'

/** The popover's name, the same as the ring's. */
export const referenceLabel = (factSheet: {
  readonly n: number
  readonly title: string
}) => `Ficha ${factSheet.n}: ${factSheet.title}`
