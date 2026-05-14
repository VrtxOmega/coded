import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, Github, GitPullRequest, ShieldCheck, Sparkles, Star, Terminal } from 'lucide-react';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 40 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: 'url("./images/hero-fallback.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onCanPlay={() => setVideoReady(true)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          opacity: videoReady ? 0.64 : 0,
          transition: 'opacity 900ms ease',
          zIndex: 2,
        }}
      >
        <source src="./videos/hero-bg.mp4" type="video/mp4" />
      </video>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background:
            'linear-gradient(180deg, rgba(11,12,15,.52), rgba(11,12,15,.78) 58%, #0B0C0F 100%)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Hero Content */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-24 pb-12"
        style={{ zIndex: 20 }}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPointer({
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100,
          });
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,0,85,.18), transparent 22rem)`,
          }}
        />
        <div className="page-padding w-full">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.03fr_.97fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-2 mb-7">
                <Sparkles size={15} style={{ color: '#00E5FF' }} />
                <span className="text-mono-data" style={{ color: '#B9BCC9' }}>
                  AI grading + community discovery for shipped software
                </span>
              </div>
              <h1 className="text-display text-text-primary mb-6">
                THE FRONT PAGE
                <br />
                FOR SERIOUS
                <br />
                BUILDS
              </h1>
              <p className="text-body mb-8" style={{ color: '#B9BCC9', maxWidth: '650px', fontSize: '20px' }}>
                Coded ranks developer projects with reproducible analysis, AI review, and weighted community signal. Submit a repo, get a public scorecard, and earn discovery for real engineering work.
              </p>

              <div className="flex items-center gap-3 flex-wrap mb-8">
                <Link to="/submit" className="btn-primary">
                  <Github size={18} />
                  Submit a repo
                  <ArrowRight size={18} />
                </Link>
                <Link to="/discover" className="btn-secondary">
                  Explore the board
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-xl">
                {[
                  ['12k+', 'repos indexed'],
                  ['4-part', 'signal score'],
                  ['6 min', 'median grade'],
                ].map(([value, label]) => (
                  <div className="metric-tile" key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-product-shell">
              <div className="hero-window-bar">
                <span />
                <span />
                <span />
                <p>coded.run/analyze/neural-sync</p>
              </div>
              <div className="hero-score-row">
                <div>
                  <span className="text-mono-data" style={{ color: '#7A7D8A' }}>COMPOSITE_SCORE</span>
                  <strong>96.4</strong>
                </div>
                <div className="score-ring">A+</div>
              </div>
              <div className="hero-code-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-mono-data" style={{ color: '#00E5FF' }}>PIPELINE PASSED</span>
                  <CheckCircle2 size={18} style={{ color: '#00E5FF' }} />
                </div>
                {[
                  ['clone', 'github.com/alex/neural-sync', 'ok'],
                  ['build', 'docker build --pull .', 'ok'],
                  ['test', '423 tests / 91% coverage', 'ok'],
                  ['scan', '0 secrets / 2 low deps', 'review'],
                ].map(([step, detail, state]) => (
                  <div className="terminal-row" key={step}>
                    <Terminal size={14} />
                    <b>{step}</b>
                    <span>{detail}</span>
                    <em>{state}</em>
                  </div>
                ))}
              </div>
              <div className="hero-breakdown">
                {[
                  ['AI grade', '40%', '94.2'],
                  ['Community', '30%', '9.1'],
                  ['Activity', '20%', '88'],
                  ['Complete', '10%', '100'],
                ].map(([label, weight, score]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{score}</b>
                    <small>{weight}</small>
                  </div>
                ))}
              </div>
              <div className="hero-proof">
                <span><Star size={15} /> 1,248 saves</span>
                <span><GitPullRequest size={15} /> 18 verified reviews</span>
                <span><ShieldCheck size={15} /> reproducible build</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
