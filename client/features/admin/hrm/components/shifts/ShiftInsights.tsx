import { History } from 'lucide-react';
import { Shift } from '../../hooks/useShiftManager';

export default function ShiftInsights({ shifts }: { shifts: Shift[] }) {
  const nightOperations = shifts.filter((s) => s.isNightShift).length;

  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <History className="w-10 h-10 text-indigo-400 mb-6" />
          <h4 className="text-2xl font-black italic uppercase tracking-tight leading-none mb-2">Shift <br />Efficiency</h4>
          <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">Automate your workforce rotation and track punctuality metrics.</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Templates</span>
              <span className="text-lg font-black">{shifts.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Night Operations</span>
              <span className="text-lg font-black text-indigo-400">{nightOperations}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50">
        <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Assignment Tip</h5>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">
          &ldquo;Assigning a shift with an effective date in the future will automatically queue it in the employee&apos;s timeline.&rdquo;
        </p>
      </div>
    </div>
  );
}
