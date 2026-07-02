"use client";

import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import {
  PRODUCT_IMPORT_TEMPLATE,
  parseProductImportCsv,
  type ProductImportRow,
} from "@/features/product/admin/lib/parseProductImportCsv";
import { fetchAPI } from "@/services/api";
import { Download, Loader2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  importBatchId: string;
  createdCount: number;
  skippedCount: number;
  pendingDescriptionProductIds: string[];
  descriptionJobId?: string | null;
  errors: Array<{ row: number; name?: string; message: string }>;
}

export default function ProductImportModal({ isOpen, onClose, onSuccess }: ProductImportModalProps) {
  const { configured } = useAiGenerate();
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ProductImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ line: number; message: string }>>([]);
  const [generateDescriptions, setGenerateDescriptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFileName(null);
    setRows([]);
    setParseErrors([]);
    setResult(null);

    void fetchAPI("/stores/ai-config")
      .then((res) => {
        const enabled = Boolean(res.data?.enabled);
        const bulkDefault = res.data?.automation?.bulkDescriptionOnImport !== false;
        setGenerateDescriptions(enabled && bulkDefault);
      })
      .catch(() => {
        setGenerateDescriptions(configured === true);
      });
  }, [isOpen, configured]);

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseProductImportCsv(text);
    setFileName(file.name);
    setRows(parsed.rows);
    setParseErrors(parsed.errors);
    setResult(null);

    if (!parsed.rows.length) {
      toast.error("No valid product rows found in CSV");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([PRODUCT_IMPORT_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "product-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!rows.length) {
      toast.error("Upload a CSV with at least one valid row");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchAPI("/products/import", {
        method: "POST",
        body: JSON.stringify({
          rows,
          generateDescriptions,
        }),
      });

      const data = res.data as ImportResult;
      setResult(data);

      if (data.createdCount > 0) {
        toast.success(`Imported ${data.createdCount} product(s)`);
        onSuccess();
      }

      if (data.descriptionJobId) {
        toast.success("Background AI description job queued");
      } else if (generateDescriptions && data.pendingDescriptionProductIds.length > 0) {
        toast.error("AI descriptions were not queued — check Settings → AI Configuration");
      }

      if (data.errors.length > 0) {
        toast.error(`${data.errors.length} row(s) failed during import`);
      }
    } catch {
      toast.error("Product import failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Import products (CSV)</h2>
            <p className="text-sm text-slate-500 mt-1">
              Bulk create catalog rows, then optionally queue AI descriptions for missing copy.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold cursor-pointer">
              <Upload className="w-4 h-4" />
              Choose CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
            </label>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              <Download className="w-4 h-4" />
              Download template
            </button>
            {fileName ? (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{fileName}</span>
            ) : null}
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4">
            <input
              type="checkbox"
              checked={generateDescriptions}
              onChange={(event) => setGenerateDescriptions(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-bold text-slate-900 dark:text-white">
                Generate missing descriptions with AI
              </span>
              <span className="block text-xs text-slate-500 mt-1">
                Queues a background job after import for rows without description text. Requires AI
                configuration in Settings.
              </span>
            </span>
          </label>

          {parseErrors.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 dark:bg-amber-900/10 p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700">CSV parse warnings</p>
              {parseErrors.map((error) => (
                <p key={`${error.line}-${error.message}`} className="text-sm text-amber-900 dark:text-amber-200">
                  Line {error.line}: {error.message}
                </p>
              ))}
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-400">
                Preview ({rows.length} row{rows.length === 1 ? "" : "s"})
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewRows.map((row) => (
                  <div key={`${row.name}-${row.sku || row.slug || row.price}`} className="px-4 py-3 flex justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
                      <p className="text-xs text-slate-500">
                        {[row.category, row.sku, row.status].filter(Boolean).join(" · ") || "No category"}
                      </p>
                    </div>
                    <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">${row.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-900/10 p-4 space-y-2">
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Created {result.createdCount} product(s)
                {result.skippedCount ? ` · ${result.skippedCount} failed` : ""}
              </p>
              {result.descriptionJobId ? (
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  AI description job queued ({result.pendingDescriptionProductIds.length} product
                  {result.pendingDescriptionProductIds.length === 1 ? "" : "s"}).
                </p>
              ) : null}
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  {result.errors.slice(0, 5).map((error) => (
                    <p key={`${error.row}-${error.message}`} className="text-xs text-rose-700 dark:text-rose-300">
                      Row {error.row}: {error.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={loading || rows.length === 0}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold inline-flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import {rows.length || ""} product{rows.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}
