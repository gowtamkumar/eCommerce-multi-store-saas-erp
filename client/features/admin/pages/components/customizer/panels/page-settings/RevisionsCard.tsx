import { fetchAPI } from '@/services/api';
import { History, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';

interface Revision {
  id: string;
  createdAt: string;
  note?: string | null;
  title?: string;
}

interface RevisionsCardProps {
  pageId: string;
}

/**
 * Lists snapshot revisions and lets the editor restore one. Restore is
 * destructive — current unsaved edits are replaced by reloading the page
 * after a successful restore, which is the simplest way to guarantee
 * editor state matches what the server now has.
 */
export default function RevisionsCard({ pageId }: RevisionsCardProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pageId || pageId === 'new') return;
    setLoading(true);
    fetchAPI(`/pages/${pageId}/revisions`)
      .then((res) => {
        if (res?.success) setRevisions(res.data || []);
      })
      .finally(() => setLoading(false));
  }, [pageId]);

  const handleRestore = async (revisionId: string) => {
    if (!pageId || pageId === 'new') return;
    if (!window.confirm('Restore this revision? Current unsaved changes will be replaced.')) {
      return;
    }
    const res = await fetchAPI(`/pages/${pageId}/revisions/${revisionId}/restore`, {
      method: 'POST',
    });
    if (res?.success) window.location.reload();
  };

  return (
    <section className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50">
      <SectionHeading icon={History} label="Revisions" className="" />
      {loading ? (
        <p className="text-[11px] text-slate-400">Loading…</p>
      ) : revisions.length === 0 ? (
        <p className="text-[11px] text-slate-400">No revisions yet. Save to create one.</p>
      ) : (
        <ul className="space-y-1 max-h-48 overflow-y-auto">
          {revisions.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white dark:hover:bg-slate-900"
            >
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                {new Date(r.createdAt).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => handleRestore(r.id)}
                className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
