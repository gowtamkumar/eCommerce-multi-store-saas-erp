'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HrmPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/hrm/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
