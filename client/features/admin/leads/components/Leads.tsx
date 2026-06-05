'use client';

import { useLeadManager } from '../hooks/useLeadManager';
import LeadsFilters from './LeadsFilters';
import LeadsHeader from './LeadsHeader';
import LeadsTable from './LeadsTable';

export default function Lead() {
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
            />
        </div>
    );
}
