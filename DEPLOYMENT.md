# Coded Deployment

## GitHub Pages frontend

The existing `.github/workflows/deploy-pages.yml` builds the Vite frontend and deploys `dist` to GitHub Pages.

The app uses hash routing on GitHub Pages. Use `https://vrtxomega.github.io/coded/#/submit` for the live submit page.

Set this non-secret repository variable if you want to override the default API URL:

- `CODED_API_URL`: public API base URL, for example `https://coded-api.example.com` or `https://pop-os.tail43dc9a.ts.net/api`

Do not set tokens with a `VITE_` prefix. Vite embeds `VITE_*` values into browser JavaScript.

If `CODED_API_URL` is not set, production builds default to `https://pop-os.tail43dc9a.ts.net/api`. If that API is unavailable, submissions fall back to browser `localStorage` plus public GitHub API metadata.

## API backend

Run the backend with:

```bash
npm run api
```

Environment variables:

- `CODED_API_PORT`: optional port, defaults to `8787`
- `CODED_API_HOST`: optional bind host, defaults to `127.0.0.1`
- `CODED_ADMIN_TOKEN`: server-only token required for moderation endpoints
- `GITHUB_CLIENT_ID`: optional GitHub OAuth app client ID for submitter verification
- `GITHUB_CLIENT_SECRET`: optional GitHub OAuth app client secret for submitter verification
- `GITHUB_TOKEN`: optional server-only GitHub token for higher API limits
- `ALLOWED_ORIGINS`: comma-separated browser origins allowed by CORS, for example `https://vrtxomega.github.io,http://localhost:3000`
- `MAX_BODY_BYTES`: optional request body cap, defaults to `16384`
- `RATE_LIMIT_WINDOW_MS`: optional write rate window, defaults to `60000`
- `RATE_LIMIT_MAX`: optional POSTs per window per IP, defaults to `10`

The backend stores submissions in `data/coded.sqlite`. It migrates old `data/submissions.json` data if the SQLite database is empty. The `data/` directory is ignored by git.

Admin endpoints:

- `GET /api/admin/submissions`
- `GET /api/admin/export`
- `POST /api/admin/submissions/:id/approve`
- `POST /api/admin/submissions/:id/hide`
- `POST /api/admin/submissions/:id/delete`
- `POST /api/admin/submissions/:id/reanalyze`

Send the token with:

```text
X-Admin-Token: <CODED_ADMIN_TOKEN>
```

## Backups

The live deployment includes a user timer:

- `coded-api-backup.timer`
- `coded-api-backup.service`

It runs daily around `03:17` and writes timestamped archives to:

```text
/home/vrtxomega/backups/coded-api
```

Each archive includes:

- `data/coded.sqlite`
- `admin-token.txt`
- `coded-api.service`
- `coded-api.service.d/secrets.conf`

Archives older than 14 days are deleted by the backup script.

Manual backup:

```bash
systemctl --user start coded-api-backup.service
```

List backups:

```bash
ls -lh /home/vrtxomega/backups/coded-api
```

## Secret rules

- Never commit `.env` files, API keys, GitHub tokens, private keys, database passwords, or production data.
- Never expose `GITHUB_TOKEN` through `VITE_*`, GitHub Pages variables, or client-side code.
- Never expose `CODED_ADMIN_TOKEN` through `VITE_*`, GitHub Pages variables, or client-side code.
- Keep tokens in the backend host secret store only.
- `CODED_API_URL` is not a secret; it is safe to expose.
- GitHub Pages cannot securely run server code or hold server secrets.

## Recommended live setup

1. Deploy the frontend with GitHub Pages.
2. Deploy `server/index.mjs` to a server host such as Render, Fly.io, Railway, a VPS, or a serverless Node host.
3. Set `GITHUB_TOKEN` only on that backend host if higher GitHub API limits are needed.
4. Set `CODED_ADMIN_TOKEN` only on that backend host.
5. Set `ALLOWED_ORIGINS` to the GitHub Pages origin.
6. Add `CODED_API_URL` as a GitHub repository variable, not a secret, so the Pages build points to the API.
7. Optional: create a GitHub OAuth app and set its callback URL to `<CODED_API_URL>/auth/github/callback`, then set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` only on the backend host.
