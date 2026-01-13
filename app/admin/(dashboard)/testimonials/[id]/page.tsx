'use client';

import TestimonialForm from '@/components/admin/TestimonialForm';
import { fetchAPI } from '@/lib/api';
import { use, useEffect, useState } from 'react';

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [testimonial, setTestimonial] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            const resData = await fetchAPI(`/testimonials/${id}`)
            if (resData.success && resData.data) setTestimonial(resData.data);
            setLoading(false)
        }
        fetchData()

    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading testimonial...</p>
                </div>
            </div>
        );
    }

    if (!testimonial) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400">Testimonial not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Edit Testimonial</h1>
            <TestimonialForm initialData={testimonial} isEdit />
        </div>
    );
}
