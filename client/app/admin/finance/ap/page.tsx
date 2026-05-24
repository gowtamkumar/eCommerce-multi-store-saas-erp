import ApAgingReport from '@/features/admin/finance/components/ApAgingReport';

export const metadata = {
    title: 'Accounts Payable | Finance',
    description: 'Track vendor aging categories, view outstanding invoices, and perform bulk payment run matching sweeps.',
};

export default function ApPage() {
    return <ApAgingReport />;
}
