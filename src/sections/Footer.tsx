import { Link } from 'react-router';

const footerColumns = [
  {
    title: 'Product',
    links: ['Rankings', 'Collections', 'API', 'Changelog'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Grading Criteria', 'FAQ', 'Blog'],
  },
  {
    title: 'Community',
    links: ['Discord', 'Twitter/X', 'GitHub', 'Newsletter'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Cookie Policy'],
  },
];

export default function Footer() {
  return (
    <footer
      id="submit"
      className="relative overflow-hidden"
      style={{
        background: '#0B0C0F',
        zIndex: 20,
        minHeight: '80vh',
      }}
    >
      {/* Background diagonal text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ opacity: 0.04 }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="absolute font-display font-bold whitespace-nowrap"
            style={{
              fontSize: '20vw',
              color: '#15171C',
              transform: `rotate(-15deg) translateY(${(i - 2) * 30}%)`,
              letterSpacing: 0,
            }}
          >
            CODED
          </span>
        ))}
      </div>

      {/* Central wordmark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.03 }}
      >
        <span
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(8rem, 20vw, 25rem)',
            color: '#F8F8F8',
            letterSpacing: 0,
          }}
        >
          CODED
        </span>
      </div>

      {/* Content */}
      <div className="relative page-padding pt-32 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="submit-panel mb-24">
            <div>
              <span className="eyebrow">LAUNCH ON CODED</span>
              <h2
                className="font-display text-5xl md:text-7xl font-bold mt-4 mb-6"
                style={{ color: '#F8F8F8' }}
              >
                Ready to get
                <br />
                <span style={{ color: '#FF0055' }}>graded?</span>
              </h2>
              <p className="text-body" style={{ color: '#B9BCC9', maxWidth: '540px' }}>
                Submit your GitHub repository and get a public scorecard built for adoption, credibility, and momentum.
              </p>
            </div>
            <form className="repo-form">
              <label htmlFor="repo">Repository URL</label>
              <div>
                <input id="repo" type="url" placeholder="https://github.com/you/project" />
                <button type="button">Start analysis</button>
              </div>
              <p>Public GitHub repo required. Dockerfile, README, and demo link improve score confidence.</p>
            </form>
          </div>

          <div className="mb-24">
            <h2
              className="font-display text-3xl md:text-5xl font-bold mb-6"
              style={{ color: '#F8F8F8' }}
            >
              The scoreboard developers check before they spend a weekend on a repo.
            </h2>
            <p
              className="text-body mb-8"
              style={{ color: '#7A7D8A', maxWidth: '480px' }}
            >
              Coded wins if it becomes the trusted layer between shipping and discovery:
              objective enough for buyers, alive enough for builders, useful enough for reviewers.
            </p>
              <Link
                to="/submit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-display font-bold transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: '#FF0055',
                color: '#0B0C0F',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 85, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                Submit Your Repo
              </Link>
          </div>

          {/* Footer columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pt-16 border-t" style={{ borderColor: '#1E2028' }}>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4
                  className="font-mono text-sm uppercase mb-4"
                  style={{ color: '#4A4D5A', letterSpacing: '0.05em' }}
                >
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-colors duration-200"
                        style={{ color: '#7A7D8A' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F8F8')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7D8A')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            className="flex items-center justify-between flex-wrap gap-4 pt-8 border-t"
            style={{ borderColor: '#1E2028' }}
          >
            <span className="text-mono-data" style={{ color: '#4A4D5A' }}>
              &copy; 2025 Coded Inc.
            </span>
            <div className="flex items-center gap-4">
              {['GitHub', 'Twitter', 'Discord'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-mono-data transition-colors duration-200"
                  style={{ color: '#4A4D5A' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F8F8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4A4D5A')}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
