export const githubRepoPattern = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/i;
const submissionsKey = 'coded:submissions';
const lastSubmissionKey = 'coded:last-submission';

export type SubmissionState = {
  id?: number;
  repoUrl: string;
  demoUrl: string;
  category: string;
  notes: string;
  submittedAt: string;
  status?: 'approved' | 'hidden' | 'deleted';
  github?: GitHubRepoMetadata;
  analysis?: RepositoryAnalysis;
  analysisHistory?: RepositoryAnalysisSnapshot[];
  submitter?: GitHubSubmitter;
};

export type RepositoryAnalysisSnapshot = {
  capturedAt: string;
  checkedAt?: string;
  score?: number;
  aiGrade?: number;
  confidence?: number;
  version?: number;
};

export type RepositoryAnalysis = {
  version?: number;
  checkedAt: string;
  repoName?: string;
  score?: number;
  aiGrade?: number;
  communityScore?: number;
  activityScore?: number;
  completenessScore?: number;
  checks: {
    readme: boolean;
    license: boolean;
    dockerfile: boolean;
    packageJson: boolean;
    workflow: boolean;
  };
  confidence: number;
  dimensions?: {
    codeQuality: AnalysisDimension;
    documentation: AnalysisDimension;
    testing: AnalysisDimension;
    security: AnalysisDimension;
    architecture: AnalysisDimension;
    originality: AnalysisDimension;
  };
  evidence?: string[];
  recommendations: string[];
};

export type AnalysisDimension = {
  score: number;
  evidence: string[];
  recommendation: string;
};

export type GitHubRepoMetadata = {
  name: string;
  fullName: string;
  description: string;
  homepage: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  license: string;
  defaultBranch: string;
  pushedAt: string;
};

export type GitHubSubmitter = {
  login: string;
  id: number;
  avatarUrl: string;
  htmlUrl: string;
  verifiedOwner: boolean;
};

export function createSubmission({
  repoUrl,
  demoUrl = '',
  category = 'Developer Tools',
  notes = '',
  github,
  analysis,
}: {
  repoUrl: string;
  demoUrl?: string;
  category?: string;
  notes?: string;
  github?: GitHubRepoMetadata;
  analysis?: RepositoryAnalysis;
}): SubmissionState {
  return {
    repoUrl: repoUrl.trim(),
    demoUrl: demoUrl.trim(),
    category,
    notes: notes.trim(),
    submittedAt: new Date().toISOString(),
    github,
    analysis,
  };
}

export function saveSubmission(submission: SubmissionState) {
  window.localStorage.setItem(lastSubmissionKey, JSON.stringify(submission));

  const submissions = getSubmissions();
  const nextSubmissions = [
    submission,
    ...submissions.filter((item) => getRepoName(item.repoUrl) !== getRepoName(submission.repoUrl)),
  ].slice(0, 25);

  window.localStorage.setItem(submissionsKey, JSON.stringify(nextSubmissions));
}

export function getLastSubmission() {
  const rawSubmission = window.localStorage.getItem(lastSubmissionKey);
  if (!rawSubmission) return null;

  try {
    return JSON.parse(rawSubmission) as SubmissionState;
  } catch {
    return null;
  }
}

export function getSubmissions() {
  const rawSubmissions = window.localStorage.getItem(submissionsKey);
  if (!rawSubmissions) return [];

  try {
    const submissions = JSON.parse(rawSubmissions) as SubmissionState[];
    return Array.isArray(submissions) ? submissions : [];
  } catch {
    return [];
  }
}

export function getRepoName(repoUrl: string) {
  const match = repoUrl.trim().match(githubRepoPattern);
  return match ? `${match[1]}/${match[2]}` : '';
}

export async function fetchGithubRepository(repoUrl: string): Promise<GitHubRepoMetadata | null> {
  const repoName = getRepoName(repoUrl);
  if (!repoName) return null;

  try {
    const response = await fetch(`https://api.github.com/repos/${repoName}`, {
      headers: { Accept: 'application/vnd.github+json' },
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
  } catch {
    return null;
  }
}
