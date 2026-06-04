/**
 * Formats a byte size number into a human-readable string (e.g. "1.5 MB").
 */
export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Copies a string URL to the system clipboard, falling back to a textarea method
 * if navigator.clipboard is unavailable (e.g. in insecure contexts).
 */
export async function copyToClipboard(url: string): Promise<boolean> {
    try {
        if (typeof window !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            return true;
        }
        
        // Fallback for older browsers or insecure HTTP contexts
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
    } catch (error) {
        console.error('Clipboard copy failed:', error);
        return false;
    }
}
