import type { PageData } from '@/types/customizer';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { buildSeoReport } from '@/features/admin/pages/lib/seo-score';
import SectionHeading from './SectionHeading';

const scoreColor = (score: number) =>
  score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';

interface SeoScoreCardProps {
  data: PageData;
}

/**
 * Live SEO health for the page. Reads metaTitle/description/slug and
 * runs a deterministic rule set in seo-score.ts so the score is stable
 * across renders and matches anything an editor previewed.
 */
export default function SeoScoreCard({ data }: SeoScoreCardProps) {
  const report = useMemo(() => buildSeoReport(data), [data]);

  return (
    <section className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50">
      <SectionHeading
        icon={Info}
        label="SEO Score"
        className=""
        trailing={
          <span className={`text-lg font-bold ${scoreColor(report.score)}`}>{report.score}</span>
        }
      />
      <ul className="space-y-1">
        {report.checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-[11px]">
            {c.status === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5" />}
            {c.status === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />}
            {c.status === 'fail' && <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />}
            <span className="text-slate-600 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300">{c.label}:</strong>{' '}
              {c.message}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
