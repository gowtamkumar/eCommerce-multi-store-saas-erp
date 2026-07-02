'use client';
import SystemSidebar from '@/features/system/components/SystemSidebar';
import SystemTopBar from '@/features/system/components/SystemTopBar';
import { UserRole } from '@/lib/enums/user-role.enum';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const routeNames: Record<string, string> = {
    system: 'Dashboard',
    billing: 'Billing & Revenue',
    stores: 'Stores',
    create: 'Provision Store',
    users: 'Users',
    health: 'Platform Health',
    notifications: 'Platform Alerts',
    'audit-logs': 'Audit Logs',
    plans: 'Subscription Plans',
    addons: 'Addon Catalog',
    subscribers: 'Subscribers',
    security: 'Security',
    settings: 'Global Settings',
  };

  return (
    <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 bg-white dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-850/50 px-4 py-2.5 rounded-2xl w-fit shadow-sm">
      <Link href="/system" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>System</span>
      </Link>

      {segments.map((segment, idx) => {
        // Skip first segment if it is "system" since we already render it as Home/System
        if (segment === 'system') return null;

        const path = '/' + segments.slice(0, idx + 1).join('/');
        const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = idx === segments.length - 1;

        return (
          <div key={path} className="flex items-center space-x-2">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            {isLast ? (
              <span className="text-slate-800 dark:text-slate-200 font-bold">{name}</span>
            ) : (
              <Link href={path} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status }: any = useSession();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== UserRole.SUPER_ADMIN)) {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <SystemSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <main className="flex-1 flex flex-col min-h-screen">
        <SystemTopBar session={session} onMenuClick={() => setIsMobileMenuOpen(true)} />

        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          <Breadcrumbs />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
