import ExpensesList from '@/features/admin/expense/components/ExpensesList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Expenses | Admin Dashboard',
    description: 'Track and manage your expenses',
};

export default function ExpensesPage() {
    return <ExpensesList />;
}
