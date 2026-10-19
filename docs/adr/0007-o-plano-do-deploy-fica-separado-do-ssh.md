# O plano do deploy fica separado do SSH

Como no Festival (`plano-do-deploy.ts` e `vps.ts` de lá), o deploy se divide em duas partes. `frontend/scripts/plano-do-deploy.ts` monta, sem rede e sem disco, as etapas de uma publicação ou de uma volta: o que sobe para `envio/`, o script bash de cada etapa (a imagem, o GoatCounter, a troca blue/green) e o que fazer se uma etapa falha. `frontend/scripts/vps.ts` segue o plano: manda os arquivos por `scp`, roda cada script pelo `ssh` e escreve o log.

Os caminhos da VPS saem de `lugaresNaVps(raiz)`. Na VPS a raiz é `/`; no `vps.test.ts` é uma pasta temporária, e o `docker`, o `curl`, o `nginx`, o `systemctl`, o `pgrep` e o `sleep` do `PATH` são de mentira (`docker-de-mentira.ts`). O teste roda o mesmo plano que vai para a VPS e cobre a troca de porta, a volta à versão anterior, o contêiner novo que não responde, o `nginx -t` que recusa e o GoatCounter, dentro do `pnpm test`.

## Consequências

- A troca continua sendo um script bash que roda inteiro na VPS, dentro do `flock`. O plano não lê o estado da VPS antes: a porta livre e as imagens velhas se decidem lá, como antes da separação.
- O docker de mentira só sabe o que os scripts usam. Um comando novo num script pede o mesmo comando no falso, senão o teste falha.
- O `stats.docker.test.ts` continua: ele roda o script do GoatCounter num Docker de verdade, fora do `pnpm test`.
- No Windows, que não tem o bash, os testes da VPS de mentira são pulados.
