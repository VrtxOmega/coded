import assert from 'node:assert/strict';
import test from 'node:test';
import { filterAndSortProjects, type FilterableProject } from './project-filters.js';

const projects: FilterableProject[] = [
  {
    title: 'Alpha Guard',
    builder: 'Ava',
    handle: 'ava',
    category: 'Security',
    summary: 'Secret scanning for launch teams',
    repo: 'github.com/ava/alpha-guard',
    score: 88,
    tags: ['Security'],
    submitter: { verifiedOwner: true },
    breakdown: { activity: 60 },
    stats: { reviews: 5, stars: 40 },
  },
  {
    title: 'Beta Trace',
    builder: 'Ben',
    handle: 'ben',
    category: 'AI Infrastructure',
    summary: 'Agent traces',
    repo: 'github.com/ben/beta-trace',
    score: 92,
    tags: ['AI'],
    submitter: { verifiedOwner: false },
    breakdown: { activity: 90 },
    stats: { reviews: 2, stars: 80 },
  },
];

test('filters by query, category, and minimum score', () => {
  const result = filterAndSortProjects(projects, {
    query: 'secret',
    category: 'Security',
    minimumScore: 85,
    sortBy: 'composite',
  });

  assert.deepEqual(result.map((project) => project.title), ['Alpha Guard']);
});

test('filters to verified maintainers only', () => {
  const result = filterAndSortProjects(projects, {
    query: '',
    category: 'All',
    minimumScore: 50,
    sortBy: 'composite',
    verifiedOnly: true,
  });

  assert.deepEqual(result.map((project) => project.title), ['Alpha Guard']);
});

test('sorts by activity when requested', () => {
  const result = filterAndSortProjects(projects, {
    query: '',
    category: 'All',
    minimumScore: 50,
    sortBy: 'activity',
  });

  assert.deepEqual(result.map((project) => project.title), ['Beta Trace', 'Alpha Guard']);
});
