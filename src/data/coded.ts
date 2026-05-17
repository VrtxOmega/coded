import {
  BrainCircuit,
  Code2,
  DatabaseZap,
  FileText,
  Layers3,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  TestTube2,
} from 'lucide-react';
import { type RepositoryAnalysis } from '@/lib/submissions';

export type Project = {
  slug: string;
  rank: number;
  title: string;
  builder: string;
  handle: string;
  category: string;
  image: string;
  score: number;
  delta: string;
  stage: string;
  tags: string[];
  summary: string;
  repo: string;
  demo: string;
  stats: {
    stars: number;
    saves: number;
    reviews: number;
    tests: string;
    coverage: string;
    releases: number;
  };
  breakdown: {
    ai: number;
    community: number;
    activity: number;
    completeness: number;
  };
  strengths: string[];
  risks: string[];
  timeline: string[];
  analysis?: RepositoryAnalysis;
  submitter?: {
    login: string;
    verifiedOwner: boolean;
  };
};

export const projects: Project[] = [
  {
    slug: 'neural-sync',
    rank: 1,
    title: 'NeuralSync',
    builder: 'Alex Rivera',
    handle: 'alexrivera',
    category: 'AI Infrastructure',
    image: './images/project-1.jpg',
    score: 96.4,
    delta: '+8.2',
    stage: 'Open beta',
    tags: ['AI', 'Observability', 'TypeScript'],
    summary: 'Agent observability with replayable traces, policy checks, and production failure clustering.',
    repo: 'github.com/alexrivera/neural-sync',
    demo: 'neural-sync.dev',
    stats: { stars: 1840, saves: 1248, reviews: 18, tests: '423', coverage: '91%', releases: 14 },
    breakdown: { ai: 94.2, community: 9.4, activity: 92, completeness: 100 },
    strengths: ['Exceptional trace UI and onboarding', 'Reproducible Docker build', 'Clear security posture and failure examples'],
    risks: ['Enterprise auth is still roadmap', 'Heavy dashboard bundle on older machines'],
    timeline: ['Submitted 2 days ago', 'Build passed in 5m 42s', 'Entered AI Infrastructure top 3', '18 verified reviews collected'],
  },
  {
    slug: 'codeweaver',
    rank: 2,
    title: 'CodeWeaver',
    builder: 'Sara Kim',
    handle: 'sarakim',
    category: 'Developer Tools',
    image: './images/project-2.jpg',
    score: 93.1,
    delta: '+4.7',
    stage: 'Stable',
    tags: ['CLI', 'Rust', 'Migration'],
    summary: 'Terminal-native code migration assistant with deterministic patch plans and rollback receipts.',
    repo: 'github.com/sarakim/codeweaver',
    demo: 'codeweaver.sh',
    stats: { stars: 970, saves: 712, reviews: 12, tests: '611', coverage: '88%', releases: 21 },
    breakdown: { ai: 92.5, community: 9.0, activity: 95, completeness: 90 },
    strengths: ['Fast install and strong examples', 'Great test surface for patch generation', 'Maintainer answers issues quickly'],
    risks: ['Docs need more monorepo migration examples', 'Windows support is experimental'],
    timeline: ['Submitted 6 days ago', 'Security scan passed', 'Featured in CLI collection', 'Maintainer shipped two review fixes'],
  },
  {
    slug: 'datapulse',
    rank: 3,
    title: 'DataPulse',
    builder: 'Mike Devlin',
    handle: 'mikedev',
    category: 'Mobile Analytics',
    image: './images/project-3.jpg',
    score: 89.7,
    delta: '+11.4',
    stage: 'Launch week',
    tags: ['Mobile', 'Analytics', 'Privacy'],
    summary: 'Realtime analytics layer for indie mobile products with privacy-first defaults and clean dashboards.',
    repo: 'github.com/mikedev/datapulse',
    demo: 'datapulse.app',
    stats: { stars: 642, saves: 530, reviews: 9, tests: '188', coverage: '76%', releases: 7 },
    breakdown: { ai: 86.1, community: 8.8, activity: 91, completeness: 95 },
    strengths: ['Strong demo and polished charts', 'Good data minimization choices', 'Fast issue response during launch week'],
    risks: ['Coverage is below top category projects', 'SDK docs need more platform-specific examples'],
    timeline: ['Submitted 4 days ago', 'Demo verified', 'Privacy review added', 'Moved up 11.4 points after docs fix'],
  },
  {
    slug: 'guardrail-kit',
    rank: 4,
    title: 'GuardrailKit',
    builder: 'Priya Nair',
    handle: 'priyanair',
    category: 'Security',
    image: './images/project-2.jpg',
    score: 87.9,
    delta: '+3.1',
    stage: 'Alpha',
    tags: ['Security', 'LLM', 'Python'],
    summary: 'Composable policy checks for LLM apps with prompt injection tests and audit receipts.',
    repo: 'github.com/priyanair/guardrail-kit',
    demo: 'guardrailkit.dev',
    stats: { stars: 511, saves: 418, reviews: 7, tests: '246', coverage: '83%', releases: 6 },
    breakdown: { ai: 88.8, community: 8.2, activity: 84, completeness: 88 },
    strengths: ['Clear threat model', 'Useful examples for teams shipping agents', 'Good test fixtures'],
    risks: ['Needs benchmark comparison', 'API ergonomics still changing'],
    timeline: ['Submitted 8 days ago', 'Two low dependency findings fixed', 'Added category benchmark notes'],
  },
  {
    slug: 'flowforge',
    rank: 5,
    title: 'FlowForge',
    builder: 'Nolan Price',
    handle: 'nolanprice',
    category: 'Workflow',
    image: './images/project-1.jpg',
    score: 84.6,
    delta: '-1.2',
    stage: 'Stable',
    tags: ['Workflow', 'No-code', 'API'],
    summary: 'Visual workflow builder for internal tools with typed API connectors and deploy previews.',
    repo: 'github.com/nolanprice/flowforge',
    demo: 'flowforge.tools',
    stats: { stars: 1204, saves: 690, reviews: 15, tests: '302', coverage: '72%', releases: 18 },
    breakdown: { ai: 80.3, community: 8.9, activity: 87, completeness: 92 },
    strengths: ['Strong product demo', 'Large connector surface', 'Helpful maintainer review responses'],
    risks: ['Architecture is more coupled than peers', 'Test coverage slipping after connector expansion'],
    timeline: ['Submitted 14 days ago', 'Trending last week', 'Dropped after build warning regression'],
  },
];

