'use client';

import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import type { DunningRule } from '../../types';
import DunningRuleCard from './DunningRuleCard';

export interface DunningRulesViewProps {
    rules: DunningRule[];
    loading: boolean;
    onCreate: () => void;
    onEdit: (rule: DunningRule) => void;
    onDelete: (id: string) => void;
}

export default function DunningRulesView({ rules, loading, onCreate, onEdit, onDelete }: DunningRulesViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dunning Notice Rules</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Automate notices and credit freezes as invoices age</p>
                </div>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm font-bold shadow-md shadow-indigo-500/10"
                >
                    <Plus className="w-4 h-4" /> Add Rule
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && rules.length === 0 ? (
                    <div className="col-span-full py-12 flex justify-center items-center text-slate-500 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading rules...
                    </div>
                ) : rules.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40 text-orange-500" />
                        <p className="font-semibold text-sm">No Dunning Rules Configured</p>
                        <p className="text-xs">Create a rule to automate notices and credit holds.</p>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <DunningRuleCard key={rule.id} rule={rule} onEdit={onEdit} onDelete={onDelete} />
                    ))
                )}
            </div>
        </div>
    );
}
