# Notes Sync App Production Deployment

The Notes Sync app deploys like `flare-backoffice-web`: GitHub Actions builds
the app, uploads a release archive to the VPS, switches the `current` symlink,
restarts a systemd service, reloads Nginx, and runs smoke tests.

## Production target

- VPS: `45.77.170.239`
- App base: `/var/www/notes-sync-app`
- Active release: `/var/www/notes-sync-app/current`
- Releases: `/var/www/notes-sync-app/releases`
- Shared env: `/var/www/notes-sync-app/shared/.env.production`
- App service: `notes-sync-app`
- App port: `3006`
- Default host: `notes.flare.pet`

## One-time VPS bootstrap

Run this once as `root` on the VPS. Use the public key that matches GitHub
secret `PROD_SSH_KEY`.

```bash
SSH_PUBLIC_KEY='ssh-ed25519 AAAA...' APP_HOST=notes.flare.pet bash deploy/production/bootstrap-vps.sh
```

The script installs Node.js 20 and Nginx, creates `/var/www/notes-sync-app`,
writes `/etc/systemd/system/notes-sync-app.service`, writes the Nginx site, and
adds limited sudo permissions for `github-deploy`.

## GitHub production environment

Create a `production` environment in the GitHub repository.

Required secret:

- `PROD_SSH_KEY`: private key matching the public key installed for `github-deploy`

Optional secrets:

- `PROD_SSH_HOST=45.77.170.239`
- `PROD_SSH_USER=github-deploy`
- `PROD_SSH_PORT=22`

Optional variables:

- `PROD_NOTES_SYNC_PATH=/var/www/notes-sync-app`
- `PROD_NOTES_SYNC_URL=http://notes.flare.pet`
- `PROD_NOTES_SYNC_PORT=3006`

## Deploy

Push to `main` or run the workflow manually:

```text
Actions -> Deploy Notes Sync App -> Run workflow
```

## Verify on VPS

```bash
systemctl status notes-sync-app --no-pager
journalctl -u notes-sync-app -n 80 --no-pager -l
curl -I http://127.0.0.1:3006
nginx -t
```

If DNS already points to the VPS:

```bash
curl -I http://notes.flare.pet
```
