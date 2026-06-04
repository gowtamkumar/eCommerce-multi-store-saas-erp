'use client';

export interface AccountingEquationBannerProps {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    formatPrice: (amount: number) => string;
}

export default function AccountingEquationBanner({
    totalAssets,
    totalLiabilities,
    totalEquity,
    formatPrice,
}: AccountingEquationBannerProps) {
    return (
        <div className="bg-linear-to-r from-violet-600 to-blue-600 rounded-3xl p-6 text-white">
            <p className="text-sm font-bold opacity-70 mb-3 uppercase tracking-wider">Accounting Equation</p>
            <div className="flex flex-wrap items-center gap-3 text-lg font-black">
                <span className="bg-white/20 px-4 py-2 rounded-2xl">
                    {formatPrice(totalAssets)}
                    <span className="block text-xs font-normal opacity-70 mt-0.5">Total Assets</span>
                </span>
                <span className="opacity-60 text-2xl">=</span>
                <span className="bg-white/20 px-4 py-2 rounded-2xl">
                    {formatPrice(totalLiabilities)}
                    <span className="block text-xs font-normal opacity-70 mt-0.5">Total Liabilities</span>
                </span>
                <span className="opacity-60 text-2xl">+</span>
                <span className="bg-white/20 px-4 py-2 rounded-2xl">
                    {formatPrice(totalEquity)}
                    <span className="block text-xs font-normal opacity-70 mt-0.5">Total Equity</span>
                </span>
            </div>
        </div>
    );
}
