import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { analyzeRepository, getRepoName } from './analyzer.mjs';

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
const githubClientId = process.env.GITHUB_CLIENT_ID ?? '';
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET ?? '';
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const rateBuckets = new Map();
const oauthStates = new Map();
const githubSessions = new Map();
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
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Token,X-Coded-Session',
    'Vary': 'Origin',
  });
  response.end(JSON.stringify(body));
}

function jsonAttachment(request, response, filename, body) {
  const origin = corsOrigin(request);
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="${filename}"`,
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Token,X-Coded-Session',
    'Vary': 'Origin',
  });
  response.end(JSON.stringify(body, null, 2));
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

function sessionFromRequest(request) {
  const token = request.headers['x-coded-session'];
  if (typeof token !== 'string') return null;

  const session = githubSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) githubSessions.delete(token);
    return null;
  }

  return session;
}

function authRedirect(response, target) {
  response.writeHead(302, { Location: target });
  response.end();
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

function updateSubmissionPayload(id, submission) {
  const existing = getSubmissionById(id);
  if (!existing) return null;

  const payload = JSON.stringify({ ...submission, status: undefined, id: undefined });
  db.prepare('UPDATE submissions SET payload = ?, status = ?, updated_at = ? WHERE id = ?').run(
    payload,
    submission.status ?? existing.status ?? 'approved',
    new Date().toISOString(),
    id,
  );
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

function exportData() {
  return {
    exportedAt: new Date().toISOString(),
    health: healthStats(),
    submissions: readSubmissions({ includeHidden: true }),
  };
}

async function exchangeGithubCode(code) {
  if (!githubClientId || !githubClientSecret) return null;

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'coded-github-oauth',
    },
    body: JSON.stringify({
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code,
    }),
  });
  if (!tokenResponse.ok) return null;

  const tokenPayload = await tokenResponse.json();
  if (!tokenPayload.access_token) return null;

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenPayload.access_token}`,
      'User-Agent': 'coded-github-oauth',
    },
  });
  if (!userResponse.ok) return null;

  const user = await userResponse.json();
  return {
    accessToken: tokenPayload.access_token,
    user: {
      login: user.login,
      id: user.id,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url,
    },
  };
}

