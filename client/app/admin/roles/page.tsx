import RolesDashboard from '@/features/admin/role/components/RolesDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Roles & Permissions | Admin Dashboard',
    description: 'Configure customized administrative authorization groups and control fine-grained access rules.',
};

export default function RolesPermissionsPage() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <RolesDashboard />
        </div>
    );
}
