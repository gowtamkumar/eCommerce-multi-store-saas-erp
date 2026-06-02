import type { PageData } from '@/types/customizer';
import { Accessibility, AlertTriangle, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { runA11yChecks } from '@/features/admin/pages/lib/a11y-checks';
import SectionHeading from './SectionHeading';

interface A11yIssuesCardProps {
  data: PageData;
}

/**
 * Accessibility hints surfaced from runA11yChecks. We show at most six in
 * the panel to keep the sidebar scannable; the full list belongs in a
 * dedicated audit view (out of scope here).
 */
export default function A11yIssuesCard({ data }: A11yIssuesCardProps) {
  const issues = useMemo(() => runA11yChecks(data), [data]);
  const hasError = issues.some((i) => i.severity === 'error');

  const trailingClass =
    issues.length === 0 ? 'text-green-600' : hasError ? 'text-red-600' : 'text-amber-600';
  const trailingLabel =
    issues.length === 0
      ? 'All good'
      : `${issues.length} issue${issues.length > 1 ? 's' : ''}`;

  return (
    <section className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50">
      <SectionHeading
        icon={Accessibility}
        label="Accessibility"
        className=""
        trailing={<span className={`text-xs font-bold ${trailingClass}`}>{trailingLabel}</span>}
      />
      {issues.length > 0 && (
        <ul className="space-y-1">
          {issues.slice(0, 6).map((issue) => (
            <li key={issue.id} className="flex items-start gap-2 text-[11px]">
              {issue.severity === 'error' ? (
                <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
              )}
              <span className="text-slate-600 dark:text-slate-400">{issue.message}</span>
            </li>
          ))}
          {issues.length > 6 && (
            <li className="text-[10px] text-slate-400">+ {issues.length - 6} more</li>
          )}
        </ul>
      )}
    </section>
  );
}
