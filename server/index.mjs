import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = resolve(rootDir, 'data', 'submissions.json');
const dbFile = resolve(rootDir, 'data', 'coded.sqlite');
const port = Number(process.env.CODED_API_PORT ?? 8787);
const host = process.env.CODED_API_HOST ?? '127.0.0.1';
const githubRepoPattern = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/i;
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES ?? 16_384);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 10);
const adminToken = process.env.CODED_ADMIN_TOKEN ?? '';
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const rateBuckets = new Map();
let db;

function corsOrigin(request) {
  const origin = request.headers.origin;
  if (allowedOrigins.includes('*')) return '*';
  if (origin && allowedOrigins.includes(origin)) return origin;
  return '';
}

function json(request, response, status, body) {
  const origin = corsOrigin(request);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Token',
    'Vary': 'Origin',
  });
  response.end(JSON.stringify(body));
}

function requestIp(request) {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return request.socket.remoteAddress ?? 'unknown';
}

function isCorsAllowed(request) {
  if (allowedOrigins.includes('*')) return true;
  const origin = request.headers.origin;
  return !origin || allowedOrigins.includes(origin);
}

function isRateLimited(request) {
  if (request.method !== 'POST') return false;

  const ip = requestIp(request);
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > rateLimitMax;
}

function requireAdmin(request, response) {
  if (!adminToken) {
    json(request, response, 403, { error: 'Admin moderation is not configured.' });
    return false;
  }

  if (request.headers['x-admin-token'] !== adminToken) {
    json(request, response, 401, { error: 'Admin token required.' });
    return false;
  }

  return true;
}

function getRepoName(repoUrl) {
  const match = repoUrl.trim().match(githubRepoPattern);
  return match ? `${match[1]}/${match[2]}` : '';
}

