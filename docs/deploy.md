# Deploy em temestudo.com

O site roda numa VPS da Hostinger (Ubuntu 26.04) que só serve a ele. O app é um contêiner Docker em `127.0.0.1`, atrás do Nginx do host, com certificado do certbot por webroot. O DNS fica na Hostinger, onde o domínio foi comprado. Ao lado do app, outro contêiner roda o GoatCounter em stats.temestudo.com. O molde é o deploy do Festival dos Macacos, sem homologação e sem Sentry. O único banco é o SQLite do GoatCounter, fora do app.

| Peça | Onde |
|---|---|
| Imagem | `frontend/Dockerfile` (o `.output` do build, em `node:24-alpine`) |
| Formato do log, vhosts, TLS e rotação | `frontend/nginx/log-sem-query.conf`, `temestudo.conf`, `temestudo-stats.conf`, `tls.conf`, `logrotate-temestudo` |
| Troca blue/green, volta e contêiner do GoatCounter | `frontend/scripts/vps.ts` |
| Preparação da VPS, uma vez | `frontend/scripts/preparar-vps.sh` |
| Passos do mantenedor | `frontend/scripts/wizard-deploy.sh` |
| Workflow | `.github/workflows/deploy.yml` |

## Antes do primeiro deploy

Rode o wizard da raiz do repositório:

```bash
bash frontend/scripts/wizard-deploy.sh
```

Ele passa por oito etapas: a VPS (Ubuntu 26.04, acesso root), os registros A de `@`, `www` e `stats` no DNS da Hostinger, a chave SSH do deploy, o e-mail do certificado, o `preparar-vps.sh` pelo ssh, os secrets do Actions, o primeiro deploy e o login do GoatCounter. Os valores que não são segredo ficam em `.env.deploy`, que o git ignora.

No DNS da Hostinger, o registro A de `@` vem apontando para a página de estacionamento e o `www` vem como CNAME: o wizard pede para trocar os dois por registros A para a VPS e apagar qualquer AAAA, porque o Let's Encrypt tenta o IPv6 primeiro.

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
2. O job `publicar` manda o `.output`, o `Dockerfile` e a configuração do Nginx por scp para `/opt/temestudo/envio/`. Na VPS, o script monta a imagem `temestudo-app:sha-<commit>` e confere o contêiner do GoatCounter (veja a seção dele).
3. A troca:
   - o contêiner novo sobe na porta livre do par 3011/3031, ao lado do antigo;
   - o script espera até 60 s que ele responda `/`;
   - instala o vhost, o TLS e a rotação, e reescreve o include `/etc/nginx/temestudo/temestudo-app.conf` com a porta nova;
   - roda `nginx -t` e recarrega o Nginx;
   - espera os workers velhos terminarem os pedidos e só então para o contêiner antigo.
4. De fora, o job confere que `https://temestudo.com/` responde com `Referrer-Policy: strict-origin` e que o http leva ao https com a query. Se `https://stats.temestudo.com/` não responde, sai só um aviso no resumo do run.

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
| Vhosts | `/etc/nginx/sites-available/temestudo.conf` e `temestudo-stats.conf`, com link em `sites-enabled/` |
| GoatCounter | contêiner `temestudo-stats` em `127.0.0.1:3051`, banco no volume `temestudo-stats` |
| Formato do access_log | `/etc/nginx/conf.d/temestudo-log-sem-query.conf` |
| Porta do contêiner no ar | `/etc/nginx/temestudo/temestudo-app.conf` |
| Logs do Nginx | `/var/log/nginx/temestudo/access.log` e `error.log` |
| Rotação | `/etc/logrotate.d/temestudo` |
| Log do app | `docker logs temestudo-app` (10 MB × 3 arquivos) |

Os vhosts do repositório são os que valem. A troca reinstala os dois a cada deploy e guarda o anterior como `.anterior` ao lado. Uma mudança feita à mão na VPS some no próximo deploy.

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

A contagem de visitas roda em https://stats.temestudo.com, num contêiner próprio (`temestudo-stats`, imagem `arp242/goatcounter:2.7.0`) em `127.0.0.1:3051`, fora do par 3011/3031. O banco é um SQLite no volume `temestudo-stats`.

- **Deploy:** a cada publicação, o `vps.ts` cria o contêiner se ele falta, parou ou a imagem de `STATS` mudou, e o volume fica. Se o GoatCounter não sobe, o deploy do site segue com um aviso.
- **Vhost:** `frontend/nginx/temestudo-stats.conf` sai junto com o `temestudo.conf`, com o mesmo `log_format` sem query e os mesmos arquivos de log. O bloco `:80` serve o desafio do certbot, porque o `default_server` recusa host que não conhece. O Nginx passa ao GoatCounter só o IP de quem visita, de onde ele tira o país.
- **Certificado:** um só para `temestudo.com`, `www` e `stats`, tirado pelo `preparar-vps.sh`. Num certificado antigo sem o `stats`, rodar o script de novo acrescenta o nome (`--expand`).
- **O que o site manda:** o envio é nosso (`frontend/src/analytics/goatcounter.ts`), e não o `count.js`, que manda sempre o `location.search` com o Perfil. Vão o caminho sem query, a referência sem query, a largura da tela e, nos eventos, o nome. Com GPC, DNT ou a chave do rodapé desligada, o arquivo nem carrega.
- **Configuração do site no GoatCounter:** retenção de 31 dias, e só referência, tamanho de tela, país e sessões ligados (`collect` = 154). Região, navegador e sistema, idioma e as visitas uma a uma ficam desligados.

### Login (uma vez, depois do primeiro deploy)

Enquanto o GoatCounter não tem site criado, a tela inicial dele deixa qualquer um criar a conta, e o deploy avisa isso no log. Logo depois do primeiro deploy verde, rode a etapa 8 do wizard, ou à mão:

```bash
ssh -t root@<ip> docker exec -it temestudo-stats goatcounter db create site \
  -vhost stats.temestudo.com -user.email <email>   # pede a senha (8 a 50 caracteres)
ssh root@<ip> "docker exec temestudo-stats goatcounter db query \"update sites set settings = json_set(settings, '\$.collect', 154, '\$.data_retention', 31) where cname = 'stats.temestudo.com'\" && docker restart temestudo-stats"
```

O GoatCounter lê as configurações ao subir, por isso o restart. Depois, entre em https://stats.temestudo.com e confira em Settings: em Data collection, só Referrer, Size, Country e Sessions marcados; em Data retention, 31.

Para conferir sem o navegador: `ssh root@<ip> docker exec temestudo-stats goatcounter db query "select settings from sites"`.

### Revisão do painel

Uma vez por mês, abra o painel. Um Guia com muitos `ajudou/nao/<motivo>/<guia>` vira uma issue de revisão com o motivo mais frequente. Não há meta numérica.
