import AuditLogsDashboard from '@/features/admin/audit-logs/components/AuditLogsDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Security & Audit Logs | Admin Dashboard',
    description: 'Real-time immutable history of all operational events and access modifications.',
};

export default function AuditLogsPage() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <AuditLogsDashboard />
        </div>
    );
}
