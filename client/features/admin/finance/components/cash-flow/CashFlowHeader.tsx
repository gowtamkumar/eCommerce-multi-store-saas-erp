'use client';

export interface CashFlowHeaderProps {
    currencyCode?: string;
    currencySymbol?: string;
}

export default function CashFlowHeader({ currencyCode, currencySymbol }: CashFlowHeaderProps) {
    return (
        <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                Cash Flow <span className="text-indigo-600">Statement</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                Statement of Cash Flows (Direct Method)
                {currencyCode && currencySymbol && (
                    <span className="ml-2 text-indigo-600 dark:text-indigo-400 normal-case tracking-normal font-black">
                        · {currencyCode} ({currencySymbol})
                    </span>
                )}
            </p>
        </div>
    );
}
