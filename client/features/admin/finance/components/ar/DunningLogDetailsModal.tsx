'use client';

import { X } from 'lucide-react';
import type { DunningLog } from '../../types';

export interface DunningLogDetailsModalProps {
    log: DunningLog;
    onClose: () => void;
}

export default function DunningLogDetailsModal({ log, onClose }: DunningLogDetailsModalProps) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white">Sent Notice Preview</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Subject</p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">{log.emailSubject}</p>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Recipient</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{log.recipientEmail}</p>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Body</p>
                        <div className="mt-1 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 text-xs">
                            {log.emailBody}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
