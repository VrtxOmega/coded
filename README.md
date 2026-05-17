# Coded

Coded is a discovery and grading platform for developer projects. Builders submit a public GitHub repository, Coded analyzes repository quality signals, and the project receives a public scorecard with strengths, risks, and improvement recommendations.

Live site: https://vrtxomega.github.io/coded/

Submit page: https://vrtxomega.github.io/coded/#/submit

## Features

- GitHub repository submission with public metadata enrichment
- Weighted analyzer dimensions for code quality, documentation, testing, security, architecture, and originality
- Composite project scorecards with evidence and recommendations
- Discover, project detail, builder, collections, saved, pricing, rubric, and admin views
- Node API with SQLite submission storage
- Admin moderation, JSON export, and reanalysis actions
- Optional no-repository-scope GitHub OAuth for owner verification
- Public repository analysis works without GitHub authorization; unverified submissions can be moderated before listing
- GitHub Pages deployment for the frontend

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn-style Radix UI components
- Node HTTP API
- SQLite through `node:sqlite`
- GitHub REST API

## Install

```bash
npm ci
```

## Development

Run the frontend and API together:

```bash
npm run dev
```

Run only the frontend:

```bash
npm run dev:web
```

Run only the API:

```bash
npm run api
```

The Vite dev server proxies `/api` to `http://localhost:8787`.

## Testing

```bash
npm test
npm run lint
npm run build
```

The test suite covers client-side submission utilities, project filtering, and the backend repository analyzer.

## Analyzer

The backend analyzer fetches:

- repository metadata
- recursive Git tree
- README content
- `package.json` content when present

It produces:

- composite score
- AI grade
- community score
- activity score
- completeness score
- weighted dimensions
- repository evidence
- recommendations

## API

Core endpoints:

- `GET /api/health`
- `GET /api/submissions`
- `POST /api/submissions`
- `GET /api/admin/submissions`
- `GET /api/admin/export`
- `POST /api/admin/submissions/:id/approve`
- `POST /api/admin/submissions/:id/hide`
- `POST /api/admin/submissions/:id/delete`
- `POST /api/admin/submissions/:id/reanalyze`

Optional OAuth endpoints:

- `GET /api/auth/github/start`
- `GET /api/auth/github/callback`
- `GET /api/auth/github/me`

## Environment

Backend variables:

- `CODED_API_PORT`
- `CODED_API_HOST`
- `CODED_ADMIN_TOKEN`
- `GITHUB_TOKEN`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `ALLOWED_ORIGINS`
- `MAX_BODY_BYTES`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

Frontend build variable:

- `VITE_CODED_API_URL`

Do not expose backend secrets through `VITE_*` variables.

## Docker

Build and run:

```bash
docker build -t coded .
docker run --rm -p 8787:8787 coded
```

The image validates tests and frontend build during the build stage, then runs the API on port `8787`.

## Deployment

GitHub Pages deploys the frontend from `.github/workflows/deploy-pages.yml`.

The API should run on a backend host with server-side secrets. Set `CODED_API_URL` as a non-secret GitHub repository variable so the Pages build points to the API.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for backend, OAuth, backup, and secret-handling details.

## Security

See [SECURITY.md](./SECURITY.md). Do not commit `.env` files, tokens, OAuth secrets, private keys, production databases, or local `data/` files.
