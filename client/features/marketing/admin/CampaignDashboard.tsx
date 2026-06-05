'use client';

import { AnimatePresence } from 'framer-motion';
import CampaignDetails from './CampaignDetails';
import CampaignFilterBar from './CampaignFilterBar';
import CampaignForm from './CampaignForm';
import CampaignHeader from './CampaignHeader';
import CampaignListSection from './CampaignListSection';
import CampaignStatsGrid from './CampaignStatsGrid';
import { useCampaignManager } from './hooks/useCampaignManager';

export default function CampaignDashboard() {
    const {
        campaigns,
        filteredCampaigns,
        stats,
        loading,
        searchQuery,
        isFormOpen,
        editingCampaign,
        viewingCampaign,
        setSearchQuery,
        loadCampaigns,
        openCreate,
        openEdit,
        closeForm,
        handleFormSuccess,
        openView,
        closeView,
        handleSchedule,
        handleCancel,
        handleDelete,
    } = useCampaignManager();

    return (
        <div className="space-y-8">
            <CampaignHeader onCreate={openCreate} />
            <CampaignStatsGrid stats={stats} />
            <CampaignFilterBar
                searchQuery={searchQuery}
                loading={loading}
                onSearchChange={setSearchQuery}
                onRefresh={loadCampaigns}
            />
            <CampaignListSection
                campaigns={filteredCampaigns}
                loading={loading}
                hasAny={campaigns.length > 0}
                onCreate={openCreate}
                onEdit={openEdit}
                onSchedule={handleSchedule}
                onCancel={handleCancel}
                onDelete={handleDelete}
                onView={openView}
            />

            <AnimatePresence>
                {isFormOpen && (
                    <CampaignForm
                        campaign={editingCampaign}
                        onClose={closeForm}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewingCampaign && (
                    <CampaignDetails
                        campaign={viewingCampaign}
                        onClose={closeView}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
