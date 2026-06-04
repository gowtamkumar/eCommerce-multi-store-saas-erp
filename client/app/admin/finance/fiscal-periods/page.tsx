import FiscalPeriodsPage from '@/features/admin/finance/components/fiscal-periods/FiscalPeriodsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Fiscal Periods | Admin Dashboard',
    description: 'Lock postings and enforce financial audit control across fiscal periods.',
};

export default function FiscalPeriodsRoute() {
    return <FiscalPeriodsPage />;
}
