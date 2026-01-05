import { FAQStatus } from '@/lib/enums/faq-status';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  order: number;
  status: FAQStatus;
  tenantId: mongoose.Types.ObjectId;
}

const FAQSchema: Schema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: [FAQStatus.ACTIVE, FAQStatus.INACTIVE], default: FAQStatus.ACTIVE },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
}, { timestamps: true });

const FAQ: Model<IFAQ> = mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);

export default FAQ;
