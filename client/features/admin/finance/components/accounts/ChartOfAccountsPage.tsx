'use client';

import { useMemo } from 'react';
import DataTable from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts';
import AccountFormModal from './AccountFormModal';
import { buildAccountColumns } from './accountColumns';
import ChartOfAccountsHeader from './ChartOfAccountsHeader';

export default function ChartOfAccountsPage() {
    const { formatPrice, selectedCurrency } = useSettings();
    const accounts = useChartOfAccounts();

    const columns = useMemo(() => buildAccountColumns(
        formatPrice,
        accounts.openEditModal,
        accounts.deleteChartAccount,
    ), [accounts.deleteChartAccount, accounts.openEditModal, formatPrice]);

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <ChartOfAccountsHeader
                searchQuery={accounts.searchQuery}
                hasAccounts={accounts.accounts.length > 0}
                onSearchChange={accounts.setSearchQuery}
                onInitializeCoa={accounts.initializeCoa}
                onAddAccount={accounts.openCreateModal}
                currencyCode={selectedCurrency.code}
                currencySymbol={selectedCurrency.symbol}
            />

            <DataTable
                data={accounts.filteredAccounts}
                columns={columns}
                getRowKey={(account) => account.id}
                loading={accounts.loading}
                emptyLabel="No Chart of Accounts matches the search filters."
                minWidthClassName="min-w-[1000px]"
                containerClassName="rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            />

            <AccountFormModal
                open={accounts.createOpen}
                mode="create"
                formData={accounts.formData}
                onFieldChange={accounts.setFormField}
                onClose={accounts.closeCreateModal}
                onSubmit={accounts.createChartAccount}
            />

            <AccountFormModal
                open={!!accounts.selectedAccount}
                mode="edit"
                accountCode={accounts.selectedAccount?.code}
                formData={accounts.formData}
                onFieldChange={accounts.setFormField}
                onClose={accounts.closeEditModal}
                onSubmit={accounts.updateChartAccount}
            />
        </div>
    );
}
