'use client';

import FAQForm from '@/components/admin/FAQForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NewFAQPage() {
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
                        Add New FAQ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Create a new frequently asked question
                    </p>
                </div>
            </div>

            {/* Form */}
            <FAQForm />
        </div>
    );
}
