import { type SubmissionState } from '@/lib/submissions';

type ApiSubmissionsResponse = {
  submissions: SubmissionState[];
};

export type ApiHealth = {
  ok: boolean;
  totalSubmissions: number;
  approvedSubmissions: number;
  hiddenSubmissions: number;
  lastWriteAt: string | null;
};

type ApiSubmissionResponse = {
  submission?: SubmissionState;
  error?: string;
};

type GitHubMeResponse = {
  user: {
    login: string;
    id: number;
    avatarUrl: string;
    htmlUrl: string;
  };
};

const productionApiUrl = 'https://pop-os.tail43dc9a.ts.net/api';
const configuredApiUrl = import.meta.env.VITE_CODED_API_URL?.trim();
const apiBaseUrl = (configuredApiUrl || (import.meta.env.PROD ? productionApiUrl : '')).replace(/\/$/, '');

function apiUrl(path: string) {
  if (!apiBaseUrl) return path;
  if (apiBaseUrl.endsWith('/api') && path.startsWith('/api/')) return `${apiBaseUrl}${path.slice(4)}`;
  return `${apiBaseUrl}${path}`;
}

export function getApiUrl(path: string) {
  return apiUrl(path);
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });

    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function fetchApiSubmissions() {
  const response = await apiFetch<ApiSubmissionsResponse>('/api/submissions');
  return response?.submissions ?? null;
}

export async function fetchApiHealth() {
  return await apiFetch<ApiHealth>('/api/health');
}

export async function createApiSubmission(input: {
  repoUrl: string;
  demoUrl: string;
  category: string;
  notes: string;
}) {
  const githubSession = window.sessionStorage.getItem('coded:github-session');
  try {
    const response = await fetch(apiUrl('/api/submissions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(githubSession ? { 'X-Coded-Session': githubSession } : {}),
      },
      body: JSON.stringify(input),
    });

    const payload = await response.json() as ApiSubmissionResponse;
    return {
      submission: response.ok ? payload.submission ?? null : null,
      error: response.ok ? '' : payload.error ?? 'Submission failed.',
      unavailable: false,
    };
  } catch {
    return {
      submission: null,
      error: '',
      unavailable: true,
    };
  }
}

export async function reanalyzeAllSubmissions(ids: number[], adminToken: string) {
  const refreshed: SubmissionState[] = [];

  for (const id of ids) {
    const submission = await reanalyzeSubmission(id, adminToken);
    if (submission) refreshed.push(submission);
  }

  return refreshed;
}

export async function fetchAdminSubmissions(adminToken: string) {
  const response = await apiFetch<ApiSubmissionsResponse>('/api/admin/submissions', {
    headers: { 'X-Admin-Token': adminToken },
  });

  return response?.submissions ?? null;
}

export async function moderateSubmission(id: number, action: 'approve' | 'hide' | 'delete', adminToken: string) {
  const response = await apiFetch<ApiSubmissionResponse>(`/api/admin/submissions/${id}/${action}`, {
    method: 'POST',
    headers: { 'X-Admin-Token': adminToken },
  });

  return response?.submission ?? null;
}

export async function reanalyzeSubmission(id: number, adminToken: string) {
  const response = await apiFetch<ApiSubmissionResponse>(`/api/admin/submissions/${id}/reanalyze`, {
    method: 'POST',
    headers: { 'X-Admin-Token': adminToken },
  });

  return response?.submission ?? null;
}

export async function fetchGithubSession() {
  const githubSession = window.sessionStorage.getItem('coded:github-session');
  if (!githubSession) return null;

  const response = await apiFetch<GitHubMeResponse>('/api/auth/github/me', {
    headers: { 'X-Coded-Session': githubSession },
  });

  return response?.user ?? null;
}

export function adminExportUrl() {
  return apiUrl('/api/admin/export');
}

export async function downloadAdminExport(adminToken: string) {
  const response = await fetch(adminExportUrl(), {
    headers: { 'X-Admin-Token': adminToken },
  });

  if (!response.ok) return false;

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `coded-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return true;
}
