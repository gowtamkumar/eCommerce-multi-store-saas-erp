'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
    FileText, 
    Search, 
    Calendar, 
    RefreshCcw, 
    ChevronDown, 
    ChevronUp, 
    Activity, 
    ShieldAlert, 
    Terminal, 
    User, 
    Clock, 
    MapPin, 
    Laptop,
    ChevronLeft,
    ChevronRight,
    ArrowRight
} from 'lucide-react';

interface AuditLog {
    id: string;
    actorId: string | null;
    actorName: string | null;
    action: string;
    entity: string;
    entityId: string | null;
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
    PERMISSION_CHECK_FAILED: 'bg-red-100/60 text-red-750 dark:bg-red-950/50 dark:text-red-400 border-red-200/50 animate-pulse',
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 15, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [actorSearch, setActorSearch] = useState('');
    const [tenantIdFilter, setTenantIdFilter] = useState('');
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
            if (actorSearch) params.append('userId', actorSearch); // backend filters by userId
            if (tenantIdFilter) params.append('tenantId', tenantIdFilter);
            if (fromDate) params.append('from', new Date(fromDate).toISOString());
            if (toDate) params.append('to', new Date(toDate).toISOString());

            const res = await fetchAPI(`/audit-logs?${params.toString()}`);
            if (res?.data) {
                setLogs(res.data.data || []);
                setMeta(res.data.meta || { total: 0, page: 1, limit: 15, totalPages: 1 });
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, actionFilter, entityFilter, actorSearch, tenantIdFilter, fromDate, toDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleResetFilters = () => {
        setActionFilter('');
        setEntityFilter('');
        setActorSearch('');
        setTenantIdFilter('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    };

    const getInitials = (name: string | null) => {
        if (!name) return 'SYS';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-display tracking-tight">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                            <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Security & Audit Logs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-lg">
                        Real-time immutable history of all operational events and access modifications.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLogs}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-110 active:rotate-180 duration-500 shadow-sm"
                        title="Refresh Audit Logs"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Premium Filter Drawer/Panel */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    <Search className="w-4 h-4 text-indigo-500" />
                    Filter Activity logs
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
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
                                placeholder="UUID Search..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all placeholder-slate-355 dark:placeholder-slate-700"
                            />
                        </div>
                    </div>

                    {/* Tenant ID (Super-Admin) */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tenant ID</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={tenantIdFilter}
                                onChange={(e) => { setTenantIdFilter(e.target.value); setCurrentPage(1); }}
                                placeholder="All Tenants..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all placeholder-slate-355 dark:placeholder-slate-700"
                                title="Filter by specific tenant UUID (Global Administrator feature)"
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
                {(actionFilter || entityFilter || actorSearch || tenantIdFilter || fromDate || toDate) && (
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

            {/* Audit Log Timeline / Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 rounded-full" />
                        <div className="absolute top-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving security event log...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850 rounded-2xl flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">No Audit Records Found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-semibold">
                            No security actions matched the selected filter configuration. Try adjusting your query parameters.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[28px] border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 w-10"></th>
                                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Actor Profile</th>
                                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Security Action</th>
                                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Model</th>
                                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Metadata</th>
                                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {logs.map((log) => {
                                        const isExpanded = expandedLogId === log.id;
                                        const actionColor = ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200/50';
                                        
                                        return (
                                            <React.Fragment key={log.id}>
                                                <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${isExpanded ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                        >
                                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 dark:border-indigo-500/10 flex items-center justify-center shadow-inner">
                                                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{getInitials(log.actorName)}</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                    {log.actorName || 'System Service'}
                                                                    {!log.actorName && (
                                                                        <span className="text-[9px] px-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded">Daemon</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 font-mono tracking-tight mt-0.5 max-w-[140px] truncate" title={log.actorId || ''}>
                                                                    {log.actorId || 'system-uuid'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border ${actionColor}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Terminal className="w-3.5 h-3.5 text-slate-400" />
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-950 dark:text-slate-100">{log.entity}</div>
                                                                {log.entityId && (
                                                                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-550 max-w-[120px] truncate" title={log.entityId}>
                                                                        ID: {log.entityId}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1 text-[11px] font-medium text-slate-450 dark:text-slate-400">
                                                            {log.ipAddress && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <MapPin className="w-3 h-3 text-indigo-400" />
                                                                    <span className="font-mono">{log.ipAddress}</span>
                                                                </div>
                                                            )}
                                                            {log.userAgent && (
                                                                <div className="flex items-center gap-1.5 max-w-[190px] truncate" title={log.userAgent}>
                                                                    <Laptop className="w-3 h-3 text-slate-400" />
                                                                    <span>{log.userAgent}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                                                            {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Details Section */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                                                        <td colSpan={6} className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/60">
                                                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Transaction Payload State</div>
                                                                    <span className="text-[10px] font-bold text-slate-400 font-mono">Log ID: {log.id}</span>
                                                                </div>

                                                                {(log.branchId || log.warehouseId) && (
                                                                    <div className="flex flex-wrap gap-6 p-4 bg-indigo-50/10 dark:bg-indigo-950/5 border border-indigo-500/10 rounded-2xl text-xs font-semibold">
                                                                        {log.branchId && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-slate-450 dark:text-slate-400">Audited Branch ID:</span>
                                                                                <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{log.branchId}</span>
                                                                            </div>
                                                                        )}
                                                                        {log.warehouseId && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-slate-450 dark:text-slate-400">Audited Warehouse ID:</span>
                                                                                <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{log.warehouseId}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    {/* Old Value */}
                                                                    <div className="space-y-2">
                                                                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-450" />
                                                                            Previous State (old_value)
                                                                        </div>
                                                                        {log.oldValue ? (
                                                                            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-auto max-h-[220px] scrollbar-thin border border-slate-800">
                                                                                {JSON.stringify(log.oldValue, null, 2)}
                                                                            </pre>
                                                                        ) : (
                                                                            <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 text-center text-xs font-semibold border border-slate-200/50 dark:border-slate-800/40">
                                                                                No previous state recorded (Action: CREATE / SPECIAL)
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* New Value */}
                                                                    <div className="space-y-2">
                                                                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                                            Applied Mutation (new_value)
                                                                        </div>
                                                                        {log.newValue ? (
                                                                            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-auto max-h-[220px] scrollbar-thin border border-slate-800">
                                                                                {JSON.stringify(log.newValue, null, 2)}
                                                                            </pre>
                                                                        ) : (
                                                                            <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 text-center text-xs font-semibold border border-slate-200/50 dark:border-slate-800/40">
                                                                                No Applied changes (Action: DELETE / CHECK)
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {meta.totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Page {meta.page} of {meta.totalPages} ({meta.total} Total Logs)
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 transition-all active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.totalPages))}
                                    disabled={currentPage === meta.totalPages}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 transition-all active:scale-95"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
