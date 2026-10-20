# Deploy em temestudo.cloud

O site roda numa VPS da Hostinger (Ubuntu 26.04) que só serve a ele. O app é um contêiner Docker em `127.0.0.1`, atrás do Nginx do host, com certificado do certbot por webroot. O DNS fica na Hostinger, onde o domínio foi comprado. Ao lado do app, outro contêiner roda o GoatCounter em stats.temestudo.cloud. O molde é o deploy do Festival dos Macacos, sem homologação e sem Sentry. O único banco é o SQLite do GoatCounter, fora do app.

| Peça                                                           | Onde                                                                                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Imagem                                                         | `frontend/Dockerfile` (o `.output` do build, em `node:24-alpine`)                                                    |
| Formato do log, vhosts, TLS e rotação                          | `frontend/nginx/log-without-query.conf`, `temestudo.conf`, `temestudo-stats.conf`, `tls.conf`, `logrotate-temestudo` |
| Etapas e scripts da VPS (troca blue/green, volta, GoatCounter) | `frontend/scripts/deploy-plan.ts` ([ADR 0007](adr/0007-the-deploy-plan-stays-separate-from-ssh.md))                  |
| Execução pelo SSH, com o tempo de cada etapa                   | `frontend/scripts/vps.ts`, `stopwatch.ts` ([ADR 0009](adr/0009-the-deploy-log-times-each-step.md))                   |
| Conferência de fora                                            | `frontend/scripts/check-live.ts` ([ADR 0008](adr/0008-the-deploy-checks-the-assets-from-outside.md))                 |
| Preparação da VPS, uma vez                                     | `frontend/scripts/prepare-vps.sh`                                                                                    |
| Passos do mantenedor                                           | `frontend/scripts/deploy-wizard.sh`                                                                                  |
| Workflow                                                       | `.github/workflows/deploy.yml`                                                                                       |

## Antes do primeiro deploy

Rode o wizard da raiz do repositório:

```bash
bash frontend/scripts/deploy-wizard.sh
```

Ele passa por oito etapas: a VPS (Ubuntu 26.04, acesso root), os registros A de `@`, `www` e `stats` no DNS da Hostinger, a chave SSH do deploy, o e-mail do certificado, o `prepare-vps.sh` pelo ssh, os secrets do Actions, o primeiro deploy e a senha do GoatCounter. Os valores que não são segredo ficam em `.env.deploy`, que o git ignora.

No DNS da Hostinger, o registro A de `@` vem apontando para a página de estacionamento e o `www` vem como CNAME: o wizard pede para trocar os dois por registros A para a VPS e apagar qualquer AAAA, porque o Let's Encrypt tenta o IPv6 primeiro.

O workflow lê estes secrets do repositório:

| Secret        | O que é                                                     |
| ------------- | ----------------------------------------------------------- |
| `VPS_HOST`    | O IPv4 da VPS                                               |
| `VPS_USER`    | `root`. A troca escreve em `/etc/nginx` e recarrega o Nginx |
| `VPS_PORT`    | A porta do SSH. Opcional, o padrão é 22                     |
| `VPS_SSH_KEY` | A chave privada inteira, a do `~/.ssh/temestudo-deploy`     |

Sem `VPS_HOST`, `VPS_USER` ou `VPS_SSH_KEY`, o workflow roda os testes e o build, pula a publicação e deixa um aviso "Deploy pulado" no resumo do run. O CI continua verde.

## Publicar

Cada push na `main` que mexe no site (`frontend/`, `packages/`, o conteúdo, o lockfile) dispara o Deploy:

1. O job `testes-e-build` roda tipos, testes e o e2e (sobre um build do conteúdo de fixture). Depois monta o build com o acervo do repositório, e é esse `.output` que sobe. Conteúdo com erro derruba o build e nada é publicado.
2. O job `publicar` manda o `.output`, o `Dockerfile` e a configuração do Nginx por scp para `/opt/temestudo/envio/`. Na VPS, o script monta a imagem `temestudo-app:sha-<commit>` e confere o contêiner do GoatCounter (veja a seção dele).
3. A troca:
   - o contêiner novo sobe na porta livre do par 3011/3031, ao lado do antigo;
   - o script espera até 60 s que ele responda `/`;
   - instala o vhost, o TLS e a rotação, e reescreve o include `/etc/nginx/temestudo/temestudo-app.conf` com a porta nova;
   - roda `nginx -t` e recarrega o Nginx;
   - espera os workers velhos terminarem os pedidos e só então para o contêiner antigo.
