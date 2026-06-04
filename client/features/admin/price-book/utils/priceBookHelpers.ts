/** Converts a name string to an UPPER-KEBAB code. e.g. "Eid Campaign 2026" → "EID-CAMPAIGN-2026" */
export function generateCode(name: string): string {
    return name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')   // strip special chars
        .replace(/\s+/g, '-')           // spaces → dash
        .replace(/-+/g, '-')            // collapse multiple dashes
        .replace(/^-|-$/g, '');         // trim leading/trailing dashes
}

export function getTypeHelperText(type: string) {
    switch (type) {
        case 'RETAIL':
            return {
                text: 'Base storefront catalog. Provides default prices for guest and standard retail shoppers. Only one active Retail price book is allowed per currency.',
                color: 'text-brand-700 dark:text-brand-300 bg-brand-50/50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800'
            };
        case 'PROMOTIONAL':
            return {
                text: 'Active campaign catalog. Promotional price books automatically override Retail catalogs during their scheduled active window. Start and End dates are required.',
                color: 'text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
            };
        case 'WHOLESALE':
            return {
                text: 'Bulk/B2B price catalog. Excluded from normal storefront fallbacks. Applies only when checked out with the wholesale channel or via wholesale customer accounts.',
                color: 'text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            };
        case 'CUSTOMER_SPECIFIC':
            return {
                text: 'VIP/Contract catalog. Excluded from normal storefront fallbacks. Applies only to specific orders where this code is explicitly passed.',
                color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
            };
        default:
            return null;
    }
}
