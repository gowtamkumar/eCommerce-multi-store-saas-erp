import type { LucideIcon } from 'lucide-react';

interface SectionHeadingProps {
  icon: LucideIcon;
  label: string;
  /** Optional content (badge/score) rendered to the right of the title. */
  trailing?: React.ReactNode;
  className?: string;
}

/**
 * The tiny capped-letter heading used at the top of every PageSettings
 * subsection. Previously copy/pasted seven times; centralizing it makes
 * the parent file shorter and keeps the visual rhythm consistent.
 */
export default function SectionHeading({
  icon: Icon,
  label,
  trailing,
  className = 'mb-2',
}: SectionHeadingProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {label}
        </h3>
      </div>
      {trailing}
    </div>
  );
}
