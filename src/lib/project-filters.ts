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
  submitter?: {
    verifiedOwner: boolean;
  };
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
    verifiedOnly = false,
  }: {
    query: string;
    category: string;
    minimumScore: number;
    sortBy: SortOption;
    verifiedOnly?: boolean;
  },
) {
  const normalizedQuery = query.trim().toLowerCase();

  return projects
    .filter((project) => {
      const matchesCategory = category === 'All' || project.category === category;
      const matchesScore = project.score >= minimumScore;
      const matchesVerification = !verifiedOnly || project.submitter?.verifiedOwner === true;
      const searchText = [
        project.title,
        project.builder,
        project.handle,
        project.category,
        project.summary,
        project.repo,
        ...project.tags,
      ].join(' ').toLowerCase();

      return matchesCategory && matchesScore && matchesVerification && (!normalizedQuery || searchText.includes(normalizedQuery));
    })
    .sort((a, b) => {
      if (sortBy === 'activity') return b.breakdown.activity - a.breakdown.activity;
      if (sortBy === 'reviews') return b.stats.reviews - a.stats.reviews;
      if (sortBy === 'stars') return b.stats.stars - a.stats.stars;
      return b.score - a.score;
    });
}
