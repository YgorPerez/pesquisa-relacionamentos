# Deploy em temestudo.com

O site roda numa VPS da Hostinger que só serve a ele. O app é um contêiner Docker em `127.0.0.1`, atrás do Nginx do host, com certificado do certbot por webroot. O DNS fica na Cloudflare, sem proxy. O molde é o deploy do Festival dos Macacos, sem homologação, sem banco e sem Sentry.

| Peça | Onde |
|---|---|
| Imagem | `frontend/Dockerfile` (o `.output` do build, em `node:24-alpine`) |
| Formato do log, vhost, TLS e rotação | `frontend/nginx/log-sem-query.conf`, `temestudo.conf`, `tls.conf`, `logrotate-temestudo` |
| Troca blue/green e volta | `frontend/scripts/vps.ts` |
| Preparação da VPS, uma vez | `frontend/scripts/preparar-vps.sh` |
| Passos do mantenedor | `frontend/scripts/wizard-deploy.sh` |
| Workflow | `.github/workflows/deploy.yml` |

## Antes do primeiro deploy

Rode o wizard da raiz do repositório:

```bash
bash frontend/scripts/wizard-deploy.sh
```

Ele passa por sete etapas: a VPS (Ubuntu 24.04, acesso root), os registros A de `@`, `www` e `stats` na Cloudflare em "DNS only", a chave SSH do deploy, o e-mail do certificado, o `preparar-vps.sh` pelo ssh, os secrets do Actions e o primeiro deploy. Os valores que não são segredo ficam em `.env.deploy`, que o git ignora.

O workflow lê estes secrets do repositório:

| Secret | O que é |
|---|---|
| `VPS_HOST` | O IPv4 da VPS |
| `VPS_USER` | `root`. A troca escreve em `/etc/nginx` e recarrega o Nginx |
| `VPS_PORT` | A porta do SSH. Opcional, o padrão é 22 |
| `VPS_SSH_KEY` | A chave privada inteira, a do `~/.ssh/temestudo-deploy` |

Sem `VPS_HOST`, `VPS_USER` ou `VPS_SSH_KEY`, o workflow roda os testes e o build, pula a publicação e deixa um aviso "Deploy pulado" no resumo do run. O CI continua verde.

## Publicar

Cada push na `main` que mexe no site (`frontend/`, `packages/`, o conteúdo, o lockfile) dispara o Deploy:

1. O job `testes-e-build` roda tipos, testes e o e2e (sobre um build do conteúdo de fixture). Depois monta o build com o acervo do repositório, e é esse `.output` que sobe. Conteúdo com erro derruba o build e nada é publicado.
2. O job `publicar` manda o `.output`, o `Dockerfile` e a configuração do Nginx por scp para `/opt/temestudo/envio/`. Na VPS, o script monta a imagem `temestudo-app:sha-<commit>`.
3. A troca:
   - o contêiner novo sobe na porta livre do par 3011/3031, ao lado do antigo;
   - o script espera até 60 s que ele responda `/`;
   - instala o vhost, o TLS e a rotação, e reescreve o include `/etc/nginx/temestudo/temestudo-app.conf` com a porta nova;
   - roda `nginx -t` e recarrega o Nginx;
   - espera os workers velhos terminarem os pedidos e só então para o contêiner antigo.
4. De fora, o job confere que `https://temestudo.com/` responde com `Referrer-Policy: strict-origin` e que o http leva ao https com a query.

