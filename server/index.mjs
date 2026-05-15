import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = resolve(rootDir, 'data', 'submissions.json');
const port = Number(process.env.CODED_API_PORT ?? 8787);
const host = process.env.CODED_API_HOST ?? '127.0.0.1';
const githubRepoPattern = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/i;
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsOrigin(request) {
  const origin = request.headers.origin;
  if (allowedOrigins.includes('*')) return '*';
  if (origin && allowedOrigins.includes(origin)) return origin;
  return allowedOrigins[0] ?? '*';
}

function json(request, response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOrigin(request),
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  });
  response.end(JSON.stringify(body));
}

function getRepoName(repoUrl) {
  const match = repoUrl.trim().match(githubRepoPattern);
  return match ? `${match[1]}/${match[2]}` : '';
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function readSubmissions() {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.submissions) ? parsed.submissions : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeSubmissions(submissions) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, `${JSON.stringify({ submissions }, null, 2)}\n`);
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
  return {
    repoUrl: body.repoUrl.trim(),
    demoUrl: (body.demoUrl ?? '').trim(),
    category: body.category || 'Developer Tools',
    notes: (body.notes ?? '').trim(),
    submittedAt: new Date().toISOString(),
    github: enriched.github ?? undefined,
    analysis: enriched.analysis ?? undefined,
  };
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') return json(request, response, 204, {});

    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

    if (request.method === 'GET' && (url.pathname === '/api/health' || url.pathname === '/health')) {
      return json(request, response, 200, { ok: true });
    }

    if (request.method === 'GET' && (url.pathname === '/api/submissions' || url.pathname === '/submissions')) {
      return json(request, response, 200, { submissions: await readSubmissions() });
    }

    if (request.method === 'POST' && (url.pathname === '/api/submissions' || url.pathname === '/submissions')) {
      const body = await readJsonBody(request);
      if (!body.repoUrl || !githubRepoPattern.test(body.repoUrl.trim())) {
        return json(request, response, 400, { error: 'Enter a full public GitHub repo URL.' });
      }

      const enriched = await analyzeRepository(body.repoUrl.trim());
      const submission = createSubmission(body, enriched);
      const submissions = await readSubmissions();
      const nextSubmissions = [
        submission,
        ...submissions.filter((item) => getRepoName(item.repoUrl) !== getRepoName(submission.repoUrl)),
      ].slice(0, 100);

      await writeSubmissions(nextSubmissions);
      return json(request, response, 201, { submission });
    }

    return json(request, response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return json(request, response, 500, { error: 'Internal server error' });
  }
});

server.listen(port, host, () => {
  console.log(`Coded API listening on http://${host}:${port}`);
});
