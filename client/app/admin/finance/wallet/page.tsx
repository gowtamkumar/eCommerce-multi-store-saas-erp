import WalletManagement from "@/features/admin/finance/components/WalletManagement";

export const metadata = {
    title: 'Customer Wallets | Finance',
    description: 'Manage store credits, refunds to wallet, and manual customer wallet adjustments',
};

export default function WalletPage() {
    return <WalletManagement />;
}
