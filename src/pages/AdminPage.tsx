import { type FormEvent, useState } from 'react';
import { Check, EyeOff, Shield, Trash2 } from 'lucide-react';
import Footer from '@/sections/Footer';
import { fetchAdminSubmissions, moderateSubmission } from '@/lib/api';
import { getRepoName, type SubmissionState } from '@/lib/submissions';

export default function AdminPage() {
  const [token, setToken] = useState(() => window.sessionStorage.getItem('coded:admin-token') ?? '');
  const [submissions, setSubmissions] = useState<SubmissionState[]>([]);
  const [message, setMessage] = useState('');

  const loadSubmissions = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    window.sessionStorage.setItem('coded:admin-token', token);

    const nextSubmissions = await fetchAdminSubmissions(token);
    if (!nextSubmissions) {
      setMessage('Admin token rejected or backend unavailable.');
      return;
    }

    setSubmissions(nextSubmissions);
    setMessage(`${nextSubmissions.length} submissions loaded.`);
  };

  const applyAction = async (submission: SubmissionState, action: 'approve' | 'hide' | 'delete') => {
    if (!submission.id) return;

    const updated = await moderateSubmission(submission.id, action, token);
    if (!updated) {
      setMessage('Moderation action failed.');
      return;
    }

    setSubmissions((items) => action === 'delete'
      ? items.filter((item) => item.id !== submission.id)
      : items.map((item) => item.id === submission.id ? updated : item));
    setMessage(`${getRepoName(submission.repoUrl)} ${action}d.`);
  };

  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow">ADMIN</span>
            <h1 className="text-h2 text-text-primary mt-4 mb-6">Moderate public submissions.</h1>
            <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 780 }}>
              Admin actions require a server-side token. The token is kept in session storage only for this browser tab.
            </p>
          </div>
        </section>

        <section className="page-padding pb-28">
          <div className="max-w-7xl mx-auto ranking-panel">
            <form className="admin-toolbar" onSubmit={loadSubmissions}>
              <label>
                Admin token
                <input value={token} onChange={(event) => setToken(event.target.value)} type="password" placeholder="Server admin token" />
              </label>
              <button className="btn-primary" type="submit"><Shield size={16} /> Load queue</button>
            </form>
            {message && <div className="admin-message">{message}</div>}
            <div className="ranking-list">
              {submissions.map((submission) => (
                <div className="admin-row" key={submission.id ?? submission.repoUrl}>
                  <div>
                    <strong>{getRepoName(submission.repoUrl) || submission.repoUrl}</strong>
                    <span>{submission.category} · {submission.status ?? 'approved'}</span>
                    <p>{submission.notes || submission.github?.description || 'No notes supplied.'}</p>
                  </div>
                  <div className="admin-actions">
                    <button type="button" onClick={() => applyAction(submission, 'approve')}><Check size={15} /> Approve</button>
                    <button type="button" onClick={() => applyAction(submission, 'hide')}><EyeOff size={15} /> Hide</button>
                    <button type="button" onClick={() => applyAction(submission, 'delete')}><Trash2 size={15} /> Delete</button>
                  </div>
                </div>
              ))}
              {!submissions.length && (
                <div className="empty-results">
                  <strong>No moderation data loaded.</strong>
                  <span>Enter the admin token and load the queue.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
