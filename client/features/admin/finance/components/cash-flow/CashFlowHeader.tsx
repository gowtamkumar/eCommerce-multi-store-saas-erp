'use client';

export default function CashFlowHeader() {
    return (
        <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                Cash Flow <span className="text-indigo-600">Statement</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                Statement of Cash Flows (Direct Method)
            </p>
        </div>
    );
}
