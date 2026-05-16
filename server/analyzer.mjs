const githubRepoPattern = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/i;
const binaryExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov', '.pdf', '.zip', '.gz', '.sqlite']);

export function getRepoName(repoUrl) {
  const match = repoUrl.trim().match(githubRepoPattern);
  return match ? `${match[1]}/${match[2]}` : '';
}

function githubHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'coded-repository-analyzer',
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) return null;
  return await response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) return '';
  return await response.text();
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function fileExt(path) {
  const match = path.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : '';
}

function pathIncludes(files, patterns) {
  return files.some((file) => patterns.some((pattern) => pattern.test(file)));
}

function countMatches(files, patterns) {
  return files.filter((file) => patterns.some((pattern) => pattern.test(file))).length;
}

function scoreDimension(score, evidence, recommendation) {
  return {
    score: Math.round(clamp(score)),
    evidence: evidence.filter(Boolean).slice(0, 4),
    recommendation,
  };
}

function readmeQuality(readme) {
  const lower = readme.toLowerCase();
  const sections = [
    /install|getting started|setup/.test(lower),
    /usage|example|quickstart/.test(lower),
    /api|configuration|environment/.test(lower),
    /test|contributing|development/.test(lower),
    /screenshot|demo|preview|video/.test(lower),
  ].filter(Boolean).length;

  return {
    lengthScore: clamp(readme.length / 70, 0, 35),
    sectionScore: sections * 9,
    sections,
  };
}

function packageSignals(packageJson) {
  if (!packageJson) return { scripts: {}, dependencyCount: 0, parsed: false };

  try {
    const parsed = JSON.parse(packageJson);
    return {
      scripts: parsed.scripts ?? {},
      dependencyCount: Object.keys({ ...(parsed.dependencies ?? {}), ...(parsed.devDependencies ?? {}) }).length,
      parsed: true,
    };
  } catch {
    return { scripts: {}, dependencyCount: 0, parsed: false };
  }
}

