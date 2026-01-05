import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  author: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  status: 'active' | 'inactive';
  tenantId: mongoose.Types.ObjectId;
}

const TestimonialSchema: Schema = new Schema({
  author: { type: String, required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  avatar: { type: String, default: 'bg-blue-100 text-blue-600' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
}, { timestamps: true });

const Testimonial: Model<ITestimonial> = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

export default Testimonial;
