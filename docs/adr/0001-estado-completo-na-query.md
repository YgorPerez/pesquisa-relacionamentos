# Estado completo na query do link, registrado em log e analytics

O link de compartilhamento leva o estado inteiro (Perfil, Requisitos e Prioridades) na query `?`, não no fragmento `#`. O fragmento nunca chegaria ao servidor. Com a query, o servidor e as prévias de redes sociais conseguem montar o resultado, e o uso fica medido em log e analytics. O custo: gênero, idade e a orientação que deles decorre passam pelo servidor, ficam 30 dias no log do proxy e no analytics e aparecem no cache das plataformas que geram a prévia. Para orientação sexual isso é dado sensível pela LGPD.

## Consequências

- O log do servidor guarda a URL completa por 30 dias. O analytics recebe a query completa, também com 30 dias de retenção, salvo opt-out do usuário. O opt-out vale só para o analytics.
- A prévia mostra o resultado e quem se procura, mas nunca o Perfil de quem compartilhou. `Referrer-Policy: strict-origin` impede que a query vaze para sites externos.
- Mudar o formato da query quebra links que já circulam, então trocá-lo depois exige ler o formato antigo também.
- Ninguém validou ainda se aviso com opt-out basta como base legal para dado sensível (art. 11). Ver o ticket de base legal LGPD.
