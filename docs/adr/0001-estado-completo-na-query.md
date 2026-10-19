# Estado completo na query do link, fora do log e sem gênero no analytics

O link de compartilhamento leva o estado inteiro (Perfil, Requisitos e Prioridades) na query `?`, não no fragmento `#`. O fragmento nunca chegaria ao servidor. Com a query, o servidor e as prévias de redes sociais conseguem montar o resultado. O custo é que gênero, idade e a orientação que deles decorre passam pelo servidor. Orientação conta como dado sensível pela LGPD, e a [pesquisa de base legal](../../relatorios/2026-10-18-lgpd-estado-link.md) mostrou que o plano inicial (log e analytics com a query completa, só com aviso e opt-out) não tinha base no art. 11. Por isso o servidor recebe a query, mas não a guarda com o Perfil.

## Consequências

- O log do proxy e do app registra só o caminho, nunca a query. A exceção é o error_log do Nginx, que copia a linha da requisição quando uma falha acontece. Ele só escreve nessas falhas e é girado todo dia, guardando 3 dias.
- O analytics recebe o evento e os campos que não revelam orientação, com retenção de 31 dias (o mínimo do GoatCounter, que roda na própria VPS) e opt-out. O par gênero próprio + gênero procurado nunca vai ao analytics. A base é o legítimo interesse do art. 7º, IX.
- A prévia mostra o resultado e quem se procura, mas nunca o Perfil de quem compartilhou. Ela ainda passa pelos robôs das plataformas, que não guardam o gênero de quem compartilhou. `Referrer-Policy: strict-origin` impede que a query vaze para sites externos.
- Mudar o formato da query quebra links que já circulam, então trocá-lo depois exige ler o formato antigo também.