export const rubric = [
  { icon: Code2, title: 'Code quality', weight: '25% of AI grade', body: 'Complexity, naming, boundaries, consistency, error handling, and idiomatic framework use.' },
  { icon: FileText, title: 'Documentation', weight: '20% of AI grade', body: 'README clarity, install path, usage examples, API docs, screenshots, and maintenance notes.' },
  { icon: TestTube2, title: 'Testing', weight: '20% of AI grade', body: 'Coverage, quality of assertions, edge cases, CI presence, and reproducible test commands.' },
  { icon: LockKeyhole, title: 'Security', weight: '15% of AI grade', body: 'Dependency exposure, secret scanning, auth posture, unsafe defaults, and input validation.' },
  { icon: Layers3, title: 'Architecture', weight: '10% of AI grade', body: 'Modularity, folder structure, composability, performance boundaries, and tech choices.' },
  { icon: Sparkles, title: 'Originality', weight: '10% of AI grade', body: 'Distance from boilerplates, differentiated approach, market usefulness, and implementation depth.' },
];

export const collections = [
  { title: 'Agent Infrastructure', count: 42, icon: BrainCircuit, body: 'Tracing, evals, policy, memory, observability, and deployment tools for AI agents.' },
  { title: 'CLI Tools Worth Installing', count: 37, icon: Terminal, body: 'Fast terminal-native tools with clean install paths and strong maintainer velocity.' },
  { title: 'Security Baseline', count: 24, icon: ShieldCheck, body: 'Projects with strong dependency health, clear threat models, and reproducible checks.' },
  { title: 'Mobile Indie Stack', count: 19, icon: Smartphone, body: 'Analytics, onboarding, payments, and infrastructure for small mobile teams.' },
  { title: 'Data Products', count: 31, icon: DatabaseZap, body: 'Dashboards, ETL helpers, warehouse tooling, analytics SDKs, and data quality tools.' },
  { title: 'Launch Week Climbers', count: 58, icon: Rocket, body: 'Projects moving quickly after review feedback, docs fixes, and active community testing.' },
];

export const platformStats = [
  ['12,408', 'repos indexed'],
  ['41,930', 'build checks'],
  ['8,612', 'verified reviews'],
  ['73%', 'scorecards improved after feedback'],
];

export const getProject = (slug?: string) => projects.find((project) => project.slug === slug) ?? projects[0];
export const getBuilderProjects = (handle?: string) => projects.filter((project) => project.handle === handle);
export const topProject = projects[0];
