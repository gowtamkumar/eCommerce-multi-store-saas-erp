'use client';

import dynamic from 'next/dynamic';
import { usePromotionManager } from './hooks/usePromotionManager';
import PromotionHeader from './PromotionHeader';
import PromotionList from './PromotionList';

// Lazy load the form to optimize initial bundle size
const PromotionForm = dynamic(() => import('./PromotionForm'), {
    loading: () => <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-96 rounded-2xl" />,
});

export default function PromotionDashboard() {
    const {
        promotions,
        loading,
        searchQuery,
        pagination,
        isFormOpen,
        selectedPromotion,
        copiedId,
        setSearchQuery,
        deletePromotionById,
        openEdit,
        openCreate,
        closeForm,
        handleFormSuccess,
        changePage,
        copyOfferLink,
    } = usePromotionManager();

    return (
        <div className="space-y-6">
            <PromotionHeader onAddClick={openCreate} />

            <PromotionList
                promotions={promotions}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                pagination={pagination}
                onPageChange={changePage}
                onEdit={openEdit}
                onDelete={deletePromotionById}
                onCopyOfferLink={copyOfferLink}
                copiedId={copiedId}
            />

            {isFormOpen && (
                <PromotionForm
                    promotion={selectedPromotion}
                    onClose={closeForm}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}
