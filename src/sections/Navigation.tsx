import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Github } from 'lucide-react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        backgroundColor: scrolled ? 'rgba(11, 12, 15, 0.8)' : 'transparent',
      }}
    >
      <div className="flex items-center justify-between page-padding h-16">
        {/* Left: Wordmark */}
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-text-primary"
        >
          CODED
        </Link>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ['Discover', '/discover'],
            ['Collections', '/collections'],
            ['Rubric', '/rubric'],
            ['Pricing', '/#pricing'],
          ].map(([item, path]) => (
            <NavLink
              key={item}
              to={path}
              className="text-sm font-medium transition-colors duration-200 hover:text-text-primary"
              style={{ color: '#7A7D8A' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F8F8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7D8A')}
            >
              {item}
            </NavLink>
          ))}
        </div>

        {/* Right: CTA */}
        <Link
          to="/submit"
          className="font-mono text-sm px-5 py-2 rounded-full transition-all duration-300 inline-flex items-center gap-2"
          style={{
            border: '1px solid #4A4D5A',
            color: '#F8F8F8',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#FF0055';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#4A4D5A';
          }}
        >
          <Github size={15} />
          Submit
        </Link>
      </div>
    </nav>
  );
}
