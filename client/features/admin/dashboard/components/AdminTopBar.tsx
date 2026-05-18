'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    Bell,
    Building2,
    ChevronDown,
    CreditCard,
    LogOut,
    Menu,
    MessageSquare,
    Search,
    Send,
    Settings,
    Sparkles,
    User,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface AdminTopBarProps {
    logo?: string;
    brandName: string;
    session: any;
    onMenuClick: () => void;
    onLogout: () => void;
}

export default function AdminTopBar({
    logo,
    brandName,
    session,
    onMenuClick,
    onLogout,
}: AdminTopBarProps) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [chatMessage, setChatMessage] = useState('');

    const [branches, setBranches] = useState<any[]>([]);
    const [activeBranch, setActiveBranch] = useState<any>(null);
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const branchDropdownRef = useRef<HTMLDivElement>(null);

    const userName = session?.user?.name || session?.user?.username || 'Administrator';
    const userEmail = session?.user?.email || 'admin@store.com';
    const userRole = session?.user?.role || 'Admin';

    // Mock Notifications
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'New Order Received',
            description: 'Order #ORD-9842 has been placed by Rahim Khan.',
            time: '5 mins ago',
            type: 'order',
            unread: true,
        },
        {
            id: 2,
            title: 'Low Stock Warning',
            description: 'iPhone 15 Pro is below the threshold (2 remaining).',
            time: '1 hour ago',
            type: 'stock',
            unread: true,
        },
        {
            id: 3,
            title: 'New Staff Invitation Accepted',
            description: 'Jamil Ahmed joined as Store Manager.',
            time: '4 hours ago',
            type: 'team',
            unread: false,
        },
    ]);

    // Mock Live Chat Messages
    const [chatMessages, setChatMessages] = useState([
        { id: 1, sender: 'Support Staff', message: 'Hello! How can I assist you with the store management today?', time: '10:30 AM', self: false },
        { id: 2, sender: 'You', message: 'I need to check the monthly sales payout reports.', time: '10:32 AM', self: true },
        { id: 3, sender: 'Support Staff', message: 'Absolutely! You can find it in the Financial Reports under Profit & Loss or Export center.', time: '10:33 AM', self: false },
    ]);

    const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

    // Load active operating branches list
    useEffect(() => {
        const fetchBranchesList = async () => {
            try {
                const { getBranches } = await import('@/services/organization');
                const res = await getBranches();
                if (res.success && res.data) {
                    const branchItems = res.data.items || res.data || [];
                    setBranches(branchItems);
                    
                    const savedBranchId = localStorage.getItem('activeBranchId');
                    let active = branchItems.find((b: any) => b.id === savedBranchId);
                    
                    if (!active && branchItems.length > 0) {
                        active = branchItems[0];
                        localStorage.setItem('activeBranchId', active.id);
                    }
                    setActiveBranch(active);
                }
            } catch (error) {
                console.error('Failed to load branches in top bar:', error);
            }
        };

        fetchBranchesList();
    }, []);

    // Click outside listener to close dropdowns
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setIsNotificationOpen(false);
            }
            if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
                setIsChatOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
            if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) {
                setIsBranchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBranchSwitch = (branch: any) => {
        localStorage.setItem('activeBranchId', branch.id);
        setActiveBranch(branch);
        setIsBranchDropdownOpen(false);
        window.dispatchEvent(new Event('branch-changed'));
        window.location.reload();
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const newMsg = {
            id: Date.now(),
            sender: 'You',
            message: chatMessage,
            time: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
            self: true,
        };

        setChatMessages([...chatMessages, newMsg]);
        setChatMessage('');

        // Mock automated support response after 1 second
        setTimeout(() => {
            setChatMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'Support Staff',
                    message: 'Your query has been logged. Our operations desk is reviewing the ledgers.',
                    time: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
                    self: false,
                },
            ]);
        }, 1200);
    };

    // Get initials for profile avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <>
            <header className="sticky top-0 z-30 flex items-center justify-between w-full h-20 px-6 md:px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors font-display print:hidden">
                {/* Mobile Menu trigger & Brand logo */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="md:hidden flex items-center gap-2">
                        {logo ? (
                            <img src={logo} alt={brandName} className="h-8 w-auto object-contain" />
                        ) : (
                            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                                {brandName.substring(0, 4)}
                                <span className="text-indigo-600">{brandName.substring(4)}</span>
                            </span>
                        )}
                    </div>

                    {/* Quick Search */}
                    <div className="hidden md:flex items-center relative w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search records, invoices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                        />
                    </div>

                    {/* Premium Branch Switcher */}
                    {branches.length > 0 && (
                        <div className="relative" ref={branchDropdownRef}>
                            <button
                                onClick={() => {
                                    setIsBranchDropdownOpen(!isBranchDropdownOpen);
                                    setIsChatOpen(false);
                                    setIsNotificationOpen(false);
                                    setIsProfileOpen(false);
                                }}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/30 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 text-xs font-bold font-display shadow-sm"
                            >
                                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="max-w-[120px] truncate">{activeBranch?.name || 'Loading branch...'}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            <AnimatePresence>
                                {isBranchDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-indigo-500/10 overflow-hidden z-50 p-1.5"
                                    >
                                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Operating Branch</span>
                                        </div>
                                        <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                                            {branches.map((b: any) => (
                                                <button
                                                    key={b.id}
                                                    onClick={() => handleBranchSwitch(b)}
                                                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-semibold ${
                                                        activeBranch?.id === b.id
                                                            ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold'
                                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    <span className="truncate">{b.name}</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono font-bold text-slate-400 dark:text-slate-500">
                                                        {b.code}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Actions: Notifications, Profile */}
                <div className="flex items-center gap-3">
                    {/* Notifications Bell Trigger */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => {
                                setIsNotificationOpen(!isNotificationOpen);
                                setIsChatOpen(false);
                                setIsProfileOpen(false);
                            }}
                            className={`p-2.5 rounded-xl border transition-all relative ${isNotificationOpen
                                    ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                }`}
                            title="Alert System Hub"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[8px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                                    {unreadNotificationsCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-indigo-500/10 overflow-hidden z-50 font-display"
                                >
                                    {/* Header */}
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-indigo-500" />
                                            <span className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider">Alert Center</span>
                                        </div>
                                        {unreadNotificationsCount > 0 && (
                                            <button onClick={markAllAsRead} className="text-[10px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold transition-colors">
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    {/* Body Notifications List */}
                                    <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-xs font-bold">All clear!</p>
                                                <p className="text-[10px] mt-0.5">No new notifications.</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 flex gap-3 relative ${n.unread ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                                                        }`}
                                                >
                                                    {n.unread && (
                                                        <span className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                                    )}
                                                    <div className="flex-1">
                                                        <span className="font-bold text-xs text-slate-800 dark:text-white">{n.title}</span>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">{n.description}</p>
                                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-2 block">{n.time}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                    {/* Profile Account Trigger */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => {
                                setIsProfileOpen(!isProfileOpen);
                                setIsChatOpen(false);
                                setIsNotificationOpen(false);
                            }}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-black shadow-md flex items-center justify-center">
                                {getInitials(userName)}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="font-bold text-xs text-slate-800 dark:text-white capitalize leading-none mb-0.5">{userName}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{userRole}</span>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-indigo-500/10 overflow-hidden z-50 font-display p-1.5"
                                >
                                    {/* Header */}
                                    <div className="px-3.5 py-3 border-b border-slate-100 dark:border-slate-700/50">
                                        <span className="font-bold text-xs text-slate-800 dark:text-white block capitalize">{userName}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block truncate">{userEmail}</span>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1 space-y-0.5">
                                        <a
                                            href="/admin/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-all font-bold"
                                        >
                                            <User className="w-3.5 h-3.5 text-indigo-500" /> Account Settings
                                        </a>
                                        <a
                                            href="/admin/settings/billing"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-all font-bold"
                                        >
                                            <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Billing & Plan
                                        </a>
                                        <a
                                            href="/admin/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-all font-bold"
                                        >
                                            <Settings className="w-3.5 h-3.5 text-indigo-500" /> Store Settings
                                        </a>
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-700/50 my-1" />

                                    {/* Logout */}
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            onLogout();
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all font-bold"
                                    >
                                        <LogOut className="w-3.5 h-3.5" /> Sign Out Account
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Floating Live Support Chat (Fixed bottom-right corner) */}
            <div className="fixed bottom-6 right-6 z-50 font-display flex flex-col items-end print:hidden" ref={chatRef}>
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-indigo-500/15 overflow-hidden flex flex-col mb-4 animate-in fade-in slide-in-from-bottom-5 duration-200"
                        >
                            {/* Header */}
                            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                                            HQ
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-indigo-600 animate-pulse" />
                                    </div>
                                    <div>
                                        <span className="font-extrabold text-xs block tracking-tight">Merchant Help Desk</span>
                                        <span className="text-[10px] text-indigo-100 font-medium block">Typically replies in a few minutes</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Message Logs */}
                            <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/10">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">{msg.sender}</span>
                                        <div
                                            className={`px-3.5 py-2 rounded-2xl text-xs max-w-[85%] leading-relaxed ${msg.self
                                                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/10'
                                                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                                }`}
                                        >
                                            {msg.message}
                                        </div>
                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{msg.time}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Send Form */}
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type support query..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Action Button */}
                <button
                    onClick={() => {
                        setIsChatOpen(!isChatOpen);
                        setIsNotificationOpen(false);
                        setIsProfileOpen(false);
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-indigo-500/10 relative ${isChatOpen
                            ? 'bg-slate-900 dark:bg-slate-700 text-white rotate-90 shadow-slate-900/20'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                        }`}
                    title="Live Support Chat"
                >
                    {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                    {!isChatOpen && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse" />
                    )}
                </button>
            </div>
        </>
    );
}
