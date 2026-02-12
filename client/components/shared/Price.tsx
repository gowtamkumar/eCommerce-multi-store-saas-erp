'use client';

import { useSettings } from "@/hooks/SettingsContext";
import { useEffect, useState } from "react";

interface PriceProps {
  amount: number;
  className?: string;
  showOriginal?: boolean;
  originalAmount?: number;
}

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
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showOriginal && originalAmount && (
        <span className="text-sm text-slate-400 line-through">
          {formatPrice(originalAmount)}
        </span>
      )}
      <span className="font-bold">
        {formatPrice(amount)}
      </span>
    </div>
  );
}
