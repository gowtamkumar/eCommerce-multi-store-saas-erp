import { CheckCircle2, Clock, FileText, LucideIcon, User } from 'lucide-react';

interface LeaveStats {
  pending: number;
  approved: number;
  activeToday: number;
}

interface StatCardConfig {
  label: string;
  count: number | string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export default function LeaveStatsGrid({ stats }: { stats: LeaveStats }) {
  const cards: StatCardConfig[] = [
    { label: 'Pending Approval', count: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Approved', count: stats.approved, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Active Today', count: stats.activeToday, icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Annual Quota', count: '100%', icon: FileText, color: 'text-slate-400', bg: 'bg-slate-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-slate-800 p-6 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-2xl ${stat.bg} dark:bg-slate-700 flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{stat.count}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
