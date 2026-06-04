'use client';

import React from 'react';
import { Monitor, Plus, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { usePosRegisterDashboard } from '../hooks/usePosRegisterDashboard';

// Subcomponents
import RegistersTab from './RegistersTab';
import ShiftsTab from './ShiftsTab';
import RegisterFormModal from './RegisterFormModal';
import ShiftDetailModal from './ShiftDetailModal';

export default function PosRegisters() {
    const {
        activeTab,
        setActiveTab,
        branches,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingRegister,
        searchQuery,
        setSearchQuery,
        loadingShifts,
        selectedShift,
        setSelectedShift,
        shiftSearchQuery,
        setShiftSearchQuery,
        shiftStatusFilter,
        setShiftStatusFilter,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        exporting,
        sortBy,
        sortOrder,
        confirmModal,
        setConfirmModal,
        formData,
        setFormData,
        loadShifts,
        openCreateModal,
        openEditModal,
        handleSubmit,
        handleDelete,
        filteredRegisters,
        sortedShifts,
        totalPages,
        paginatedShifts,
        handleShiftSort,
        handleExportShifts,
    } = usePosRegisterDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-brand-600" />
                        POS Till Audit & Terminal Management
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Manage register terminals, local branches, and review cashier shift audits and drawer variance records.
                    </p>
                </div>

                {activeTab === 'registers' && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 self-start md:self-center"
                    >
                        <Plus className="w-4 h-4" />
                        New Register
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('registers')}
                    className={`pb-2 text-sm font-bold transition-all border-b-2 px-2 ${
                        activeTab === 'registers'
                            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                            : 'border-transparent text-slate-400 hover:text-slate-655'
                    }`}
                >
                    Register Terminals
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('shifts');
                        setCurrentPage(1);
                        void loadShifts();
                    }}
                    className={`pb-2 text-sm font-bold transition-all border-b-2 px-2 ${
                        activeTab === 'shifts'
                            ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                            : 'border-transparent text-slate-400 hover:text-slate-655'
                    }`}
                >
                    Till Audits & Shifts History
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'registers' ? (
                <RegistersTab
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredRegisters={filteredRegisters}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                />
            ) : (
                <ShiftsTab
                    shiftSearchQuery={shiftSearchQuery}
                    setShiftSearchQuery={setShiftSearchQuery}
                    shiftStatusFilter={shiftStatusFilter}
                    setShiftStatusFilter={setShiftStatusFilter}
                    handleExportShifts={handleExportShifts}
                    exporting={exporting}
                    paginatedShifts={paginatedShifts}
                    loadingShifts={loadingShifts}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    handleShiftSort={handleShiftSort}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    totalShiftsCount={sortedShifts.length}
                    totalPages={totalPages}
                    onViewDetails={setSelectedShift}
                />
            )}

            {/* Modals & Popups */}
            <RegisterFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingRegister={editingRegister}
                formData={formData}
                setFormData={setFormData}
                branches={branches}
                handleSubmit={handleSubmit}
            />

            <ShiftDetailModal
                shift={selectedShift}
                onClose={() => setSelectedShift(null)}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={true}
            />
        </div>
    );
}
