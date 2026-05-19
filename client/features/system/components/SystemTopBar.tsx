'use client';

import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, ShieldCheck, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface SystemTopBarProps {
    session: any;
    onMenuClick?: () => void;
}

export default function SystemTopBar({ session, onMenuClick }: SystemTopBarProps) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef<HTMLDivElement>(null);

    const userName = session?.user?.name || session?.user?.username || 'Super Admin';

    const fetchNotifications = async () => {
        try {
            const data = await fetchAPI('/infra/notifications?limit=10');
            if (data.success && data.data) {
                setNotifications(data.data.notifications || []);
                setUnreadCount(data.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch platform notifications:', error);
        }
    };

    useEffect(() => {
        if (session) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    // Close notifications dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        try {
            await fetchAPI('/infra/notifications/read-all', { method: 'PATCH' });
            setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            try {
                await fetchAPI(`/infra/notifications/${notif.id}/read`, { method: 'PATCH' });
                setNotifications(notifications.map((n) =>
                    n.id === notif.id ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        if (notif.link) {
            window.location.href = notif.link;
        }
    };

    // Helper for styling notification types
    const getTypeStyles = (type?: string) => {
        switch (type) {
            case 'SUCCESS':
                return { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
            case 'WARNING':
                return { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
            case 'DANGER':
                return { bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
            default:
                return { bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 -ml-2 mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50 rounded-full border border-indigo-200 dark:border-indigo-900/50">
                    System Control
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/50"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotificationOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Platform Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-indigo-600 rounded-full">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                    {notifications.length === 0 ? (
                                        <div className="py-10 px-4 text-center">
                                            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">All caught up!</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No new platform alerts.</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => {
                                            const styles = getTypeStyles(notif.type);
                                            return (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors flex gap-3 ${
                                                        !notif.isRead ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                                                {notif.title}
                                                            </p>
                                                            <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full uppercase ${styles.bg}`}>
                                                                {notif.type || 'SYSTEM'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-2 font-medium">
                                                            {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Widget */}
                <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center rounded-lg border border-indigo-200 dark:border-indigo-900/50">
                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                            {userName}
                        </p>
                        <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Super Admin
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
