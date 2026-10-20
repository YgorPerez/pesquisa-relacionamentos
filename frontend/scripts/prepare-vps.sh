#!/usr/bin/env bash
# Prepares the Tem estudo? VPS once, before the first deploy
# (`docs/deploy.md`). Runs as root on an Ubuntu 26.04 VPS, over ssh:
#
#   ssh root@<ip> 'bash -s -- <Let's Encrypt e-mail>' < frontend/scripts/prepare-vps.sh
#
# Installs Docker, Nginx and certbot, opens ports 80 and 443 and gets, by
# webroot, a single certificate for temestudo.cloud, www.temestudo.cloud and
# stats.temestudo.cloud (GoatCounter, #35). The real vhost and the GoatCounter
# container come with the first deploy (`vps.ts`). Until then, a temporary
# vhost on port 80 only serves certbot's challenge. It can run again: what is
# already done stays as it is, and a certificate without stats gains the
# missing name.
set -euo pipefail

EMAIL=${1:?"Usage: bash -s -- <e-mail for the certificate notices>"}
ACME=/opt/temestudo/acme
CERT=/etc/letsencrypt/live/temestudo.cloud/fullchain.pem
NAMES=(temestudo.cloud www.temestudo.cloud stats.temestudo.cloud)

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

# Does the certificate already cover the three names? One taken before #35
# lacks stats.
covers_all() {
  [ -f "$CERT" ] || return 1
  local san
  san=$(openssl x509 -in "$CERT" -noout -ext subjectAltName 2>/dev/null)
  for name in "${NAMES[@]}"; do
    grep -qE "DNS:${name//./\\.}(,|$)" <<<"$san" || return 1
  done
}

if covers_all; then
  echo "The certificate for ${NAMES[*]} already exists."
else
  if [ ! -f /etc/nginx/sites-enabled/temestudo.conf ]; then
    # Before the first deploy. The package's default site takes port 80's
    # default_server.
    rm -f /etc/nginx/sites-enabled/default
    cat > /etc/nginx/sites-available/temestudo-acme.conf <<EOF
# Temporary, until the first deploy installs temestudo.conf.
server {
  listen 80;
  listen [::]:80;
  server_name ${NAMES[*]};
  access_log off;
  location ^~ /.well-known/acme-challenge/ { root $ACME; }
  location / { return 503; }
}
EOF
    ln -sfn /etc/nginx/sites-available/temestudo-acme.conf /etc/nginx/sites-enabled/temestudo-acme.conf
    nginx -t
    systemctl reload nginx
  fi
  # After the first deploy, temestudo.conf and temestudo-stats.conf already
  # serve the challenge. --expand adds stats to an old certificate.
  certbot certonly --webroot -w "$ACME" --cert-name temestudo.cloud --expand \
    -d temestudo.cloud -d www.temestudo.cloud -d stats.temestudo.cloud \
    --email "$EMAIL" --agree-tos --no-eff-email -n \
    --deploy-hook 'systemctl reload nginx'
fi

# Renewal uses the same webroot, which the real vhost also serves.
certbot renew --dry-run -q && echo "Certificate renewal works."
docker --version
nginx -v
echo "VPS ready. The next merge to main (or the Deploy's 'Run workflow') publishes the site and starts GoatCounter."
