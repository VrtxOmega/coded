import { CheckCircle2, Github, Link as LinkIcon, UploadCloud } from 'lucide-react';
import Footer from '@/sections/Footer';

const requirements = ['Public GitHub repository', 'README with install and usage', 'Dockerfile or documented build command', 'Demo URL, screenshots, or short product video'];

export default function SubmitPage() {
  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto submit-layout">
            <div>
              <span className="eyebrow">SUBMIT</span>
              <h1 className="text-h2 text-text-primary mt-4 mb-6">Turn your repository into a public credibility asset.</h1>
              <p className="text-body" style={{ color: '#B9BCC9' }}>
                The best submission flow should feel like a build pipeline: clear inputs, visible checks, and a scorecard that tells builders exactly what to improve next.
              </p>
              <div className="requirement-list">
                {requirements.map((item) => <span key={item}><CheckCircle2 size={16} /> {item}</span>)}
              </div>
            </div>
            <form className="submission-card">
              <h2>Project intake</h2>
              <label>Repository URL<input placeholder="https://github.com/you/project" /></label>
              <label>Live demo<input placeholder="https://yourproject.dev" /></label>
              <label>Category<select defaultValue="Developer Tools"><option>Developer Tools</option><option>AI Infrastructure</option><option>Security</option><option>Mobile Analytics</option></select></label>
              <label>What should reviewers notice?<textarea placeholder="Short positioning, strongest feature, or target user..." /></label>
              <button type="button"><Github size={18} /> Connect GitHub and analyze</button>
            </form>
          </div>
        </section>

        <section className="page-padding pb-28">
          <div className="max-w-7xl mx-auto intake-steps">
            {[
              [Github, 'Authenticate', 'Use GitHub OAuth to verify ownership or maintainer access.'],
              [LinkIcon, 'Validate assets', 'Check repo, demo, license, screenshots, README, and build commands.'],
              [UploadCloud, 'Run analysis', 'Queue clone, build, test, scan, AI grading, and initial scorecard generation.'],
            ].map(([Icon, title, body]) => (
              <article key={title as string}>
                <Icon size={24} />
                <h3>{title as string}</h3>
                <p>{body as string}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

