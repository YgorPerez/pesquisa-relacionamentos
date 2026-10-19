#!/usr/bin/env bash
# Prepara a VPS do Tem estudo? uma vez, antes do primeiro deploy
# (`docs/deploy.md`). Roda como root numa VPS Ubuntu 26.04, pelo ssh:
#
#   ssh root@<ip> 'bash -s -- <email do Let's Encrypt>' < frontend/scripts/preparar-vps.sh
#
# Instala o Docker, o Nginx e o certbot, abre as portas 80 e 443 e tira, por
# webroot, um certificado só para temestudo.com, www.temestudo.com e
# stats.temestudo.com (o GoatCounter, #35). O vhost de verdade e o contêiner
# do GoatCounter vêm com o primeiro deploy (`vps.ts`). Até lá, um vhost
# provisório só na porta 80 serve o desafio do certbot. Pode rodar de novo:
# o que já está feito fica como está, e um certificado sem o stats ganha o
# nome que falta.
set -euo pipefail

EMAIL=${1:?"Uso: bash -s -- <email para os avisos do certificado>"}
ACME=/opt/temestudo/acme
CERT=/etc/letsencrypt/live/temestudo.com/fullchain.pem
NOMES=(temestudo.com www.temestudo.com stats.temestudo.com)

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot curl ca-certificates docker.io procps logrotate openssl >/dev/null
systemctl enable --now docker nginx >/dev/null

if command -v ufw >/dev/null && ufw status | grep -q 'Status: active'; then
  ufw allow OpenSSH >/dev/null
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
fi

install -d -m 755 "$ACME" /opt/temestudo /var/log/nginx/temestudo /etc/nginx/temestudo

# O certificado já cobre os três nomes? Um tirado antes do #35 não tem o stats.
cobre_todos() {
  [ -f "$CERT" ] || return 1
  local san
  san=$(openssl x509 -in "$CERT" -noout -ext subjectAltName 2>/dev/null)
  for nome in "${NOMES[@]}"; do
    grep -qE "DNS:${nome//./\\.}(,|$)" <<<"$san" || return 1
  done
}

if cobre_todos; then
  echo "O certificado de ${NOMES[*]} já existe."
else
  if [ ! -f /etc/nginx/sites-enabled/temestudo.conf ]; then
    # Antes do primeiro deploy. O site padrão do pacote ocupa o
    # default_server da 80.
    rm -f /etc/nginx/sites-enabled/default
    cat > /etc/nginx/sites-available/temestudo-acme.conf <<EOF
# Provisório, até o primeiro deploy instalar o temestudo.conf.
server {
  listen 80;
  listen [::]:80;
  server_name ${NOMES[*]};
  access_log off;
  location ^~ /.well-known/acme-challenge/ { root $ACME; }
  location / { return 503; }
}
EOF
    ln -sfn /etc/nginx/sites-available/temestudo-acme.conf /etc/nginx/sites-enabled/temestudo-acme.conf
    nginx -t
    systemctl reload nginx
  fi
  # Depois do primeiro deploy, o temestudo.conf e o temestudo-stats.conf já
  # servem o desafio. O --expand acrescenta o stats a um certificado antigo.
  certbot certonly --webroot -w "$ACME" --cert-name temestudo.com --expand \
    -d temestudo.com -d www.temestudo.com -d stats.temestudo.com \
    --email "$EMAIL" --agree-tos --no-eff-email -n \
    --deploy-hook 'systemctl reload nginx'
fi

# A renovação usa o mesmo webroot, que o vhost de verdade também serve.
certbot renew --dry-run -q && echo "A renovação do certificado funciona."
docker --version
nginx -v
echo "VPS pronta. O próximo merge na main (ou o 'Run workflow' do Deploy) publica o site e sobe o GoatCounter."
