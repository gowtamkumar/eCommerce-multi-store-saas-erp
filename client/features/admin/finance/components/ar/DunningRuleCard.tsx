'use client';

import { AlertTriangle, Clock, Edit2, Mail, Trash2 } from 'lucide-react';
import type { ComponentType } from 'react';
import type { DunningRule } from '../../types';

interface ActionMeta {
    label: string;
    color: string;
    icon: ComponentType<{ className?: string }>;
}

const actionMap: Record<DunningRule['action'], ActionMeta> = {
    EMAIL: { label: 'Email Notice Only', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', icon: Mail },
    CREDIT_HOLD: { label: 'Credit Hold Only', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400', icon: AlertTriangle },
    EMAIL_AND_HOLD: { label: 'Email & Credit Hold', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', icon: AlertTriangle },
};

export interface DunningRuleCardProps {
    rule: DunningRule;
    onEdit: (rule: DunningRule) => void;
    onDelete: (id: string) => void;
}

export default function DunningRuleCard({ rule, onEdit, onDelete }: DunningRuleCardProps) {
    const act = actionMap[rule.action] || { label: rule.action, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800', icon: AlertTriangle };
    const showEmail = rule.action === 'EMAIL' || rule.action === 'EMAIL_AND_HOLD';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-xs font-black">
                            L{rule.dunningLevel}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Dunning Level {rule.dunningLevel}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${act.color}`}>
                        {act.label}
                    </span>
                </div>
                <div className="space-y-2 mt-4 text-xs">
                    <p className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Triggers at <strong className="text-slate-800 dark:text-white">{rule.daysOverdue} days</strong> overdue
                    </p>
                    {showEmail && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <p className="font-semibold text-[10px] text-slate-400 uppercase tracking-widest">Email Subject</p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">{rule.emailSubject}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2 justify-end mt-5 border-t border-slate-100 dark:border-slate-700 pt-3">
                <button
                    onClick={() => onEdit(rule)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(rule.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
