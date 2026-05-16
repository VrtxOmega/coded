import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Bookmark, Check, ExternalLink, Github, MessageSquareText, ShieldCheck } from 'lucide-react';
import Footer from '@/sections/Footer';
import { findProject, useProjectCatalog } from '@/lib/project-catalog';
import { type AnalysisDimension } from '@/lib/submissions';

function externalUrl(value: string) {
  return value.startsWith('http') ? value : `https://${value}`;
}

function dimensionLabel(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

export default function ProjectPage() {
  const { slug } = useParams();
  const projects = useProjectCatalog();
  const project = findProject(projects, slug);
  const dimensions = project.analysis?.dimensions ? Object.entries(project.analysis.dimensions) as [string, AnalysisDimension][] : [];
  const repoUrl = externalUrl(project.repo);
  const hasDemo = project.demo !== 'Demo not provided';
  const demoUrl = hasDemo ? externalUrl(project.demo) : '';
  const [savedProjects, setSavedProjects] = useState<string[]>(() => JSON.parse(window.localStorage.getItem('coded:saved-projects') ?? '[]') as string[]);
  const isSaved = savedProjects.includes(project.slug);

  const toggleSaved = () => {
    const nextSavedProjects = savedProjects.includes(project.slug)
      ? savedProjects.filter((item) => item !== project.slug)
      : [...savedProjects, project.slug];

    window.localStorage.setItem('coded:saved-projects', JSON.stringify(nextSavedProjects));
    setSavedProjects(nextSavedProjects);
  };

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
                  <a className="btn-primary" href={repoUrl} target="_blank" rel="noreferrer"><Github size={18} /> View repository</a>
                  {hasDemo ? (
                    <a className="btn-secondary" href={demoUrl} target="_blank" rel="noreferrer">Live demo <ExternalLink size={16} /></a>
                  ) : (
                    <span className="btn-secondary muted-action">Demo pending</span>
                  )}
                  <Link className="btn-secondary" to={`/builders/${project.handle}`}>Builder profile</Link>
                  <button className="btn-secondary" type="button" onClick={toggleSaved}>
                    {isSaved ? <Check size={16} /> : <Bookmark size={16} />}
                    {isSaved ? 'Saved' : 'Save project'}
                  </button>
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

              {dimensions.length > 0 && (
                <div className="analysis-panel">
                  <h2>Weighted analyzer dimensions</h2>
                  <div className="dimension-grid">
                    {dimensions.map(([key, dimension]) => (
                      <article className="dimension-card" key={key}>
                        <div>
                          <span>{dimensionLabel(key)}</span>
                          <strong>{dimension.score}</strong>
                        </div>
                        <p>{dimension.evidence[0] ?? dimension.recommendation}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
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
              {project.analysis?.evidence?.length ? (
                <div className="sidebar-card">
                  <h3>Analyzer evidence</h3>
                  <ol className="timeline-list">
                    {project.analysis.evidence.map((item) => <li key={item}>{item}</li>)}
                  </ol>
                </div>
              ) : null}
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
