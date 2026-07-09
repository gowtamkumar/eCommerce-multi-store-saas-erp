'use client';

import { useEffect, useState, useRef } from 'react';
import { Printer, QrCode, Search, Trash2, Settings, Plus, Minus, X, Info } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Product, ProductVariant } from '@/types/product';
import toast from 'react-hot-toast';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';

interface BarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct?: Product | null;
}

interface SelectedItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

type TemplateSize = '38x25' | '50x30' | 'A4-24';
type CodeFormat = 'BARCODE' | 'QR' | 'BOTH';

function QRLabelImage({ value }: { value: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, { margin: 0, width: 120 })
      .then(setSrc)
      .catch(console.error);
  }, [value]);
  return src ? (
    <img src={src} className="w-16 h-16 object-contain" alt="QR Code" />
  ) : (
    <div className="w-16 h-16 bg-slate-105 dark:bg-slate-800 animate-pulse rounded-lg" />
  );
}

function BarcodeImage({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: 1.2,
          height: 32,
          displayValue: true,
          fontSize: 9,
          fontOptions: 'bold',
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch (err) {
        console.error('JsBarcode error:', err);
      }
    }
  }, [value]);
  return <svg ref={svgRef} className="max-w-full h-auto mx-auto" />;
}

export default function BarcodeLabelModal({
  isOpen,
  onClose,
  products,
  initialProduct,
}: BarcodeLabelModalProps) {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Print Config State
  const [templateSize, setTemplateSize] = useState<TemplateSize>('50x30');
  const [codeFormat, setCodeFormat] = useState<CodeFormat>('BARCODE');
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showVariant, setShowVariant] = useState(true);
  const [showStoreName, setShowStoreName] = useState(true);
  const [storeName, setStoreName] = useState('My Enterprise ERP');

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        // Pre-populate with initial product
        const items: SelectedItem[] = [];
        if (initialProduct.variants && initialProduct.variants.length > 0) {
          initialProduct.variants.forEach((v) => {
            items.push({ product: initialProduct, variant: v, quantity: 1 });
          });
        } else {
          items.push({ product: initialProduct, quantity: 1 });
        }
        setSelectedItems(items);
      } else {
        setSelectedItems([]);
      }
      setSearchQuery('');
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  // Search filter
  const searchResults: { product: Product; variant?: ProductVariant }[] = [];
  if (searchQuery.trim().length > 1) {
    const query = searchQuery.toLowerCase();
    products.forEach((p) => {
      const matchProduct =
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query));

      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          const matchVariant =
            v.sku.toLowerCase().includes(query) ||
            (v.barcode && v.barcode.toLowerCase().includes(query)) ||
            Object.values(v.combination).some((val) =>
              val.toLowerCase().includes(query)
            );
          if (matchProduct || matchVariant) {
            searchResults.push({ product: p, variant: v });
          }
        });
      } else if (matchProduct) {
        searchResults.push({ product: p });
      }
    });
  }

  const addItem = (product: Product, variant?: ProductVariant) => {
    const existing = selectedItems.find(
      (item) =>
        item.product.id === product.id && item.variant?.id === variant?.id
    );

    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.product.id === product.id && item.variant?.id === variant?.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { product, variant, quantity: 1 }]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...selectedItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setSelectedItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  // Compile flat list of labels to render in preview/print
  const labelsToPrint: {
    sku: string;
    barcode?: string;
    name: string;
    variantDesc?: string;
    price: number;
  }[] = [];

  selectedItems.forEach((item) => {
    const codeVal = item.variant?.barcode || item.variant?.sku || item.product.barcode || item.product.sku;
    const nameVal = item.product.name;
    const priceVal = Number(item.variant?.price ?? item.product.price ?? 0) || 0;
    const variantVal = item.variant
      ? Object.entries(item.variant.combination)
          .map(([k, v]) => `${v}`)
          .join('/')
      : undefined;

    for (let i = 0; i < item.quantity; i++) {
      labelsToPrint.push({
        sku: item.variant?.sku || item.product.sku || '',
        barcode: codeVal,
        name: nameVal,
        variantDesc: variantVal,
        price: priceVal,
      });
    }
  });

  const handlePrint = () => {
    if (labelsToPrint.length === 0) {
      toast.error('No labels to print');
      return;
    }

    // Open a new blank window for print styling isolate
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Failed to open print preview. Please check pop-up blockers.');
      return;
    }

    // Build template page CSS
    let templateCss = '';
    if (templateSize === '38x25') {
      templateCss = `
        @page { size: 38mm 25mm; margin: 0; }
        body { margin: 0; padding: 0; }
        .label-page {
          width: 38mm;
          height: 25mm;
          box-sizing: border-box;
          padding: 1.5mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          page-break-after: always;
          font-family: system-ui, sans-serif;
          background: #ffffff;
        }
        .store-name { font-size: 6.5px; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5mm; color: #333333; }
        .product-name { font-size: 7.5px; font-weight: 800; line-height: 1.1; margin-bottom: 0.5mm; max-height: 5.5mm; overflow: hidden; }
        .price { font-size: 8.5px; font-weight: 900; margin-top: 0.5mm; }
        .code-container { margin: 0.5mm 0; display: flex; align-items: center; justify-content: center; }
      `;
    } else if (templateSize === '50x30') {
      templateCss = `
        @page { size: 50mm 30mm; margin: 0; }
        body { margin: 0; padding: 0; }
        .label-page {
          width: 50mm;
          height: 30mm;
          box-sizing: border-box;
          padding: 2mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          page-break-after: always;
          font-family: system-ui, sans-serif;
          background: #ffffff;
        }
        .store-name { font-size: 8px; font-weight: 800; text-transform: uppercase; margin-bottom: 0.8mm; color: #333333; }
        .product-name { font-size: 9px; font-weight: 800; line-height: 1.1; margin-bottom: 0.8mm; max-height: 6.5mm; overflow: hidden; }
        .price { font-size: 10px; font-weight: 900; margin-top: 0.8mm; }
        .code-container { margin: 0.8mm 0; display: flex; align-items: center; justify-content: center; }
      `;
    } else if (templateSize === 'A4-24') {
      templateCss = `
        @page { size: A4; margin: 15mm 10mm; }
        body { margin: 0; padding: 0; background: #ffffff; font-family: system-ui, sans-serif; }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(3, 63.5mm);
          grid-auto-rows: 38.1mm;
          gap: 2mm 3mm;
          box-sizing: border-box;
        }
        .label-page {
          width: 63.5mm;
          height: 38.1mm;
          border: 0.2mm dashed #ddd; /* visible cut-lines on screen */
          box-sizing: border-box;
          padding: 3mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #ffffff;
          overflow: hidden;
        }
        @media print {
          .label-page { border: none !important; }
        }
        .store-name { font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 1mm; color: #333333; }
        .product-name { font-size: 10.5px; font-weight: 800; line-height: 1.1; margin-bottom: 1mm; max-height: 8mm; overflow: hidden; }
        .price { font-size: 12px; font-weight: 900; margin-top: 1mm; }
        .code-container { margin: 1mm 0; display: flex; align-items: center; justify-content: center; }
      `;
    }

    // Build the label HTML contents
    let labelsHtml = '';
    if (templateSize === 'A4-24') {
      labelsHtml = '<div class="grid-container">';
    }

    labelsToPrint.forEach((label, idx) => {
      const barcodeSvgId = `barcode-print-${idx}`;
      const qrImgId = `qr-print-${idx}`;

      labelsHtml += `
        <div class="label-page">
          ${showStoreName ? `<div class="store-name">${storeName}</div>` : ''}
          ${showProductName ? `<div class="product-name">${label.name} ${showVariant && label.variantDesc ? `(${label.variantDesc})` : ''}</div>` : ''}
          
          <div class="code-container">
            ${
              codeFormat === 'BARCODE' || codeFormat === 'BOTH'
                ? `<svg id="${barcodeSvgId}"></svg>`
                : ''
            }
            ${
              codeFormat === 'QR' || codeFormat === 'BOTH'
                ? `<img id="${qrImgId}" style="width: 55px; height: 55px; ${
                    codeFormat === 'BOTH' ? 'margin-left: 5px;' : ''
                  }" />`
                : ''
            }
          </div>

          ${showPrice ? `<div class="price">${formatCurrency(label.price, currencySymbol)}</div>` : ''}
        </div>
      `;
    });

    if (templateSize === 'A4-24') {
      labelsHtml += '</div>';
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Product Labels</title>
          <style>
            ${templateCss}
          </style>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        </head>
        <body>
          ${labelsHtml}
          <script>
            window.onload = function() {
              const count = ${labelsToPrint.length};
              for (let i = 0; i < count; i++) {
                const label = ${JSON.stringify(labelsToPrint)}[i];
                const barcodeId = "barcode-print-" + i;
                const qrId = "qr-print-" + i;

                // render barcode
                const barcodeEl = document.getElementById(barcodeId);
                if (barcodeEl && label.barcode) {
                  try {
                    JsBarcode("#" + barcodeId, label.barcode, {
                      format: "CODE128",
                      width: ${templateSize === '38x25' ? 0.9 : 1.2},
                      height: ${templateSize === '38x25' ? 24 : 32},
                      displayValue: true,
                      fontSize: 8,
                      fontOptions: "bold",
                      margin: 0
                    });
                  } catch (e) {
                    console.error("Barcode print error", e);
                  }
                }

                // render QR Code
                const qrEl = document.getElementById(qrId);
                if (qrEl && label.barcode) {
                  QRCode.toDataURL(label.barcode, { margin: 0, width: 120 }, function(err, url) {
                    if (!err) qrEl.src = url;
                  });
                }
              }

              // Automatically trigger system print screen
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-2xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Barcode & QR Label Generator</h2>
              <p className="text-xs text-slate-500 font-medium">Configure template size, items, and print dynamic barcode labels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Config Panel */}
          <div className="w-full lg:w-1/2 border-r border-slate-100 dark:border-slate-800 p-6 overflow-y-auto space-y-6">
            
            {/* Search Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Search Products/Variants</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type product name, barcode or SKU to add..."
                  value={searchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-sm shadow-sm"
                />

                {showDropdown && searchQuery.trim().length > 1 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1">
                    <div className="flex justify-between items-center px-3 py-1 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Search Results</span>
                      <button onClick={() => setShowDropdown(false)} className="text-[10px] font-black text-brand-500">Dismiss</button>
                    </div>
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 font-semibold">No items match query</p>
                    ) : (
                      searchResults.map(({ product, variant }, idx) => (
                        <button
                          key={`${product.id}-${variant?.id || 'base'}-${idx}`}
                          onClick={() => addItem(product, variant)}
                          className="w-full text-left p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 rounded-xl flex items-center justify-between gap-4 transition-all"
                        >
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white">{product.name}</p>
                            {variant && (
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Variant: {Object.entries(variant.combination).map(([k, v]) => `${k}:${v}`).join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-mono font-bold">
                            {variant?.sku || product.sku}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Print Settings Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                <Settings className="w-4 h-4 text-slate-450" />
                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Template & Output Options</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Label Page / Size</label>
                  <select
                    value={templateSize}
                    onChange={(e) => setTemplateSize(e.target.value as TemplateSize)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white outline-none font-bold text-xs"
                  >
                    <option value="50x30">Standard Roll (50mm x 30mm)</option>
                    <option value="38x25">Small Barcode Roll (38mm x 25mm)</option>
                    <option value="A4-24">A4 Sheet (24 labels/page, 3x8 Grid)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Render Layout</label>
                  <select
                    value={codeFormat}
                    onChange={(e) => setCodeFormat(e.target.value as CodeFormat)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white outline-none font-bold text-xs"
                  >
                    <option value="BARCODE">Barcode (CODE128 Only)</option>
                    <option value="QR">QR Code Only</option>
                    <option value="BOTH">Dual Layout (Barcode & QR Side-by-Side)</option>
                  </select>
                </div>
              </div>

              {/* Text Fields to Display */}
              <div className="space-y-2.5 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Label Card Contents</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showStoreName}
                      onChange={(e) => setShowStoreName(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                    Include Store Name
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showProductName}
                      onChange={(e) => setShowProductName(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                    Include Product Title
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showVariant}
                      onChange={(e) => setShowVariant(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                    Include Variant Label
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                    Include Pricing
                  </label>
                </div>

                {showStoreName && (
                  <div className="space-y-1 mt-3">
                    <label className="block text-[9px] font-black uppercase text-slate-500">Custom Store Label text</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none font-bold text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* List of items selected */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Queue Selection</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-405 text-[10px] font-black rounded-lg">
                  {selectedItems.length} Products
                </span>
              </div>

              {selectedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <Info className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">Search and select items to queue for label generation.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {selectedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 rounded-xl gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                        {item.variant ? (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {Object.entries(item.variant.combination).map(([k, v]) => `${k}:${v}`).join(', ')}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Base Product</p>
                        )}
                        <p className="text-[10px] font-bold text-brand-650 dark:text-brand-400 mt-1 font-mono">
                          Code: {item.variant?.barcode || item.variant?.sku || item.product.barcode || item.product.sku || 'No code set'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, -1)}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-black text-xs text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Preview Grid Panel */}
          <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-950/40 p-6 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Live Layout Print Preview</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Simulated representation on label media. Output matches selection counts.</p>
              </div>
              <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-black rounded-lg">
                {labelsToPrint.length} Print Copies
              </span>
            </div>

            {/* Scrollable Previews */}
            <div className="flex-1 overflow-y-auto p-4 border border-slate-100 dark:border-slate-850 bg-slate-100 dark:bg-slate-950 rounded-2xl flex flex-wrap gap-4 items-start justify-center">
              {labelsToPrint.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16">
                  <Printer className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm font-black">No Preview Content</p>
                  <p className="text-xs max-w-[240px] mt-1 font-medium">Add products and variants on the left panel to populate label cards.</p>
                </div>
              ) : (
                labelsToPrint.map((label, idx) => {
                  const dimensionsClass =
                    templateSize === '38x25'
                      ? 'w-[38mm] h-[25mm] scale-125 my-4 mx-6'
                      : templateSize === '50x30'
                      ? 'w-[50mm] h-[30mm] scale-125 my-4 mx-6'
                      : 'w-[63.5mm] h-[38.1mm]'; // A4 grid cell

                  return (
                    <div
                      key={idx}
                      className={`bg-white text-black border border-slate-200 shadow-lg rounded p-2 flex flex-col justify-between items-center text-center select-none overflow-hidden origin-center shrink-0 ${dimensionsClass}`}
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      {/* Store Name */}
                      {showStoreName && (
                        <div className="text-[6.5px] uppercase font-black tracking-widest text-slate-700 truncate max-w-full">
                          {storeName}
                        </div>
                      )}

                      {/* Product Name & Variant */}
                      {showProductName && (
                        <div className="text-[7.5px] leading-tight font-extrabold text-black line-clamp-2 max-w-full mt-0.5">
                          {label.name} {showVariant && label.variantDesc ? `(${label.variantDesc})` : ''}
                        </div>
                      )}

                      {/* Code Block Container */}
                      <div className="my-1 flex items-center justify-center gap-1 max-w-full">
                        {(codeFormat === 'BARCODE' || codeFormat === 'BOTH') && label.barcode && (
                          <BarcodeImage value={label.barcode} />
                        )}
                        {(codeFormat === 'QR' || codeFormat === 'BOTH') && label.barcode && (
                          <QRLabelImage value={label.barcode} />
                        )}
                      </div>

                      {/* Price Block */}
                      {showPrice && (
                        <div className="text-[9px] font-black text-black mt-0.5">
                          {formatCurrency(label.price, currencySymbol)}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Print Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                disabled={labelsToPrint.length === 0}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl shadow-xl shadow-brand-600/10 hover:shadow-brand-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-5 h-5" />
                Initialize System Print ({labelsToPrint.length} Copies)
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
