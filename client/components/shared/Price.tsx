'use client';

import { useSettings } from "@/hooks/SettingsContext";
import { PriceProps } from "@/types/inex";
import { useEffect, useState } from "react";

export default function Price({ amount, className = "", showOriginal = false, originalAmount }: PriceProps) {
  const { formatPrice, convertPrice, selectedCurrency } = useSettings();
  const [mounted, setMounted] = useState(false);

  // Use useEffect to ensure we only render the converted price on the client
  // to avoid hydration mismatch, but we initialize with server-side compatible logic
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or the raw amount with $ during SSR to avoid mismatch
    return <span className={className}>${Number(amount).toFixed(2)}</span>;
  }

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {showOriginal && originalAmount && (
        <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium opacity-80">
          {formatPrice(originalAmount)}
        </span>
      )}
      <span className="font-black tracking-tight">
        {formatPrice(amount)}
      </span>
    </div>
  );
}