async function readJsonBody(request) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > maxBodyBytes) {
      const error = new Error('Request body too large.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function readJsonSubmissions() {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.submissions) ? parsed.submissions : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function initDb() {
  await mkdir(dirname(dataFile), { recursive: true });
  db = new DatabaseSync(dbFile);
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repo_name TEXT NOT NULL UNIQUE,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'approved',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_submissions_status_created ON submissions(status, created_at DESC);
  `);

  if (existsSync(dataFile)) {
    const existingRows = db.prepare('SELECT COUNT(*) AS count FROM submissions').get();
    if (existingRows.count === 0) {
      const jsonSubmissions = await readJsonSubmissions();
      for (const submission of jsonSubmissions) {
        upsertSubmission({ ...submission, status: submission.status ?? 'approved' });
      }
    }
  }
}

function serializeSubmission(row) {
  const submission = JSON.parse(row.payload);
  return {
    id: row.id,
    ...submission,
    status: row.status,
  };
}

function readSubmissions({ includeHidden = false } = {}) {
  const rows = includeHidden
    ? db.prepare('SELECT * FROM submissions WHERE status != ? ORDER BY created_at DESC').all('deleted')
    : db.prepare('SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC').all('approved');

  return rows.map(serializeSubmission);
}

function getSubmissionById(id) {
  const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
  return row ? serializeSubmission(row) : null;
}

function upsertSubmission(submission) {
  const repoName = getRepoName(submission.repoUrl);
  const now = new Date().toISOString();
  const status = submission.status ?? 'approved';
  const payload = JSON.stringify({ ...submission, status: undefined, id: undefined });

  db.prepare(`
    INSERT INTO submissions (repo_name, payload, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(repo_name) DO UPDATE SET
      payload = excluded.payload,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run(repoName, payload, status, submission.submittedAt ?? now, now);

  return db.prepare('SELECT * FROM submissions WHERE repo_name = ?').get(repoName);
}

function updateSubmissionStatus(id, status) {
  db.prepare('UPDATE submissions SET status = ?, updated_at = ? WHERE id = ?').run(status, new Date().toISOString(), id);
  return getSubmissionById(id);
}

function healthStats() {
  const row = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) AS hidden,
      MAX(updated_at) AS lastWriteAt
    FROM submissions
    WHERE status != 'deleted'
  `).get();

  return {
    totalSubmissions: row.total ?? 0,
    approvedSubmissions: row.approved ?? 0,
    hiddenSubmissions: row.hidden ?? 0,
    lastWriteAt: row.lastWriteAt ?? null,
  };
}

async function fetchGithubRepository(repoUrl) {
  const repoName = getRepoName(repoUrl);
  if (!repoName) return null;

  const response = await fetch(`https://api.github.com/repos/${repoName}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'coded-local-analyzer',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });

  if (!response.ok) return null;
  const repo = await response.json();

  return {
    name: repo.name ?? repoName.split('/')[1],
    fullName: repo.full_name ?? repoName,
    description: repo.description ?? '',
    homepage: repo.homepage ?? '',
    language: repo.language ?? '',
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    license: repo.license?.spdx_id ?? repo.license?.name ?? '',
    defaultBranch: repo.default_branch ?? 'main',
    pushedAt: repo.pushed_at ?? '',
  };
}

async function githubFileExists(repoName, path) {
  const response = await fetch(`https://api.github.com/repos/${repoName}/contents/${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'coded-local-analyzer',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });

  return response.ok;
}

async function analyzeRepository(repoUrl) {
  const repoName = getRepoName(repoUrl);
  const github = await fetchGithubRepository(repoUrl);
  if (!repoName || !github) return { github, analysis: null };

  const checks = {
    readme: await githubFileExists(repoName, 'README.md'),
    license: Boolean(github.license) || await githubFileExists(repoName, 'LICENSE'),
    dockerfile: await githubFileExists(repoName, 'Dockerfile'),
    packageJson: await githubFileExists(repoName, 'package.json'),
    workflow: await githubFileExists(repoName, '.github/workflows'),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  return {
    github,
    analysis: {
      checkedAt: new Date().toISOString(),
      checks,
      confidence: Number((0.45 + passed * 0.1).toFixed(2)),
      recommendations: [
        !checks.readme && 'Add a README with install, usage, screenshots, and architecture notes.',
        !checks.license && 'Add a license so adopters know how they can use the project.',
        !checks.dockerfile && 'Add a Dockerfile or document a reproducible build command.',
        !checks.workflow && 'Add CI so tests and scans are visible before adoption.',
      ].filter(Boolean),
    },
  };
}

function createSubmission(body, enriched) {
  const notes = (body.notes ?? '').trim().slice(0, 500);
  const demoUrl = (body.demoUrl ?? '').trim().slice(0, 300);

  return {
    repoUrl: body.repoUrl.trim().slice(0, 300),
    demoUrl,
    category: body.category || 'Developer Tools',
    notes,
    submittedAt: new Date().toISOString(),
    status: 'approved',
    github: enriched.github ?? undefined,
    analysis: enriched.analysis ?? undefined,
  };
}

await initDb();

const server = createServer(async (request, response) => {
  try {
    if (!isCorsAllowed(request)) return json(request, response, 403, { error: 'Origin not allowed.' });
    if (request.method === 'OPTIONS') return json(request, response, 204, {});
    if (isRateLimited(request)) return json(request, response, 429, { error: 'Too many requests. Try again shortly.' });

    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

    if (request.method === 'GET' && (url.pathname === '/api/health' || url.pathname === '/health')) {
      return json(request, response, 200, { ok: true, ...healthStats() });
    }

    if (request.method === 'GET' && (url.pathname === '/api/submissions' || url.pathname === '/submissions')) {
      return json(request, response, 200, { submissions: await readSubmissions() });
    }

    if (request.method === 'GET' && (url.pathname === '/api/admin/submissions' || url.pathname === '/admin/submissions')) {
      if (!requireAdmin(request, response)) return;
      return json(request, response, 200, { submissions: readSubmissions({ includeHidden: true }) });
    }

    const adminStatusMatch = url.pathname.match(/^\/(?:api\/)?admin\/submissions\/(\d+)\/(approve|hide|delete)$/);
    if (request.method === 'POST' && adminStatusMatch) {
      if (!requireAdmin(request, response)) return;

      const statusByAction = { approve: 'approved', hide: 'hidden', delete: 'deleted' };
      const submission = updateSubmissionStatus(Number(adminStatusMatch[1]), statusByAction[adminStatusMatch[2]]);
      if (!submission) return json(request, response, 404, { error: 'Submission not found.' });
      return json(request, response, 200, { submission });
    }

    if (request.method === 'POST' && (url.pathname === '/api/submissions' || url.pathname === '/submissions')) {
      const body = await readJsonBody(request);
      if (!body.repoUrl || !githubRepoPattern.test(body.repoUrl.trim())) {
        return json(request, response, 400, { error: 'Enter a full public GitHub repo URL.' });
      }

      const enriched = await analyzeRepository(body.repoUrl.trim());
      const submission = createSubmission(body, enriched);
      const row = upsertSubmission(submission);
      return json(request, response, 201, { submission: serializeSubmission(row) });
    }

    return json(request, response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return json(request, response, error.status ?? 500, { error: error.status ? error.message : 'Internal server error' });
  }
});

server.listen(port, host, () => {
  console.log(`Coded API listening on http://${host}:${port}`);
});
