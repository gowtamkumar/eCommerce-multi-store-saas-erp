import { memo } from 'react';
import { Star, Trash2, Box } from 'lucide-react';
import { ReviewStatus } from '@/lib/enums/review-status.enum';
import { AdminReview } from '../types';
import { getReviewerName, getReviewerEmail } from '../utils/reviewHelpers';

export const ReviewCard = memo(({
    review,
    onAction
}: {
    review: AdminReview;
    onAction: (id: string, action: ReviewStatus | 'delete') => void;
}) => {
    return (
        <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{getReviewerName(review)}</span>
                        <span className="text-xs text-slate-500">{getReviewerEmail(review)}</span>
                    </div>

                    {review.product?.name && (
                        <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-brand-600 bg-brand-50 w-fit px-2 py-0.5 rounded-md dark:bg-brand-900/40 dark:text-brand-400">
                            <Box className="w-3 h-3" />
                            {review.product.name}
                        </div>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{review.comment}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded-full ${review.status === ReviewStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                review.status === ReviewStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                            {review.status}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {review.status !== ReviewStatus.APPROVED && (
                        <button
                            onClick={() => onAction(review.id, ReviewStatus.APPROVED)}
                            className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                        >
                            Approve
                        </button>
                    )}
                    {review.status !== ReviewStatus.REJECTED && (
                        <button
                            onClick={() => onAction(review.id, ReviewStatus.REJECTED)}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                        >
                            Reject
                        </button>
                    )}
                    <button
                        onClick={() => onAction(review.id, 'delete')}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

ReviewCard.displayName = 'ReviewCard';
