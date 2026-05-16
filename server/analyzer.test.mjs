import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRepositoryAnalysis, getRepoName } from './analyzer.mjs';

const github = {
  name: 'coded',
  fullName: 'VrtxOmega/coded',
  description: 'AI-powered developer project discovery and grading platform',
  homepage: 'https://vrtxomega.github.io/coded/',
  language: 'TypeScript',
  stars: 6,
  forks: 0,
  openIssues: 0,
  license: 'MIT',
  defaultBranch: 'main',
  pushedAt: new Date().toISOString(),
};

test('extracts owner and repo from a GitHub URL', () => {
  assert.equal(getRepoName('https://github.com/VrtxOmega/coded'), 'VrtxOmega/coded');
});

test('builds weighted repository analysis from file signals', () => {
  const analysis = buildRepositoryAnalysis({
    repoUrl: 'https://github.com/VrtxOmega/coded',
    github,
    files: [
      'README.md',
      'LICENSE',
      'package.json',
      'package-lock.json',
      'Dockerfile',
      '.github/workflows/deploy-pages.yml',
      'src/App.tsx',
      'src/lib/submissions.test.ts',
      'src/lib/project-filters.test.ts',
      'server/index.mjs',
      'eslint.config.js',
      'tsconfig.json',
    ],
    readme: '# Coded\n\n## Install\nnpm ci\n\n## Usage\nSubmit a repo.\n\n## Testing\nnpm test\n\n## Demo\nScreenshots and live demo.',
    packageJson: JSON.stringify({
      scripts: {
        test: 'node --test',
        lint: 'eslint .',
      },
      dependencies: { react: '^19.0.0' },
    }),
  });

  assert.equal(analysis.version, 2);
  assert.equal(analysis.checks.readme, true);
  assert.equal(analysis.checks.workflow, true);
  assert.ok(analysis.score > 50);
  assert.ok(analysis.aiGrade > 50);
  assert.ok(analysis.dimensions.testing.score > 50);
  assert.ok(analysis.evidence.some((item) => item.includes('repository files scanned')));
});
