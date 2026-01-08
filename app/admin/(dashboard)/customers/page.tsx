'use client';

import { fetchAPI } from '@/lib/api';

import ConfirmModal from '@/components/ConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';
import { ChevronLeft, ChevronRight, Loader2, Search, Trash2, User as UserIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    status: string;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function CustomersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState<Pagination>({
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

    const session = useSession();

    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        fetchUsers(1, debouncedSearch);
    }, [debouncedSearch]);

    const fetchUsers = async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                q: search
            });
            const res = await fetchAPI(`/users?${params}`);

            if (res.data?.users) {
                setUsers(res.data.users);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchUsers(newPage, debouncedSearch);
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await fetchAPI(`/users/${id}`, { method: 'DELETE' });
                    setUsers(users.filter(u => u.id !== id));
                    toast.success('User deleted successfully');
                } catch (error) {
                    toast.error('Error deleting user');
                }
            },
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Customers</h1>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Total: {pagination.total} customers
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Customer</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Contact</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Role</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Joined</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Loading customers...
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No customers found.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                                    <UserIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user.id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-600 dark:text-slate-300">{user.email}</p>
                                            {user.phone && <p className="text-xs text-slate-500 dark:text-slate-400">{user.phone}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : user.role === 'lead'
                                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        {
                                            user.role !== 'admin' && (
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        disabled={loading}

                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )
                                        }
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>

                    <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                    </div>

                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || loading}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            )}

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
