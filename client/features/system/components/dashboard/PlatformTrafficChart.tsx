'use client';

import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import TrendBadge from './TrendBadge';
import type { TrafficData } from '../../types/dashboard.types';

interface PlatformTrafficChartProps {
  traffic: TrafficData[];
  days: number;
  trafficTrend?: string | null;
}

const TrafficTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-2xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-800 pb-1.5">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requests</span>
          <p className="text-sm font-black text-indigo-400">{payload[0].value.toLocaleString()}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function PlatformTrafficChart({ traffic, days, trafficTrend }: PlatformTrafficChartProps) {
  const chartData = useMemo(() => {
    return [...traffic]
      .slice(0, days)
      .reverse()
      .map((t) => {
        const dateObj = new Date(t.date);
        const valid = !isNaN(dateObj.getTime());
        return {
          label: valid ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—',
          requests: t.requestCount,
        };
      });
  }, [traffic, days]);

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
      <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Traffic</h2>
          <p className="text-xs text-slate-500">Cross-store request volume — last {days} days</p>
        </div>
        {trafficTrend && <TrendBadge trend={trafficTrend} />}
      </div>
      <div className="flex-1 p-6 min-h-[280px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={240}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/40" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip content={<TrafficTooltip />} />
              <Area type="monotone" dataKey="requests" name="Requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">No traffic data yet</p>
            <p className="text-xs mt-1 opacity-60">Data will appear as requests come in</p>
          </div>
        )}
      </div>
    </div>
  );
}
