import { AdminReview } from '../types';

/**
 * Safely extracts a display name for the reviewer from the nested user or flat fallback fields.
 */
export const getReviewerName = (review: AdminReview): string =>
    review.user?.name || review.user?.username || review.customerName || 'Anonymous';

/**
 * Safely extracts the email of the reviewer.
 */
export const getReviewerEmail = (review: AdminReview): string =>
    review.user?.email || review.customerEmail || '';
