import Expense from '@/features/admin/expense/components/Expense';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Expenses | Admin Dashboard',
    description: 'Track and manage your expenses',
};

export default function ExpensesPage() {
    return <Expense />;
}
