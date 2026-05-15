import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowUpRight, Filter, Search, SlidersHorizontal, Star } from 'lucide-react';
import Footer from '@/sections/Footer';
import { platformStats } from '@/data/coded';
import { useProjectCatalog } from '@/lib/project-catalog';
import { filterAndSortProjects, type SortOption } from '@/lib/project-filters';

const categories = ['All', 'AI Infrastructure', 'Developer Tools', 'Security', 'Mobile Analytics', 'Workflow'];
const sortOptions = [
  ['composite', 'Composite score'],
  ['activity', 'Activity'],
  ['reviews', 'Reviews'],
  ['stars', 'Stars'],
] as const;

export default function DiscoverPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const projects = useProjectCatalog();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory && categories.includes(initialCategory) ? initialCategory : 'All');
  const [minimumScore, setMinimumScore] = useState(85);
  const [sortBy, setSortBy] = useState<SortOption>('composite');

  const visibleProjects = useMemo(() => {
    return filterAndSortProjects(projects, { query, category, minimumScore, sortBy });
  }, [category, minimumScore, projects, query, sortBy]);

  return (
    <>
      <main className="site-page">
        <section className="page-hero page-padding">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow">DISCOVER</span>
            <div className="page-hero-grid">
              <div>
                <h1 className="text-h2 text-text-primary mt-4 mb-6">A ranked board for software people can actually evaluate.</h1>
                <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 720 }}>
                  Browse by category, score confidence, maintainer velocity, and real community review depth. Coded is designed for adoption decisions, not just launch-day applause.
                </p>
              </div>
              <div className="stat-grid compact">
                {platformStats.map(([value, label]) => (
                  <div className="metric-tile" key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="page-padding pb-28">
          <div className="max-w-7xl mx-auto discovery-shell">
            <aside className="filter-panel">
              <div className="filter-heading">
                <Filter size={16} />
                Filters
              </div>
              <label>
                Search
                <div className="search-box">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="project, builder, tag"
                  />
                </div>
              </label>
              <label>
                Category
                <div className="filter-list">
                  {categories.map((item) => (
                    <button
                      className={item === category ? 'active' : ''}
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </label>
              <label>
                Minimum score: {minimumScore}
                <input
                  className="range"
                  type="range"
                  min="50"
                  max="100"
                  value={minimumScore}
                  onChange={(event) => setMinimumScore(Number(event.target.value))}
                />
              </label>
              <div className="filter-note">
                Rankings blend AI grade, community rating, activity, and completeness. Sponsored placements never alter score.
              </div>
            </aside>

            <div className="ranking-panel">
              <div className="ranking-toolbar">
                <div>
                  <span className="eyebrow">TOP THIS WEEK</span>
                  <h2>{visibleProjects.length} projects with verified momentum</h2>
                </div>
                <label className="sort-control">
                  <SlidersHorizontal size={16} />
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
                    {sortOptions.map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="ranking-list">
                {visibleProjects.map((project, index) => (
                  <Link to={`/projects/${project.slug}`} className="ranking-row" key={project.slug}>
                    <div className="rank-number">#{String(index + 1).padStart(2, '0')}</div>
                    <img src={project.image} alt="" />
                    <div className="ranking-main">
                      <div className="ranking-title-line">
                        <h3>{project.title}</h3>
                        <span>{project.stage}</span>
                      </div>
                      <p>{project.summary}</p>
                      <div className="ranking-tags">
                        {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    </div>
                    <div className="ranking-score">
                      <strong>{project.score}</strong>
                      <span><Star size={13} /> {project.delta}</span>
                    </div>
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
                {!visibleProjects.length && (
                  <div className="empty-results">
                    <strong>No projects match those filters.</strong>
                    <span>Lower the minimum score or clear the search field.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
