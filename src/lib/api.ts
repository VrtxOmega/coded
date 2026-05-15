import { type SubmissionState } from '@/lib/submissions';

type ApiSubmissionsResponse = {
  submissions: SubmissionState[];
};

type ApiSubmissionResponse = {
  submission: SubmissionState;
  error?: string;
};

const productionApiUrl = 'https://pop-os.tail43dc9a.ts.net/api';
const configuredApiUrl = import.meta.env.VITE_CODED_API_URL?.trim();
const apiBaseUrl = (configuredApiUrl || (import.meta.env.PROD ? productionApiUrl : '')).replace(/\/$/, '');

function apiUrl(path: string) {
  if (!apiBaseUrl) return path;
  if (apiBaseUrl.endsWith('/api') && path.startsWith('/api/')) return `${apiBaseUrl}${path.slice(4)}`;
  return `${apiBaseUrl}${path}`;
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

export async function createApiSubmission(input: {
  repoUrl: string;
  demoUrl: string;
  category: string;
  notes: string;
}) {
  const response = await apiFetch<ApiSubmissionResponse>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return response?.submission ?? null;
}
