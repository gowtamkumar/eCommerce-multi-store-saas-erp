'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { fetchAPI } from '@/services/api';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastPath = useRef<string | null>(null);

    useEffect(() => {
        // Construct full path including query params if needed, or just path
        // For analytics, usually just the path is cleaner: /products/shoe-1
        const currentPath = pathname;

        // Avoid duplicate hits (React Strict Mode double mount or quick renders)
        if (currentPath === lastPath.current) return;
        lastPath.current = currentPath;

        // Skip admin and api routes from frontend tracking (they might be tracked elsewhere or irrelevant)
        if (currentPath?.startsWith('/admin') || currentPath?.startsWith('/super-admin') || currentPath?.startsWith('/api')) {
            return;
        }

        const track = async () => {
            try {
                await fetchAPI('/tracking/page-view', {
                    method: 'POST',
                    body: JSON.stringify({ path: currentPath })
                });
            } catch (err) {
                // Silently fail for analytics
                console.warn('Analytics tracking failed', err);
            }
        };

        // Debounce slightly to ensure it's a real navigation
        const timer = setTimeout(track, 500);
        return () => clearTimeout(timer);

    }, [pathname, searchParams]);

    return null;
}
