import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Bookmark } from 'lucide-react';
import Footer from '@/sections/Footer';
import { useProjectCatalog } from '@/lib/project-catalog';

export default function SavedPage() {
  const projects = useProjectCatalog();
  const [savedSlugs] = useState<string[]>(() => JSON.parse(window.localStorage.getItem('coded:saved-projects') ?? '[]') as string[]);

  const savedProjects = projects.filter((project) => savedSlugs.includes(project.slug));

  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow">SAVED</span>
            <h1 className="text-h2 text-text-primary mt-4 mb-6">Projects you want to revisit.</h1>
            <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 780 }}>
              Saved scorecards stay local in this prototype. Use them as a shortlist for tools to test, sponsor, review, or compare later.
            </p>
          </div>
        </section>
        <section className="page-padding pb-28">
          <div className="max-w-7xl mx-auto ranking-panel">
            <div className="ranking-toolbar">
              <div>
                <span className="eyebrow">LOCAL SHORTLIST</span>
                <h2>{savedProjects.length} saved projects</h2>
              </div>
              <Link className="btn-secondary" to="/discover">Browse more <ArrowRight size={16} /></Link>
            </div>
            <div className="ranking-list">
              {savedProjects.map((project) => (
                <Link to={`/projects/${project.slug}`} className="ranking-row" key={project.slug}>
                  <div className="rank-number">#{String(project.rank).padStart(2, '0')}</div>
                  <img src={project.image} alt="" />
                  <div className="ranking-main">
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                  </div>
                  <div className="ranking-score"><strong>{project.score}</strong><span>{project.delta}</span></div>
                  <ArrowRight size={18} />
                </Link>
              ))}
              {!savedProjects.length && (
                <div className="empty-results saved-empty">
                  <Bookmark size={22} />
                  <strong>No saved projects yet.</strong>
                  <span>Open any scorecard and use Save project to build a shortlist.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
