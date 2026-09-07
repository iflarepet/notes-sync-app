# Notes Sync App

Static React/Vite app prepared for production deployment.

## Scripts

```bash
npm ci
npm run build
npm run preview
```

## Production

Deployment files are in `deploy/production`.

GitHub Actions workflow:

```text
.github/workflows/production-deploy.yml
```

The production build does not include third-party tag manager snippets or starter-template external links.
