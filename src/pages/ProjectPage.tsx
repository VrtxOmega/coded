import { Link, useParams } from 'react-router';
import { ArrowLeft, ExternalLink, Github, MessageSquareText, ShieldCheck } from 'lucide-react';
import Footer from '@/sections/Footer';
import { getProject, projects } from '@/data/coded';

export default function ProjectPage() {
  const { slug } = useParams();
  const project = getProject(slug);

  return (
    <>
      <main className="site-page">
        <section className="page-padding project-hero">
          <div className="max-w-7xl mx-auto">
            <Link to="/discover" className="back-link"><ArrowLeft size={16} /> Back to rankings</Link>
            <div className="project-detail-grid">
              <div>
                <span className="eyebrow">PROJECT SCORECARD</span>
                <h1 className="text-h2 text-text-primary mt-4 mb-4">{project.title}</h1>
                <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 760 }}>{project.summary}</p>
                <div className="project-actions">
                  <a className="btn-primary" href="#"><Github size={18} /> View repository</a>
                  <a className="btn-secondary" href="#">Live demo <ExternalLink size={16} /></a>
                  <Link className="btn-secondary" to={`/builders/${project.handle}`}>Builder profile</Link>
                </div>
              </div>
              <div className="detail-score-card">
                <span>COMPOSITE</span>
                <strong>{project.score}</strong>
                <p>{project.delta} this week</p>
              </div>
            </div>
          </div>
        </section>

        <section className="page-padding pb-28">
          <div className="max-w-7xl mx-auto project-content-grid">
            <div>
              <img className="project-hero-image" src={project.image} alt="" />
              <div className="score-breakdown-grid">
                {[
                  ['AI grade', project.breakdown.ai, '40%'],
                  ['Community', project.breakdown.community, '30%'],
                  ['Activity', project.breakdown.activity, '20%'],
                  ['Completeness', project.breakdown.completeness, '10%'],
                ].map(([label, score, weight]) => (
                  <div className="breakdown-card" key={label}>
                    <span>{label}</span>
                    <strong>{score}</strong>
                    <small>{weight} weight</small>
                  </div>
                ))}
              </div>

              <div className="analysis-panel">
                <h2>AI analysis notes</h2>
                <div className="analysis-columns">
                  <div>
                    <h3>Strengths</h3>
                    {project.strengths.map((item) => <p key={item}><ShieldCheck size={16} /> {item}</p>)}
                  </div>
                  <div>
                    <h3>Risks to watch</h3>
                    {project.risks.map((item) => <p key={item}><MessageSquareText size={16} /> {item}</p>)}
                  </div>
                </div>
              </div>
            </div>

            <aside className="project-sidebar">
              <div className="sidebar-card">
                <h3>Repository signals</h3>
                {[
                  ['Repo', project.repo],
                  ['Demo', project.demo],
                  ['Tests', project.stats.tests],
                  ['Coverage', project.stats.coverage],
                  ['Releases', String(project.stats.releases)],
                  ['Reviews', String(project.stats.reviews)],
                ].map(([label, value]) => (
                  <div className="sidebar-row" key={label}>
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
              <div className="sidebar-card">
                <h3>Timeline</h3>
                <ol className="timeline-list">
                  {project.timeline.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </div>
              <div className="sidebar-card">
                <h3>Similar projects</h3>
                {projects.filter((item) => item.slug !== project.slug).slice(0, 3).map((item) => (
                  <Link className="mini-project" to={`/projects/${item.slug}`} key={item.slug}>
                    <span>{item.title}</span>
                    <b>{item.score}</b>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
