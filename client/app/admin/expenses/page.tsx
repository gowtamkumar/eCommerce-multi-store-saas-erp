import ExpenseDashboard from '@/features/admin/expense/components/ExpenseDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Expenses | Admin Dashboard',
    description: 'Track and manage your expenses',
};

export default function ExpensesPage() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <ExpenseDashboard />
        </div>
    );
}
