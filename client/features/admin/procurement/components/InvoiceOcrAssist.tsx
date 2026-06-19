"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { InvoiceOcrResult } from "@/features/admin/ai/types/ai-studio";
import type { Product } from "@/features/admin/product/types";
import type { PurchaseOrder } from "@/features/admin/purchase/types";
import type { Supplier } from "@/features/admin/supplier/types";
import { FileUp, Loader2, ScanLine, Sparkles } from "lucide-react";
import { ChangeEvent, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import {
  applyInvoiceOcrDraft,
  buildInvoiceOcrPayload,
  buildPoContextSummary,
  isInvoiceVisionEligible,
  uploadInvoiceFile,
  type UploadedInvoiceFile,
} from "../lib/buildInvoiceOcrContext";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

interface InvoiceOcrAssistProps {
  suppliers: Supplier[];
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  selectedPoId: string;
  setInvoiceNumber: (value: string) => void;
  setSelectedSupplierId: (value: string) => void;
  setInvoiceDate: (value: string) => void;
  setDueDate: (value: string) => void;
  setAddedItems: Dispatch<
    SetStateAction<Array<{ productId: string; name: string; quantity: number; unitPrice: number }>>
  >;
}

export function InvoiceOcrAssist({
  suppliers,
  products,
  purchaseOrders,
  selectedPoId,
  setInvoiceNumber,
  setSelectedSupplierId,
  setInvoiceDate,
  setDueDate,
  setAddedItems,
}: InvoiceOcrAssistProps) {
  const { configured, loading, generateInvoiceOcr } = useAiGenerate();
  const [uploadedFile, setUploadedFile] = useState<UploadedInvoiceFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [invoiceText, setInvoiceText] = useState("");
  const [useVision, setUseVision] = useState(false);
  const [result, setResult] = useState<InvoiceOcrResult | null>(null);

  const visionEligible = isInvoiceVisionEligible(uploadedFile);

  useEffect(() => {
    setUseVision(visionEligible);
  }, [visionEligible]);

  const canExtract = Boolean(uploadedFile || invoiceText.trim());

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Upload a JPG or PNG invoice scan for vision OCR");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadInvoiceFile(file);
      setUploadedFile(uploaded);
      setUseVision(true);
      setResult(null);
      toast.success("Invoice uploaded — ready to extract");
    } catch {
      toast.error("Failed to upload invoice file");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleExtract = async () => {
    try {
      const data = await generateInvoiceOcr(
        buildInvoiceOcrPayload({
          file: uploadedFile,
          invoiceText,
          useVision,
          poContextSummary: buildPoContextSummary(purchaseOrders, selectedPoId),
        }),
      );
      if (!data) return;

      setResult(data);
      toast.success(
        data.visionUsed
          ? "Invoice extracted from image — review before applying"
          : "Invoice extracted from text — review before applying",
      );
    } catch {
      toast.error("Failed to extract invoice data");
    }
  };

  const handleApply = () => {
    if (!result) return;

    const { matchedCount, unmatchedCount } = applyInvoiceOcrDraft({
      result,
      suppliers,
      products,
      setInvoiceNumber,
      setSelectedSupplierId,
      setInvoiceDate,
      setDueDate,
      setAddedItems,
    });

    toast.success(
      `Draft applied — ${matchedCount} line(s) matched${unmatchedCount ? `, ${unmatchedCount} need manual mapping` : ""}`,
    );
  };

  return (
    <div className="bg-indigo-50/70 dark:bg-indigo-950/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 space-y-4">
      <div className="flex items-center gap-2">
        <ScanLine className="w-4 h-4 text-indigo-600" />
        <h4 className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">
          Invoice OCR (draft extract)
        </h4>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800 bg-white/70 dark:bg-slate-900/40 cursor-pointer hover:bg-white transition-colors">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          ) : (
            <FileUp className="w-5 h-5 text-indigo-500" />
          )}
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">
            {uploadedFile ? uploadedFile.filename : "Upload invoice scan (JPG/PNG)"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => void handleFileChange(e)}
          />
        </label>

        <div className="space-y-2">
          <label className={labelClass}>Or paste invoice text</label>
          <textarea
            value={invoiceText}
            onChange={(e) => {
              setInvoiceText(e.target.value);
              setResult(null);
            }}
            rows={4}
            placeholder="Paste invoice body text if no scan..."
            className={inputClass}
          />
        </div>
      </div>

      {visionEligible && (
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={useVision}
            onChange={(e) => setUseVision(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Use vision OCR on uploaded image
        </label>
      )}

      <AiInlineBar
        title="Extract invoice fields"
        hint="Pull header, dates, amounts, and line items into a draft — apply manually"
        configured={configured}
        loading={loading}
        disabled={!canExtract}
        onGenerate={handleExtract}
      />

      {result && (
        <div className="space-y-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              Extraction preview
              {result.visionUsed ? " (vision)" : " (text)"}
            </div>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest"
            >
              Apply to form
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            <p>
              <span className="font-black text-slate-400 uppercase tracking-wider">Invoice #:</span>{" "}
              {result.invoiceNumber || "—"}
            </p>
            <p>
              <span className="font-black text-slate-400 uppercase tracking-wider">Supplier:</span>{" "}
              {result.supplierName || "—"}
            </p>
            <p>
              <span className="font-black text-slate-400 uppercase tracking-wider">Invoice date:</span>{" "}
              {result.invoiceDate || "—"}
            </p>
            <p>
              <span className="font-black text-slate-400 uppercase tracking-wider">Due date:</span>{" "}
              {result.dueDate || "—"}
            </p>
            <p>
              <span className="font-black text-slate-400 uppercase tracking-wider">Total:</span>{" "}
              {result.totalAmount != null ? `${result.currency || ""} ${result.totalAmount}` : "—"}
            </p>
            <p>
              <span className="font-black text-slate-400 uppercase tracking-wider">Lines:</span>{" "}
              {result.lineItems?.length || 0}
            </p>
          </div>

          {result.lineItems?.length > 0 && (
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {result.lineItems.map((line, index) => (
                <div
                  key={`${line.description}-${index}`}
                  className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg"
                >
                  {line.description} · qty {line.quantity} @ {line.unitPrice}
                  {line.sku ? ` · SKU ${line.sku}` : ""}
                </div>
              ))}
            </div>
          )}

          {result.unmatchedWarnings && result.unmatchedWarnings.length > 0 && (
            <ul className="space-y-1">
              {result.unmatchedWarnings.map((warning) => (
                <li key={warning} className="text-[11px] text-amber-700 dark:text-amber-300">
                  • {warning}
                </li>
              ))}
            </ul>
          )}

          {result.extractionNotes && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{result.extractionNotes}</p>
          )}

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Draft only — verify all fields before Match &amp; Save Invoice.
          </p>
        </div>
      )}
    </div>
  );
}
