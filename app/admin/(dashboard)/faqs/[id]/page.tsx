'use client';

import FAQForm from '@/components/admin/FAQForm';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditFAQPage() {
    const params = useParams();
    const faqId = params.id as string;
    const [faq, setFaq] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFAQ();
    }, [faqId]);

    const fetchFAQ = async () => {
        try {
            const response = await fetchAPI(`/faqs/${faqId}`);

            if (response.success) {
                setFaq(response.data);
            }
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!faq) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">FAQ not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/faqs">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </motion.button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
                        Edit FAQ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Update the FAQ details
                    </p>
                </div>
            </div>

            {/* Form */}
            <FAQForm faqId={faqId} initialData={faq} />
        </div>
    );
}
