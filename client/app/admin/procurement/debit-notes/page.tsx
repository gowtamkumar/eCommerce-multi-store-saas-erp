'use client';

import React from 'react';
import { useDebitNoteDashboard } from '@/features/admin/procurement/hooks/useDebitNoteDashboard';
import { DebitNoteListPage } from '@/features/admin/procurement/components/DebitNoteListPage';
import DebitNoteDetailDrawer from '@/features/admin/procurement/components/DebitNoteDetailDrawer';
import CreateDebitNoteModal from '@/features/admin/procurement/components/CreateDebitNoteModal';

export default function DebitNotePage() {
  const {
    debitNotes,
    loading,
    searchQuery,
    setSearchQuery,
    selectedNote,
    setSelectedNote,
    pagination,
    createOpen,
    setCreateOpen,
    fetchDebitNotes,
    handleApprove,
    handlePageChange,
  } = useDebitNoteDashboard();

  return (
    <>
      <DebitNoteListPage
        debitNotes={debitNotes}
        loading={loading}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        pagination={pagination}
        onSelectNote={setSelectedNote}
        onPageChange={handlePageChange}
        onOpenCreateModal={() => setCreateOpen(true)}
      />

      <DebitNoteDetailDrawer
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onApprove={handleApprove}
      />

      <CreateDebitNoteModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => fetchDebitNotes(1)}
      />
    </>
  );
}
