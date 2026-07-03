'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Calendar,
    RefreshCcw,
    ShieldAlert,
    Terminal,
    Clock,
    MapPin,
    Laptop,
    ShieldCheck,
    Download,
    Info,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

interface AuditLog {
    id: string;
    actorId: string | null;
    actorName: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    storeId: string;
    branchId?: string | null;
    warehouseId?: string | null;
    oldValue: Record<string, any> | null;
    newValue: Record<string, any> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const ACTION_COLORS: Record<string, string> = {
    CREATE: 'bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50',
    UPDATE: 'bg-amber-100/60 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50',
    DELETE: 'bg-rose-100/60 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/50',
    ROLE_CREATED: 'bg-purple-100/60 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50',
    ROLE_MODIFIED: 'bg-indigo-100/60 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200/50',
    ROLE_DELETED: 'bg-rose-100/60 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/50',
    USER_ROLE_ASSIGNED: 'bg-purple-100/60 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50',
    USER_ROLE_REVOKED: 'bg-amber-100/60 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50',
    PERMISSION_CHECK_FAILED: 'bg-red-100/60 text-red-750 dark:bg-red-950/50 dark:text-red-400 border-red-200/50',
};

interface AuditLogDetailsModalProps {
    log: AuditLog | null;
    onClose: () => void;
}

function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
    if (!log) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/60">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Transaction Payload State</h3>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">Log ID: {log.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 bg-white dark:bg-slate-900">
                    {/* Diagnostic Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Action</p>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{log.action}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Entity</p>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{log.entity}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">IP Address</p>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{log.ipAddress || 'N/A'}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Store ID</p>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono truncate block" title={log.storeId}>{log.storeId}</span>
                        </div>
                    </div>

                    {(log.branchId || log.warehouseId) && (
                        <div className="flex flex-wrap gap-6 p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl text-xs font-semibold">
                            {log.branchId && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 dark:text-slate-400">Branch ID:</span>
                                    <span className="font-mono text-[11px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">{log.branchId}</span>
                                </div>
                            )}
                            {log.warehouseId && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 dark:text-slate-400">Warehouse ID:</span>
                                    <span className="font-mono text-[11px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">{log.warehouseId}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payloads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Old Value */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                                Previous State (oldValue)
                            </div>
                            {log.oldValue ? (
                                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-auto max-h-[300px] scrollbar-thin border border-slate-800">
                                    {JSON.stringify(log.oldValue, null, 2)}
                                </pre>
                            ) : (
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-center text-xs font-semibold border border-slate-200 dark:border-slate-700">
                                    No previous state recorded
                                </div>
                            )}
                        </div>

                        {/* New Value */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Applied Mutation (newValue)
                            </div>
                            {log.newValue ? (
                                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-auto max-h-[300px] scrollbar-thin border border-slate-800">
                                    {JSON.stringify(log.newValue, null, 2)}
                                </pre>
                            ) : (
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-center text-xs font-semibold border border-slate-200 dark:border-slate-700">
                                    No applied changes
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PlatformAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 15, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [actorSearch, setActorSearch] = useState('');
    const [storeFilter, setStoreFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const { fetchAPI } = await import('@/services/api');

            // Build query params
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('limit', '15');
            if (actionFilter) params.append('action', actionFilter);
            if (entityFilter) params.append('entity', entityFilter);
            if (actorSearch) params.append('userId', actorSearch);
            if (storeFilter) params.append('storeId', storeFilter);
            if (branchFilter) params.append('branchId', branchFilter);
            if (warehouseFilter) params.append('warehouseId', warehouseFilter);
            if (fromDate) params.append('from', new Date(fromDate).toISOString());
            if (toDate) params.append('to', new Date(toDate).toISOString());

            const res = await fetchAPI(`/audit-logs?${params.toString()}`);
            if (res?.data) {
                setLogs(res.data.data || []);
                setMeta(res.data.meta || { total: 0, page: 1, limit: 15, totalPages: 1 });
            }
        } catch (err) {
            console.error('Failed to fetch platform audit logs:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, actionFilter, entityFilter, actorSearch, storeFilter, branchFilter, warehouseFilter, fromDate, toDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleResetFilters = () => {
        setActionFilter('');
        setEntityFilter('');
        setActorSearch('');
        setStoreFilter('');
        setBranchFilter('');
        setWarehouseFilter('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    };

    const getInitials = (name: string | null) => {
        if (!name) return 'SYS';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const columns: DataTableColumn<AuditLog>[] = [
        {
            key: 'actor',
            header: 'Actor',
            className: 'px-6 py-4',
            cell: (log) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 dark:border-indigo-500/10 flex items-center justify-center shadow-inner">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{getInitials(log.actorName)}</span>
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                            {log.actorName || 'System Service'}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 max-w-[120px] truncate" title={log.actorId || ''}>
                            {log.actorId || 'system-uuid'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            className: 'px-6 py-4',
            cell: (log) => {
                const actionColor = ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200/50';
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${actionColor}`}>
                        {log.action}
                    </span>
                );
            },
        },
        {
            key: 'storeId',
            header: 'Partition (Store ID)',
            className: 'px-6 py-4',
            cell: (log) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-700 dark:text-slate-350">Merchant Partition</span>
                    <span className="text-[9px] font-mono text-slate-400 max-w-[130px] truncate" title={log.storeId}>{log.storeId}</span>
                </div>
            ),
        },
        {
            key: 'target',
            header: 'Target',
            className: 'px-6 py-4',
            cell: (log) => (
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                        <div className="font-bold text-slate-955 dark:text-slate-100">{log.entity}</div>
                        {log.entityId && (
                            <div className="text-[9px] font-mono text-slate-400 max-w-[100px] truncate" title={log.entityId}>
                                ID: {log.entityId}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'metadata',
            header: 'Metadata',
            className: 'px-6 py-4',
            cell: (log) => (
                <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-450 dark:text-slate-400">
                    {log.ipAddress && (
                        <div className="flex items-center gap-1.5 font-mono">
                            <MapPin className="w-3 h-3 text-indigo-400" />
                            <span>{log.ipAddress}</span>
                        </div>
                    )}
                    {log.userAgent && (
                        <div className="flex items-center gap-1.5 max-w-[150px] truncate font-sans" title={log.userAgent}>
                            <Laptop className="w-3 h-3 text-slate-400" />
                            <span>{log.userAgent}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'timestamp',
            header: 'Timestamp',
            headerClassName: 'text-right',
            className: 'px-6 py-4 text-right',
            cell: (log) => (
                <div>
                    <div className="flex items-center justify-end gap-1 text-slate-900 dark:text-white font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 mt-1">
                        {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                    </div>
                </div>
            ),
        },
        {
            key: 'actions',
            header: '',
            headerClassName: 'text-right',
            className: 'px-6 py-4 text-right',
            cell: (log) => (
                <button
                    onClick={() => setSelectedLog(log)}
                    className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all"
                    title="View Details"
                >
                    <Info className="w-4 h-4" />
                </button>
            ),
        },
    ];

    const dataTablePagination = {
        page: meta.page,
        total: meta.total,
        totalPages: meta.totalPages,
        onPageChange: (page: number) => setCurrentPage(page),
    };

    const dataTablePaginationSummary = (
        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hidden sm:block">
            Page {meta.page} of {meta.totalPages} ({meta.total} Total Logs)
        </span>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-display tracking-tight">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Platform Audit Logs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-lg">
                        System-wide immutable trail monitoring transactions across all merchant accounts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const apiBase = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:4000';
                            const qs = new URLSearchParams();
                            if (actionFilter) qs.set('action', actionFilter);
                            if (storeFilter) qs.set('storeId', storeFilter);
                            if (fromDate) qs.set('from', new Date(fromDate).toISOString());
                            if (toDate) qs.set('to', new Date(toDate).toISOString());
                            window.open(`${apiBase}/super-admin/audit-logs/export?${qs}`, '_blank');
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-semibold border border-slate-200 dark:border-slate-700"
                        title="Export CSV"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-110 active:rotate-180 duration-500 shadow-sm"
                        title="Refresh Logs"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    <Search className="w-4 h-4 text-indigo-500" />
                    Filter Logs
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-4">
                    {/* Action Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action Type</label>
                        <select
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all cursor-pointer"
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                            <option value="ROLE_CREATED">ROLE_CREATED</option>
                            <option value="ROLE_MODIFIED">ROLE_MODIFIED</option>
                            <option value="ROLE_DELETED">ROLE_DELETED</option>
                            <option value="USER_ROLE_ASSIGNED">USER_ROLE_ASSIGNED</option>
                            <option value="USER_ROLE_REVOKED">USER_ROLE_REVOKED</option>
                            <option value="STORE_STATUS_CHANGE">STORE_STATUS_CHANGE</option>
                            <option value="STORE_PLAN_CHANGE">STORE_PLAN_CHANGE</option>
                            <option value="STORE_FEATURE_OVERRIDE">STORE_FEATURE_OVERRIDE</option>
                            <option value="IMPERSONATE_START">IMPERSONATE_START</option>
                            <option value="PERMISSION_CHECK_FAILED">SECURITY ALERT</option>
                        </select>
                    </div>

                    {/* Target Entity */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entity Model</label>
                        <select
                            value={entityFilter}
                            onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all cursor-pointer"
                        >
                            <option value="">All Entities</option>
                            <option value="Product">Product</option>
                            <option value="Order">Order</option>
                            <option value="Role">Role</option>
                            <option value="User">User</option>
                            <option value="UserRoleAssignment">User Role Assignment</option>
                            <option value="UserPermissionOverride">Permission Override</option>
                        </select>
                    </div>

                    {/* Actor Search */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actor User ID</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={actorSearch}
                                onChange={(e) => { setActorSearch(e.target.value); setCurrentPage(1); }}
                                placeholder="Actor UUID..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all placeholder-slate-355 dark:placeholder-slate-700"
                            />
                        </div>
                    </div>

                    {/* Store ID */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Store ID</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={storeFilter}
                                onChange={(e) => { setStoreFilter(e.target.value); setCurrentPage(1); }}
                                placeholder="Store UUID..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all placeholder-slate-355 dark:placeholder-slate-700"
                            />
                        </div>
                    </div>

                    {/* Branch ID */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Branch ID</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={branchFilter}
                                onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
                                placeholder="Branch UUID..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all placeholder-slate-355 dark:placeholder-slate-700"
                            />
                        </div>
                    </div>

                    {/* Warehouse ID */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Warehouse ID</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={warehouseFilter}
                                onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
                                placeholder="Warehouse UUID..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all placeholder-slate-355 dark:placeholder-slate-700"
                            />
                        </div>
                    </div>

                    {/* From Date */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-indigo-500" /> From Date
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all"
                        />
                    </div>

                    {/* To Date */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-indigo-500" /> To Date
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all"
                        />
                    </div>
                </div>
                {(actionFilter || entityFilter || actorSearch || storeFilter || branchFilter || warehouseFilter || fromDate || toDate) && (
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleResetFilters}
                            className="text-xs font-black text-rose-500 hover:text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/10 transition-colors"
                        >
                            Reset Active Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <DataTable
                data={logs}
                columns={columns}
                getRowKey={log => log.id}
                loading={loading}
                loadingLabel="Scanning infrastructure logs..."
                emptyLabel={
                    <div className="flex flex-col items-center gap-3 opacity-30 py-12">
                        <Terminal className="w-12 h-12" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Zero audit records matched your filter criteria</p>
                    </div>
                }
                containerClassName="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[28px] border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden"
                pagination={dataTablePagination}
                paginationSummary={dataTablePaginationSummary}
            />

            <AuditLogDetailsModal
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
            />
        </div>
    );
}
