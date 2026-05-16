import { useEffect, useState } from 'react';
import { projects as seededProjects, type Project } from '@/data/coded';
import { getRepoName, getSubmissions, type SubmissionState } from '@/lib/submissions';
import { fetchApiSubmissions } from '@/lib/api';

const categoryTags: Record<string, string[]> = {
  'AI Infrastructure': ['AI', 'Infrastructure'],
  'Developer Tools': ['DevTools', 'CLI'],
  Security: ['Security', 'Audit'],
  'Mobile Analytics': ['Mobile', 'Analytics'],
  Workflow: ['Workflow', 'Automation'],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function hashString(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function titleize(value: string) {
  return value
    .replace(/[-_.]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function projectFromSubmission(submission: SubmissionState, index = 0): Project {
  const repoName = getRepoName(submission.repoUrl);
  const [owner = 'builder', repo = 'submitted-project'] = repoName.split('/');
  const hash = hashString(repoName || submission.repoUrl);
  const github = submission.github;
  const analysis = submission.analysis;
  const metadataBoost = github ? Math.min(8, Math.log10(Math.max(1, github.stars + github.forks)) * 2.5) : 0;
  const analysisBoost = analysis ? analysis.confidence * 10 : 0;
  const score = analysis?.score ?? Number((64 + (hash % 220) / 10 + metadataBoost + analysisBoost).toFixed(1));
  const hasDemo = Boolean(submission.demoUrl || github?.homepage);
  const hasNotes = Boolean(submission.notes);
  const category = submission.category || 'Developer Tools';
  const coverage = `${58 + (hash % 31)}%`;
  const passedChecks = analysis ? Object.values(analysis.checks).filter(Boolean).length : 0;
  const strengths = analysis?.dimensions
    ? Object.entries(analysis.dimensions)
        .filter(([, dimension]) => dimension.score >= 78)
        .map(([key, dimension]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}: ${dimension.evidence[0] ?? 'strong repository signal detected'}`)
    : [];

  return {
    slug: slugify(`${owner}-${repo}`),
    rank: index + 1,
    title: titleize(github?.name ?? repo),
    builder: titleize(owner),
    handle: owner,
    category,
    image: `./images/project-${(hash % 3) + 1}.jpg`,
    score,
    delta: analysis ? 'fresh analysis' : '+0.0',
    stage: analysis?.version === 2 ? 'Scorecard generated' : analysis ? 'Analyzed' : github ? 'Repository fetched' : 'Analysis queued',
    tags: [...(categoryTags[category] ?? ['Submitted']), analysis?.version === 2 ? 'Scored' : analysis ? 'Analyzed' : 'Pending'],
    summary: submission.notes || github?.description || `${titleize(repo)} is queued for Coded analysis from ${repoName || submission.repoUrl}.`,
    repo: submission.repoUrl.replace(/^https?:\/\//, ''),
    demo: hasDemo ? (submission.demoUrl || github?.homepage || '').replace(/^https?:\/\//, '') : 'Demo not provided',
    stats: {
      stars: github?.stars ?? 0,
      saves: 0,
      reviews: 0,
      tests: analysis?.checks.workflow ? 'CI found' : analysis?.dimensions?.testing?.score ? `${analysis.dimensions.testing.score}/100` : 'Pending',
      coverage,
      releases: github?.forks ?? 0,
    },
    breakdown: {
      ai: analysis?.aiGrade ?? Number((score - 3.2).toFixed(1)),
      community: analysis?.communityScore ?? 0,
      activity: analysis?.activityScore ?? (github?.pushedAt ? 82 : 50 + (hash % 30)),
      completeness: analysis?.completenessScore ?? (analysis ? Number((analysis.confidence * 100).toFixed(0)) : hasDemo && hasNotes && github ? 84 : hasDemo || hasNotes || github ? 72 : 58),
    },
    strengths: strengths.length ? strengths.slice(0, 5) : [
      'Repository URL accepted and normalized',
      github ? `GitHub metadata fetched from ${github.defaultBranch}` : 'Public GitHub API lookup will enrich this scorecard when available',
      analysis ? `${passedChecks}/5 repository checks passed` : 'Repository checks waiting for backend analyzer',
      github?.language ? `${github.language} detected as primary language` : 'Primary language awaiting repository metadata',
      github?.license ? `${github.license} license signal detected` : 'License signal pending',
      hasDemo ? 'Live demo attached for reviewer verification' : 'Ready for demo and screenshot enrichment',
      hasNotes ? 'Reviewer guidance captured in intake notes' : 'Initial scorecard can be improved with positioning notes',
    ],
    risks: [
      analysis?.version === 2 ? `Analyzer confidence ${(analysis.confidence * 100).toFixed(0)}%; manual review still required before featuring` : github ? 'File-level README, CI, and security evidence still needs backend fetch workers' : 'Repository files have not been fetched by a backend analyzer yet',
      ...(analysis?.recommendations.length ? analysis.recommendations : ['README, license, CI, Dockerfile, and dependency evidence are simulated in this prototype']),
      'Community reviews are pending',
    ],
    timeline: [
      `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}`,
      github ? 'Public GitHub metadata fetched' : 'Mock analysis queued',
      analysis?.version === 2 ? 'Weighted repository score generated' : analysis ? 'Backend repository checks completed' : 'Awaiting repository fetch worker',
      'Scorecard created from intake data',
    ],
    analysis,
  };
}

export function getSubmittedProjects() {
  return getSubmissions().map((submission, index) => projectFromSubmission(submission, index));
}

export function getProjectCatalog() {
  const submittedProjects = getSubmittedProjects();
  const submittedSlugs = new Set(submittedProjects.map((project) => project.slug));
  const staticProjects = seededProjects.filter((project) => !submittedSlugs.has(project.slug));
  return [...submittedProjects, ...staticProjects].map((project, index) => ({ ...project, rank: index + 1 }));
}

export function useProjectCatalog() {
  const [projects, setProjects] = useState<Project[]>(() => getProjectCatalog());

  useEffect(() => {
    const refresh = () => setProjects(getProjectCatalog());
    const refreshFromApi = async () => {
      const submissions = await fetchApiSubmissions();
      if (!submissions) return;

      const submittedProjects = submissions.map((submission, index) => projectFromSubmission(submission, index));
      const submittedSlugs = new Set(submittedProjects.map((project) => project.slug));
      const staticProjects = seededProjects.filter((project) => !submittedSlugs.has(project.slug));
      setProjects([...submittedProjects, ...staticProjects].map((project, index) => ({ ...project, rank: index + 1 })));
    };

    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    void refreshFromApi();

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return projects;
}

export function findProject(projects: Project[], slug?: string) {
  return projects.find((project) => project.slug === slug) ?? projects[0];
}

export function findBuilderProjects(projects: Project[], handle?: string) {
  return projects.filter((project) => project.handle === handle);
}
