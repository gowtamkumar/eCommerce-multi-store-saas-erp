"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { PriceBookRationaleResult } from "@/features/admin/ai/types/ai-studio";
import toast from "react-hot-toast";
import type { PriceBook } from "../types";
import { buildPriceBookRationalePayload } from "../lib/buildPriceBookRationaleContext";

interface PriceBookRationaleAiAssistProps {
  book: PriceBook;
  allBooks: PriceBook[];
  onApply: (result: PriceBookRationaleResult) => void;
}

export function PriceBookRationaleAiAssist({
  book,
  allBooks,
  onApply,
}: PriceBookRationaleAiAssistProps) {
  const { configured, loading, generatePriceBookRationale } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generatePriceBookRationale(
      buildPriceBookRationalePayload(book, allBooks),
    );

    if (!result) return;
    onApply(result);
    toast.success("Pricing rationale generated — internal notes only");
  };

  return (
    <AiInlineBar
      title="AI pricing rationale"
      hint="Internal notes on why this price book exists and when to use it"
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
