import ArAgingReport from '@/features/admin/finance/components/ArAgingReport';

export const metadata = {
    title: 'Accounts Receivable | Finance',
    description: 'B2B customer debt aging, credit limits, and payment collection',
};

export default function ArPage() {
    return <ArAgingReport />;
}
