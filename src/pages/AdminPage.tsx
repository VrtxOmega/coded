import { type FormEvent, useState } from 'react';
import { Check, Download, EyeOff, LockKeyhole, LogOut, RefreshCcw, Shield, ShieldCheck, Trash2 } from 'lucide-react';
import Footer from '@/sections/Footer';
import { downloadAdminExport, fetchAdminSubmissions, moderateSubmission, reanalyzeAllSubmissions, reanalyzeSubmission } from '@/lib/api';
import { getRepoName, type SubmissionState } from '@/lib/submissions';

export default function AdminPage() {
  const [token, setToken] = useState(() => window.sessionStorage.getItem('coded:admin-token') ?? '');
  const [submissions, setSubmissions] = useState<SubmissionState[]>([]);
  const [message, setMessage] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [busyIds, setBusyIds] = useState<number[]>([]);
  const summary = submissions.reduce((counts, submission) => {
    counts.total += 1;
    counts[submission.status ?? 'approved'] += 1;
    if (submission.submitter?.verifiedOwner) counts.verified += 1;
    if (submission.submitter && !submission.submitter.verifiedOwner) counts.unverified += 1;
    if (!submission.submitter) counts.anonymous += 1;
    return counts;
  }, { total: 0, approved: 0, hidden: 0, deleted: 0, verified: 0, unverified: 0, anonymous: 0 });

  const loadSubmissions = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setLoginError('Enter the admin token.');
      return;
    }

    setIsLoading(true);
    setLoginError('');
    const result = await fetchAdminSubmissions(trimmedToken);
    setIsLoading(false);
    if (result.status !== 'ok' || !result.submissions) {
      setIsAuthenticated(false);
      setSubmissions([]);
      setLoginError(result.error);
      setMessage('');
      return;
    }

    window.sessionStorage.setItem('coded:admin-token', trimmedToken);
    setToken(trimmedToken);
    setIsAuthenticated(true);
    setSubmissions(result.submissions);
    setMessage(`${result.submissions.length} submissions loaded.`);
  };

  const logout = () => {
    window.sessionStorage.removeItem('coded:admin-token');
    setToken('');
    setSubmissions([]);
    setIsAuthenticated(false);
    setMessage('');
    setLoginError('');
  };

  const applyAction = async (submission: SubmissionState, action: 'approve' | 'hide' | 'delete') => {
    if (!submission.id) return;

    setBusyIds((ids) => [...ids, submission.id as number]);
    const updated = await moderateSubmission(submission.id, action, token);
    setBusyIds((ids) => ids.filter((id) => id !== submission.id));
    if (!updated) {
      setMessage('Moderation action failed.');
      return;
    }

    setSubmissions((items) => action === 'delete'
      ? items.filter((item) => item.id !== submission.id)
      : items.map((item) => item.id === submission.id ? updated : item));
    setMessage(`${getRepoName(submission.repoUrl)} ${action}d.`);
  };

  const reanalyze = async (submission: SubmissionState) => {
    if (!submission.id) return;

    setBusyIds((ids) => [...ids, submission.id as number]);
    setMessage(`Reanalyzing ${getRepoName(submission.repoUrl)}...`);
    const updated = await reanalyzeSubmission(submission.id, token);
    setBusyIds((ids) => ids.filter((id) => id !== submission.id));
    if (!updated) {
      setMessage('Reanalysis failed.');
      return;
    }

    setSubmissions((items) => items.map((item) => item.id === submission.id ? updated : item));
    setMessage(`${getRepoName(submission.repoUrl)} score refreshed.`);
  };

  const reanalyzeAll = async () => {
    const ids = submissions.map((submission) => submission.id).filter((id): id is number => Boolean(id));
    if (!ids.length) return;

    setBusyIds(ids);
    setMessage(`Reanalyzing ${ids.length} submissions...`);
    const refreshed = await reanalyzeAllSubmissions(ids, token);
    setBusyIds([]);

    if (!refreshed.length) {
      setMessage('Bulk reanalysis failed.');
      return;
    }

    setSubmissions((items) => items.map((item) => refreshed.find((fresh) => fresh.id === item.id) ?? item));
    setMessage(`${refreshed.length} submissions refreshed.`);
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
            {isAuthenticated && (
              <form className="admin-toolbar" onSubmit={loadSubmissions}>
                <div className="admin-session-status">
                  <ShieldCheck size={16} />
                  <span>Admin session unlocked</span>
                </div>
                <button className="btn-primary" type="submit" disabled={isLoading}><Shield size={16} /> Refresh queue</button>
                <button className="btn-secondary" type="button" onClick={async () => {
                  const ok = await downloadAdminExport(token);
                  setMessage(ok ? 'Export downloaded.' : 'Export failed.');
                }} disabled={!token}>
                  <Download size={16} /> Export JSON
                </button>
                <button className="btn-secondary" type="button" onClick={reanalyzeAll} disabled={!token || !submissions.length || Boolean(busyIds.length)}>
                  <RefreshCcw size={16} /> Reanalyze all
                </button>
                <button className="btn-secondary" type="button" onClick={logout}>
                  <LogOut size={16} /> Lock
                </button>
              </form>
            )}
            {!isAuthenticated ? (
              <form className="admin-login-panel" onSubmit={loadSubmissions}>
                <div className="admin-login-icon" aria-hidden="true"><LockKeyhole size={24} /></div>
                <div>
                  <strong>Admin access</strong>
                  <span>Enter the server admin token to load moderation tools for this browser session.</span>
                </div>
                <label>
                  Admin token
                  <input
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Paste admin token"
                    autoFocus
                  />
                </label>
                {loginError && <div className="admin-login-error">{loginError}</div>}
                <button className="btn-primary" type="submit" disabled={isLoading}>
                  <Shield size={16} /> {isLoading ? 'Checking...' : 'Unlock admin'}
                </button>
              </form>
            ) : (
              <div className="admin-hint">
                Hidden submissions are withheld from public discovery until approved. Export downloads all non-deleted submissions as JSON.
              </div>
            )}
            {message && <div className="admin-message">{message}</div>}
            {isAuthenticated && Boolean(submissions.length) && (
              <div className="admin-summary-grid" aria-label="Moderation summary">
                <div><strong>{summary.total}</strong><span>Total</span></div>
                <div><strong>{summary.approved}</strong><span>Approved</span></div>
                <div><strong>{summary.hidden}</strong><span>Hidden</span></div>
                <div><strong>{summary.verified}</strong><span>Verified</span></div>
                <div><strong>{summary.unverified}</strong><span>Unverified</span></div>
                <div><strong>{summary.anonymous}</strong><span>Anonymous</span></div>
              </div>
            )}
            <div className="ranking-list">
              {isAuthenticated && submissions.map((submission) => (
                <div className="admin-row" key={submission.id ?? submission.repoUrl}>
                  <div>
                    <strong>{getRepoName(submission.repoUrl) || submission.repoUrl}</strong>
                    <span>
                      {submission.category} · {submission.status ?? 'approved'}
                      {submission.submitter?.verifiedOwner ? ' · verified maintainer' : submission.submitter ? ' · unverified maintainer' : ' · no GitHub session'}
                    </span>
                    <p>{submission.notes || submission.github?.description || 'No notes supplied.'}</p>
                    {submission.submitter && (
                      <small className={submission.submitter.verifiedOwner ? 'verified-inline' : ''}>
                        {submission.submitter.verifiedOwner && <ShieldCheck size={13} />} Submitted by {submission.submitter.login}
                      </small>
                    )}
                    {submission.analysis?.score && (
                      <small>
                        Score {submission.analysis.score} · AI grade {submission.analysis.aiGrade ?? 'pending'} · confidence {Math.round(submission.analysis.confidence * 100)}%
                        {submission.analysisHistory?.length ? ` · ${submission.analysisHistory.length} prior ${submission.analysisHistory.length === 1 ? 'analysis' : 'analyses'}` : ''}
                      </small>
                    )}
                    {submission.status === 'hidden' && <small className="admin-review-note">Needs approval before it appears publicly.</small>}
                  </div>
                  <div className="admin-actions">
                    <button type="button" disabled={submission.id ? busyIds.includes(submission.id) : false} onClick={() => reanalyze(submission)}><RefreshCcw size={15} /> Reanalyze</button>
                    <button type="button" disabled={submission.id ? busyIds.includes(submission.id) : false} onClick={() => applyAction(submission, 'approve')}><Check size={15} /> Approve</button>
                    <button type="button" disabled={submission.id ? busyIds.includes(submission.id) : false} onClick={() => applyAction(submission, 'hide')}><EyeOff size={15} /> Hide</button>
                    <button type="button" disabled={submission.id ? busyIds.includes(submission.id) : false} onClick={() => applyAction(submission, 'delete')}><Trash2 size={15} /> Delete</button>
                  </div>
                </div>
              ))}
              {isAuthenticated && !submissions.length && (
                <div className="empty-results">
                  <strong>No submissions in the moderation queue.</strong>
                  <span>New unverified submissions will appear here before public listing.</span>
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
