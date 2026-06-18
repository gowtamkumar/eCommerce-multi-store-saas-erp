'use client';

import { useState } from 'react';
import { useLeadManager } from '../hooks/useLeadManager';
import type { LeadMessage } from '../type';
import LeadFollowUpModal from './LeadFollowUpModal';
import LeadsFilters from './LeadsFilters';
import LeadsHeader from './LeadsHeader';
import LeadsTable from './LeadsTable';

export default function Lead() {
    const [draftLead, setDraftLead] = useState<LeadMessage | null>(null);
    const {
        leads,
        loading,
        exporting,
        pagination,
        statusFilter,
        updatingStatus,
        searchQuery,
        setSearchQuery,
        setStatusFilter,
        handlePageChange,
        handleStatusUpdate,
        handleExport,
    } = useLeadManager();

    return (
        <div>
            <LeadsHeader onExport={handleExport} exporting={exporting} />
            <LeadsFilters
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                total={pagination.total}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
            />
            <LeadsTable
                leads={leads}
                loading={loading}
                searchQuery={searchQuery}
                pagination={pagination}
                updatingStatus={updatingStatus}
                onPageChange={handlePageChange}
                onStatusUpdate={handleStatusUpdate}
                onDraftEmail={setDraftLead}
            />

            {draftLead && (
                <LeadFollowUpModal lead={draftLead} onClose={() => setDraftLead(null)} />
            )}
        </div>
    );
}
