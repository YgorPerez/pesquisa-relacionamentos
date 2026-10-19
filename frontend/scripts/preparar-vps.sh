#!/usr/bin/env bash
# Prepara a VPS do Tem estudo? uma vez, antes do primeiro deploy
# (`docs/deploy.md`). Roda como root numa VPS Ubuntu 24.04, pelo ssh:
#
#   ssh root@<ip> 'bash -s -- <email do Let's Encrypt>' < frontend/scripts/preparar-vps.sh
#
# Instala o Docker, o Nginx e o certbot, abre as portas 80 e 443 e tira o
# primeiro certificado de temestudo.com e www.temestudo.com por webroot. O
# vhost de verdade vem com o primeiro deploy (`vps.ts`). Até lá, um vhost
# provisório só na porta 80 serve o desafio do certbot. Pode rodar de novo:
# o que já está feito fica como está.
set -euo pipefail

EMAIL=${1:?"Uso: bash -s -- <email para os avisos do certificado>"}
ACME=/opt/temestudo/acme

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot curl ca-certificates docker.io procps logrotate >/dev/null
systemctl enable --now docker nginx >/dev/null

if command -v ufw >/dev/null && ufw status | grep -q 'Status: active'; then
  ufw allow OpenSSH >/dev/null
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
fi

install -d -m 755 "$ACME" /opt/temestudo /var/log/nginx/temestudo /etc/nginx/temestudo

if [ -f /etc/letsencrypt/live/temestudo.com/fullchain.pem ]; then
  echo "O certificado de temestudo.com já existe."
else
  # O site padrão do pacote ocupa o default_server da 80.
  rm -f /etc/nginx/sites-enabled/default
  cat > /etc/nginx/sites-available/temestudo-acme.conf <<EOF
# Provisório, até o primeiro deploy instalar o temestudo.conf.
server {
  listen 80;
  listen [::]:80;
  server_name temestudo.com www.temestudo.com;
  access_log off;
  location ^~ /.well-known/acme-challenge/ { root $ACME; }
  location / { return 503; }
}
EOF
  ln -sfn /etc/nginx/sites-available/temestudo-acme.conf /etc/nginx/sites-enabled/temestudo-acme.conf
  nginx -t
  systemctl reload nginx
  certbot certonly --webroot -w "$ACME" \
    -d temestudo.com -d www.temestudo.com \
    --email "$EMAIL" --agree-tos --no-eff-email -n \
    --deploy-hook 'systemctl reload nginx'
fi

# A renovação usa o mesmo webroot, que o vhost de verdade também serve.
certbot renew --dry-run -q && echo "A renovação do certificado funciona."
docker --version
nginx -v
echo "VPS pronta. O próximo merge na main (ou o 'Run workflow' do Deploy) publica o site."