export function buildRepositoryAnalysis({ repoUrl, github, files, readme = '', packageJson = '' }) {
  const normalizedFiles = files.map((file) => file.toLowerCase());
  const packageInfo = packageSignals(packageJson);
  const scripts = packageInfo.scripts;
  const hasReadme = normalizedFiles.includes('readme.md') || Boolean(readme);
  const hasLicense = normalizedFiles.some((file) => /^licen[cs]e(\.|$)/.test(file)) || Boolean(github?.license);
  const hasDockerfile = normalizedFiles.some((file) => /(^|\/)(dockerfile|containerfile)$/.test(file));
  const hasCompose = normalizedFiles.some((file) => /(^|\/)docker-compose\.ya?ml$/.test(file));
  const hasWorkflow = normalizedFiles.some((file) => file.startsWith('.github/workflows/'));
  const hasPackageJson = normalizedFiles.includes('package.json') || Boolean(packageJson);
  const hasLockfile = pathIncludes(normalizedFiles, [/package-lock\.json$/, /pnpm-lock\.yaml$/, /yarn\.lock$/, /bun\.lockb?$/, /poetry\.lock$/, /uv\.lock$/, /cargo\.lock$/, /go\.sum$/]);
  const testFiles = countMatches(normalizedFiles, [/\.test\./, /\.spec\./, /(^|\/)__tests__\//, /(^|\/)tests?\//]);
  const sourceFiles = normalizedFiles.filter((file) => !binaryExtensions.has(fileExt(file)));
  const sourceCount = sourceFiles.length;
  const configCount = countMatches(normalizedFiles, [/eslint/, /prettier/, /tsconfig/, /ruff/, /pyproject/, /biome/, /vite\.config/, /next\.config/]);
  const securitySignals = [
    pathIncludes(normalizedFiles, [/^security\.md$/, /\.github\/dependabot\.ya?ml$/, /codeql/, /semgrep/, /bandit/]),
    Object.keys(scripts).some((name) => /audit|security|scan|lint/.test(name.toLowerCase())),
    hasLockfile,
  ].filter(Boolean).length;
  const architectureDirs = ['src/', 'server/', 'app/', 'components/', 'lib/', 'pages/', 'packages/', 'services/', 'tests/', 'docs/']
    .filter((dir) => normalizedFiles.some((file) => file.startsWith(dir))).length;
  const readmeScore = readmeQuality(readme);
  const testScript = Object.keys(scripts).find((name) => /test|check/.test(name.toLowerCase()));
  const lintScript = Object.keys(scripts).find((name) => /lint|typecheck|type-check/.test(name.toLowerCase()));
  const recentPushDays = github?.pushedAt ? (Date.now() - new Date(github.pushedAt).getTime()) / 86_400_000 : 90;

  const dimensions = {
    codeQuality: scoreDimension(
      35 + Math.min(sourceCount, 120) * 0.22 + configCount * 5 + (lintScript ? 15 : 0) + (hasLockfile ? 8 : 0),
      [
        `${sourceCount} text files scanned`,
        lintScript ? `Quality script detected: ${lintScript}` : '',
        configCount ? `${configCount} tooling config files found` : '',
        hasLockfile ? 'Dependency lockfile present' : '',
      ],
      lintScript ? 'Keep lint and type checks visible in CI.' : 'Add lint or type-check scripts so code quality can be verified automatically.',
    ),
    documentation: scoreDimension(
      (hasReadme ? 25 : 0) + readmeScore.lengthScore + readmeScore.sectionScore + (normalizedFiles.some((file) => file.startsWith('docs/')) ? 12 : 0),
      [
        hasReadme ? `README found with ${readme.length.toLocaleString()} characters` : '',
        readmeScore.sections ? `${readmeScore.sections}/5 expected README sections detected` : '',
        normalizedFiles.some((file) => file.startsWith('docs/')) ? 'Dedicated docs directory found' : '',
      ],
      readmeScore.sections >= 4 ? 'Add screenshots or architecture notes if they are missing.' : 'Expand README with install, usage, test, demo, and architecture sections.',
    ),
    testing: scoreDimension(
      30 + Math.min(testFiles, 20) * 2.5 + (testScript ? 18 : 0) + (hasWorkflow ? 17 : 0),
      [
        testFiles ? `${testFiles} test files or test directories detected` : '',
        testScript ? `Test script detected: ${testScript}` : '',
        hasWorkflow ? 'GitHub Actions workflow present' : '',
      ],
      testScript && hasWorkflow ? 'Surface coverage output in CI for stronger scoring.' : 'Add test scripts and a GitHub Actions workflow that runs them.',
    ),
    security: scoreDimension(
      35 + securitySignals * 16 + (hasLicense ? 9 : 0) + (hasLockfile ? 8 : 0),
      [
        hasLicense ? 'License signal present' : '',
        hasLockfile ? 'Lockfile supports dependency review' : '',
        securitySignals ? `${securitySignals} security hygiene signals detected` : '',
      ],
      securitySignals >= 2 ? 'Add a public SECURITY.md if the project handles user data.' : 'Add dependency scanning, SECURITY.md, and secret/dependency checks.',
    ),
    architecture: scoreDimension(
      32 + architectureDirs * 7 + (hasDockerfile || hasCompose ? 12 : 0) + (sourceCount > 12 ? 10 : 0),
      [
        `${architectureDirs} recognizable project directories found`,
        hasDockerfile ? 'Dockerfile present' : '',
        hasCompose ? 'docker-compose config present' : '',
        sourceCount > 12 ? 'Non-trivial project file surface' : '',
      ],
      hasDockerfile || hasCompose ? 'Document the production runtime path next to the container setup.' : 'Add Dockerfile or documented reproducible runtime/build command.',
    ),
    originality: scoreDimension(
      42 + Math.min(sourceCount, 90) * 0.18 + Math.min(readme.length, 6_000) / 160 + (github?.description ? 8 : 0),
      [
        github?.description ? 'Repository description is set' : '',
        sourceCount > 20 ? 'Implementation extends beyond a minimal scaffold' : '',
        readme.length > 900 ? 'README has enough detail for positioning' : '',
      ],
      sourceCount > 20 ? 'Explain what is differentiated versus adjacent tools.' : 'Add implementation depth beyond starter-template structure.',
    ),
  };

  const weightedAi =
    dimensions.codeQuality.score * 0.25 +
    dimensions.documentation.score * 0.2 +
    dimensions.testing.score * 0.2 +
    dimensions.security.score * 0.15 +
    dimensions.architecture.score * 0.1 +
    dimensions.originality.score * 0.1;
  const activityScore = clamp(95 - recentPushDays * 1.4 + Math.log10(Math.max(1, (github?.stars ?? 0) + (github?.forks ?? 0))) * 8);
  const completenessScore = clamp(
    (hasReadme ? 18 : 0) +
    (hasLicense ? 14 : 0) +
    (hasDockerfile || hasCompose ? 18 : 0) +
    (hasWorkflow ? 16 : 0) +
    (github?.homepage ? 12 : 0) +
    (readmeScore.sections * 4),
  );
  const communityScore = clamp(Math.log10(Math.max(1, (github?.stars ?? 0) * 2 + (github?.forks ?? 0) * 5 + (github?.openIssues ?? 0))) * 22);
  const compositeScore = weightedAi * 0.4 + communityScore * 0.3 + activityScore * 0.2 + completenessScore * 0.1;

  const recommendations = Object.values(dimensions)
    .filter((dimension) => dimension.score < 82)
    .map((dimension) => dimension.recommendation)
    .slice(0, 5);

  return {
    version: 2,
    checkedAt: new Date().toISOString(),
    repoName: getRepoName(repoUrl),
    score: Number(compositeScore.toFixed(1)),
    aiGrade: Number(weightedAi.toFixed(1)),
    communityScore: Number(communityScore.toFixed(1)),
    activityScore: Number(activityScore.toFixed(1)),
    completenessScore: Number(completenessScore.toFixed(1)),
    confidence: Number(clamp(0.55 + Math.min(sourceCount, 80) / 200 + Object.values(dimensions).filter((dimension) => dimension.evidence.length).length * 0.025, 0.35, 0.98).toFixed(2)),
    checks: {
      readme: hasReadme,
      license: hasLicense,
      dockerfile: hasDockerfile || hasCompose,
      packageJson: hasPackageJson,
      workflow: hasWorkflow,
    },
    dimensions,
    evidence: [
      `${sourceCount} repository files scanned from ${github?.defaultBranch ?? 'default branch'}`,
      hasPackageJson && packageInfo.parsed ? `${packageInfo.dependencyCount} package dependencies/dev dependencies found` : '',
      testFiles ? `${testFiles} test paths detected` : '',
      hasWorkflow ? 'CI workflow detected' : '',
      github?.pushedAt ? `Last push ${new Date(github.pushedAt).toLocaleDateString('en-US')}` : '',
    ].filter(Boolean),
    recommendations,
  };
}

export async function fetchGithubRepository(repoUrl) {
  const repoName = getRepoName(repoUrl);
  if (!repoName) return null;

  const repo = await fetchJson(`https://api.github.com/repos/${repoName}`);
  if (!repo) return null;

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

async function fetchRepositoryFiles(repoName, ref) {
  const tree = await fetchJson(`https://api.github.com/repos/${repoName}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
  if (!tree?.tree) return [];
  return tree.tree.filter((item) => item.type === 'blob').map((item) => item.path);
}

async function fetchRepositoryText(repoName, ref, path) {
  return await fetchText(`https://raw.githubusercontent.com/${repoName}/${encodeURIComponent(ref)}/${path}`);
}

export async function analyzeRepository(repoUrl) {
  const repoName = getRepoName(repoUrl);
  const github = await fetchGithubRepository(repoUrl);
  if (!repoName || !github) return { github, analysis: null };

  const files = await fetchRepositoryFiles(repoName, github.defaultBranch);
  const readmePath = files.find((file) => file.toLowerCase() === 'readme.md') ?? '';
  const packagePath = files.find((file) => file.toLowerCase() === 'package.json') ?? '';
  const [readme, packageJson] = await Promise.all([
    readmePath ? fetchRepositoryText(repoName, github.defaultBranch, readmePath) : '',
    packagePath ? fetchRepositoryText(repoName, github.defaultBranch, packagePath) : '',
  ]);

  return {
    github,
    analysis: buildRepositoryAnalysis({ repoUrl, github, files, readme, packageJson }),
  };
}
