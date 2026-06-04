'use client';

import { Search } from 'lucide-react';

interface PerformanceSearchProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function PerformanceSearch({ search, setSearch }: PerformanceSearchProps) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search by employee or period..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
      />
    </div>
  );
}
