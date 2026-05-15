import { type FormEvent, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import Footer from '@/sections/Footer';

type WaitlistSignup = {
  email: string;
  plan: string;
  useCase: string;
  submittedAt: string;
};

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Pro Profile');
  const [useCase, setUseCase] = useState('');
  const [error, setError] = useState('');
  const [signup, setSignup] = useState<WaitlistSignup | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      setSignup(null);
      return;
    }

    const nextSignup = {
      email: email.trim(),
      plan,
      useCase: useCase.trim(),
      submittedAt: new Date().toISOString(),
    };

    window.localStorage.setItem('coded:waitlist', JSON.stringify(nextSignup));
    setSignup(nextSignup);
    setError('');
  };

  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto submit-layout">
            <div>
              <span className="eyebrow">WAITLIST</span>
              <h1 className="text-h2 text-text-primary mt-4 mb-6">Get early access to deeper score intelligence.</h1>
              <p className="text-body" style={{ color: '#B9BCC9' }}>
                Pro and partner workflows need analytics, saved category feeds, launch monitoring, and private distribution tools. Capture the use case now, wire billing later.
              </p>
              <div className="requirement-list">
                {['Score history and launch analytics', 'Saved project watchlists', 'Partner category feeds', 'Early product updates'].map((item) => (
                  <span key={item}><CheckCircle2 size={16} /> {item}</span>
                ))}
              </div>
            </div>
            <form className="submission-card" onSubmit={handleSubmit} noValidate>
              <h2>Access request</h2>
              <label>
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@company.com" required />
              </label>
              <label>
                Plan
                <select value={plan} onChange={(event) => setPlan(event.target.value)}>
                  <option>Pro Profile</option>
                  <option>Partner</option>
                  <option>Newsletter</option>
                </select>
              </label>
              <label>
                Use case
                <textarea value={useCase} onChange={(event) => setUseCase(event.target.value)} placeholder="What do you want Coded to help you track or distribute?" />
              </label>
              {error && <p className="submission-message error" role="alert">{error}</p>}
              {signup && (
                <div className="submission-message success" role="status">
                  <b>{signup.plan} request saved</b>
                  <span>{signup.email} is on the local prototype waitlist.</span>
                </div>
              )}
              <button type="submit"><Send size={18} /> Request access</button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
