'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useWalletManagement } from '../hooks/useWalletManagement';
import WalletAdjustmentModal from './wallet/WalletAdjustmentModal';
import WalletCustomerList from './wallet/WalletCustomerList';
import WalletDetailsPanel from './wallet/WalletDetailsPanel';
import WalletHeader from './wallet/WalletHeader';

export default function WalletManagement() {
    const { formatPrice, selectedCurrency } = useSettings();
    const wallet = useWalletManagement();

    return (
        <div className="space-y-6 pb-12">
            <WalletHeader
                loading={wallet.loading}
                onRefresh={wallet.loadCustomers}
                currencyCode={selectedCurrency.code}
                currencySymbol={selectedCurrency.symbol}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <WalletCustomerList
                    customers={wallet.filteredCustomers}
                    loading={wallet.loading}
                    search={wallet.search}
                    selectedCustomerId={wallet.selectedCustomerId}
                    onSearchChange={wallet.setSearch}
                    onSelectCustomer={wallet.selectCustomer}
                />

                <WalletDetailsPanel
                    selectedCustomerId={wallet.selectedCustomerId}
                    customer={wallet.selectedCustomerInfo}
                    wallet={wallet.selectedCustomerWallet}
                    historyLoading={wallet.historyLoading}
                    onOpenAdjustment={wallet.openAdjustmentModal}
                    formatPrice={formatPrice}
                />
            </div>

            <WalletAdjustmentModal
                type={wallet.adjustmentType}
                customerName={wallet.selectedCustomerInfo?.name}
                amount={wallet.adjustAmount}
                note={wallet.adjustNote}
                submitting={wallet.submitting}
                onAmountChange={wallet.setAdjustAmount}
                onNoteChange={wallet.setAdjustNote}
                onClose={wallet.closeAdjustmentModal}
                onSubmit={wallet.submitAdjustment}
            />
        </div>
    );
}
