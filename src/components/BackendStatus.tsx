import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { fetchApiHealth, type ApiHealth } from '@/lib/api';

export default function BackendStatus() {
  const [health, setHealth] = useState<ApiHealth | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchApiHealth().then((nextHealth) => {
      if (!cancelled) setHealth(nextHealth);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`backend-status ${health?.ok ? 'online' : 'offline'}`}>
      <Activity size={14} />
      <span>{health?.ok ? `${health.approvedSubmissions} live submissions` : 'Local fallback'}</span>
    </div>
  );
}
