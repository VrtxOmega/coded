import { Link, useParams } from 'react-router';
import { Github, MapPin, Star } from 'lucide-react';
import Footer from '@/sections/Footer';
import { getBuilderProjects, projects } from '@/data/coded';

export default function BuilderPage() {
  const { handle } = useParams();
  const builderProjects = getBuilderProjects(handle);
  const visibleProjects = builderProjects.length ? builderProjects : projects.slice(0, 2);
  const primary = visibleProjects[0];

  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto builder-header">
            <img src={primary.image} alt="" />
            <div>
              <span className="eyebrow">BUILDER PROFILE</span>
              <h1 className="text-h2 text-text-primary mt-4 mb-4">{primary.builder}</h1>
              <p className="text-body" style={{ color: '#B9BCC9' }}>
                Maintainer of {visibleProjects.map((project) => project.title).join(', ')}. Builder profiles collect project scorecards, review history, launch velocity, and credibility signals.
              </p>
              <div className="builder-meta">
                <span><Github size={16} /> @{primary.handle}</span>
                <span><MapPin size={16} /> Remote</span>
                <span><Star size={16} /> {primary.stats.stars.toLocaleString()} project stars</span>
              </div>
            </div>
          </div>
        </section>
        <section className="page-padding pb-28">
          <div className="max-w-7xl mx-auto builder-grid">
            <div className="builder-summary-card">
              <h2>Credibility summary</h2>
              <p>Verified maintainer with consistent response velocity, strong documentation habits, and multiple score improvements after review feedback.</p>
              <div className="score-breakdown-grid">
                <div className="breakdown-card"><span>Avg score</span><strong>{Math.round(visibleProjects.reduce((sum, project) => sum + project.score, 0) / visibleProjects.length)}</strong><small>portfolio</small></div>
                <div className="breakdown-card"><span>Reviews</span><strong>{visibleProjects.reduce((sum, project) => sum + project.stats.reviews, 0)}</strong><small>verified</small></div>
              </div>
            </div>
            <div className="builder-project-list">
              {visibleProjects.map((project) => (
                <Link className="ranking-row" to={`/projects/${project.slug}`} key={project.slug}>
                  <img src={project.image} alt="" />
                  <div className="ranking-main">
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                  </div>
                  <div className="ranking-score"><strong>{project.score}</strong><span>{project.delta}</span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
