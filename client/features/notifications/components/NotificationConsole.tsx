'use client';

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
  ArrowUpRight,
  Plus,
  Send,
  X,
} from 'lucide-react';
import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types';
import { fetchAPI } from '@/services/api';
import { fetchSuperAdminAPI } from '@/services/superAdminApi';
import toast from 'react-hot-toast';

interface NotificationConsoleProps {
  isSystem?: boolean;
  title: string;
  description: string;
  bellBlockTitle: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  loaderText: string;
}

export const getMappedLink = (link?: string | null) => {
  if (!link || typeof link !== 'string' || link.trim() === '') return null;
  let targetLink = link.trim();
  if (targetLink.startsWith('/admin/system/stores/')) {
    const storeId = targetLink.split('/').pop();
    return `/system/stores/${storeId}/analytics`;
  }
  if (targetLink.startsWith('/admin/system/billing/')) {
    return '/system/billing';
  }
  if (targetLink.startsWith('/admin/settings/billing')) {
    return '/system/billing';
  }
  if (targetLink.startsWith('/system/stores/') && !targetLink.endsWith('/analytics')) {
    const parts = targetLink.split('/');
    const storeId = parts[3];
    if (storeId) {
      return `/system/stores/${storeId}/analytics`;
    }
  }
  return targetLink;
};

export default function NotificationConsole({
  isSystem = false,
  title,
  description,
  bellBlockTitle,
  emptyStateTitle,
  emptyStateDescription,
  loaderText,
}: NotificationConsoleProps) {
  const {
    notifications,
    loading,
    total,
    unreadCount,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    totalPages,
    markAllAsRead,
    handleNotificationClick,
  } = useNotifications({ isSystem });

  const [stores, setStores] = React.useState<any[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = React.useState(false);
  const [broadcasting, setBroadcasting] = React.useState(false);

  // Broadcast Form States
  const [broadcastTitle, setBroadcastTitle] = React.useState('');
  const [broadcastMessage, setBroadcastMessage] = React.useState('');
  const [broadcastType, setBroadcastType] = React.useState('INFO');
  const [broadcastLink, setBroadcastLink] = React.useState('');
  const [broadcastTarget, setBroadcastTarget] = React.useState('global');

  React.useEffect(() => {
    if (isSystem) {
      async function loadStores() {
        try {
          const res = await fetchSuperAdminAPI('/super-admin/stores');
          setStores(res.data || []);
        } catch (error) {
          console.error('Failed to load stores list:', error);
        }
      }
      loadStores();
    }
  }, [isSystem]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      toast.error('Title and message are required');
      return;
    }
    setBroadcasting(true);
    try {
      const headers = { 'x-store-id': '' };
      await fetchAPI('/infra/notifications/broadcast', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
          link: broadcastLink,
          storeId: broadcastTarget,
        }),
      });
      toast.success('Broadcast notification dispatched successfully!');
      setShowBroadcastModal(false);
      // Reset form
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastType('INFO');
      setBroadcastLink('');
      setBroadcastTarget('global');
    } catch (error: any) {
      console.error('Failed to send broadcast:', error);
      toast.error(error.message || 'Failed to dispatch broadcast notification');
    } finally {
      setBroadcasting(false);
    }
  };

  const onRedirect = (link?: string) => {
    if (!link) return;
    if (isSystem) {
      const mapped = getMappedLink(link);
      if (mapped) {
        window.location.href = mapped;
      }
    } else {
      window.location.href = link;
    }
  };

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
        return isSystem
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'WARNING':
        return isSystem
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'DANGER':
        return isSystem
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  const HeaderIcon = isSystem ? ShieldCheck : Bell;
  const iconTextClass = isSystem ? 'text-indigo-650' : 'text-indigo-600';
  const indicatorBg = isSystem ? 'bg-indigo-655' : 'bg-indigo-600';
  const calendarTextClass = isSystem ? 'dark:text-slate-550' : 'dark:text-slate-500';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {description}
          </p>
        </div>
        <div className="flex gap-3">
          {isSystem && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Send Broadcast
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-95"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Main Panel Box */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        {/* Controls Bar */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center ${iconTextClass} shadow-inner`}>
                <HeaderIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{bellBlockTitle}</h2>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {isSystem
                    ? `${unreadCount} Active Platform Indicators (${total} Total Logs)`
                    : `${unreadCount} Unread Alerts (${total} Total)`}
                </span>
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder={isSystem ? "Query telemetry..." : "Search alerts..."}
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
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{loaderText}</p>
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
                  onClick={() => handleNotificationClick(notif, onRedirect)}
                  className={`p-6 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-750/30 flex gap-4 relative cursor-pointer ${
                    !notif.isRead ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                  }`}
                >
                  {!notif.isRead && (
                    <span className={`absolute top-7 left-3 w-2 h-2 rounded-full ${indicatorBg} shadow-md animate-pulse`} />
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
                    
                    {/* Render action/link UI conditionally for system context */}
                    {isSystem ? (
                      <div className="flex items-center justify-between gap-2 flex-wrap mt-3">
                        <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${calendarTextClass} font-bold uppercase tracking-wider`}>
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
                        {getMappedLink(notif.link) && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            View details
                            <ArrowUpRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${calendarTextClass} font-bold uppercase tracking-wider mt-3`}>
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
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-32 text-center">
              <div className="flex flex-col items-center gap-3 opacity-35 max-w-sm mx-auto">
                <Inbox className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                <p className="text-base font-bold text-slate-800 dark:text-white">{emptyStateTitle}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {emptyStateDescription}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
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

      {/* Send Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !broadcasting && setShowBroadcastModal(false)}
              className="absolute inset-0 bg-slate-950/40 dark:bg-slate-955/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative z-10 space-y-6"
            >
              <button
                type="button"
                disabled={broadcasting}
                onClick={() => setShowBroadcastModal(false)}
                className="absolute right-6 top-6 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 rounded-2xl shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Send Broadcast Notification
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Compose and dispatch alert notifications across the system.</p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Recipient Target</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="global">Global Platform Alert (Super Admins Only)</option>
                    <option value="all">Broadcast to All Store Stores (Bulk)</option>
                    {stores.map((t) => (
                      <option key={t.id} value={t.id}>
                        Single Store: {t.name} ({t.subdomain || 'no-subdomain'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Notification Type</label>
                    <select
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="INFO">INFO</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="WARNING">WARNING</option>
                      <option value="DANGER">DANGER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Action Link (Optional)</label>
                    <input
                      type="text"
                      value={broadcastLink}
                      onChange={(e) => setBroadcastLink(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="e.g. /system/billing"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Notification Title</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Scheduled System Maintenance"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Message / Details</label>
                  <textarea
                    required
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none"
                    placeholder="Provide details about this notification..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={broadcasting}
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-750/30 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {broadcasting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Broadcast</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
