'use client';

import { useSubscriberManager } from '../hooks/useSubscriberManager';
import SubscribersFilters from './SubscribersFilters';
import SubscribersHeader from './SubscribersHeader';
import SubscribersTable from './SubscribersTable';

export default function Subscribers() {
    const {
        subscribers,
        loading,
        exporting,
        searchQuery,
        pagination,
        setSearchQuery,
        handlePageChange,
        handleExport,
    } = useSubscriberManager();

    return (
        <div className="space-y-8">
            <SubscribersHeader onExport={handleExport} exporting={exporting} />
            <SubscribersFilters
                searchQuery={searchQuery}
                total={pagination.total}
                onSearchChange={setSearchQuery}
            />
            <SubscribersTable
                subscribers={subscribers}
                loading={loading}
                searchQuery={searchQuery}
                pagination={pagination}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
