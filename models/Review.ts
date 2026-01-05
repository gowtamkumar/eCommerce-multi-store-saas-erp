import { ReviewStatus } from '@/lib/enums/review-status';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  tenantId: mongoose.Types.ObjectId;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: [ReviewStatus.PENDING, ReviewStatus.APPROVED, ReviewStatus.REJECTED],
      default: ReviewStatus.PENDING,
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

// Index for faster queries
ReviewSchema.index({ productId: 1, status: 1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
