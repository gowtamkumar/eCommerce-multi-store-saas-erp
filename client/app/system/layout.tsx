'use client';
import SystemSidebar from '@/features/system/components/SystemSidebar';
import { UserRole } from '@/lib/enums/user-role.enum';
import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      <main className="flex-1">
        <div className="md:hidden p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Super Panel</h1>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
