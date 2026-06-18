import type { AdminReview } from "../types";
import { getReviewerEmail, getReviewerName } from "../utils/reviewHelpers";

export function buildReviewAssistSummary(review: AdminReview): string {
  const lines = [
    `Review ID: ${review.id}`,
    `Rating: ${review.rating}/5`,
    `Status: ${review.status}`,
    `Posted: ${new Date(review.createdAt).toISOString()}`,
    `Reviewer: ${getReviewerName(review)}`,
  ];

  const email = getReviewerEmail(review);
  if (email) lines.push(`Reviewer email: ${email}`);
  if (review.product?.name) lines.push(`Product: ${review.product.name}`);
  lines.push("", "Comment:", review.comment);

  return lines.join("\n");
}

export function buildReviewAssistPayload(review: AdminReview) {
  return {
    reviewSummary: buildReviewAssistSummary(review),
    reviewerName: getReviewerName(review),
    rating: review.rating,
    reviewStatus: review.status,
    productName: review.product?.name,
  };
}
