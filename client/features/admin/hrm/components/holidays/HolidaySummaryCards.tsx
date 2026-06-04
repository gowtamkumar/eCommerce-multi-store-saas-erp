import { Calendar as CalendarIcon, Globe2, LucideIcon, MapPin } from 'lucide-react';

interface HolidayStats {
  total: number;
  global: number;
  branchSpecific: number;
}

interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  dark?: boolean;
}

export default function HolidaySummaryCards({ stats }: { stats: HolidayStats }) {
  const cards: StatCard[] = [
    {
      label: 'Year Holidays',
      value: stats.total,
      icon: CalendarIcon,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      label: 'Global',
      value: stats.global,
      icon: Globe2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Branch Specific',
      value: stats.branchSpecific,
      icon: MapPin,
      color: 'text-indigo-400',
      bg: 'bg-white/10',
      dark: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={card.dark
            ? 'bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center gap-6 relative overflow-hidden shadow-xl'
            : 'bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6'}
        >
          {card.dark && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full" />}
          <div className={`w-16 h-16 rounded-3xl ${card.bg} flex items-center justify-center ${card.color} ${card.dark ? 'relative z-10' : ''}`}>
            <card.icon className="w-8 h-8" />
          </div>
          <div className={card.dark ? 'relative z-10' : ''}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <h3 className={`text-3xl font-black ${card.dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
