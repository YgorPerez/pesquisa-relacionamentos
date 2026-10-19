# O log do deploy diz o tempo de cada etapa

Como no Festival (`cronometro.ts` de lá), o `vps.ts` escreve uma linha ao fim de cada etapa do plano, `[vps] Troca levou 14,2 s.`, e o total no fim. O `conferir-no-ar.ts` escreve a dele. Comparar dois deploys pelo log mostra qual etapa ficou mais lenta, coisa que o tempo do passo do Actions, um número só para a publicação inteira, não mostra.

## Consequências

- A etapa que falha não escreve tempo: o erro dela segue como era.
- As etapas têm os nomes do plano (`Envio`, `Imagem`, `GoatCounter`, `Troca`). Mudar um nome muda o que se procura no log.
