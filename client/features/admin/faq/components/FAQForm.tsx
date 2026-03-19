'use client';

import { fetchAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FAQFormProps } from '../type';

export default function FAQForm({ faqId, initialData }: FAQFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        question: initialData?.question || '',
        answer: initialData?.answer || '',
        category: initialData?.category || 'General',
        order: initialData?.order || 0,
        status: initialData?.status || 'active',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = faqId ? `/faqs/${faqId}` : '/faqs';
            const method = faqId ? 'PUT' : 'POST';

            const response = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (response.success) {
                router.push('/admin/faqs');
                router.refresh();
                toast.success('FAQ saved successfully');
            } else {
                toast.error(response.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error saving FAQ:', error);
            toast.error('Failed to save FAQ');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'order' ? parseInt(value) || 0 : value,
        }));
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
        >
            {/* Question */}
            <div>
                <label
                    htmlFor="question"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                    Question <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter the FAQ question..."
                />
            </div>

            {/* Answer */}
            <div>
                <label
                    htmlFor="answer"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                    Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="answer"
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter the answer..."
                />
            </div>

            {/* Category and Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    >
                        Category
                    </label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        placeholder="e.g., Shipping, Returns, Payment"
                    />
                </div>

                <div>
                    <label
                        htmlFor="order"
                        className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    >
                        Display Order
                    </label>
                    <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Status */}
            <div>
                <label
                    htmlFor="status"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                    Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/30"
                >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : faqId ? 'Update FAQ' : 'Create FAQ'}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => router.push('/admin/faqs')}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                    <X className="w-5 h-5" />
                    Cancel
                </motion.button>
            </div>
        </motion.form>
    );
}
