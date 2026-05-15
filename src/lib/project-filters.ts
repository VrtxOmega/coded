export type SortOption = 'composite' | 'activity' | 'reviews' | 'stars';

export type FilterableProject = {
  title: string;
  builder: string;
  handle: string;
  category: string;
  summary: string;
  repo: string;
  score: number;
  tags: string[];
  breakdown: {
    activity: number;
  };
  stats: {
    reviews: number;
    stars: number;
  };
};

export function filterAndSortProjects<T extends FilterableProject>(
  projects: T[],
  {
    query,
    category,
    minimumScore,
    sortBy,
  }: {
    query: string;
    category: string;
    minimumScore: number;
    sortBy: SortOption;
  },
) {
  const normalizedQuery = query.trim().toLowerCase();

  return projects
    .filter((project) => {
      const matchesCategory = category === 'All' || project.category === category;
      const matchesScore = project.score >= minimumScore;
      const searchText = [
        project.title,
        project.builder,
        project.handle,
        project.category,
        project.summary,
        project.repo,
        ...project.tags,
      ].join(' ').toLowerCase();

      return matchesCategory && matchesScore && (!normalizedQuery || searchText.includes(normalizedQuery));
    })
    .sort((a, b) => {
      if (sortBy === 'activity') return b.breakdown.activity - a.breakdown.activity;
      if (sortBy === 'reviews') return b.stats.reviews - a.stats.reviews;
      if (sortBy === 'stars') return b.stats.stars - a.stats.stars;
      return b.score - a.score;
    });
}
