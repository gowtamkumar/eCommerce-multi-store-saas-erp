import TestimonialForm from '@/components/admin/TestimonialForm';
export const dynamic = 'force-dynamic';

export default function NewTestimonialPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Add New Testimonial</h1>
            <TestimonialForm />
        </div>
    );
}
