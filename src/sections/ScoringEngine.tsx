import { useEffect, useRef, useState } from 'react';

const metrics = [
  {
    label: 'AI_GRADE',
    weight: '40%',
    score: '94.2',
    description: 'Static analysis, tests, security scans, architecture review, documentation read-through, and AI critique in one reproducible report.',
  },
  {
    label: 'COMMUNITY_RATING',
    weight: '30%',
    score: '9.1',
    description: 'GitHub-linked builders review usefulness, novelty, polish, and willingness to adopt. Verified reviewers carry more weight.',
  },
  {
    label: 'ACTIVITY_SIGNAL',
    weight: '20%',
    score: '88',
    description: 'Commit recency, release cadence, issue responsiveness, discussion health, and momentum without rewarding spam commits.',
  },
  {
    label: 'COMPLETENESS',
    weight: '10%',
    score: '100',
    description: 'Dockerfile or build config, working install steps, demo link, screenshots, license clarity, and a README someone can actually follow.',
  },
];

function ScoreCard({
  metric,
  index,
  isVisible,
}: {
  metric: (typeof metrics)[0];
  index: number;
  isVisible: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-8 mb-6 transition-all duration-700"
      style={{
        background: '#15171C',
        border: '1px solid #1E2028',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-mono-data uppercase" style={{ color: '#FF0055' }}>
              {metric.label}
            </span>
            <span className="text-mono-data rounded-full px-2 py-1" style={{ color: '#00E5FF', background: 'rgba(0,229,255,.08)' }}>
              weight {metric.weight}
            </span>
          </div>
          <p className="text-body" style={{ color: '#7A7D8A', fontSize: '15px' }}>
            {metric.description}
          </p>
        </div>
        <span
          className="font-display text-5xl font-bold shrink-0"
          style={{
            color: '#F8F8F8',
            letterSpacing: '-0.02em',
          }}
        >
            {metric.score}
          </span>
        </div>
        <div className="mt-6 h-2 rounded-full overflow-hidden" style={{ background: '#1E2028' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(Number(metric.score) > 10 ? Number(metric.score) : Number(metric.score) * 10, 100)}%`,
              background: 'linear-gradient(90deg, #FF0055, #00E5FF)',
            }}
          />
        </div>
      </div>
  );
}

export default function ScoringEngine() {
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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="discover"
      className="relative page-padding py-32 lg:py-48"
      style={{ background: '#0B0C0F', zIndex: 20 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left column - sticky */}
          <div className="lg:sticky lg:top-[25vh] lg:self-start">
            <h2
              className="text-h2 mb-6 transition-all duration-700"
              style={{
                color: '#F8F8F8',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              SIGNAL OVER
              <br />
              HYPE
            </h2>
            <p
              className="text-body mb-8 transition-all duration-700"
              style={{
                color: '#7A7D8A',
                maxWidth: '420px',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: '100ms',
              }}
            >
              Most discovery boards reward launch-day noise. Coded rewards projects
              that can be cloned, understood, built, tested, reviewed, and trusted.
              Every ranking is backed by a public scorecard.
            </p>
            <div className="formula-card mb-7">
              <span>Composite =</span>
              <b>.40 AI</b>
              <b>.30 Community</b>
              <b>.20 Activity</b>
              <b>.10 Complete</b>
            </div>
            <div
              className="flex items-center gap-3 transition-all duration-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transitionDelay: '200ms',
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#FF0055' }}
              />
              <span className="text-mono-data" style={{ color: '#4A4D5A' }}>
                AI GRADE 40%
              </span>
              <div
                className="w-3 h-3 rounded-full ml-2"
                style={{ background: '#00E5FF' }}
              />
              <span className="text-mono-data" style={{ color: '#4A4D5A' }}>
                COMMUNITY 30%
              </span>
            </div>
            <div
              className="flex items-center gap-3 mt-2 transition-all duration-700"
              style={{
                opacity: isVisible ? 1 : 0,
                transitionDelay: '250ms',
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#7B2D8E' }}
              />
              <span className="text-mono-data" style={{ color: '#4A4D5A' }}>
                ACTIVITY 20%
              </span>
              <div
                className="w-3 h-3 rounded-full ml-2"
                style={{ background: '#4A4D5A' }}
              />
              <span className="text-mono-data" style={{ color: '#4A4D5A' }}>
                COMPLETENESS 10%
              </span>
            </div>
          </div>

          {/* Right column - scrolling score cards */}
          <div>
            {metrics.map((metric, i) => (
              <ScoreCard
                key={metric.label}
                metric={metric}
                index={i}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
