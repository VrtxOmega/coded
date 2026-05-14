import { AlertTriangle, BadgeCheck, Eye, GitBranch, LockKeyhole, MessageSquareText, type LucideIcon } from 'lucide-react';

const controls: Array<[string, string, LucideIcon]> = [
  ['Verified identity', 'GitHub-linked accounts and contribution history make ratings harder to fake.', BadgeCheck],
  ['Evidence trail', 'Build logs, scan summaries, rubric notes, and score changes stay visible.', Eye],
  ['Anti-hype ranking', 'Recency and upvotes help, but cannot overpower broken builds or weak docs.', AlertTriangle],
  ['Maintainer response', 'Issue and PR responsiveness becomes part of the activity score.', GitBranch],
  ['Review quality', 'Helpful technical reviews gain weight; shallow reactions decay.', MessageSquareText],
  ['Security baseline', 'Secret scanning, dependency health, and unsafe defaults are surfaced early.', LockKeyhole],
];

export default function TrustLayer() {
  return (
    <section className="relative page-padding py-28 lg:py-40" style={{ background: '#0B0C0F', zIndex: 20 }}>
      <div className="max-w-7xl mx-auto trust-layout">
        <div>
          <span className="eyebrow">BUILT TO FILTER NOISE</span>
          <h2 className="text-h2 text-text-primary mb-6">Discovery only works when the ranking can be trusted.</h2>
          <p className="text-body mb-8" style={{ color: '#9EA2B3' }}>
            Coded should become the place developers check before adopting, starring, sponsoring, hiring, or investing time into a project. That means the trust layer is a product feature, not an afterthought.
          </p>
          <div className="trust-stat">
            <strong>0.73</strong>
            <span>minimum confidence required before a project can enter category top charts</span>
          </div>
        </div>

        <div className="trust-grid">
          {controls.map(([title, body, Icon]) => (
            <article className="trust-card" key={title as string}>
              <Icon size={20} />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
