import { type FormEvent, useState } from 'react';
import { Check, Download, EyeOff, RefreshCcw, Shield, ShieldCheck, Trash2 } from 'lucide-react';
import Footer from '@/sections/Footer';
import { downloadAdminExport, fetchAdminSubmissions, moderateSubmission, reanalyzeAllSubmissions, reanalyzeSubmission } from '@/lib/api';
import { getRepoName, type SubmissionState } from '@/lib/submissions';

export default function AdminPage() {
  const [token, setToken] = useState(() => window.sessionStorage.getItem('coded:admin-token') ?? '');
  const [submissions, setSubmissions] = useState<SubmissionState[]>([]);
  const [message, setMessage] = useState('');
  const [busyIds, setBusyIds] = useState<number[]>([]);

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
            <form className="admin-toolbar" onSubmit={loadSubmissions}>
              <label>
                Admin token
                <input value={token} onChange={(event) => setToken(event.target.value)} type="password" placeholder="Server admin token" />
              </label>
              <button className="btn-primary" type="submit"><Shield size={16} /> Load queue</button>
              <button className="btn-secondary" type="button" onClick={async () => {
                const ok = await downloadAdminExport(token);
                setMessage(ok ? 'Export downloaded.' : 'Export failed.');
              }} disabled={!token}>
                <Download size={16} /> Export JSON
              </button>
              <button className="btn-secondary" type="button" onClick={reanalyzeAll} disabled={!token || !submissions.length || Boolean(busyIds.length)}>
                <RefreshCcw size={16} /> Reanalyze all
              </button>
            </form>
            <div className="admin-hint">
              Export downloads all non-deleted submissions as JSON using the admin token for this session.
            </div>
            {message && <div className="admin-message">{message}</div>}
            <div className="ranking-list">
              {submissions.map((submission) => (
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
                    {submission.analysis?.score && <small>Score {submission.analysis.score} · AI grade {submission.analysis.aiGrade ?? 'pending'} · confidence {Math.round(submission.analysis.confidence * 100)}%</small>}
                  </div>
                  <div className="admin-actions">
                    <button type="button" disabled={submission.id ? busyIds.includes(submission.id) : false} onClick={() => reanalyze(submission)}><RefreshCcw size={15} /> Reanalyze</button>
                    <button type="button" disabled={submission.id ? busyIds.includes(submission.id) : false} onClick={() => applyAction(submission, 'approve')}><Check size={15} /> Approve</button>
                    <button type="button" disabled={submission.id ? busyIds.includes(submission.id) : false} onClick={() => applyAction(submission, 'hide')}><EyeOff size={15} /> Hide</button>
                    <button type="button" disabled={submission.id ? busyIds.includes(submission.id) : false} onClick={() => applyAction(submission, 'delete')}><Trash2 size={15} /> Delete</button>
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
