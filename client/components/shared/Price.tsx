'use client';

import { useSettings } from "@/hooks/SettingsContext";
import { PriceProps } from "@/types/inex";

export default function Price({ amount, className = "", showOriginal = false, originalAmount }: PriceProps) {
  const { formatPrice } = useSettings();

  return (
    <span className={`inline-flex flex-col gap-0.5 ${className}`}>
      {showOriginal && originalAmount != null && (
        <span
          className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium opacity-80"
          suppressHydrationWarning
        >
          {formatPrice(originalAmount)}
        </span>
      )}
      <span className="font-black tracking-tight" suppressHydrationWarning>
        {formatPrice(amount)}
      </span>
    </span>
  );
}
