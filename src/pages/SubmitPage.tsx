import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Github, Link as LinkIcon, Loader2, ShieldCheck, UploadCloud } from 'lucide-react';
import Footer from '@/sections/Footer';
import { createSubmission, fetchGithubRepository, getLastSubmission, getRepoName, githubRepoPattern, saveSubmission, type SubmissionState } from '@/lib/submissions';
import { createApiSubmission, fetchGithubSession, getApiUrl } from '@/lib/api';

const requirements = ['Public GitHub repository', 'README with install and usage', 'Dockerfile or documented build command', 'Demo URL, screenshots, or short product video'];

function slugFromRepo(repoUrl: string) {
  return getRepoName(repoUrl)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function SubmitPage() {
  const initialSubmission = useMemo(() => getLastSubmission(), []);
  const [repoUrl, setRepoUrl] = useState(initialSubmission?.repoUrl ?? '');
  const [demoUrl, setDemoUrl] = useState(initialSubmission?.demoUrl ?? '');
  const [category, setCategory] = useState(initialSubmission?.category ?? 'Developer Tools');
  const [notes, setNotes] = useState(initialSubmission?.notes ?? '');
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState<SubmissionState | null>(initialSubmission);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubLogin, setGithubLogin] = useState(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get('github_login') ?? window.sessionStorage.getItem('coded:github-login') ?? '';
  });

  const repoName = useMemo(() => {
    return getRepoName(repoUrl);
  }, [repoUrl]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const session = url.searchParams.get('coded_session');
    const login = url.searchParams.get('github_login');

    if (session) {
      window.sessionStorage.setItem('coded:github-session', session);
      if (login) window.sessionStorage.setItem('coded:github-login', login);
      url.searchParams.delete('coded_session');
      url.searchParams.delete('github_login');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    void fetchGithubSession().then((user) => {
      if (!user) return;
      window.sessionStorage.setItem('coded:github-login', user.login);
      setGithubLogin(user.login);
    });
  }, []);

  const connectGithub = () => {
    window.location.href = getApiUrl(`/api/auth/github/start?returnTo=${encodeURIComponent(`${window.location.origin}${window.location.pathname}#/submit`)}`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedRepoUrl = repoUrl.trim();
    const normalizedDemoUrl = demoUrl.trim();

    if (!githubRepoPattern.test(normalizedRepoUrl)) {
      setError('Enter a full public GitHub repo URL like https://github.com/you/project.');
      setSubmission(null);
      return;
    }

    setError('');
    setIsSubmitting(true);

    const apiResult = await createApiSubmission({
      repoUrl: normalizedRepoUrl,
      demoUrl: normalizedDemoUrl,
      category,
      notes,
    });
    if (apiResult.error) {
      setError(apiResult.error);
      setIsSubmitting(false);
      return;
    }

    const github = apiResult.submission ? null : await fetchGithubRepository(normalizedRepoUrl);
    const nextSubmission = apiResult.submission ?? createSubmission({
      repoUrl: normalizedRepoUrl,
      demoUrl: normalizedDemoUrl,
      category,
      notes,
      github: github ?? undefined,
    });

    saveSubmission(nextSubmission);
    setSubmission(nextSubmission);
    setIsSubmitting(false);
  };

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
            <form className="submission-card" onSubmit={handleSubmit} noValidate>
              <h2>Project intake</h2>
              <div className={`submission-message ${githubLogin ? 'success' : 'neutral'}`}>
                <b>{githubLogin ? `Verified as ${githubLogin}` : 'GitHub verification'}</b>
                <span>{githubLogin ? 'Owner submissions can be verified without asking for repository write permissions.' : 'Public repos can be analyzed without GitHub access. Connect GitHub only if you want owner verification.'}</span>
                {!githubLogin && (
                  <button className="inline-auth-button" type="button" onClick={connectGithub}>
                    <ShieldCheck size={16} /> Connect GitHub
                  </button>
                )}
              </div>
              <label>
                Repository URL
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  placeholder="https://github.com/you/project"
                  aria-invalid={error ? 'true' : 'false'}
                  required
                />
              </label>
              <label>
                Live demo
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(event) => setDemoUrl(event.target.value)}
                  placeholder="https://yourproject.dev"
                />
              </label>
              <label>
                Category
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option>Developer Tools</option>
                  <option>AI Infrastructure</option>
                  <option>Security</option>
                  <option>Mobile Analytics</option>
                </select>
              </label>
              <label>
                What should reviewers notice?
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Short positioning, strongest feature, or target user..."
                />
              </label>
              {error && <p className="submission-message error" role="alert">{error}</p>}
              {submission && (
                <div className="submission-message success" role="status">
                  <b>{repoName || submission.repoUrl.replace('https://github.com/', '')}</b>
                  <span>
                    {submission.submitter?.verifiedOwner ? 'Maintainer access verified and weighted scorecard created.' : submission.analysis?.version === 2 ? 'Weighted repository scorecard created.' : submission.github ? 'GitHub metadata fetched and pending scorecard created.' : 'Analysis queued. Your repo intake was saved and is ready for the scoring pipeline.'}
                  </span>
                  <Link to={`/projects/${slugFromRepo(submission.repoUrl)}`}>Open pending scorecard</Link>
                </div>
              )}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={18} className="spin-icon" /> : <Github size={18} />}
                {isSubmitting ? 'Checking GitHub...' : githubLogin ? 'Analyze verified repository' : 'Analyze public repository'}
              </button>
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
