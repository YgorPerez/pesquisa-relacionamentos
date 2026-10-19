// Quanto cada etapa do deploy levou, e o total, no molde do Festival dos
// Macacos (`frontend/scripts/cronometro.ts` de lá): o `vps.ts` e o
// `conferir-no-ar.ts` escrevem uma linha ao fim de cada etapa, para comparar
// um deploy com outro pelo log (ADR 0009).
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

/** `12,3 s` abaixo de um minuto, `1 min 22 s` dele para cima. */
export function duracao(ms: number) {
  // Arredonda antes de escolher o formato: 59,96 s viraria `60,0 s`.
  const decimos = Math.round(ms / 100)
  if (decimos < 600) return `${(decimos / 10).toFixed(1).replace('.', ',')} s`
  const inteiros = Math.round(ms / 1000)
  return `${Math.floor(inteiros / 60)} min ${inteiros % 60} s`
}

/** Um cronômetro que nasce agora. `etapa` roda o passo e, se ele termina bem
 * (uma promessa, quando ela se cumpre), diz quanto levou; o erro de um passo
 * segue sem linha. `total` diz o tempo desde que o cronômetro nasceu. */
export function cronometro(
  dizer: (linha: string) => void,
  agora: () => number = () => performance.now(),
) {
  const inicio = agora()
  return {
    etapa<T>(nome: string, passo: () => T): T {
      const comeco = agora()
      const dizerOTempo = () =>
        dizer(`${nome} levou ${duracao(agora() - comeco)}.`)
      const dado = passo()
      if (dado instanceof Promise) {
        return dado.then((valor: unknown) => {
          dizerOTempo()
          return valor
        }) as T
      }
      dizerOTempo()
      return dado
    },
    total() {
      dizer(`Total: ${duracao(agora() - inicio)}.`)
    },
  }
}
