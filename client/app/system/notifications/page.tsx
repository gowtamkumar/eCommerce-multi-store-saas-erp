'use client';

import { fetchAPI } from '@/services/api';
import { useSocketEvent } from '@/hooks/SocketContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Info,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function SuperAdminNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchNotifications = useCallback(async (page: number, type: string, search: string) => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      let url = `/infra/notifications?limit=${limit}&offset=${offset}`;
      if (type && type !== 'ALL') {
        url += `&type=${type}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      // We pass header to bypass tenant ID resolving if any, fetching system global notifications
      const data = await fetchAPI(url, {
        headers: { 'x-tenant-id': '' },
      });
      if (data.success && data.data) {
        setNotifications(data.data.notifications || []);
        setTotal(data.data.total || 0);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch system notifications:', error);
      toast.error('Failed to load system notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotifications(currentPage, activeTab, debouncedSearch);
    }
  }, [session, currentPage, activeTab, debouncedSearch, fetchNotifications]);

  // Handle incoming real-time global notifications
  useSocketEvent('notification', (newNotif: any) => {
    const matchesTab = activeTab === 'ALL' || newNotif.type === activeTab;
    const matchesSearch = !debouncedSearch ||
      newNotif.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      newNotif.message.toLowerCase().includes(debouncedSearch.toLowerCase());

    if (matchesTab && matchesSearch) {
      setNotifications((prev) => [newNotif, ...prev.slice(0, limit - 1)]);
      setTotal((prev) => prev + 1);
    }
    setUnreadCount((prev) => prev + 1);
  });

  const markAllAsRead = async () => {
    try {
      await fetchAPI('/infra/notifications/read-all', {
        method: 'PATCH',
        headers: { 'x-tenant-id': '' },
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All platform notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await fetchAPI(`/infra/notifications/${notif.id}/read`, {
          method: 'PATCH',
          headers: { 'x-tenant-id': '' },
        });
        setNotifications(
          notifications.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    if (notif.link) {
      window.location.href = notif.link;
    }
  };



  const totalPages = Math.ceil(total / limit);

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'DANGER':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20';
      case 'DANGER':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Platform Alert Console
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Monitor and respond to critical global events, system creations, and diagnostic telemetry.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-95"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Main Panel Box */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        {/* Controls Bar */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-650 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">Global Broadcasts</h2>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {unreadCount} Active Platform Indicators ({total} Total Logs)
                </span>
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Query telemetry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'DANGER'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {loading ? (
            <div className="py-32 text-center text-slate-500">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing alert arrays...</p>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-6 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-750/30 flex gap-4 relative cursor-pointer ${
                    !notif.isRead ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-7 left-3 w-2 h-2 rounded-full bg-indigo-655 shadow-md animate-pulse" />
                  )}
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white leading-snug">
                        {notif.title}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-full ${getBadgeStyle(notif.type)}`}>
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-3">
                      <Calendar className="w-3.5 h-3.5 opacity-55" />
                      <span>
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-32 text-center">
              <div className="flex flex-col items-center gap-3 opacity-35 max-w-sm mx-auto">
                <Inbox className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">No platform logs</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Platform network diagnostic channels are quiet. Any health alerts or registrations will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Page Bar */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
