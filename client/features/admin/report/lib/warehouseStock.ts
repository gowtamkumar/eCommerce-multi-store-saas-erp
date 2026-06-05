import type {
    WarehouseBranchRef,
    WarehouseStockFilter,
    WarehouseStockProduct,
    WarehouseStockStats,
    WarehouseStockVariant,
} from '../types';

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function selectTargetWarehouses(
    warehouses: WarehouseBranchRef[],
    selectedBranchId: string,
    selectedWarehouseId: string,
): WarehouseBranchRef[] {
    if (selectedWarehouseId && selectedWarehouseId !== 'all') {
        return warehouses.filter((w) => w.id === selectedWarehouseId);
    }
    if (selectedBranchId) {
        return warehouses.filter((w) => w.branchId === selectedBranchId || w.branch?.id === selectedBranchId);
    }
    return warehouses;
}

export function filterWarehousesByBranch(
    warehouses: WarehouseBranchRef[],
    selectedBranchId: string,
): WarehouseBranchRef[] {
    if (!selectedBranchId) return warehouses;
    return warehouses.filter((w) => w.branchId === selectedBranchId || w.branch?.id === selectedBranchId);
}

/** Merge stock summaries from multiple warehouses into a single product list. */
export function aggregateStockResults(
    results: Array<{ data: WarehouseStockProduct[] }>,
): WarehouseStockProduct[] {
    const productMap = new Map<string, WarehouseStockProduct>();

    results.forEach(({ data }) => {
        data.forEach((p) => {
            if (!productMap.has(p.id)) {
                productMap.set(p.id, {
                    ...p,
                    stock: 0,
                    stockValue: 0,
                    reservedStock: 0,
                    variants: p.variants
                        ? p.variants.map((v) => ({ ...v, stock: 0, reservedStock: 0 }))
                        : [],
                });
            }

            const existing = productMap.get(p.id)!;
            existing.stock += p.stock || 0;
            existing.stockValue += p.stockValue || 0;
            existing.reservedStock = (existing.reservedStock || 0) + (p.reservedStock || 0);

            if (p.variants && p.variants.length > 0) {
                p.variants.forEach((v) => {
                    const match = existing.variants?.find((ev) => ev.id === v.id);
                    if (match) {
                        match.stock += v.stock || 0;
                        match.reservedStock = (match.reservedStock || 0) + (v.reservedStock || 0);
                    }
                });
            }
        });
    });

    return Array.from(productMap.values()).map(applyStockThresholds);
}

/** Recompute low/out-of-stock flags for a product and its variants. */
export function applyStockThresholds(product: WarehouseStockProduct): WarehouseStockProduct {
    const hasVariants = Boolean(product.variants && product.variants.length > 0);
    let isOutOfStock = false;
    let isLowStock = false;

    if (hasVariants && product.variants) {
        product.variants.forEach((v) => {
            const available = v.stock - (v.reservedStock || 0);
            v.outOfStock = v.stock === 0;
            v.lowStock = available <= (v.lowStockThreshold || DEFAULT_LOW_STOCK_THRESHOLD);
        });
        isOutOfStock = product.variants.every((v) => v.stock === 0);
        isLowStock = product.variants.some((v) => v.lowStock);
    } else {
        const available = product.stock - (product.reservedStock || 0);
        isOutOfStock = product.stock === 0;
        isLowStock = available <= (product.lowStockThreshold || DEFAULT_LOW_STOCK_THRESHOLD);
    }

    return { ...product, lowStock: isLowStock, outOfStock: isOutOfStock };
}

function matchesSearch(product: WarehouseStockProduct, query: string): boolean {
    if (!query) return true;
    return (
        product.name.toLowerCase().includes(query) ||
        product.categoryName?.toLowerCase().includes(query) === true ||
        product.supplierName?.toLowerCase().includes(query) === true ||
        product.variants?.some((v) => v.sku.toLowerCase().includes(query)) === true
    );
}

function matchesFilter(product: WarehouseStockProduct, filter: WarehouseStockFilter): boolean {
    switch (filter) {
        case 'lowStock':
            return Boolean(product.lowStock);
        case 'outOfStock':
            return Boolean(product.outOfStock);
        case 'inStock':
            return !product.lowStock && !product.outOfStock;
        case 'all':
        default:
            return true;
    }
}

export function filterStockProducts(
    products: WarehouseStockProduct[],
    searchQuery: string,
    filter: WarehouseStockFilter,
): WarehouseStockProduct[] {
    const query = searchQuery.toLowerCase();
    return products.filter((p) => matchesSearch(p, query) && matchesFilter(p, filter));
}

export function computeStockStats(products: WarehouseStockProduct[]): WarehouseStockStats {
    return {
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + p.stockValue, 0),
        outOfStockCount: products.filter((p) => p.outOfStock).length,
        lowStockCount: products.filter((p) => p.lowStock).length,
        inStockCount: products.filter((p) => !p.lowStock && !p.outOfStock).length,
    };
}

export function getAvailableStock(item: { stock?: number; reservedStock?: number }): number {
    return (item.stock || 0) - (item.reservedStock || 0);
}

export function getVariantLabel(variant: WarehouseStockVariant): string {
    return Object.values(variant.combination || {}).join(' / ');
}
