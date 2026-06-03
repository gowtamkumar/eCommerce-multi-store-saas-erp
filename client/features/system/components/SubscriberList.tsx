'use client';

import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import { Activity, Calendar, Database, Mail, Search, Terminal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export default function SubscriberList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSuperAdminAPI('/subscribers');
      setSubscribers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: DataTableColumn<Subscriber>[] = [
    {
      key: 'email',
      header: 'Deployment Identity',
      headerClassName: 'px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]',
      className: 'px-8 py-5',
      cell: (subscriber) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{subscriber.email}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registration Date',
      headerClassName: 'px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]',
      className: 'px-8 py-5',
      cell: (subscriber) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Calendar className="w-4 h-4 opacity-50" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {new Date(subscriber.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Network Status',
      headerClassName: 'px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]',
      className: 'px-8 py-5',
      cell: (subscriber) => (
        <div className="flex items-center gap-2">
          <Activity className={`w-3 h-3 ${subscriber.isActive ? 'text-emerald-500' : 'text-slate-300 animate-pulse'}`} />
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${subscriber.isActive
            ? 'text-emerald-500'
            : 'text-slate-400'
            }`}>
            {subscriber.isActive ? 'Connected' : 'Dormant'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight animate-in fade-in duration-300">Global Subscription Pulse</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring the neural broadcast network across all partitions.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">Active Subscribers</h2>
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Repository Size: {subscribers.length}</span>
              </div>
            </div>
          </div>

          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Query identity mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <DataTable
          data={filteredSubscribers}
          columns={columns}
          getRowKey={(sub) => sub.id}
          loading={loading}
          loadingLabel="Syncing identity clusters..."
          emptyLabel={
            <div className="flex flex-col items-center gap-3 opacity-30 py-12">
              <Terminal className="w-12 h-12" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Zero identity results matched your query</p>
            </div>
          }
          containerClassName="border-0 shadow-none rounded-t-none rounded-b-[2.5rem] bg-transparent"
        />
      </div>
    </div>
  );
}
