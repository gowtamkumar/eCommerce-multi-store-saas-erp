'use client';

import { useCallback } from 'react';
import { useSettings } from '@/hooks/SettingsContext';
import { useGeneralLedger } from '../../hooks/useGeneralLedger';
import FinancialJournalsView from './FinancialJournalsView';
import InventoryMovementsView from './InventoryMovementsView';
import LedgerHeader from './LedgerHeader';
import LedgerTabs from './LedgerTabs';
import PostJournalModal from './PostJournalModal';

export function GeneralLedgerPage() {
    const { selectedCurrency } = useSettings();
    const gl = useGeneralLedger();

    const isDoubleEntry = gl.activeTab === 'double-entry';

    const handleRefresh = useCallback(() => {
        if (isDoubleEntry) void gl.loadGLEntries();
        else void gl.loadInvEntries();
    }, [isDoubleEntry, gl.loadGLEntries, gl.loadInvEntries]);

    const handleInvSearchChange = useCallback((value: string) => {
        gl.setInvSearch(value);
        gl.setInvPage(1);
    }, [gl.setInvSearch, gl.setInvPage]);

    const handleInvTypeFilterChange = useCallback((value: string) => {
        gl.setInvTypeFilter(value);
        gl.setInvPage(1);
    }, [gl.setInvTypeFilter, gl.setInvPage]);

    return (
        <div className="space-y-6 pb-12">
            <LedgerHeader
                showPostButton={isDoubleEntry}
                refreshing={gl.glLoading || gl.invLoading}
                onPost={() => gl.setPostOpen(true)}
                onRefresh={handleRefresh}
                currencyCode={selectedCurrency.code}
                currencySymbol={selectedCurrency.symbol}
            />

            <LedgerTabs activeTab={gl.activeTab} onTabChange={gl.setActiveTab} />

            {isDoubleEntry ? (
                <FinancialJournalsView
                    entries={gl.filteredGlEntries}
                    expandedJournals={gl.expandedJournals}
                    loading={gl.glLoading}
                    search={gl.glSearch}
                    onSearchChange={gl.setGlSearch}
                    onToggleExpand={gl.toggleExpand}
                    onReverse={gl.handleReverseJournal}
                />
            ) : (
                <InventoryMovementsView
                    entries={gl.invEntries}
                    loading={gl.invLoading}
                    search={gl.invSearch}
                    typeFilter={gl.invTypeFilter}
                    page={gl.invPage}
                    total={gl.invTotal}
                    totalPages={gl.totalInvPages}
                    onSearchChange={handleInvSearchChange}
                    onTypeFilterChange={handleInvTypeFilterChange}
                    onPageChange={gl.setInvPage}
                />
            )}

            <PostJournalModal
                open={gl.postOpen}
                onClose={() => gl.setPostOpen(false)}
                coa={gl.coa}
                journalType={gl.journalType}
                onJournalTypeChange={gl.setJournalType}
                journalDate={gl.journalDate}
                onJournalDateChange={gl.setJournalDate}
                description={gl.description}
                onDescriptionChange={gl.setDescription}
                refType={gl.refType}
                onRefTypeChange={gl.setRefType}
                refId={gl.refId}
                onRefIdChange={gl.setRefId}
                lines={gl.lines}
                onAddLine={gl.handleAddLine}
                onRemoveLine={gl.handleRemoveLine}
                onLineChange={gl.handleLineChange}
                formTotals={gl.formTotals}
                posting={gl.posting}
                onSubmit={gl.handlePostJournal}
            />
        </div>
    );
}