async function verifiedRepoPermission(repoUrl, session) {
  const repoName = getRepoName(repoUrl);
  if (!repoName || !session?.accessToken || !session.user?.login) return false;

  const response = await fetch(`https://api.github.com/repos/${repoName}/collaborators/${session.user.login}/permission`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${session.accessToken}`,
      'User-Agent': 'coded-github-oauth',
    },
  });
  if (!response.ok) return false;

  const payload = await response.json();
  return ['admin', 'maintain', 'write'].includes(payload.permission);
}

function createSubmission(body, enriched, submitter = null) {
  const notes = (body.notes ?? '').trim().slice(0, 500);
  const demoUrl = (body.demoUrl ?? '').trim().slice(0, 300);
  const requiresVerification = Boolean(githubClientId && githubClientSecret);
  const isVerifiedOwner = Boolean(submitter?.verifiedOwner);

  return {
    repoUrl: body.repoUrl.trim().slice(0, 300),
    demoUrl,
    category: body.category || 'Developer Tools',
    notes,
    submittedAt: new Date().toISOString(),
    status: requiresVerification && !isVerifiedOwner ? 'hidden' : 'approved',
    github: enriched.github ?? undefined,
    analysis: enriched.analysis ?? undefined,
    submitter: submitter ?? undefined,
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

    if (request.method === 'GET' && (url.pathname === '/api/auth/github/start' || url.pathname === '/auth/github/start')) {
      if (!githubClientId || !githubClientSecret) {
        return json(request, response, 503, { error: 'GitHub OAuth is not configured.' });
      }

      const state = randomUUID();
      const returnTo = url.searchParams.get('returnTo') || '/submit';
      oauthStates.set(state, { returnTo, expiresAt: Date.now() + 10 * 60_000 });
      const params = new URLSearchParams({
        client_id: githubClientId,
        state,
        scope: 'read:user public_repo',
      });
      return authRedirect(response, `https://github.com/login/oauth/authorize?${params.toString()}`);
    }

    if (request.method === 'GET' && (url.pathname === '/api/auth/github/callback' || url.pathname === '/auth/github/callback')) {
      const state = url.searchParams.get('state') ?? '';
      const code = url.searchParams.get('code') ?? '';
      const savedState = oauthStates.get(state);
      oauthStates.delete(state);
      if (!savedState || savedState.expiresAt < Date.now() || !code) {
        return json(request, response, 400, { error: 'Invalid GitHub OAuth state.' });
      }

      const exchanged = await exchangeGithubCode(code);
      if (!exchanged) return json(request, response, 502, { error: 'GitHub OAuth exchange failed.' });

      const sessionToken = randomUUID();
      githubSessions.set(sessionToken, { ...exchanged, expiresAt: Date.now() + 7 * 24 * 60 * 60_000 });
      const redirectUrl = new URL(savedState.returnTo, `http://${request.headers.host}`);
      redirectUrl.searchParams.set('coded_session', sessionToken);
      redirectUrl.searchParams.set('github_login', exchanged.user.login);
      return authRedirect(response, redirectUrl.toString());
    }

    if (request.method === 'GET' && (url.pathname === '/api/auth/github/me' || url.pathname === '/auth/github/me')) {
      const session = sessionFromRequest(request);
      return json(request, response, session ? 200 : 401, session ? { user: session.user } : { error: 'GitHub session required.' });
    }

    if (request.method === 'GET' && (url.pathname === '/api/submissions' || url.pathname === '/submissions')) {
      return json(request, response, 200, { submissions: await readSubmissions() });
    }

    if (request.method === 'GET' && (url.pathname === '/api/admin/submissions' || url.pathname === '/admin/submissions')) {
      if (!requireAdmin(request, response)) return;
      return json(request, response, 200, { submissions: readSubmissions({ includeHidden: true }) });
    }

    if (request.method === 'GET' && (url.pathname === '/api/admin/export' || url.pathname === '/admin/export')) {
      if (!requireAdmin(request, response)) return;
      return jsonAttachment(request, response, `coded-export-${new Date().toISOString().slice(0, 10)}.json`, exportData());
    }

    const adminStatusMatch = url.pathname.match(/^\/(?:api\/)?admin\/submissions\/(\d+)\/(approve|hide|delete)$/);
    if (request.method === 'POST' && adminStatusMatch) {
      if (!requireAdmin(request, response)) return;

      const statusByAction = { approve: 'approved', hide: 'hidden', delete: 'deleted' };
      const submission = updateSubmissionStatus(Number(adminStatusMatch[1]), statusByAction[adminStatusMatch[2]]);
      if (!submission) return json(request, response, 404, { error: 'Submission not found.' });
      return json(request, response, 200, { submission });
    }

    const adminReanalyzeMatch = url.pathname.match(/^\/(?:api\/)?admin\/submissions\/(\d+)\/reanalyze$/);
    if (request.method === 'POST' && adminReanalyzeMatch) {
      if (!requireAdmin(request, response)) return;

      const existing = getSubmissionById(Number(adminReanalyzeMatch[1]));
      if (!existing) return json(request, response, 404, { error: 'Submission not found.' });

      const enriched = await analyzeRepository(existing.repoUrl);
      const updated = updateSubmissionPayload(Number(adminReanalyzeMatch[1]), {
        ...existing,
        github: enriched.github ?? existing.github,
        analysis: enriched.analysis ?? existing.analysis,
      });
      return json(request, response, 200, { submission: updated });
    }

    if (request.method === 'POST' && (url.pathname === '/api/submissions' || url.pathname === '/submissions')) {
      const body = await readJsonBody(request);
      if (!body.repoUrl || !githubRepoPattern.test(body.repoUrl.trim())) {
        return json(request, response, 400, { error: 'Enter a full public GitHub repo URL.' });
      }

      const session = sessionFromRequest(request);
      if (githubClientId && githubClientSecret && !session) {
        return json(request, response, 401, { error: 'Connect GitHub before submitting a public project.' });
      }

      const enriched = await analyzeRepository(body.repoUrl.trim());
      const verifiedOwner = await verifiedRepoPermission(body.repoUrl.trim(), session);
      const submitter = session ? { ...session.user, verifiedOwner } : null;
      const submission = createSubmission(body, enriched, submitter);
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
