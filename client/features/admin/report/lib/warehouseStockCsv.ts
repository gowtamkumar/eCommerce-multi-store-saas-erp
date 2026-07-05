import type { WarehouseStockProduct } from '../types';
import { getAvailableStock, getVariantLabel } from './warehouseStock';

const CSV_HEADER = (currencyCode?: string) =>
    currencyCode
        ? `Product,Category,Supplier,SKU,Variant,Stock,Reserved,Available,Unit Price (${currencyCode}),Asset Value (${currencyCode}),Status\n`
        : 'Product,Category,Supplier,SKU,Variant,Stock,Reserved,Available,Unit Price,Asset Value,Status\n';

function getStatusLabel(product: WarehouseStockProduct): string {
    if (product.outOfStock) return 'Out of Stock';
    if (product.lowStock) return 'Low Stock';
    return 'In Stock';
}

function slug(value: string): string {
    return value.toLowerCase().replace(/\s+/g, '-');
}

export function buildStockReportFilename(branchName: string, warehouseName: string): string {
    return `${slug(branchName)}-${slug(warehouseName)}-stock-report.csv`;
}

export function buildStockReportCsv(products: WarehouseStockProduct[], currencyCode?: string): string {
    let csv = CSV_HEADER(currencyCode);

    products.forEach((p) => {
        const statusStr = getStatusLabel(p);
        const category = p.categoryName || '';
        const supplier = p.supplierName || '';

        if (p.hasVariants && p.variants) {
            p.variants.forEach((v) => {
                const variantStr = getVariantLabel(v);
                const available = getAvailableStock(v);
                csv += `"${p.name}","${category}","${supplier}","${v.sku}","${variantStr}",${v.stock},${v.reservedStock || 0},${available},${v.price},${v.stock * Number(v.price)},"${statusStr}"\n`;
            });
        } else {
            const available = getAvailableStock(p);
            csv += `"${p.name}","${category}","${supplier}","","N/A",${p.stock},${p.reservedStock || 0},${available},${p.price},${p.stockValue},"${statusStr}"\n`;
        }
    });

    return csv;
}

export function downloadCsv(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
