import { Calendar, Clock } from 'lucide-react';
import SectionHeading from './SectionHeading';

interface SchedulePublishFieldProps {
  publishAt: string | null | undefined;
  onChange: (isoOrNull: string | null) => void;
}

/**
 * Picks the future date/time at which the page should auto-publish.
 * The server checks this lazily on storefront reads — no background worker
 * required — so an empty value simply clears any scheduled flag.
 */
export default function SchedulePublishField({
  publishAt,
  onChange,
}: SchedulePublishFieldProps) {
  const localValue = publishAt ? new Date(publishAt).toISOString().slice(0, 16) : '';

  return (
    <section className="space-y-3">
      <SectionHeading icon={Calendar} label="Schedule publish" />
      <div className="space-y-2">
        <input
          type="datetime-local"
          value={localValue}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v ? new Date(v).toISOString() : null);
          }}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
        />
        {publishAt && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-blue-600 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Auto-publish on save
            </p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[10px] font-bold text-slate-500 hover:text-red-500"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
