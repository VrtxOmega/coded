import assert from 'node:assert/strict';
import test from 'node:test';
import { createSubmission, getRepoName, saveSubmission, getSubmissions } from './submissions.js';

function installLocalStorage() {
  const store = new Map<string, string>();

  globalThis.window = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    },
  } as Window & typeof globalThis;
}

test('extracts owner and repo from a GitHub URL', () => {
  assert.equal(getRepoName('https://github.com/VrtxOmega/coded'), 'VrtxOmega/coded');
});

test('saves submissions newest-first and dedupes by repo', () => {
  installLocalStorage();

  saveSubmission(createSubmission({ repoUrl: 'https://github.com/one/alpha', notes: 'first' }));
  saveSubmission(createSubmission({ repoUrl: 'https://github.com/two/beta' }));
  saveSubmission(createSubmission({ repoUrl: 'https://github.com/one/alpha', notes: 'updated' }));

  const submissions = getSubmissions();
  assert.equal(submissions.length, 2);
  assert.equal(submissions[0].repoUrl, 'https://github.com/one/alpha');
  assert.equal(submissions[0].notes, 'updated');
  assert.equal(submissions[1].repoUrl, 'https://github.com/two/beta');
});
