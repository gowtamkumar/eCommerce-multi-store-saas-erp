'use client';
import SystemSidebar from '@/features/system/components/SystemSidebar';
import SystemTopBar from '@/features/system/components/SystemTopBar';
import { UserRole } from '@/lib/enums/user-role.enum';
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
      <main className="flex-1 flex flex-col min-h-screen">
        <SystemTopBar session={session} onMenuClick={() => setIsMobileMenuOpen(true)} />

        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
