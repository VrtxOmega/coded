import { Link, useParams } from 'react-router';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Footer from '@/sections/Footer';

const infoPages = {
  api: {
    eyebrow: 'API',
    title: 'Programmatic access to Coded scorecards.',
    body: 'Use project rankings, rubric breakdowns, category feeds, and score history in partner directories, hiring workflows, and developer research tools.',
    points: ['Project lookup by repo URL or slug', 'Category rankings with confidence scores', 'Score history and rubric deltas', 'Webhook events for new analysis results'],
  },
  changelog: {
    eyebrow: 'CHANGELOG',
    title: 'What shipped recently.',
    body: 'The product is moving from static discovery site to working scorecard prototype with live filtering, intake state, and route-complete navigation.',
    points: ['Repository intake validation', 'Discover filters and ranking sort', 'Collection-aware browse links', 'Dedicated waitlist and information pages'],
  },
  docs: {
    eyebrow: 'DOCUMENTATION',
    title: 'How Coded evaluates a project.',
    body: 'Every score starts with repository evidence, then blends automated checks, AI review, and verified community signals into a transparent scorecard.',
    points: ['Submit a public GitHub repository', 'Add demo, category, and reviewer notes', 'Review build, docs, security, and activity signals', 'Improve the scorecard over time'],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Answers before you submit.',
    body: 'Coded is designed for public projects that want sharper feedback and better discovery without paying for ranking position.',
    points: ['Private repositories are not supported in this prototype', 'Sponsored placements do not change scores', 'Community reviews are weighted by quality', 'Missing docs or builds lower confidence'],
  },
  blog: {
    eyebrow: 'BLOG',
    title: 'Field notes on software discovery.',
    body: 'Short essays, category reports, and builder interviews will live here as Coded starts collecting enough project and review history.',
    points: ['Launch week score improvements', 'What makes a README adoption-ready', 'Security baselines for indie tools', 'How reviewers earn trust weight'],
  },
  privacy: {
    eyebrow: 'PRIVACY',
    title: 'Privacy posture for a public repo platform.',
    body: 'Coded focuses on public project evidence. The prototype stores local intake state in your browser and does not send it to a backend yet.',
    points: ['Local submissions are stored in browser localStorage', 'Public repo metadata is intended to be visible', 'Private credentials should never be pasted', 'Future accounts should expose export and deletion controls'],
  },
  terms: {
    eyebrow: 'TERMS',
    title: 'Plain-language platform terms.',
    body: 'The working assumption is simple: builders submit projects they control, reviewers provide useful technical feedback, and rankings stay evidence-based.',
    points: ['Submit only repositories you own or maintain', 'Do not manipulate reviews or activity signals', 'Do not upload secrets or private code', 'Scores can change as evidence changes'],
  },
  cookies: {
    eyebrow: 'COOKIE POLICY',
    title: 'Storage used by this prototype.',
    body: 'This frontend prototype uses browser storage to remember the latest repository intake so navigation between footer and submit flow feels continuous.',
    points: ['No tracking cookies are required for the prototype', 'Last submission state is saved locally', 'Clearing browser site data removes saved intake', 'Analytics consent should be explicit when added'],
  },
};

export default function InfoPage() {
  const { topic = 'docs' } = useParams();
  const page = infoPages[topic as keyof typeof infoPages] ?? infoPages.docs;

  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto page-hero-grid">
            <div>
              <span className="eyebrow">{page.eyebrow}</span>
              <h1 className="text-h2 text-text-primary mt-4 mb-6">{page.title}</h1>
              <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 760 }}>{page.body}</p>
              <div className="project-actions">
                <Link className="btn-primary" to="/submit">Submit a repo <ArrowRight size={16} /></Link>
                <Link className="btn-secondary" to="/rubric">View rubric</Link>
              </div>
            </div>
            <div className="docs-panel info-panel">
              <h2>Useful details</h2>
              <div className="info-point-list">
                {page.points.map((point) => (
                  <p key={point}><CheckCircle2 size={16} /> {point}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
