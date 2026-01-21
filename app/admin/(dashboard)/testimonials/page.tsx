'use client';

import ConfirmModal from '@/components/ui/ConfirmModal';
import { fetchAPI } from '@/lib/api';
import { Pencil, Plus, Save, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Testimonial {
    id: string;
    author: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
    status: 'active' | 'inactive';
}

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>({});
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false,
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetchAPI('/testimonials');
            if (res.success && res.data) {
                setTestimonials(res.data.testimonials);
            }
        } catch (error) {
            console.error('Failed to fetch testimonials', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentTestimonial.id ? `/testimonials/${currentTestimonial.id}` : '/testimonials';
            const method = currentTestimonial.id ? 'PUT' : 'POST';

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(currentTestimonial),
            });

            if (res.success) {
                fetchTestimonials();
                setIsEditing(false);
                setCurrentTestimonial({});
                toast.success('Testimonial saved successfully');
            }
        } catch (error) {
            console.error('Failed to save testimonial', error);
            toast.error('Failed to save testimonial');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Testimonial',
            message: 'Are you sure you want to delete this testimonial? This action cannot be undone.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    const res = await fetchAPI(`/testimonials/${id}`, { method: 'DELETE' });
                    if (res.success) {
                        fetchTestimonials();
                        toast.success('Testimonial deleted successfully');
                    } else {
                        toast.error('Failed to delete testimonial');
                    }
                } catch (error) {
                    console.error('Failed to delete testimonial', error);
                    toast.error('Error deleting testimonial');
                }
            },
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Testimonials Management</h1>
                <button
                    onClick={() => { setIsEditing(true); setCurrentTestimonial({ status: 'active', rating: 5, avatar: 'bg-blue-100 text-blue-600' }); }}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Testimonial
                </button>
            </div>

            {isEditing && (
                <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author Name</label>
                                <input
                                    type="text"
                                    value={currentTestimonial.author || ''}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, author: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role/Title</label>
                                <input
                                    type="text"
                                    value={currentTestimonial.role || ''}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, role: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={currentTestimonial.rating || 5}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, rating: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select
                                    value={currentTestimonial.status || 'active'}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                            <textarea
                                value={currentTestimonial.content || ''}
                                onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, content: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {loading ? (
                    <p className="text-center text-slate-500 col-span-2">Loading Testimonials...</p>
                ) : testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${testimonial.avatar}`}>
                                    {testimonial.author[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{testimonial.author}</h3>
                                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setCurrentTestimonial(testimonial); setIsEditing(true); }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(testimonial.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">"{testimonial.content}"</p>
                        <div className="flex items-center justify-between">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                                ))}
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${testimonial.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>
                                {testimonial.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
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
