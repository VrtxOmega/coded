# Coded Deployment

## GitHub Pages frontend

The existing `.github/workflows/deploy-pages.yml` builds the Vite frontend and deploys `dist` to GitHub Pages.

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
- `GITHUB_TOKEN`: optional server-only GitHub token for higher API limits
- `ALLOWED_ORIGINS`: comma-separated browser origins allowed by CORS, for example `https://vrtxomega.github.io,http://localhost:3000`

The backend stores submissions in `data/submissions.json`. That directory is ignored by git.

## Secret rules

- Never commit `.env` files, API keys, GitHub tokens, private keys, database passwords, or production data.
- Never expose `GITHUB_TOKEN` through `VITE_*`, GitHub Pages variables, or client-side code.
- Keep tokens in the backend host secret store only.
- `CODED_API_URL` is not a secret; it is safe to expose.
- GitHub Pages cannot securely run server code or hold server secrets.

## Recommended live setup

1. Deploy the frontend with GitHub Pages.
2. Deploy `server/index.mjs` to a server host such as Render, Fly.io, Railway, a VPS, or a serverless Node host.
3. Set `GITHUB_TOKEN` only on that backend host.
4. Set `ALLOWED_ORIGINS` to the GitHub Pages origin.
5. Add `CODED_API_URL` as a GitHub repository variable, not a secret, so the Pages build points to the API.
