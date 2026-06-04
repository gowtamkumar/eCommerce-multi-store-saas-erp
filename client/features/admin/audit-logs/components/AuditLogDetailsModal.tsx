import React from 'react';
import type { AuditLog } from '../types';

export interface AuditLogDetailsModalProps {
    log: AuditLog | null;
    onClose: () => void;
}

export default function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
    if (!log) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-250">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Transaction Payload State</h3>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">Log ID: {log.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-850 rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Diagnostic Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Action</p>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{log.action}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Entity</p>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{log.entity}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">IP Address</p>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{log.ipAddress || 'N/A'}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">User Agent</p>
                            <span className="text-xs font-bold text-slate-850 dark:text-slate-200 font-sans truncate block" title={log.userAgent || 'N/A'}>{log.userAgent || 'N/A'}</span>
                        </div>
                    </div>

                    {(log.branchId || log.warehouseId) && (
                        <div className="flex flex-wrap gap-6 p-4 bg-indigo-50/10 dark:bg-indigo-950/5 border border-indigo-500/10 rounded-2xl text-xs font-semibold">
                            {log.branchId && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">Branch ID:</span>
                                    <span className="font-mono text-[11px] bg-slate-150 dark:bg-slate-850 px-2 py-0.5 rounded text-indigo-650 dark:text-indigo-400">{log.branchId}</span>
                                </div>
                            )}
                            {log.warehouseId && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">Warehouse ID:</span>
                                    <span className="font-mono text-[11px] bg-slate-150 dark:bg-slate-850 px-2 py-0.5 rounded text-indigo-650 dark:text-indigo-400">{log.warehouseId}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payloads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Old Value */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Previous State (oldValue)
                            </div>
                            {log.oldValue ? (
                                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-auto max-h-[300px] scrollbar-thin border border-slate-800">
                                    {JSON.stringify(log.oldValue, null, 2)}
                                </pre>
                            ) : (
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-955/20 text-slate-400 text-center text-xs font-semibold border border-slate-200/50 dark:border-slate-800/40">
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
                                <pre className="p-4 rounded-2xl bg-slate-955 text-slate-200 font-mono text-[10px] overflow-auto max-h-[300px] scrollbar-thin border border-slate-800">
                                    {JSON.stringify(log.newValue, null, 2)}
                                </pre>
                            ) : (
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-955/20 text-slate-400 text-center text-xs font-semibold border border-slate-200/50 dark:border-slate-800/40">
                                    No Applied changes
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
