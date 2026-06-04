import TeamDashboard from '@/features/admin/team/components/TeamDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Team Management | Admin Dashboard',
    description: 'Define roles and manage staff credentials for your e-commerce ecosystem.',
};

export default function TeamPage() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <TeamDashboard />
        </div>
    );
}
