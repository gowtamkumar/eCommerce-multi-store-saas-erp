'use client';

import { useState } from 'react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import ImageUploadField from '@/components/shared/ImageUploadField';
import Pagination from '@/components/shared/Pagination';
import { fetchAPI } from '@/services/api';
import { Check, Copy, HardDrive, Image as ImageIcon, Loader2, Search, Sparkles, Trash2, X } from 'lucide-react';
import type { MediaItem } from '../type';
import { useMediaDashboard } from '../hooks/useMediaDashboard';
import MediaAiAssistModal from './MediaAiAssistModal';
import { formatSize } from '../utils/mediaHelpers';

export default function Media() {
    const [aiItem, setAiItem] = useState<MediaItem | null>(null);
    const {
        media,
        loading,
        copiedId,
        search,
        setSearch,
        selectedIds,
        setSelectedIds,
        bulkDeleting,
        pagination,
        confirmModal,
        setConfirmModal,
        debouncedSearch,
        fetchMedia,
        handleDelete,
        handleBulkDelete,
        toggleSelect,
        toggleSelectAll,
        handleCopyToClipboard,
        allSelected,
    } = useMediaDashboard();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Media Library</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your images and assets</p>
                </div>
                <div className="flex items-center gap-3">
                    <ImageUploadField
                        label="Upload New"
                        variant="button"
                        uploadApi={fetchAPI}
                        onUploadSuccess={() => fetchMedia(pagination.page, debouncedSearch)}
                        className="relative"
                        onChange={() => { /* handled via onUploadSuccess for the button variant */ }}
                    />
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by filename..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {media.length > 0 && (
                        <button
                            onClick={toggleSelectAll}
                            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        >
                            {allSelected ? 'Deselect all' : 'Select all'}
                        </button>
                    )}
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Total: {pagination.total} items
                    </div>
                </div>
            </div>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                        {selectedIds.size} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60"
                        >
                            {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete selected
                        </button>
                    </div>
                </div>
            )}

            {/* Grid Content */}
            {loading && media.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                        <p className="text-slate-500 font-medium">Loading library...</p>
                    </div>
                </div>
            ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    {search ? (
                        <>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No results found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center mt-1">
                                No media files match your search &ldquo;{search}&rdquo;. Try a different keyword.
                            </p>
                            <button
                                onClick={() => setSearch('')}
                                className="mt-4 text-brand-600 hover:text-brand-700 font-semibold"
                            >
                                Clear Search
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your library is empty</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center mt-1">
                                Upload images to use them in your products and pages.
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {media.map((item) => {
                        const isSelected = selectedIds.has(item._id);
                        return (
                            <div
                                key={item._id}
                                className={`group relative bg-white dark:bg-slate-800 rounded-xl border overflow-hidden hover:shadow-xl transition-all duration-300 ${isSelected ? 'border-brand-500 ring-2 ring-brand-500/40' : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'}`}
                            >
                                <div className="aspect-square relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                    {/* Selection checkbox */}
                                    <label
                                        className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(item._id)}
                                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                        />
                                    </label>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.url}
                                        alt={item.filename}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAiItem(item)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors transform translate-y-2 group-hover:translate-y-0"
                                        >
                                            <Sparkles className="w-3 h-3" /> AI Assist
                                        </button>
                                        <button
                                            onClick={() => handleCopyToClipboard(item.url, item._id)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors transform translate-y-2 group-hover:translate-y-0"
                                        >
                                            {copiedId === item._id ? (
                                                <>
                                                    <Check className="w-3 h-3 text-green-600" /> Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" /> Copy URL
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors transform translate-y-2 group-hover:translate-y-0 delay-75"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate mb-1" title={item.filename}>
                                        {item.filename}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <HardDrive className="w-3 h-3" />
                                            {formatSize(item.size)}
                                        </span>
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => fetchMedia(page, debouncedSearch)}
                    loading={loading}
                />
            )}
            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />

            {aiItem && (
                <MediaAiAssistModal
                    item={aiItem}
                    onClose={() => setAiItem(null)}
                />
            )}
        </div>
    );
}