Se o contêiner novo não responde ou o `nginx -t` recusa a configuração, o script desfaz o que trocou, apaga o contêiner novo e sai com erro. O site fica na versão que estava. Dois deploys não correm juntos: o `concurrency` do workflow faz o segundo esperar, e na VPS um `flock` em `publicar.lock` segura a troca.

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
VPS_HOST=<ip> VPS_SSH_KEY=~/.ssh/temestudo-deploy node scripts/vps.ts --voltar
```

A volta usa a mesma troca sem janela e não mexe no vhost. Rodar a volta duas vezes alterna entre as duas versões.

Esse atalho não muda a `main`. O próximo merge publica o que estiver nela, então o conserto definitivo é um `git revert` do commit ruim na `main`, que passa pelo deploy normal.

Para ver as imagens que a VPS tem: `ssh root@<ip> docker images temestudo-app`.

## Na VPS

| O quê | Onde |
|---|---|
| Pasta do app | `/opt/temestudo` (`no-ar`, `anterior`, `publicar.lock`, `envio/`) |
| Desafio do certbot | `/opt/temestudo/acme` |
| Vhost | `/etc/nginx/sites-available/temestudo.conf`, com link em `sites-enabled/` |
| Formato do access_log | `/etc/nginx/conf.d/temestudo-log-sem-query.conf` |
| Porta do contêiner no ar | `/etc/nginx/temestudo/temestudo-app.conf` |
| Logs do Nginx | `/var/log/nginx/temestudo/access.log` e `error.log` |
| Rotação | `/etc/logrotate.d/temestudo` |
| Log do app | `docker logs temestudo-app` (10 MB × 3 arquivos) |

O vhost do repositório é o que vale. A troca reinstala o vhost a cada deploy e guarda o anterior como `.anterior` ao lado. Uma mudança feita à mão na VPS some no próximo deploy.

A renovação do certificado é a do pacote do certbot, que roda sozinha e recarrega o Nginx pelo `--deploy-hook` do `preparar-vps.sh`. Para conferir: `certbot renew --dry-run`.

## Logs e privacidade

O link de compartilhamento leva o Perfil na query ([ADR 0001](adr/0001-estado-completo-na-query.md)), e nenhum log de acesso a guarda:

- O access_log do Nginx usa o `log_format temestudo_sem_query` (`/etc/nginx/conf.d/temestudo-log-sem-query.conf`), com o caminho cortado antes do `?` e sem o Referer. Uma linha fica assim: `1.2.3.4 [19/Oct/2026:16:33:25 -0300] "GET /grupo-possivel HTTP/2.0" 200 1796 0.004 "temestudo.com"`.
- Todo `server` do arquivo usa esse formato, inclusive o `default_server` que recebe os pedidos pelo IP. O site padrão do pacote sai no deploy.
- O app escreve uma linha por pedido no stdout, com método, caminho, status e tempo: `GET /grupo-possivel 200 12ms` (`frontend/src/platform/registro-do-pedido.ts`).
- O error_log copia a linha do pedido quando algo falha, com a query. Ele gira todo dia e guarda 3 dias. O access_log guarda 14. Os dois ficam numa subpasta para escapar do `*.log` do `/etc/logrotate.d/nginx` do Ubuntu, que guardaria 14 dias do error_log também.
- `Referrer-Policy: strict-origin` sai do app nas páginas e do Nginx em todo o resto. O Nginx esconde a do app para o cabeçalho não sair duplicado.

Os testes conferem isso: `frontend/src/platform/registro-do-pedido.test.ts` manda um pedido com query e lê a linha de log, e `frontend/nginx/nginx.test.ts` lê o formato declarado no vhost e na rotação.

## GoatCounter (#35)

O registro `stats` já sai do wizard. O GoatCounter vai num contêiner próprio, numa porta fora do par 3011/3031, com o vhost `stats.temestudo.com` num arquivo à parte (`temestudo-stats.conf`), que usa o mesmo `log_format` e o mesmo access_log. O formato fica no `conf.d/`, que o Nginx lê antes dos vhosts, e vale para esse arquivo também. O bloco `:80` do stats precisa servir `/.well-known/acme-challenge/` de `/opt/temestudo/acme`, porque o `default_server` recusa hosts que não conhece. Com ele no ar, o certificado sai com `certbot certonly --webroot -w /opt/temestudo/acme -d stats.temestudo.com`. A troca do `vps.ts` só reinstala os arquivos dela e não toca no do stats.
