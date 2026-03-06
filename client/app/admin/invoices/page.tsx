import InvoicesList from '@/features/invoice/components/InvoicesList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invoices | Admin Dashboard',
    description: 'Manage generated invoices',
};

export default function InvoicesPage() {
    return <InvoicesList />;
}
