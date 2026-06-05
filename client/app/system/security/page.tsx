'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    ShieldAlert,
    Lock,
    Globe,
    Terminal,
    Clock,
    Plus,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserX,
    Eye
} from 'lucide-react';
import { fetchSuperAdminAPI } from '@/services/superAdminApi';
import toast from 'react-hot-toast';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

interface ImpersonationLog {
    id: string;
    action: string;
    actorName: string;
    entityId: string;
    newValue?: {
        targetUserId?: string;
        targetUsername?: string;
    };
    ipAddress?: string;
    createdAt: string;
}

export default function SecurityDashboardPage() {
    const [logs, setLogs] = useState<ImpersonationLog[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    // IP Allowlist State
    const [ips, setIps] = useState<string[]>(['127.0.0.1', '192.168.1.1']);
    const [newIp, setNewIp] = useState('');

    // 2FA State
    const [is2faEnforced, setIs2faEnforced] = useState(false);

    // Fetch Impersonation Logs
    const fetchLogs = useCallback(async (pageNum: number) => {
        setIsLoadingLogs(true);
        try {
            const res = await fetchSuperAdminAPI(`/super-admin/security/impersonation-logs?page=${pageNum}&limit=5`);
            if (res.success) {
                // The audit log service returns logs inside data.data and pagination inside data
                setLogs(res.data?.data || []);
                setTotalPages(res.data?.totalPages || 1);
                setTotalLogs(res.data?.total || 0);
            }
        } catch (e: any) {
            console.error('Error fetching impersonation logs:', e);
            toast.error('Failed to load impersonation logs');
        } finally {
            setIsLoadingLogs(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs(page);
    }, [page, fetchLogs]);

    const handleAddIp = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newIp.trim();
        // Simple IP v4 regex check
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipRegex.test(trimmed)) {
            toast.error('Invalid IP Address format');
            return;
        }
        if (ips.includes(trimmed)) {
            toast.error('IP Address already in allowlist');
            return;
        }
        setIps(prev => [...prev, trimmed]);
        setNewIp('');
        toast.success(`IP ${trimmed} added to allowlist`);
    };

    const handleRemoveIp = (ipToRemove: string) => {
        setIps(prev => prev.filter(ip => ip !== ipToRemove));
        toast.success(`IP ${ipToRemove} removed from allowlist`);
    };

    const handleToggle2fa = () => {
        setIs2faEnforced(prev => {
            const next = !prev;
            toast.success(`Super Admin 2FA Policy ${next ? 'Enforced' : 'Disabled'}`);
            return next;
        });
    };

    const columns: DataTableColumn<ImpersonationLog>[] = [
        {
            key: 'actorName',
            header: 'Session Operator',
            cell: (log) => <span className="font-bold text-slate-850 dark:text-slate-200">{log.actorName}</span>
        },
        {
            key: 'targetIdentity',
            header: 'Target Identity',
            cell: (log) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {log.newValue?.targetUsername || 'Unknown User'}
                    </span>
                    <span className="text-xs text-slate-400">{log.newValue?.targetUserId || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'ipAddress',
            header: 'IP Address',
            className: 'text-xs font-mono text-slate-500 dark:text-slate-400',
            cell: (log) => <span>{log.ipAddress || '127.0.0.1'}</span>
        },
        {
            key: 'createdAt',
            header: 'Date / Time',
            className: 'text-xs text-slate-400 font-bold',
            cell: (log) => <span>{new Date(log.createdAt).toLocaleString()}</span>
        },
        {
            key: 'action',
            header: 'Security Action',
            cell: (log) => (
                <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                    <ShieldAlert className="w-3 h-3" /> IMPERSONATION
                </span>
            )
        }
    ];

    const pagination = {
        page,
        total: totalLogs,
        totalPages,
        onPageChange: (p: number) => setPage(p)
    };

    const paginationSummary = (
        <span className="text-xs text-slate-400 font-bold">
            Showing page {page} of {totalPages} ({totalLogs} events logged)
        </span>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security & Access Audits</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage session profiles, enforce login configurations, and trace super-admin impersonation activity.
                </p>
            </div>

            {/* Top Cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2FA Enforce policies */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between min-h-[220px]">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Super Admin 2FA</h3>
                            <Lock className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Enforcement Policy</h4>
                        <p className="text-xs text-slate-500 mt-2">
                            Enforce multi-factor authentication (TOTP) for all Super Admin account profiles.
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Policy status: {is2faEnforced ? (
                                <span className="text-emerald-500">ENFORCED</span>
                            ) : (
                                <span className="text-slate-400">OPTIONAL</span>
                            )}
                        </span>
                        <button
                            onClick={handleToggle2fa}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${is2faEnforced ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${is2faEnforced ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>

                {/* IP Allowlist configuration */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between min-h-[220px]">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">IP Allowlist</h3>
                            <Globe className="w-5 h-5 text-indigo-500" />
                        </div>
                        
                        <form onSubmit={handleAddIp} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add IP (e.g. 8.8.8.8)"
                                value={newIp}
                                onChange={(e) => setNewIp(e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2 mt-4 max-h-[80px] overflow-y-auto pr-1">
                            {ips.map((ip) => (
                                <span key={ip} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
                                    {ip}
                                    <button type="button" onClick={() => handleRemoveIp(ip)} className="text-slate-400 hover:text-rose-500">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active super admin sessions */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between min-h-[220px]">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Active Sessions</h3>
                            <Terminal className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Active Terminals</h4>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Super Admin (You)</span>
                                <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">Current</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Active since 32m ago
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Impersonation Logs Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="p-8 border-b border-slate-100 dark:border-slate-700/60 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Impersonation Registry</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Trace super admin store login sessions</p>
                    </div>
                    <button
                        onClick={() => fetchLogs(page)}
                        disabled={isLoadingLogs}
                        className="p-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 border border-slate-100 dark:border-slate-800 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin text-indigo-500' : ''}`} />
                    </button>
                </div>

                <DataTable
                    data={logs}
                    columns={columns}
                    getRowKey={(log) => log.id}
                    loading={isLoadingLogs}
                    loadingLabel="Refreshing impersonation trace..."
                    emptyLabel="No impersonation logs recorded in database."
                    containerClassName="border-0 shadow-none rounded-t-none rounded-b-[2rem] bg-transparent"
                    pagination={pagination}
                    paginationSummary={paginationSummary}
                />
            </div>
        </div>
    );
}
