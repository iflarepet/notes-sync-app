#!/usr/bin/env bash
set -euo pipefail

APP_PATH="${APP_PATH:-/var/www/notes-sync-app}"
APP_PORT="${APP_PORT:-3006}"
APP_HOST="${APP_HOST:-notes.flare.pet}"
DEPLOY_USER="${DEPLOY_USER:-github-deploy}"
SSH_PUBLIC_KEY="${SSH_PUBLIC_KEY:-}"
NODE_MAJOR="${NODE_MAJOR:-20}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root on the VPS."
  exit 1
fi

if [ -z "$SSH_PUBLIC_KEY" ]; then
  echo "Set SSH_PUBLIC_KEY to the public key that matches GitHub secret PROD_SSH_KEY."
  echo "Example: SSH_PUBLIC_KEY='ssh-ed25519 AAAA...' bash bootstrap-vps.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl gnupg nginx

install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
printf 'deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_%s.x nodistro main\n' "$NODE_MAJOR" > /etc/apt/sources.list.d/nodesource.list
apt-get update
apt-get install -y nodejs

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "GitHub deploy user" "$DEPLOY_USER"
fi

install -d -m 0700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
printf '%s\n' "$SSH_PUBLIC_KEY" > "/home/$DEPLOY_USER/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
chmod 0600 "/home/$DEPLOY_USER/.ssh/authorized_keys"

install -d -m 0755 "$APP_PATH/releases" "$APP_PATH/shared" "$APP_PATH/shared/data"
chown -R "$DEPLOY_USER:www-data" "$APP_PATH"
chmod -R g+rwX "$APP_PATH"

if [ ! -f "$APP_PATH/shared/.env.production" ]; then
  cat > "$APP_PATH/shared/.env.production" <<'ENV'
NODE_ENV=production
ENV
  chown "$DEPLOY_USER:www-data" "$APP_PATH/shared/.env.production"
  chmod 0640 "$APP_PATH/shared/.env.production"
fi

cat > /etc/systemd/system/notes-sync-app.service <<SERVICE
[Unit]
Description=Notes Sync App
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP_PATH/current
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
Environment=STATIC_ROOT=dist
Environment=NOTES_FILE=$APP_PATH/shared/data/notes.json
EnvironmentFile=$APP_PATH/shared/.env.production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
SERVICE

cat > /etc/nginx/sites-available/notes-sync-app.conf <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $APP_HOST;

    client_max_body_size 32m;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

ln -sfn /etc/nginx/sites-available/notes-sync-app.conf /etc/nginx/sites-enabled/notes-sync-app.conf

cat > /etc/sudoers.d/notes-sync-app-deploy <<SUDOERS
$DEPLOY_USER ALL=(root) NOPASSWD: /bin/systemctl restart notes-sync-app, /bin/systemctl reload nginx, /usr/bin/systemctl restart notes-sync-app, /usr/bin/systemctl reload nginx
SUDOERS
chmod 0440 /etc/sudoers.d/notes-sync-app-deploy

systemctl daemon-reload
systemctl enable notes-sync-app
nginx -t
systemctl reload nginx

echo "Notes Sync VPS bootstrap complete. Fill $APP_PATH/shared/.env.production if needed, then run the GitHub Actions deploy."
