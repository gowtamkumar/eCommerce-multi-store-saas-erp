'use client';
import ConfirmModal from '@/components/shared/ConfirmModal';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';
import { Check, Copy, HardDrive, Image as ImageIcon, Loader2, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pagination as PaginationType } from '../../customer/type';
import { MediaItem } from '../type';
import Pagination from '@/components/shared/Pagination';



export default function Media() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState<PaginationType>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false,
    });

    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchMedia(1, debouncedSearch);
    }, [debouncedSearch]);

    const fetchMedia = async (page: number, searchQuery: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                filename: searchQuery,
                page: page.toString(),
                limit: '20'
            });

            const res = await fetchAPI(`/admin/media?${params}`);
            if (res.data && res.data.items) {
                const mappedMedia: MediaItem[] = res.data.items.map((f: any) => {
                    // Extract timestamp from filename (timestamp_name.ext)
                    let createdAt = new Date().toISOString();
                    const parts = f.filename?.split('_');
                    if (parts && parts.length > 1 && !isNaN(Number(parts[0]))) {
                        createdAt = new Date(Number(parts[0])).toISOString();
                    }
                    return {
                        _id: f.id,
                        filename: f.originalname || f.filename,
                        url: f.path || '',
                        mimetype: f.mimetype,
                        size: f.size,
                        createdAt: f.createdAt || createdAt
                    };
                });

                setMedia(mappedMedia);
                setPagination({
                    total: res.data.total,
                    page: res.data.page,
                    limit: res.data.limit,
                    totalPages: res.data.totalPages || 1
                });
            } else {
                setMedia([]);
            }
        } catch (error) {
            console.error('Error fetching media:', error);
            toast.error('Failed to load media library');
        } finally {
            setLoading(false);
        }
    };




    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Image',
            message: 'Are you sure you want to delete this image? This action cannot be undone.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await fetchAPI(`/admin/media/${id}`, {
                        method: 'DELETE',
                    });

                    setMedia(media.filter((item: any) => item._id !== id));
                    toast.success('Image deleted successfully');

                    // Optional: refetch if we want to update pagination counts strictly
                    if (media.length === 1 && pagination.page > 1) {
                        fetchMedia(pagination.page - 1, debouncedSearch);
                    } else {
                        fetchMedia(pagination.page, debouncedSearch);
                    }
                } catch (error) {
                    console.error('Error deleting:', error);
                    toast.error('Error deleting image');
                }
            },
        });
    };


    const copyToClipboard = (url: string, id: string) => {
        const fullUrl = url;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

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
                        onChange={function (val: string): void {
                            throw new Error('Function not implemented.');
                        }}
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
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Total: {pagination.total} items
                </div>
            </div>

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
                                No media files match your search "{search}". Try a different keyword.
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
                    {media.map((item: any) => (
                        <div
                            key={item._id}
                            className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300"
                        >
                            <div className="aspect-square relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.url}
                                    alt={item.filename}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3">
                                    <button
                                        onClick={() => copyToClipboard(item.url, item._id)}
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
                                    {item.filename.replace(/^\d+-/, '')}
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
                    ))}
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
        </div>
    );
}
