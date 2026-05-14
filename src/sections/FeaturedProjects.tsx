import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, GitFork, MessageSquare, Star } from 'lucide-react';

const projects = [
  {
    slug: 'neural-sync',
    rank: '#01',
    title: 'NeuralSync',
    builder: '@alexrivera',
    tags: ['AI', 'Dashboard'],
    image: './images/project-1.jpg',
    score: 96.4,
    delta: '+8.2',
    summary: 'Open-source agent observability with replayable traces and policy checks.',
    stats: ['91% tests', '18 reviews', 'A+ docs'],
  },
  {
    slug: 'codeweaver',
    rank: '#02',
    title: 'CodeWeaver',
    builder: '@sarakim',
    tags: ['CLI', 'Rust'],
    image: './images/project-2.jpg',
    score: 93.1,
    delta: '+4.7',
    summary: 'A terminal-native code migration assistant with deterministic patch plans.',
    stats: ['0 secrets', 'fast build', '12 reviews'],
  },
  {
    slug: 'datapulse',
    rank: '#03',
    title: 'DataPulse',
    builder: '@mikedev',
    tags: ['Mobile', 'Analytics'],
    image: './images/project-3.jpg',
    score: 89.7,
    delta: '+11.4',
    summary: 'Realtime mobile analytics layer for indie products with privacy-first defaults.',
    stats: ['demo live', '7 releases', 'B+ security'],
  },
];

function ProjectCard({
  project,
  index,
  isVisible,
}: {
  project: (typeof projects)[0];
  index: number;
  isVisible: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-500"
      style={{
        background: '#15171C',
        border: '1px solid #1E2028',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.98)',
        transitionDelay: `${index * 200}ms`,
        boxShadow: hovered ? '0 20px 70px rgba(255, 0, 85, 0.16)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        {/* Rank badge */}
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-lg font-mono text-sm font-medium"
          style={{
            background: 'rgba(11, 12, 15, 0.8)',
            color: '#00E5FF',
            backdropFilter: 'blur(8px)',
          }}
        >
          {project.rank}
        </div>
        {/* Score badge */}
        <div
          className="absolute top-4 left-4 px-3 py-1 rounded-lg font-display font-bold text-lg"
          style={{
            background: 'rgba(255, 0, 85, 0.9)',
            color: '#0B0C0F',
          }}
        >
          {project.score}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-text-primary mb-1 group-hover:text-magenta transition-colors duration-300">
              {project.title}
            </h3>
            <p className="text-sm" style={{ color: '#7A7D8A' }}>
              {project.builder}
            </p>
          </div>
          <ArrowUpRight
            size={20}
            className="shrink-0 mt-1 transition-all duration-300"
            style={{
              color: hovered ? '#FF0055' : '#4A4D5A',
              transform: hovered ? 'translate(2px, -2px)' : 'translate(0, 0)',
            }}
          />
        </div>
        <p className="mt-4 text-sm leading-6" style={{ color: '#B9BCC9' }}>
          {project.summary}
        </p>
        <div className="flex gap-2 mt-5 flex-wrap">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-mono-data px-3 py-1 rounded-md"
              style={{
                background: '#1E2028',
                color: '#FF0055',
                fontSize: '11px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="project-signal-row">
          <span><Star size={14} /> {project.delta}</span>
          <span><MessageSquare size={14} /> {project.stats[1]}</span>
          <span><GitFork size={14} /> {project.stats[0]}</span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProjects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="featured"
      className="relative page-padding py-32 lg:py-48"
      style={{ background: '#0B0C0F', zIndex: 20 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-8 mb-12">
          <div>
            <span className="eyebrow">DISCOVERY FEED</span>
            <h3
              className="text-h3 text-text-primary transition-all duration-700 mt-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              Trending projects with enough evidence to matter.
            </h3>
          </div>
          <Link
            to="/discover"
            className="hidden sm:inline-flex items-center gap-1 text-sm transition-all duration-300 hover:gap-2"
            style={{
              color: '#7A7D8A',
              opacity: isVisible ? 1 : 0,
              transitionDelay: '200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F8F8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7D8A')}
          >
            View All
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="feed-toolbar mb-8">
          {['Top this week', 'AI tools', 'Developer infra', 'Mobile', 'Security', 'Open source'].map((filter, index) => (
            <button className={index === 0 ? 'active' : ''} key={filter}>{filter}</button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={i}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
