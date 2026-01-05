import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export async function checkAdminAuth() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/admin/login');
    }

    return session;
}
