'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Edit2, Trash2, Building2, Check, ShieldAlert } from 'lucide-react';
import { PosRegisterTerminal } from '../types';

interface RegistersTabProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredRegisters: PosRegisterTerminal[];
    onEdit: (reg: PosRegisterTerminal) => void;
    onDelete: (id: string) => void;
}

export default function RegistersTab({
    searchQuery,
    setSearchQuery,
    filteredRegisters,
    onEdit,
    onDelete,
}: RegistersTabProps) {
    return (
        <div className="space-y-6">
            {/* Filter / Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search registers by name or linked branch..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                />
            </div>

            {/* Registers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRegisters.map((reg) => (
                    <motion.div
                        key={reg.id}
                        layout
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
                                    <Monitor className="w-6 h-6 text-brand-600" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onEdit(reg)} 
                                        className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                        title="Edit Register"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(reg.id)} 
                                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                        title="Delete Register"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{reg.name}</h5>
                            
                            {reg.branch && (
                                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1 rounded-lg w-fit">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {reg.branch.name}
                                </div>
                            )}

                            <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/50 pt-4">
                                <div className="flex items-center gap-2">
                                    <Check className={`w-4 h-4 ${reg.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}`} />
                                    <span className="font-bold">
                                        {reg.status === 'ACTIVE' ? (
                                            <span className="text-emerald-600 dark:text-emerald-400">Terminal Online / Ready</span>
                                        ) : (
                                            <span className="text-slate-400">Terminal Inactive / Offline</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredRegisters.length === 0 && (
                    <div className="col-span-full py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        <span>No register terminals found. Set one up to allow opening cashier shifts and collecting sales.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