4. De fora, o `check-live.ts` confere que `https://temestudo.cloud/` responde com `Referrer-Policy: strict-origin`, que cada `/assets/*.js` e `/assets/*.css` citado na página chega com o tipo dele, e não como HTML, e que o http leva ao https com a query. Ele tenta por até 60 s e, se não passa, o job falha. Se `https://stats.temestudo.cloud/` não responde, sai só um aviso no resumo do run.

O log do `publicar` diz quanto levou cada etapa (`[vps] Upload took 8.1 s.`, `Image`, `GoatCounter`, `Swap`) e o total.

Se o contêiner novo não responde ou o `nginx -t` recusa a configuração, o script desfaz o que trocou, apaga o contêiner novo e sai com erro. O site fica na versão que estava. Esses caminhos, a troca, a volta e o GoatCounter têm teste numa VPS de mentira (`vps.test.ts`, `fake-docker.ts`), sem Docker, dentro do `pnpm test`. Dois deploys não correm juntos: o `concurrency` do workflow faz o segundo esperar, e na VPS um `flock` em `publicar.lock` segura a troca.

Para publicar a `main` sem um push: Actions, Deploy, "Run workflow" com `voltar` vazio, ou `gh workflow run deploy.yml --ref main`.

A VPS guarda duas imagens: a no ar e a anterior. O SHA de cada uma fica em `/opt/temestudo/no-ar` e `/opt/temestudo/anterior`.

## Voltar à versão anterior

O caminho rápido troca para a imagem anterior, que já está na VPS, sem build:

```bash
gh workflow run deploy.yml --ref main -f voltar=anterior
# ou um SHA que a VPS ainda tem:
gh workflow run deploy.yml --ref main -f voltar=<sha>
```

Da máquina, com a chave:

```bash
cd frontend
VPS_HOST=<ip> VPS_SSH_KEY=~/.ssh/temestudo-deploy node scripts/vps.ts --rollback
```

A volta usa a mesma troca sem janela e não mexe no vhost. Rodar a volta duas vezes alterna entre as duas versões.

Esse atalho não muda a `main`. O próximo merge publica o que estiver nela, então o conserto definitivo é um `git revert` do commit ruim na `main`, que passa pelo deploy normal.

Para ver as imagens que a VPS tem: `ssh root@<ip> docker images temestudo-app`.

## Na VPS

| O quê                    | Onde                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Pasta do app             | `/opt/temestudo` (`no-ar`, `anterior`, `publicar.lock`, `envio/`, `goatcounter-senha`)             |
| Desafio do certbot       | `/opt/temestudo/acme`                                                                              |
| Vhosts                   | `/etc/nginx/sites-available/temestudo.conf` e `temestudo-stats.conf`, com link em `sites-enabled/` |
| GoatCounter              | contêiner `temestudo-stats` em `127.0.0.1:3051`, banco no volume `temestudo-stats`                 |
| Formato do access_log    | `/etc/nginx/conf.d/temestudo-log-sem-query.conf`                                                   |
| Porta do contêiner no ar | `/etc/nginx/temestudo/temestudo-app.conf`                                                          |
| Logs do Nginx            | `/var/log/nginx/temestudo/access.log` e `error.log`                                                |
| Rotação                  | `/etc/logrotate.d/temestudo`                                                                       |
| Log do app               | `docker logs temestudo-app` (10 MB × 3 arquivos)                                                   |

Os vhosts do repositório são os que valem. A troca reinstala os dois a cada deploy e guarda o anterior como `.anterior` ao lado. Uma mudança feita à mão na VPS some no próximo deploy.

A renovação do certificado é a do pacote do certbot, que roda sozinha e recarrega o Nginx pelo `--deploy-hook` do `prepare-vps.sh`. Para conferir: `certbot renew --dry-run`.

## Logs e privacidade

O link de compartilhamento leva o Perfil na query ([ADR 0001](adr/0001-full-state-in-the-query.md)), e nenhum log de acesso a guarda:

- O access_log do Nginx usa o `log_format temestudo_sem_query` (`/etc/nginx/conf.d/temestudo-log-sem-query.conf`), com o caminho cortado antes do `?` e sem o Referer. Uma linha fica assim: `1.2.3.4 [19/Oct/2026:16:33:25 -0300] "GET /grupo-possivel HTTP/2.0" 200 1796 0.004 "temestudo.cloud"`.
- Todo `server` do arquivo usa esse formato, inclusive o `default_server` que recebe os pedidos pelo IP. O site padrão do pacote sai no deploy.
- O app escreve uma linha por pedido no stdout, com método, caminho, status e tempo: `GET /grupo-possivel 200 12ms` (`frontend/src/platform/request-log.ts`).
- O error_log copia a linha do pedido quando algo falha, com a query. Ele gira todo dia e não passa de 3 dias: o arquivo de hoje e 2 girados (`rotate 2`). O access_log guarda 14. Os dois ficam numa subpasta para escapar do `*.log` do `/etc/logrotate.d/nginx` do Ubuntu, que guardaria 14 dias do error_log também.
- `Referrer-Policy: strict-origin` sai do app nas páginas e do Nginx em todo o resto. O Nginx esconde a do app para o cabeçalho não sair duplicado.

Os testes conferem isso: `frontend/src/platform/request-log.test.ts` manda um pedido com query e lê a linha de log, e `frontend/nginx/nginx.test.ts` lê o formato declarado no vhost e na rotação.

## GoatCounter (#35)

A contagem de visitas roda em https://stats.temestudo.cloud, num contêiner próprio (`temestudo-stats`, imagem `arp242/goatcounter:2.7.0`) em `127.0.0.1:3051`, fora do par 3011/3031. O banco é um SQLite no volume `temestudo-stats`.

- **Deploy:** a cada publicação, o `vps.ts` cria o contêiner se ele falta, parou ou a imagem de `STATS` mudou, e o volume fica. Se o GoatCounter não sobe, o deploy do site segue com um aviso.
- **Vhost:** `frontend/nginx/temestudo-stats.conf` sai junto com o `temestudo.conf`, com o mesmo `log_format` sem query e os mesmos arquivos de log. O bloco `:80` serve o desafio do certbot, porque o `default_server` recusa host que não conhece. O Nginx passa ao GoatCounter só o IP de quem visita, de onde ele tira o país.
- **Certificado:** um só para `temestudo.cloud`, `www` e `stats`, tirado pelo `prepare-vps.sh`. Num certificado antigo sem o `stats`, rodar o script de novo acrescenta o nome (`--expand`).
- **O que o site manda:** o envio é nosso (`frontend/src/analytics/goatcounter.ts`), e não o `count.js`, que manda sempre o `location.search` com o Perfil. Vão o caminho sem query, a referência sem query, a largura da tela e, nos eventos, o nome. Com GPC, DNT ou a chave do rodapé desligada, o arquivo nem carrega.
- **Configuração do site no GoatCounter:** retenção de 31 dias, e só referência, tamanho de tela e país ligados (`collect` = 26, `STATS_COLLECT` no `deploy-plan.ts`). Sessões, região, navegador e sistema e idioma ficam desligados. Todo deploy confere as duas e, se alguém mexeu, volta ao combinado e reinicia o contêiner, porque o GoatCounter lê a configuração ao subir.

### Site e login

Sem site criado, a tela inicial do GoatCounter deixa qualquer um criar a conta. Por isso o próprio deploy cria o site `stats.temestudo.cloud` e o usuário, antes de o vhost de `stats` entrar no Nginx:

- o e-mail vem da variável `GOATCOUNTER_EMAIL` do repositório (Settings, Variables), que o wizard grava na etapa 6; sem ela, `admin@temestudo.cloud`;
- a senha é sorteada (40 letras e números) e fica em `/opt/temestudo/goatcounter-senha`, do root, com modo 600;
- se a criação falha, o contêiner para, e o Nginx responde 502 em vez da tela de criar conta. Se o GoatCounter nem sobe e um contêiner antigo sem site está no ar, o deploy também o para.

Depois do primeiro deploy verde, a etapa 8 do wizard mostra a senha e abre o painel. À mão:

```bash
ssh root@<ip> cat /opt/temestudo/goatcounter-senha
```

Entre em https://stats.temestudo.cloud com o e-mail e essa senha, e confira em Settings: em Data collection, só Referrer, Size e Country marcados; em Data retention, 31. Se trocar a senha no painel, o arquivo fica com a antiga: apague-o para não confundir.

Para conferir sem o navegador: `ssh root@<ip> docker exec temestudo-stats goatcounter db query "select settings from sites"`.

O teste `frontend/scripts/stats.docker.test.ts` roda esse caminho num GoatCounter local, em Docker: `TEST_GOATCOUNTER=1 pnpm --filter frontend exec vp test run scripts/stats.docker.test.ts`.

### Revisão do painel

Uma vez por mês, abra o painel. Um Guia com muitos `ajudou/nao/<motivo>/<guia>` vira uma issue de revisão com o motivo mais frequente. Não há meta numérica.
