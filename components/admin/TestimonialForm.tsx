'use client';

import { fetchAPI } from '@/lib/api';
import { Loader2, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface TestimonialFormProps {
    initialData?: {
        id?: string;
        author: string;
        role: string;
        content: string;
        rating: number;
        avatar: string;
        status: string;
    };
    isEdit?: boolean;
}

const avatarColors = [
    { value: 'bg-blue-100 text-blue-600', label: 'Blue' },
    { value: 'bg-pink-100 text-pink-600', label: 'Pink' },
    { value: 'bg-purple-100 text-purple-600', label: 'Purple' },
    { value: 'bg-green-100 text-green-600', label: 'Green' },
    { value: 'bg-yellow-100 text-yellow-600', label: 'Yellow' },
    { value: 'bg-red-100 text-red-600', label: 'Red' },
];

export default function TestimonialForm({ initialData, isEdit }: TestimonialFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        author: initialData?.author || '',
        role: initialData?.role || '',
        content: initialData?.content || '',
        rating: initialData?.rating || 5,
        avatar: initialData?.avatar || 'bg-blue-100 text-blue-600',
        status: initialData?.status || 'active',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit ? `/testimonials/${initialData?.id}` : '/testimonials';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (res.success) {
                router.push('/admin/testimonials');
                router.refresh();
                toast.success('Testimonial saved successfully');
            } else {
                toast.error('Failed to save testimonial');
            }
        } catch (error) {
            toast.error('Error saving testimonial');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Testimonial Information</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Author Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Role/Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            placeholder="CEO, Software Engineer, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Testimonial Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                            placeholder="Write the testimonial content here..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating })}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <Star
                                        className={`w-8 h-8 ${rating <= formData.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-slate-300 dark:text-slate-600'
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 flex items-center text-slate-600 dark:text-slate-400">
                                {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Avatar Color
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {avatarColors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, avatar: color.value })}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.avatar === color.value
                                        ? 'border-brand-600 ring-2 ring-brand-200 dark:ring-brand-800'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full ${color.value} flex items-center justify-center mx-auto mb-2 font-bold text-lg`}>
                                        {formData.author ? formData.author[0].toUpperCase() : 'A'}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">{color.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="active"
                                    checked={formData.status === 'active'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                                />
                                <span className="text-slate-700 dark:text-slate-300">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="inactive"
                                    checked={formData.status === 'inactive'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                                />
                                <span className="text-slate-700 dark:text-slate-300">Inactive</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isEdit ? 'Update Testimonial' : 'Create Testimonial'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-medium transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
